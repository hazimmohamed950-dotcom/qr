import React from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  GraduationCap 
} from 'lucide-react';
import { AttendanceSession, Student } from '../types/attendance';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: AttendanceSession;
  students: Student[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  session,
  students,
}) => {
  if (!isOpen) return null;

  const expectedStudents = students.filter(s => 
    session.targetGroup === 'ALL' ? true : s.group === session.targetGroup
  );

  const recordMap = new Map(session.records.map(r => [r.studentId, r]));
  const presentCount = session.records.length;
  const absentCount = expectedStudents.length - presentCount;
  const attendanceRate = expectedStudents.length > 0 
    ? Math.round((presentCount / expectedStudents.length) * 100) 
    : 0;

  // Export to standard Apogée CSV format
  const handleExportCsv = () => {
    const headers = [
      'CODE_APOGEE',
      'CNE_MASSAR',
      'NOM',
      'PRENOM',
      'GROUPE',
      'STATUT',
      'HORODATAGE',
      'RECU_CRYPTOGRAPHIQUE',
    ];

    const rows = expectedStudents.map(student => {
      const rec = recordMap.get(student.id);
      const isPresent = !!rec;
      return [
        student.apogeeId,
        student.cne,
        `"${student.nom}"`,
        `"${student.prenom}"`,
        student.group,
        isPresent ? 'PRESENT' : 'ABSENT',
        rec ? rec.timestamp : '',
        rec ? rec.receiptHash : '',
      ].join(';');
    });

    const csvContent = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PV_Emargement_${session.courseCode}_Groupe_${session.targetGroup}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Procès-Verbal Officiel d'Émargement
              </h3>
              <p className="text-[11px] text-slate-400">
                Format d'exportation compatible Apogée UCA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-900/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter CSV Apogée</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official PV Document Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 print:text-black print:bg-white">
          
          {/* Institutional Header */}
          <div className="text-center border-b border-slate-800 pb-5 space-y-1">
            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              Royaume du Maroc • Université Cadi Ayyad
            </div>
            <div className="text-base font-extrabold text-white">
              Faculté des Sciences Juridiques, Économiques et Sociales — Kelaa des Sraghna
            </div>
            <div className="text-xs text-amber-400 font-semibold">
              Licence Marketing Digital & Management des Médias Sociaux (MD & MMS) — Année Universitaire 2025–2026
            </div>
            <div className="text-[11px] text-slate-400">
              Coordinateur Pédagogique : Pr. Zakaria KNIDIRI
            </div>
          </div>

          {/* Session Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Matière</span>
              <span className="font-bold text-white">[{session.courseCode}] {session.courseTitle}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Enseignant</span>
              <span className="font-bold text-white">{session.professor}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Groupe Cible</span>
              <span className="font-bold text-amber-400">Groupe {session.targetGroup}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Taux de Présence</span>
              <span className="font-bold text-emerald-400">{attendanceRate}% ({presentCount}/{expectedStudents.length})</span>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Apogée</th>
                  <th className="py-2.5 px-3">CNE</th>
                  <th className="py-2.5 px-3">Nom & Prénom</th>
                  <th className="py-2.5 px-3">Groupe</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3">Heure Émargement</th>
                  <th className="py-2.5 px-3">Preuve Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {expectedStudents.map((student, idx) => {
                  const rec = recordMap.get(student.id);
                  const isPresent = !!rec;

                  return (
                    <tr 
                      key={student.id}
                      className={idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/90'}
                    >
                      <td className="py-2 px-3 text-slate-300 font-bold">{student.apogeeId}</td>
                      <td className="py-2 px-3 text-slate-400">{student.cne}</td>
                      <td className="py-2 px-3 font-sans font-semibold text-slate-200">
                        {student.nom} {student.prenom}
                      </td>
                      <td className="py-2 px-3 text-slate-400">{student.group}</td>
                      <td className="py-2 px-3">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>PRÉSENT</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>ABSENT</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-400">
                        {rec ? new Date(rec.timestamp).toLocaleTimeString('fr-FR') : '—'}
                      </td>
                      <td className="py-2 px-3 text-[10px] text-slate-400 truncate max-w-[120px]">
                        {rec ? rec.receiptHash : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Signatures Footer */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-800 text-xs">
            <div className="border border-slate-800 rounded-xl p-4 text-center min-h-[90px] flex flex-col justify-between">
              <span className="font-semibold text-slate-400">L'Enseignant Responsable du Module</span>
              <span className="text-[10px] text-slate-400 italic">Signature & Cachet</span>
            </div>
            <div className="border border-slate-800 rounded-xl p-4 text-center min-h-[90px] flex flex-col justify-between">
              <span className="font-semibold text-slate-400">Le Coordonnateur de la Filière (Pr. Zakaria KNIDIRI)</span>
              <span className="text-[10px] text-slate-400 italic">Signature & Cachet</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
