import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  AlertTriangle,
  History,
  Settings,
  Calendar,
  Search,
  Leaf,
  ChevronRight,
  X
} from 'lucide-react';

export type NavView =
  | 'DASHBOARD'
  | 'RADAR'
  | 'ANALYTICS'
  | 'ALERTS'
  | 'AUDIT'
  | 'SETTINGS'
  | 'TEACHER'
  | 'STUDENT_FINDER';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { activeAlerts } = useSimulation();

  const mainNavItems: {
    id: NavView;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'RADAR', label: 'Live Monitoring', icon: Activity },
    { id: 'ANALYTICS', label: 'Energy Analytics', icon: BarChart3 },
    {
      id: 'ALERTS',
      label: 'Waste Alerts',
      icon: AlertTriangle,
      badge: activeAlerts.length > 0 ? activeAlerts.length : undefined,
    },
    { id: 'AUDIT', label: 'Audit Trail', icon: History },
    { id: 'SETTINGS', label: 'Settings & BOM', icon: Settings },
  ];

  const portalNavItems: {
    id: NavView;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'TEACHER', label: 'Faculty Portal', icon: Calendar },
    { id: 'STUDENT_FINDER', label: 'Student Room Finder', icon: Search },
  ];

  const handleNavClick = (view: NavView) => {
    onSelectView(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <img
                src="/vidyutiq-logo.jpg"
                alt="VidyutIQ Logo"
                className="h-9 w-auto max-w-[50px] object-contain rounded-lg shrink-0 border border-slate-100"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">
                    VidyutIQ
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    SaaS
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium truncate max-w-[120px]">Smarter Campus</p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-170px)]">
            
            {/* Section: Main App */}
            <div>
              <span className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Overview & Operations
              </span>
              <nav className="space-y-0.5">
                {mainNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-indigo-600' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Section: Academic Portals */}
            <div>
              <span className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Campus Portals
              </span>
              <nav className="space-y-0.5">
                {portalNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-indigo-600' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                  );
                })}
              </nav>
            </div>

          </div>
        </div>

        {/* Bottom System Status Widget (Single Persistent Connection Status) */}
        <div className="p-3 border-t border-slate-100 bg-[#fbfcfe]">
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-700">Telemetry Nodes</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 font-mono">16 Active</span>
          </div>
        </div>

      </aside>
    </>
  );
};
