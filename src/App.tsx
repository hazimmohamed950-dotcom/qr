/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { ProjectorView } from './components/ProjectorView';
import { StudentAttendanceForm } from './components/StudentAttendanceForm';
import { DatabaseView } from './components/DatabaseView';
import { StudentMobileView } from './components/StudentMobileView';
import { SecurityReportView } from './components/SecurityReportView';
import { SecurityLabView } from './components/SecurityLabView';
import { RosterView } from './components/RosterView';
import { ExportModal } from './components/ExportModal';

import { INITIAL_STUDENTS } from './data/studentsData';
import { OFFICIAL_COURSES } from './data/coursesData';
import { AttendanceSession, AttendanceRecord, Student } from './types/attendance';
import { generateRandomNonce } from './utils/crypto';
import { loadStoredRecords, saveRecordToDatabase, clearDatabase } from './utils/database';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('projector');
  const [students] = useState<Student[]>(INITIAL_STUDENTS);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [urlSessionCode, setUrlSessionCode] = useState<string>('MD-7842');

  // Database Records State (loaded from localStorage)
  const [dbRecords, setDbRecords] = useState<AttendanceRecord[]>([]);

  // Initial Attendance Session for FSJES Kelaa des Sraghna
  const [session, setSession] = useState<AttendanceSession>(() => {
    const course = OFFICIAL_COURSES[0];
    const initialExpected = INITIAL_STUDENTS.filter(s => s.group === 'S5-A').length;

    // Pre-populate a few realistic checked-in students
    const initialRecords: AttendanceRecord[] = INITIAL_STUDENTS.slice(0, 18).map((std, idx) => ({
      id: `att-seed-${idx}`,
      sessionId: 'session-2025-md501-s5a',
      sessionCode: 'MD-7842',
      studentId: std.id,
      studentNom: std.nom,
      studentPrenom: std.prenom,
      apogeeId: std.apogeeId,
      cne: std.cne,
      group: std.group,
      timestamp: new Date(Date.now() - (18 - idx) * 12000).toISOString(),
      scanEpoch: Math.floor(Date.now() / 1000 / 8) - (18 - idx),
      verificationMethod: 'QR_URL_FORM',
      receiptHash: `UCA-${generateRandomNonce(10).toUpperCase()}`,
      deviceFingerprint: `SHA-${generateRandomNonce(8)}`,
      ipSubnet: '196.200.174.xxx (UCA-Campus-Wifi)',
      status: 'PRESENT',
    }));

    return {
      id: 'session-2025-md501-s5a',
      sessionCode: 'MD-7842',
      courseId: course.id,
      courseTitle: course.title,
      courseCode: course.code,
      professor: course.professor,
      targetGroup: 'S5-A',
      startTime: new Date().toISOString(),
      durationMinutes: 15,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      isActive: true,
      isPaused: false,
      currentRotatingEpoch: Math.floor(Date.now() / 1000 / 8),
      tokenRefreshIntervalSec: 8,
      sessionSecretKey: 'uca_knidiri_sraghna_key_2025_sec',
      attendeesCount: initialRecords.length,
      totalExpectedStudents: initialExpected,
      records: initialRecords,
    };
  });

  // Check URL parameters for direct QR Code link routing
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const code = params.get('code');

      if (code) {
        setUrlSessionCode(code);
      }

      // If the student scanned the QR code URL (?action=form)
      if (action === 'form' || window.location.hash.includes('form')) {
        setActiveTab('form');
      }

      // Load persistent records from localStorage
      const stored = loadStoredRecords();
      if (stored.length > 0) {
        setDbRecords(stored);
        // Merge with session records
        setSession(prev => {
          const sessionRecords = stored.filter(r => r.sessionId === prev.id);
          if (sessionRecords.length > 0) {
            return {
              ...prev,
              records: sessionRecords,
              attendeesCount: sessionRecords.length,
            };
          }
          return prev;
        });
      } else {
        // Seed default records into localStorage if fresh
        session.records.forEach(r => saveRecordToDatabase(r));
        setDbRecords(session.records);
      }
    } catch (err) {
      console.warn('URL parsing error:', err);
    }
  }, []);

  // Handler when a record is added via Form or Scanner
  const handleRecordAdded = (record: AttendanceRecord) => {
    // 1. Update session state
    setSession(prev => {
      if (prev.records.some(r => r.studentId === record.studentId || r.apogeeId === record.apogeeId)) {
        return prev;
      }
      const updated = [record, ...prev.records];
      return {
        ...prev,
        records: updated,
        attendeesCount: updated.length,
      };
    });

    // 2. Update persistent DB state
    setDbRecords(prev => {
      if (prev.some(r => r.sessionId === record.sessionId && (r.studentId === record.studentId || r.apogeeId === record.apogeeId))) {
        return prev;
      }
      return [record, ...prev];
    });
  };

  // Clear Database Handler
  const handleClearDatabase = () => {
    clearDatabase();
    setDbRecords([]);
    setSession(prev => ({
      ...prev,
      records: [],
      attendeesCount: 0,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Institutional Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSessionActive={session.isActive && !session.isPaused}
        attendeesCount={session.records.length}
        totalStudents={session.totalExpectedStudents}
        courseTitle={session.courseCode}
        databaseCount={dbRecords.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: Vidéoprojecteur Amphi (Grand Écran avec QR URL) */}
        {activeTab === 'projector' && (
          <ProjectorView
            session={session}
            setSession={setSession}
            students={students}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenMobileView={() => setActiveTab('mobile')}
            onOpenForm={() => setActiveTab('form')}
          />
        )}

        {/* TAB 2: Formulaire d'Émargement Étudiant (الرابط المضمن في الـ QR Code) */}
        {activeTab === 'form' && (
          <StudentAttendanceForm
            session={session}
            students={students}
            onRecordAdded={handleRecordAdded}
            onNavigateHome={() => setActiveTab('projector')}
            initialSessionCode={urlSessionCode || session.sessionCode}
          />
        )}

        {/* TAB 3: Base de Données des Présences */}
        {activeTab === 'database' && (
          <DatabaseView
            records={dbRecords}
            onClearRecords={handleClearDatabase}
            onRefresh={() => setDbRecords(loadStoredRecords())}
          />
        )}

        {/* TAB 4: Vue Mobile / Scanner Interactif */}
        {activeTab === 'mobile' && (
          <StudentMobileView
            session={session}
            onRecordScan={handleRecordAdded}
            students={students}
          />
        )}

        {/* TAB 5: Laboratoire Sécurité & E2EE */}
        {activeTab === 'security_lab' && (
          <SecurityLabView
            session={session}
            students={students}
          />
        )}

        {/* TAB 6: Roster 297 Étudiants */}
        {activeTab === 'roster' && (
          <RosterView
            students={students}
            session={session}
          />
        )}

        {/* TAB 7: Rapport d'Architecture & Sécurité */}
        {activeTab === 'report' && (
          <SecurityReportView />
        )}

      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-400">
            Faculté des Sciences Juridiques, Économiques et Sociales de Kelaa des Sraghna • Université Cadi Ayyad
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Licence MD & MMS • Promotion 2025–2026 • Coordinateur : Pr. Zakaria KNIDIRI • Système d'Émargement QR & Formulaire Web
          </p>
        </div>
      </footer>

      {/* Official PV d'Émargement Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        session={session}
        students={students}
      />

    </div>
  );
}
