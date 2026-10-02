import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  GraduationCap, 
  Mail, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Student, AttendanceSession } from '../types/attendance';

interface RosterViewProps {
  students: Student[];
  session: AttendanceSession;
  onSelectStudentToScan?: (student: Student) => void;
}

export const RosterView: React.FC<RosterViewProps> = ({
  students,
  session,
  onSelectStudentToScan,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<'ALL' | 'S5-A' | 'S5-B'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'REGULAR' | 'AT_RISK' | 'CRITICAL'>('ALL');
  const [inspectedStudent, setInspectedStudent] = useState<Student | null>(null);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Group filter
      if (selectedGroup !== 'ALL' && student.group !== selectedGroup) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'ALL' && student.attendanceStats.status !== selectedStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const fullName = `${student.prenom} ${student.nom}`.toLowerCase();
        const reversedFullName = `${student.nom} ${student.prenom}`.toLowerCase();
        return (
          fullName.includes(query) ||
          reversedFullName.includes(query) ||
          student.apogeeId.toLowerCase().includes(query) ||
          student.cne.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [students, selectedGroup, selectedStatus, searchQuery]);

  // Presence set for current session
  const presentStudentIds = useMemo(() => {
    return new Set(session.records.map(r => r.studentId));
  }, [session.records]);

  // Aggregate stats
  const totalCount = students.length;
  const s5aCount = students.filter(s => s.group === 'S5-A').length;
  const s5bCount = students.filter(s => s.group === 'S5-B').length;
  const regularCount = students.filter(s => s.attendanceStats.status === 'REGULAR').length;
  const atRiskCount = students.filter(s => s.attendanceStats.status === 'AT_RISK').length;
  const criticalCount = students.filter(s => s.attendanceStats.status === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      
      {/* Roster Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Trombinoscope & Roster Officiel (297 Étudiants)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Licence Marketing Digital & Management des Médias Sociaux (MD & MMS)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Promotion 2025–2026 • Faculté des Sciences Juridiques, Économiques et Sociales - Kelaa des Sraghna
          </p>
        </div>

        {/* Group Counts */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-slate-400">Total : </span>
            <span className="text-white font-bold">{totalCount}</span>
          </div>
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-amber-400 font-bold">S5-A : </span>
            <span className="text-white">{s5aCount}</span>
          </div>
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-emerald-400 font-bold">S5-B : </span>
            <span className="text-white">{s5bCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, Apogée, CNE ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Group filter */}
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedGroup('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedGroup === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedGroup('S5-A')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedGroup === 'S5-A' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Groupe S5-A
            </button>
            <button
              onClick={() => setSelectedGroup('S5-B')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedGroup === 'S5-B' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Groupe S5-B
            </button>
          </div>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-950 text-slate-200 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">Tous les statuts ({totalCount})</option>
            <option value="REGULAR">Régulier (≥ 80%) • {regularCount}</option>
            <option value="AT_RISK">À Risque (65-79%) • {atRiskCount}</option>
            <option value="CRITICAL">Critique (&lt; 65%) • {criticalCount}</option>
          </select>
        </div>

      </div>

      {/* Students Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.slice(0, 60).map((student) => {
          const isPresentInCurrentSession = presentStudentIds.has(student.id);

          return (
            <div
              key={student.id}
              onClick={() => setInspectedStudent(student)}
              className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600/30 to-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-500/20">
                      {student.prenom[0]}{student.nom[0]}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        {student.nom} {student.prenom}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Apogée: {student.apogeeId} • CNE: {student.cne}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    student.group === 'S5-A' 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  }`}>
                    {student.group}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 font-mono truncate mb-3">
                  {student.email}
                </div>
              </div>

              {/* Bottom stats row */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Assiduité :</span>
                  <span className={`font-bold font-mono ${
                    student.attendanceStats.status === 'REGULAR'
                      ? 'text-emerald-400'
                      : student.attendanceStats.status === 'AT_RISK'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}>
                    {student.attendanceStats.rate}% ({student.attendanceStats.attended}/{student.attendanceStats.totalSessions})
                  </span>
                </div>

                {/* Session presence tag */}
                {isPresentInCurrentSession ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" />
                    <span>Émargé</span>
                  </span>
                ) : (
                  <span className="text-slate-500 text-[9px]">
                    Non émargé
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length > 60 && (
        <div className="text-center p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400">
          Affichage des 60 premiers étudiants sur {filteredStudents.length} correspondants à vos filtres. Utilisez la barre de recherche pour trouver un étudiant spécifique.
        </div>
      )}

      {/* Student Details Inspection Modal */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Fiche Étudiant Trombinoscope</h3>
              </div>
              <button
                onClick={() => setInspectedStudent(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Fermer ✕
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-600/30 text-amber-300 font-black text-xl flex items-center justify-center border-2 border-amber-500/30">
                {inspectedStudent.prenom[0]}{inspectedStudent.nom[0]}
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {inspectedStudent.nom} {inspectedStudent.prenom}
                </h2>
                <div className="text-xs text-slate-400">{inspectedStudent.filiere}</div>
                <div className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Groupe {inspectedStudent.group}
                </div>
              </div>
            </div>

            {/* Academic details */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Numéro Apogée :</span>
                <span className="text-white font-bold">{inspectedStudent.apogeeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CNE / Massar :</span>
                <span className="text-white font-bold">{inspectedStudent.cne}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email Académique :</span>
                <span className="text-amber-400 truncate ml-2">{inspectedStudent.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Taux d'assiduité S5 :</span>
                <span className="text-emerald-400 font-bold">{inspectedStudent.attendanceStats.rate}%</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setInspectedStudent(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
