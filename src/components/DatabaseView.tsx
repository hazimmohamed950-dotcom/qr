import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  Users, 
  Hash, 
  Layers, 
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { AttendanceRecord } from '../types/attendance';

interface DatabaseViewProps {
  records: AttendanceRecord[];
  onClearRecords: () => void;
  onRefresh: () => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  records,
  onClearRecords,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [groupFilter, setGroupFilter] = useState<'ALL' | 'S5-A' | 'S5-B'>('ALL');

  // Filtered records
  const filteredRecords = records.filter(r => {
    if (groupFilter !== 'ALL' && r.group !== groupFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.studentNom.toLowerCase().includes(q) ||
        r.studentPrenom.toLowerCase().includes(q) ||
        r.apogeeId.includes(q) ||
        r.cne.toLowerCase().includes(q) ||
        (r.sessionCode && r.sessionCode.toLowerCase().includes(q)) ||
        r.receiptHash.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'CODE_APOGEE',
      'CNE_MASSAR',
      'NOM',
      'PRENOM',
      'GROUPE',
      'CODE_SEANCE',
      'HORODATAGE',
      'METHODE',
      'RECU_CRYPTOGRAPHIQUE',
    ];

    const rows = filteredRecords.map(r => [
      r.apogeeId,
      r.cne,
      `"${r.studentNom}"`,
      `"${r.studentPrenom}"`,
      r.group,
      `"${r.sessionCode || 'MD-7842'}"`,
      r.timestamp,
      r.verificationMethod,
      r.receiptHash,
    ].join(';'));

    const csvContent = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Base_Donnees_Presences_UCA_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearWithConfirm = () => {
    if (confirm('هل أنت متأكد من رغبتك في مسح سجل قاعدة البيانات بالكامل؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      onClearRecords();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>قاعدة البيانات المركزية للحضور (Base de Données des Présences)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            سجل الحضور المحفوظ في الـ Base de Données
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            جميع الإدخالات المسجلة عبر الرابط المضمن في الـ QR code أو الماسح الضوئي، محفوظة بشكل دائم في قاعدة البيانات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>تصدير CSV (Apogée)</span>
          </button>

          <button
            onClick={handleClearWithConfirm}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>مسح السجل</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-semibold">إجمالي الحضور المسجل (Total)</span>
          <div className="text-3xl font-black text-white font-mono mt-1">
            {records.length} <span className="text-xs text-slate-400 font-normal">تسجيل</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-amber-400 font-semibold">الفوج S5-A</span>
          <div className="text-3xl font-black text-white font-mono mt-1">
            {records.filter(r => r.group === 'S5-A').length} <span className="text-xs text-slate-400 font-normal">طالب</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-blue-400 font-semibold">الفوج S5-B</span>
          <div className="text-3xl font-black text-white font-mono mt-1">
            {records.filter(r => r.group === 'S5-B').length} <span className="text-xs text-slate-400 font-normal">طالب</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم، رقم Apogée، رقم الغياب، أو وصل التسجيل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-500"
          />
        </div>

        {/* Group Filter */}
        <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setGroupFilter('ALL')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              groupFilter === 'ALL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            الكل ({records.length})
          </button>
          <button
            onClick={() => setGroupFilter('S5-A')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              groupFilter === 'S5-A' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Groupe S5-A
          </button>
          <button
            onClick={() => setGroupFilter('S5-B')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              groupFilter === 'S5-B' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Groupe S5-B
          </button>
        </div>

      </div>

      {/* Table of Database Records */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">رقم Apogée</th>
                <th className="py-3 px-4">رمز CNE</th>
                <th className="py-3 px-4">الاسم الكامل (Nom & Prénom)</th>
                <th className="py-3 px-4">الفوج</th>
                <th className="py-3 px-4">رقم الغياب (Code)</th>
                <th className="py-3 px-4">توقيت الحفظ</th>
                <th className="py-3 px-4">وصل التسجيل (Receipt Hash)</th>
                <th className="py-3 px-4">طريقة الإدخال</th>
                <th className="py-3 px-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    لا توجد تسجيلات مطابقة في قاعدة البيانات حالياً.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-amber-400">{r.apogeeId}</td>
                    <td className="py-2.5 px-4 text-slate-400">{r.cne}</td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-white">
                      {r.studentNom} {r.studentPrenom}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.group === 'S5-A' ? 'bg-amber-500/10 text-amber-300' : 'bg-blue-500/10 text-blue-300'
                      }`}>
                        {r.group}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">{r.sessionCode || 'MD-7842'}</td>
                    <td className="py-2.5 px-4 text-slate-400">
                      {new Date(r.timestamp).toLocaleTimeString('fr-FR')} • {new Date(r.timestamp).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-2.5 px-4 text-emerald-400 font-bold">{r.receiptHash}</td>
                    <td className="py-2.5 px-4 text-[10px] text-slate-400">
                      {r.verificationMethod === 'QR_URL_FORM' ? 'استمارة الرابط (Form URL)' : 'مسح مباشر (E2EE)'}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>محفوظ في الـ DB</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
