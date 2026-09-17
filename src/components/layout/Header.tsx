import React from 'react';
import { useSimulation, UserRole } from '../../context/SimulationContext';
import { NavView } from './Sidebar';
import { Menu, ShieldAlert, Zap, Cpu, Sliders, Bell, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentView: NavView;
  onOpenMobileSidebar: () => void;
  onOpenAssumptions: () => void;
  onOpenHardwareBOM: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenMobileSidebar,
  onOpenAssumptions,
  onOpenHardwareBOM,
}) => {
  const { currentRole, setCurrentRole, activeAlerts, simulateCampusEcoRemediation } = useSimulation();

  const getViewTitle = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return 'Dashboard';
      case 'RADAR':
        return 'Live Monitoring';
      case 'ANALYTICS':
        return 'Energy Analytics';
      case 'ALERTS':
        return 'Waste Alerts';
      case 'AUDIT':
        return 'Audit Trail';
      case 'SETTINGS':
        return 'Settings & BOM';
      case 'TEACHER':
        return 'Faculty Portal';
      case 'STUDENT_FINDER':
        return 'Room Finder';
      default:
        return 'VidyutIQ';
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <img src="/vidyutiq-logo.jpg" alt="VidyutIQ" className="h-4 w-auto object-contain rounded-xs lg:hidden" />
            <span>VidyutIQ</span>
            <span>/</span>
            <span className="text-indigo-600 font-semibold">{getViewTitle()}</span>
          </div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight hidden sm:block">
            {getViewTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Quick Actions, Waste Button, & Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Bulk Remediate Quick Action if Alerts Exist */}
        {activeAlerts.length > 0 && (
          <button
            onClick={simulateCampusEcoRemediation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-xs active:scale-95 animate-pulse"
            title="1-Click Cut contactors for all alerting rooms"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Remediate All Waste</span>
            <span className="font-mono">({activeAlerts.length})</span>
          </button>
        )}

        {/* User Role Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          {(['ADMIN', 'TEACHER', 'STUDENT'] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => setCurrentRole(role)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                currentRole === role
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {role === 'ADMIN' && 'Admin'}
              {role === 'TEACHER' && 'Faculty'}
              {role === 'STUDENT' && 'Student'}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
};
