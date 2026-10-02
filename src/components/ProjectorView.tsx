import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Clock, 
  Users, 
  ShieldCheck, 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2,
  QrCode as QrCodeIcon,
  Copy,
  Check,
  ExternalLink,
  ClipboardList,
  Hash
} from 'lucide-react';
import { AttendanceSession, Course, Student, AttendanceRecord } from '../types/attendance';
import { OFFICIAL_COURSES } from '../data/coursesData';
import { generateRotatingQRPayload } from '../utils/crypto';

interface ProjectorViewProps {
  session: AttendanceSession;
  setSession: React.Dispatch<React.SetStateAction<AttendanceSession>>;
  students: Student[];
  onOpenExport: () => void;
  onOpenMobileView: () => void;
  onOpenForm: () => void;
}

export const ProjectorView: React.FC<ProjectorViewProps> = ({
  session,
  setSession,
  students,
  onOpenExport,
  onOpenMobileView,
  onOpenForm,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [secondsRemainingInEpoch, setSecondsRemainingInEpoch] = useState<number>(8);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(session.durationMinutes * 60);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'live' | 'absent'>('live');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter expected students based on target group
  const expectedStudents = students.filter(s => 
    session.targetGroup === 'ALL' ? true : s.group === session.targetGroup
  );

  const presentStudentIds = new Set(session.records.map(r => r.studentId));
  const absentStudents = expectedStudents.filter(s => !presentStudentIds.has(s.id));
  const attendancePercentage = expectedStudents.length > 0 
    ? Math.round((session.records.length / expectedStudents.length) * 100) 
    : 0;

  // Real-time 15:00 countdown timer
  useEffect(() => {
    if (!session.isActive || session.isPaused) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          setSession(s => ({ ...s, isActive: false }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session.isActive, session.isPaused, setSession]);

  // Construct Direct Student Attendance URL encoded in the QR code
  const getAttendanceUrl = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const path = window.location.pathname;
      return `${origin}${path}?action=form&session=${session.id}&code=${session.sessionCode || 'MD-7842'}&grp=${session.targetGroup}`;
    }
    return `https://fsjes-uca.ac.ma/presence?session=${session.id}&code=${session.sessionCode || 'MD-7842'}`;
  };

  const currentFormUrl = getAttendanceUrl();

  // Generate QR Code containing the direct Form URL
  useEffect(() => {
    let isMounted = true;

    const refreshQr = async () => {
      if (!session.isActive) return;
      try {
        const urlToEncode = getAttendanceUrl();

        // Generate high-resolution, scannable QR code
        const dataUrl = await QRCode.toDataURL(urlToEncode, {
          width: 520,
          margin: 1.5,
          color: {
            dark: '#020617', // deep slate/black
            light: '#ffffff', // pure white
          },
          errorCorrectionLevel: 'M',
        });

        if (isMounted) {
          setQrCodeDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    refreshQr();
    const interval = setInterval(refreshQr, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [session.isActive, session.id, session.sessionCode, session.targetGroup]);

  // Copy Link Handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentFormUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Format MM:SS timer
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
      setIsFullscreen(false);
    }
  };

  // Switch Course Handler
  const handleCourseChange = (courseId: string) => {
    const course = OFFICIAL_COURSES.find(c => c.id === courseId);
    if (!course) return;
    setSession(prev => ({
      ...prev,
      courseId: course.id,
      courseTitle: course.title,
      courseCode: course.code,
      sessionCode: `${course.code}-${Math.floor(1000 + Math.random() * 9000)}`,
      professor: course.professor,
      records: [],
      attendeesCount: 0,
    }));
    setTimeLeftSeconds(15 * 60);
  };

  // Switch Group Handler
  const handleGroupChange = (group: 'S5-A' | 'S5-B' | 'ALL') => {
    const count = students.filter(s => group === 'ALL' ? true : s.group === group).length;
    setSession(prev => ({
      ...prev,
      targetGroup: group,
      totalExpectedStudents: count,
      records: [],
      attendeesCount: 0,
    }));
    setTimeLeftSeconds(15 * 60);
  };

  // Reset Session
  const handleResetSession = () => {
    if (confirm('Voulez-vous réinitialiser cette session d\'émargement ? Les présences actuelles seront remises à zéro.')) {
      setSession(prev => ({
        ...prev,
        records: [],
        attendeesCount: 0,
        isActive: true,
        isPaused: false,
      }));
      setTimeLeftSeconds(15 * 60);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      
      {/* Top Session Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Course & Group Pickers */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Matière / Cours (MD & MMS)
            </label>
            <select
              value={session.courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="bg-slate-800 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {OFFICIAL_COURSES.map(course => (
                <option key={course.id} value={course.id}>
                  [{course.code}] {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Groupe Cible
            </label>
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-sm">
              <button
                onClick={() => handleGroupChange('S5-A')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  session.targetGroup === 'S5-A' 
                    ? 'bg-amber-500 text-slate-950 shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Groupe S5-A (148)
              </button>
              <button
                onClick={() => handleGroupChange('S5-B')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  session.targetGroup === 'S5-B' 
                    ? 'bg-amber-500 text-slate-950 shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Groupe S5-B (149)
              </button>
              <button
                onClick={() => handleGroupChange('ALL')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  session.targetGroup === 'ALL' 
                    ? 'bg-amber-500 text-slate-950 shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Promo Complète (297)
              </button>
            </div>
          </div>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSession(s => ({ ...s, isPaused: !s.isPaused }))}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              session.isPaused 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {session.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{session.isPaused ? 'Reprendre' : 'Suspendre'}</span>
          </button>

          <button
            onClick={() => setTimeLeftSeconds(prev => prev + 300)}
            className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
            title="Ajouter 5 minutes au compte à rebours"
          >
            +5 min
          </button>

          <button
            onClick={handleResetSession}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700"
            title="Réinitialiser l'émargement"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>PV d'Émargement</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title={isFullscreen ? 'Quitter Plein Écran' : 'Mode Plein Écran Vidéoprojecteur'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Projector Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Col (7 cols): Projected Dynamic QR Code */}
        <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden">
          
          {/* Subtle Institutional Watermark Header */}
          <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
                Émargement Officiel • Licence MD & MMS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {session.courseTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {session.professor} • Groupe {session.targetGroup} (Promotion 2025–2026)
              </p>
            </div>
            
            {/* Live Status indicator */}
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                session.isActive && !session.isPaused
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${session.isActive && !session.isPaused ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {session.isActive && !session.isPaused ? 'SESSION ACTIVE' : 'SUSPENDUE'}
              </span>
            </div>
          </div>

          {/* Central High-Contrast Projected QR Code */}
          <div className="my-auto py-2 flex flex-col items-center">
            <div className="relative p-4 sm:p-5 bg-white rounded-3xl shadow-2xl shadow-amber-500/10 border-4 border-slate-100 flex flex-col items-center">
              
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code d'Émargement Dynamique"
                  className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain rounded-xl select-none"
                />
              ) : (
                <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center bg-slate-100 rounded-xl">
                  <RefreshCw className="w-10 h-10 animate-spin text-slate-500" />
                </div>
              )}

              {/* Watermark badge inside QR */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-slate-950 rounded-2xl flex flex-col items-center justify-center border-4 border-white shadow-xl pointer-events-none">
                <span className="text-[10px] font-black text-amber-400">UCA</span>
                <span className="text-[8px] font-bold text-slate-200">FSJES</span>
              </div>
            </div>

            {/* Session Code & Direct URL Box */}
            <div className="w-full max-w-md mt-4 bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 space-y-3">
              
              {/* Code de la séance / رقم الغياب */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <span className="text-xs text-slate-400">
                  رقم الغياب / رمز الحصة (Code Séance) :
                </span>
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-black text-sm tracking-wider border border-amber-500/30">
                  {session.sessionCode || 'MD-7842'}
                </span>
              </div>

              {/* URL preview & Actions */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">
                  الرابط المضمن في الـ QR code (URL du formulaire) :
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentFormUrl}
                    className="flex-1 bg-slate-950 border border-slate-700 text-[10px] font-mono text-slate-300 rounded-lg px-2.5 py-1.5 truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all shrink-0 flex items-center gap-1 text-[11px]"
                    title="نسخ الرابط"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                  <button
                    onClick={onOpenForm}
                    className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shrink-0 flex items-center gap-1 text-[11px]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>فتح الاستمارة</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Projector Footer: Instructions */}
          <div className="w-full border-t border-slate-800/80 pt-4 mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-amber-400 font-bold">
                1
              </span>
              <span>امسح الـ QR code بكاميرا الهاتف</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-amber-400 font-bold">
                2
              </span>
              <span>ادخل رقم الغياب واسمك أو رقم Apogée</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>تسجيل فوري في قاعدة البيانات</span>
            </div>
          </div>

        </div>

        {/* Right Col (5 cols): Live Countdown, Counters & Real-Time Attendees */}
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          
          {/* Real-time 15-Minute Countdown Block */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Temps Restant d'Émargement
                  </h3>
                  <p className="text-[11px] text-slate-400">Durée officielle : 15 min</p>
                </div>
              </div>

              {/* Time display */}
              <div className={`font-mono text-4xl sm:text-5xl font-extrabold tracking-tight ${
                timeLeftSeconds < 120 
                  ? 'text-rose-400 animate-pulse' 
                  : timeLeftSeconds < 300 
                  ? 'text-amber-400' 
                  : 'text-white'
              }`}>
                {formatTime(timeLeftSeconds)}
              </div>
            </div>

            {/* Session Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeftSeconds < 120 ? 'bg-rose-500' : 'bg-amber-500'
                }`}
                style={{ width: `${(timeLeftSeconds / (session.durationMinutes * 60)) * 100}%` }}
              />
            </div>
          </div>

          {/* Live Attendance Counter & Gauge */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Présents en Amphithéâtre
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Groupe {session.targetGroup} ({expectedStudents.length} inscrits)
                  </p>
                </div>
              </div>

              {/* Attendance percentage pill */}
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono font-bold text-emerald-400 text-sm">
                {attendancePercentage}%
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-5xl font-black text-white font-mono">
                {session.records.length}
              </span>
              <span className="text-slate-400 text-lg font-medium">
                / {expectedStudents.length} étudiants
              </span>
            </div>

            {/* Visual ratio bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 mt-2 font-mono">
              <span className="text-emerald-400">● {session.records.length} Présents</span>
              <span className="text-rose-400">● {absentStudents.length} Absents</span>
            </div>
          </div>

          {/* Real-time Attendees Feed / Absence Ticker */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex-1 flex flex-col min-h-[260px]">
            
            {/* Header Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('live')}
                  className={`text-xs font-bold px-2.5 py-1 rounded-md transition-all ${
                    activeTab === 'live' 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Direct Présents ({session.records.length})
                </button>
                <button
                  onClick={() => setActiveTab('absent')}
                  className={`text-xs font-bold px-2.5 py-1 rounded-md transition-all ${
                    activeTab === 'absent' 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Absents ({absentStudents.length})
                </button>
              </div>

              <button
                onClick={onOpenMobileView}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 flex items-center gap-1"
              >
                <span>Tester le scan étudiant</span>
                <span>→</span>
              </button>
            </div>

            {/* List area */}
            <div className="overflow-y-auto max-h-56 space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {activeTab === 'live' ? (
                session.records.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                    <QrCodeIcon className="w-8 h-8 mb-2 text-slate-600 opacity-60 animate-bounce" />
                    <p className="font-medium text-slate-400">En attente des premiers scans...</p>
                    <p className="text-[11px]">Les étudiants émargeront en scannant le QR code projeté.</p>
                  </div>
                ) : (
                  session.records.slice().reverse().map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/50 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                          ✓
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">
                            {record.studentNom} {record.studentPrenom}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Apogée: {record.apogeeId} • CNE: {record.cne}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[10px] text-emerald-400 font-semibold block">
                          {new Date(record.timestamp).toLocaleTimeString('fr-FR')}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400">
                          {record.receiptHash}
                        </span>
                      </div>
                    </div>
                  ))
                )
              ) : (
                absentStudents.slice(0, 50).map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-2 bg-slate-800/40 rounded-lg border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="text-slate-300 font-medium">{student.nom} {student.prenom}</span>
                      <span className="text-slate-500 text-[10px] font-mono ml-2">({student.apogeeId})</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                      Absent
                    </span>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
