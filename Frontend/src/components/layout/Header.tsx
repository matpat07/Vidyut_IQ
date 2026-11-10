import React, { useState, useRef, useEffect } from 'react';
import { useSimulation, UserRole } from '../../context/SimulationContext';
import { useAuth } from '../../context/AuthContext';
import { NavView } from './Sidebar';

interface HeaderProps {
  currentView: NavView;
  onOpenMobileSidebar: () => void;
  onOpenAssumptions?: () => void;
  onOpenHardwareBOM?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const titles: Record<NavView, string> = {
  DASHBOARD: 'Dashboard',
  RADAR: 'Campus Digital Twin & Radar',
  ANALYTICS: 'Energy Analytics',
  ALERTS: 'Waste Alerts',
  AUDIT: 'Audit Trail',
  SETTINGS: 'Settings',
  TEACHER: 'Faculty Portal',
  STUDENT_FINDER: 'Student Room Finder',
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenMobileSidebar,
  theme,
  onToggleTheme,
}) => {
  const { currentRole, setCurrentRole, activeAlerts, simulateCampusEcoRemediation } = useSimulation();
  const { user, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-100 transition-colors">
      
      {/* Left: Menu Trigger + Page Title */}
      <div className="flex items-center gap-4">
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white active:scale-95 transition-all"
          aria-controls="primary-navigation"
          onClick={onOpenMobileSidebar}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <p className="text-[11px] font-semibold tracking-wider uppercase text-cyan-400">
            VidyutIQ / Workspace
          </p>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            {titles[currentView] ?? 'Overview'}
          </h1>
        </div>
      </div>

      {/* Right: Actions, Role Selector, Theme, and Profile */}
      <div className="flex items-center gap-3">
        
        {/* Active Waste Alerts Banner / Button */}
        {activeAlerts.length > 0 && (
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/25 active:scale-95 transition-all animate-pulse"
            onClick={simulateCampusEcoRemediation}
          >
            <span>Remediate all ({activeAlerts.length})</span>
          </button>
        )}

        {/* Role Segmented Switch */}
        <div className="hidden lg:flex items-center p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
          {(['ADMIN', 'TEACHER', 'STUDENT'] as UserRole[]).map((role) => (
            <button
              key={role}
              aria-pressed={currentRole === role}
              onClick={() => setCurrentRole(role)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all active:scale-95 ${
                currentRole === role
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {role === 'ADMIN' ? 'Admin' : role === 'TEACHER' ? 'Faculty' : 'Student'}
            </button>
          ))}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95 transition-all"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Profile Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 active:scale-95 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-inner">
              {userInitial}
            </div>
            <span className="hidden sm:inline max-w-[120px] truncate text-xs font-medium text-slate-300">
              {user?.email ?? 'Account'}
            </span>
            <svg
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isProfileOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Card */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2.5 border-b border-slate-800">
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  Signed In Profile
                </p>
                <p className="text-xs font-semibold text-white truncate mt-1">
                  {user?.email ?? 'Unknown User'}
                </p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                  Role: {currentRole}
                </div>
              </div>

              <div className="p-1">
                <button
                  onClick={async () => {
                    setIsProfileOpen(false);
                    if (signOut) await signOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};