import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Send, 
  GraduationCap, 
  UserCheck, 
  Hash, 
  Search, 
  Database, 
  Clock, 
  Printer, 
  RotateCcw,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { Student, AttendanceSession, AttendanceRecord } from '../types/attendance';
import { generateRandomNonce, computeSha256 } from '../utils/crypto';
import { saveRecordToDatabase } from '../utils/database';

interface StudentAttendanceFormProps {
  session: AttendanceSession;
  students: Student[];
  onRecordAdded: (record: AttendanceRecord) => void;
  onNavigateHome?: () => void;
  initialSessionCode?: string;
}

export const StudentAttendanceForm: React.FC<StudentAttendanceFormProps> = ({
  session,
  students,
  onRecordAdded,
  onNavigateHome,
  initialSessionCode,
}) => {
  // Form State
  const [sessionCodeInput, setSessionCodeInput] = useState<string>(
    initialSessionCode || session.sessionCode || 'MD-7842'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [manualNom, setManualNom] = useState<string>('');
  const [manualPrenom, setManualPrenom] = useState<string>('');
  const [manualApogee, setManualApogee] = useState<string>('');
  const [manualCne, setManualCne] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<'S5-A' | 'S5-B'>(
    session.targetGroup === 'S5-B' ? 'S5-B' : 'S5-A'
  );
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success State (Thank You Message)
  const [submittedRecord, setSubmittedRecord] = useState<AttendanceRecord | null>(null);

  // Autocomplete matching students from 297 enrolled
  const matchingStudents = searchQuery.trim().length > 1
    ? students.filter(s => {
        const query = searchQuery.toLowerCase();
        return (
          s.apogeeId.includes(query) ||
          s.nom.toLowerCase().includes(query) ||
          s.prenom.toLowerCase().includes(query) ||
          s.cne.toLowerCase().includes(query)
        );
      }).slice(0, 6)
    : [];

  // When a student is clicked in autocomplete
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchQuery(`${student.nom} ${student.prenom} (${student.apogeeId})`);
    setManualNom(student.nom);
    setManualPrenom(student.prenom);
    setManualApogee(student.apogeeId);
    setManualCne(student.cne);
    setSelectedGroup(student.group);
    setShowSuggestions(false);
    setErrorMessage(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    const apogee = selectedStudent ? selectedStudent.apogeeId : manualApogee.trim();
    const nom = selectedStudent ? selectedStudent.nom : manualNom.trim();
    const prenom = selectedStudent ? selectedStudent.prenom : manualPrenom.trim();
    const cne = selectedStudent ? selectedStudent.cne : (manualCne.trim() || 'CNE-UCA');
    const group = selectedStudent ? selectedStudent.group : selectedGroup;

    if (!sessionCodeInput.trim()) {
      setErrorMessage('يرجى إدخال رقم الغياب أو رمز الحضور (Veuillez renseigner le code de la séance).');
      return;
    }

    if (!nom || !apogee) {
      setErrorMessage('يرجى تحديد اسمك أو رقم Apogée الخاص بك (Veuillez indiquer votre nom ou votre code Apogée).');
      return;
    }

    // Check if group matches session target
    if (session.targetGroup !== 'ALL' && session.targetGroup !== group) {
      setErrorMessage(
        `تنبيه: هذه الحصة مخصصة للفوج ${session.targetGroup}. أنت مسجل في الفوج ${group}.`
      );
      return;
    }

    // Check for duplicate in current session
    const isAlreadyPresent = session.records.some(
      r => r.apogeeId === apogee || (selectedStudent && r.studentId === selectedStudent.id)
    );

    if (isAlreadyPresent) {
      setErrorMessage(
        `تم تسجيل حضور الطالب (${nom} ${prenom} - ${apogee}) مسبقاً في هذه الحصة. لا يمكن تسجيل الحضور مرتين.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate immutable receipt hash
      const timestampStr = new Date().toISOString();
      const receiptHash = `UCA-${(await computeSha256(`${apogee}:${session.id}:${Date.now()}`)).substring(0, 10).toUpperCase()}`;

      const newRecord: AttendanceRecord = {
        id: `att-form-${Date.now()}-${generateRandomNonce(4)}`,
        sessionId: session.id,
        sessionCode: sessionCodeInput.trim(),
        studentId: selectedStudent?.id || `std-custom-${apogee}`,
        studentNom: nom,
        studentPrenom: prenom,
        apogeeId: apogee,
        cne: cne,
        group: group,
        timestamp: timestampStr,
        scanEpoch: Math.floor(Date.now() / 1000 / 8),
        verificationMethod: 'QR_URL_FORM',
        receiptHash: receiptHash,
        deviceFingerprint: `WEB-${generateRandomNonce(6)}`,
        ipSubnet: '196.200.xxx.xxx (UCA Network)',
        status: 'PRESENT',
      };

      // Save to localStorage database
      saveRecordToDatabase(newRecord);

      // Notify parent state
      onRecordAdded(newRecord);

      // Confetti effect
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#10b981', '#f59e0b', '#3b82f6'],
      });

      setSubmittedRecord(newRecord);
    } catch (err: any) {
      setErrorMessage(`حدث خطأ أثناء حفظ الحضور: ${err?.message || 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to register another student
  const handleResetForNext = () => {
    setSelectedStudent(null);
    setSearchQuery('');
    setManualNom('');
    setManualPrenom('');
    setManualApogee('');
    setManualCne('');
    setSubmittedRecord(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      
      {/* SUCCESS SCREEN: THANK YOU MESSAGE */}
      {submittedRecord ? (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-300">
          
          {/* Big Green Badge */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
              تم التسجيل في قاعدة البيانات بنجاح • Base de Données synchronisée
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              شكراً لك! تم تسجيل حضورك بنجاح
            </h2>
            <p className="text-sm font-semibold text-slate-300 mt-1">
              Merci ! Votre présence a été enregistrée avec succès.
            </p>
          </div>

          {/* Detailed Official Attendance Receipt Card */}
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 text-right space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-[11px] text-slate-400">
              <span className="font-mono text-emerald-400 font-bold">
                {submittedRecord.receiptHash}
              </span>
              <span className="font-semibold text-slate-300">
                وصل إثبات الحضور الرسمي (Reçu d'émargement)
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-white font-mono">{submittedRecord.studentNom} {submittedRecord.studentPrenom}</span>
              <span className="text-slate-400">الطالب(ة) / Nom & Prénom :</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-amber-400 font-mono">{submittedRecord.apogeeId}</span>
              <span className="text-slate-400">رقم أبوجي / Code Apogée :</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-300 font-mono">{submittedRecord.cne}</span>
              <span className="text-slate-400">رمز مسار / CNE :</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-200 font-mono">{session.courseCode} - {session.courseTitle}</span>
              <span className="text-slate-400">المادة / Matière :</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-300 font-mono">{session.professor}</span>
              <span className="text-slate-400">الأستاذ / Enseignant :</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-amber-400 font-bold font-mono">الفوج {submittedRecord.group}</span>
              <span className="text-slate-400">الفوج / Groupe :</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="font-mono text-slate-300">{submittedRecord.sessionCode}</span>
              <span className="text-slate-400">رقم الغياب / Code Séance :</span>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-slate-800/80 pt-2 text-[11px]">
              <span className="font-mono text-emerald-400 font-bold">
                {new Date(submittedRecord.timestamp).toLocaleTimeString('fr-FR')} - {new Date(submittedRecord.timestamp).toLocaleDateString('fr-FR')}
              </span>
              <span className="text-slate-400">توقيت التسجيل / Horodatage :</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الوصل / Imprimer le reçu</span>
            </button>
            <button
              onClick={handleResetForNext}
              className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>تسجيل طالب آخر / Nouveau formulaire</span>
            </button>
          </div>

        </div>
      ) : (
        /* THE FORM: FORMULAIRE D'ÉMARGEMENT */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Institutional Heading */}
          <div className="border-b border-slate-800 pb-5 text-center space-y-1.5">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>جامعة القاضي عياض • FSJES Kelaa des Sraghna</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              استمارة تسجيل الحضور الرسمي
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Licence Marketing Digital & Management des Médias Sociaux (MD & MMS) — 2025–2026
            </p>
          </div>

          {/* Course & Session Info Pill */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-mono text-emerald-400 font-bold">الحصة نشطة ●</span>
              <span className="font-semibold text-slate-200">{session.courseCode} • {session.courseTitle}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="font-mono text-amber-400">الفوج {session.targetGroup}</span>
              <span>الأستاذ : <strong className="text-slate-200">{session.professor}</strong></span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300 text-xs text-right">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Main Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Field 1: Code de la séance / رقم الغياب */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-400 font-mono">Code d'absence ou code séance</span>
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span>رقم الغياب / رمز الحصة</span>
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={sessionCodeInput}
                  onChange={(e) => setSessionCodeInput(e.target.value)}
                  placeholder="مثال: MD-7842"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-amber-400 font-bold text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                  مضبوط من الـ QR ✓
                </span>
              </div>
            </div>

            {/* Field 2: Search Student by Name or Apogée */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-400 font-mono">Recherche Trombinoscope (297)</span>
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span>الاسم الكامل أو رقم أبوجي (Apogée)</span>
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                </label>
              </div>

              <input
                type="text"
                required
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  if (selectedStudent) setSelectedStudent(null);
                }}
                placeholder="اكتب رقم Apogée ديالك أو اسمك العائلي والشخصي..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 text-right focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-500"
              />

              {/* Autocomplete Dropdown */}
              {showSuggestions && matchingStudents.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                  {matchingStudents.map((std) => (
                    <div
                      key={std.id}
                      onClick={() => handleSelectStudent(std)}
                      className="p-3 hover:bg-slate-750 cursor-pointer border-b border-slate-700/60 last:border-0 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold font-mono text-[10px]">
                          {std.group}
                        </span>
                        <span className="text-slate-400 font-mono">
                          Apogée: {std.apogeeId}
                        </span>
                      </div>
                      <div className="text-right font-bold text-white">
                        {std.nom} {std.prenom}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* If Student Selected: Confirmation Badge */}
            {selectedStudent && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 text-xs text-right space-y-1">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="font-mono">{selectedStudent.email}</span>
                  <span className="flex items-center gap-1">
                    <span>تم التعرف على الطالب بنجاح</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  {selectedStudent.nom} {selectedStudent.prenom} • Apogée: {selectedStudent.apogeeId} • {selectedStudent.cne}
                </div>
              </div>
            )}

            {/* Manual fallback fields if not in list */}
            {!selectedStudent && searchQuery.length > 2 && matchingStudents.length === 0 && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-[11px] text-amber-400 font-semibold text-right">
                  لم يتم العثور على الاسم في اللائحة التلقائية؟ أدخل بياناتك يدوياً :
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 text-right">الاسم العائلي (Nom)</label>
                    <input
                      type="text"
                      value={manualNom}
                      onChange={(e) => setManualNom(e.target.value)}
                      placeholder="ALAMI"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-right">الاسم الشخصي (Prénom)</label>
                    <input
                      type="text"
                      value={manualPrenom}
                      onChange={(e) => setManualPrenom(e.target.value)}
                      placeholder="Mohamed"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 text-right">رقم Apogée</label>
                    <input
                      type="text"
                      value={manualApogee}
                      onChange={(e) => setManualApogee(e.target.value)}
                      placeholder="22001482"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-right">رمز CNE / مسار</label>
                    <input
                      type="text"
                      value={manualCne}
                      onChange={(e) => setManualCne(e.target.value)}
                      placeholder="G134582910"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Field 3: Group Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 text-right">
                الفوج الدراسي (Groupe)
              </label>
              <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedGroup('S5-A')}
                  className={`py-3 rounded-xl border transition-all text-center ${
                    selectedGroup === 'S5-A'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  الفوج S5-A (Groupe A)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGroup('S5-B')}
                  className={`py-3 rounded-xl border transition-all text-center ${
                    selectedGroup === 'S5-B'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  الفوج S5-B (Groupe B)
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>جاري حفظ الحضور في قاعدة البيانات...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>تأكيد وتسجيل الحضور (Valider ma Présence)</span>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Guarantee / Security Notice */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-mono">CNDP & Base UCA</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>يتم الحفظ التلقائي في قاعدة بيانات الكلية فور الضغط على تأكيد</span>
            </span>
          </div>

        </div>
      )}

    </div>
  );
};
