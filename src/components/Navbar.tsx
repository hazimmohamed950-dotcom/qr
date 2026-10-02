import React from 'react';
import { 
  Projector, 
  Smartphone, 
  ShieldCheck, 
  Users, 
  FileText, 
  GraduationCap, 
  Activity,
  Lock,
  ClipboardList,
  Database
} from 'lucide-react';

export type NavTab = 'projector' | 'form' | 'database' | 'mobile' | 'security_lab' | 'roster' | 'report';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isSessionActive: boolean;
  attendeesCount: number;
  totalStudents: number;
  courseTitle: string;
  databaseCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isSessionActive,
  attendeesCount,
  totalStudents,
  courseTitle,
  databaseCount,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Institutional Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 text-white font-bold text-lg border border-amber-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                  FSJES Kelaa des Sraghna
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
                  UCA
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate max-w-xs sm:max-w-md">
                <span>Licence MD & MMS</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Coord. Pr. Z. KNIDIRI</span>
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('projector')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                activeTab === 'projector'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Projector className="w-4 h-4" />
              <span>Vidéoprojecteur</span>
              {isSessionActive && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </button>

            {/* NEW TAB: Formulaire Étudiant (رابط الـ QR) */}
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                activeTab === 'form'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>استمارة الحضور (Formulaire)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                رابط QR
              </span>
            </button>

            {/* NEW TAB: Base de Données */}
            <button
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                activeTab === 'database'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Base de Données</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-emerald-400 border border-slate-700">
                {databaseCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                activeTab === 'mobile'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                activeTab === 'roster'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Roster (297)</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                activeTab === 'report'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Rapport</span>
            </button>
          </nav>

          {/* Quick Status Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="text-slate-400">Séance :</span>
              <span className="font-semibold text-slate-200">{courseTitle}</span>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-emerald-400 font-bold">{attendeesCount}/{totalStudents}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Database className="w-3 h-3" />
              <span>DB Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex border-t border-slate-800/80 overflow-x-auto bg-slate-900/95 scrollbar-none px-2 py-1.5 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('projector')}
          className={`py-1.5 px-3 rounded whitespace-nowrap font-medium ${
            activeTab === 'projector' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Projecteur
        </button>
        <button
          onClick={() => setActiveTab('form')}
          className={`py-1.5 px-3 rounded whitespace-nowrap font-bold ${
            activeTab === 'form' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-400'
          }`}
        >
          استمارة الحضور
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`py-1.5 px-3 rounded whitespace-nowrap font-medium ${
            activeTab === 'database' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Base DB ({databaseCount})
        </button>
        <button
          onClick={() => setActiveTab('mobile')}
          className={`py-1.5 px-3 rounded whitespace-nowrap font-medium ${
            activeTab === 'mobile' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Scanner
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`py-1.5 px-3 rounded whitespace-nowrap font-medium ${
            activeTab === 'roster' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          297 Étudiants
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`py-1.5 px-3 rounded whitespace-nowrap font-medium ${
            activeTab === 'report' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Rapport
        </button>
      </div>
    </header>
  );
};

