import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  Camera, 
  Smartphone, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  GraduationCap, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';
import { Student, AttendanceSession, ScanResult, AttendanceRecord } from '../types/attendance';
import { generateRotatingQRPayload, verifyScan } from '../utils/crypto';

interface StudentMobileViewProps {
  session: AttendanceSession;
  onRecordScan: (record: AttendanceRecord) => void;
  students: Student[];
}

export const StudentMobileView: React.FC<StudentMobileViewProps> = ({
  session,
  onRecordScan,
  students,
}) => {
  // Currently simulated authenticated student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const [scanState, setScanState] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Check if current student is already recorded in this session
  const isAlreadyPresent = session.records.some(r => r.studentId === currentStudent?.id);

  // Fire celebratory confetti on instant validation
  const triggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6'],
    });
  };

  // Perform Zero-Typing Scan Verification
  const executeScan = async (forcedPayload?: string) => {
    if (!currentStudent) return;
    setScanState('SCANNING');
    setCameraError(null);

    // Simulate rapid network roundtrip (< 40ms)
    await new Promise(resolve => setTimeout(resolve, 80));

    try {
      let payloadToVerify: string;

      if (forcedPayload) {
        payloadToVerify = forcedPayload;
      } else {
        // Get current live rotating payload from session
        const { rawString } = await generateRotatingQRPayload(session, 8);
        payloadToVerify = rawString;
      }

      const result = await verifyScan(payloadToVerify, session, currentStudent, session.records);
      setScanResult(result);

      if (result.success && result.record) {
        setScanState('SUCCESS');
        onRecordScan(result.record);
        triggerConfetti();
      } else {
        setScanState('ERROR');
      }
    } catch (err: any) {
      setScanState('ERROR');
      setScanResult({
        success: false,
        message: err?.message || 'Erreur lors du traitement du scan.',
        errorReason: 'INVALID_SIGNATURE',
      });
    }
  };

  // Test WhatsApp Relay Attack (Simulate scanning a 30-second-old expired QR code)
  const testExpiredWhatsAppScreenshot = async () => {
    if (!currentStudent) return;
    setScanState('SCANNING');
    await new Promise(resolve => setTimeout(resolve, 80));

    // Create an expired payload from 5 epochs ago (~40 seconds old)
    const oldEpoch = Math.floor(Date.now() / 1000 / 8) - 5;
    const fakeExpiredPayload = JSON.stringify({
      v: 2,
      sid: session.id,
      ep: oldEpoch,
      exp: (oldEpoch + 1) * 8,
      grp: session.targetGroup,
      sig: 'expired_hmac_hash',
      nonce: 'wh4ts4pp_rel4y',
    });

    const result = await verifyScan(fakeExpiredPayload, session, currentStudent, session.records);
    setScanResult(result);
    setScanState('ERROR');
  };

  // Switch student
  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    setScanState('IDLE');
    setScanResult(null);
  };

  // Reset scan state
  const handleReset = () => {
    setScanState('IDLE');
    setScanResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Educational Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-transparent border border-amber-500/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Expérience Étudiant Zéro-Saisie (Zero-Typing)</h2>
            <p className="text-xs text-slate-400">
              L'étudiant ne saisit ni son nom, ni son Apogée, ni ne clique sur "Envoyer". L'identité est résolue instantanément via Google Workspace (@uca.ac.ma).
            </p>
          </div>
        </div>

        {/* Identity selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Tester avec l'étudiant :</label>
          <select
            value={selectedStudentId}
            onChange={(e) => handleStudentChange(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500"
          >
            {students.slice(0, 30).map(std => (
              <option key={std.id} value={std.id}>
                {std.nom} {std.prenom} ({std.group} - {std.apogeeId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Smartphone Chassis Container */}
      <div className="flex justify-center">
        <div className="w-full max-w-[380px] bg-slate-900 border-4 border-slate-700 rounded-[44px] shadow-2xl p-4 relative overflow-hidden flex flex-col min-h-[660px]">
          
          {/* Phone Speaker & Dynamic Island */}
          <div className="w-full flex justify-center mb-3">
            <div className="w-24 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-800" />
              <span className="w-8 h-1 rounded-full bg-slate-800" />
            </div>
          </div>

          {/* Student App Screen Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-600/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                UCA
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">Émargement UCA</div>
                <div className="text-[10px] text-slate-400">FSJES Kelaa des Sraghna</div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>SSO Connecté</span>
            </div>
          </div>

          {/* Authenticated Identity Pill */}
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow">
                {currentStudent.prenom[0]}{currentStudent.nom[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {currentStudent.prenom} {currentStudent.nom}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {currentStudent.email}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-300">
                  <span className="bg-slate-700 px-1.5 py-0.2 rounded">Apogée: {currentStudent.apogeeId}</span>
                  <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">{currentStudent.group}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Screen Body depending on State */}
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            
            {/* STATE 1: IDLE / READY TO SCAN */}
            {scanState === 'IDLE' && (
              <div className="space-y-4 w-full my-auto">
                
                {isAlreadyPresent ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                    <p className="font-bold">Présence déjà enregistrée</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Vous avez déjà émargé pour cette séance de {session.courseCode}.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative w-44 h-44 mx-auto border-2 border-dashed border-amber-500/50 rounded-3xl flex flex-col items-center justify-center bg-slate-950/40 p-4">
                      <QrCode className="w-16 h-16 text-amber-400/80 mb-2 animate-pulse" />
                      <span className="text-[11px] font-medium text-slate-300">
                        Visez le vidéoprojecteur
                      </span>
                      <span className="text-[9px] text-slate-500">
                        Détection automatique
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 px-4">
                      Scannez le QR code affiché en classe. La confirmation est immédiate et infalsifiable.
                    </div>

                    {/* Big Action Button (Zero typing simulator) */}
                    <button
                      onClick={() => executeScan()}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Scanner le Vidéoprojecteur</span>
                    </button>
                  </>
                )}

                {/* Educational test buttons */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    Simuler des tests de sécurité :
                  </div>
                  
                  <button
                    onClick={testExpiredWhatsAppScreenshot}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tester Capture WhatsApp (Expirée)</span>
                  </button>
                </div>

              </div>
            )}

            {/* STATE 2: SCANNING / VERIFYING */}
            {scanState === 'SCANNING' && (
              <div className="my-auto space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto" />
                <h3 className="text-sm font-bold text-white">Vérification cryptographique...</h3>
                <p className="text-xs text-slate-400 font-mono">
                  HMAC validation • Atomic lock • SSO match
                </p>
              </div>
            )}

            {/* STATE 3: SUCCESS (PRESENT) */}
            {scanState === 'SUCCESS' && scanResult?.record && (
              <div className="my-auto space-y-4 w-full">
                
                {/* Big Green Stamp */}
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-12 h-12" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-emerald-400 tracking-tight">
                    ✓ PRÉSENT(E)
                  </h3>
                  <p className="text-xs font-semibold text-slate-200 mt-1">
                    {session.courseTitle}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {session.professor} • Salle d'Amphi
                  </p>
                </div>

                {/* Cryptographic Receipt Card */}
                <div className="bg-slate-950/80 rounded-2xl p-3 border border-emerald-500/30 text-left space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Reçu Numérique :</span>
                    <span className="text-emerald-400 font-bold">{scanResult.record.receiptHash}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Horodatage :</span>
                    <span className="text-slate-200">{new Date(scanResult.record.timestamp).toLocaleTimeString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Protocole :</span>
                    <span className="text-slate-200">TOTP-E2EE v2</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Preuve Proximité :</span>
                    <span className="text-slate-200">UCA-Campus-Wifi</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400">
                  Vous pouvez ranger votre smartphone. Votre présence est officialisée et synchronisée avec le serveur.
                </p>

                <button
                  onClick={handleReset}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
                >
                  Retour
                </button>
              </div>
            )}

            {/* STATE 4: ERROR / FRAUD PREVENTED */}
            {scanState === 'ERROR' && scanResult && (
              <div className="my-auto space-y-4 w-full">
                
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 text-rose-400 flex items-center justify-center mx-auto">
                  <XCircle className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-rose-400">
                    Émargement Refusé
                  </h3>
                  <div className="mt-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-left">
                    <p className="text-xs text-rose-200 font-medium">
                      {scanResult.message}
                    </p>
                    <div className="mt-2 text-[10px] text-rose-300/80 font-mono">
                      Code Erreur : {scanResult.errorReason || 'REJECTED'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réessayer avec le QR projeté</span>
                </button>
              </div>
            )}

          </div>

          {/* Phone Bottom Home Indicator */}
          <div className="w-full flex justify-center pt-2">
            <div className="w-28 h-1 bg-slate-700 rounded-full" />
          </div>

        </div>
      </div>

    </div>
  );
};
