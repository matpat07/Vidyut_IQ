import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { SimulationBar } from './components/layout/SimulationBar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { CampusRadar } from './components/radar/CampusRadar';
import { RoomDetailModal } from './components/radar/RoomDetailModal';
import { HourlyEnergyChart } from './components/analytics/HourlyEnergyChart';
import { DepartmentLeaderboard } from './components/analytics/DepartmentLeaderboard';
import { ImpactSummaryCards } from './components/analytics/ImpactSummaryCards';
import { AlertsTriageView } from './components/alerts/AlertsTriageView';
import { AuditTrail } from './components/alerts/AuditTrail';
import { SettingsView } from './components/settings/SettingsView';
import { TeacherScheduleView } from './components/teacher/TeacherScheduleView';
import { RoomAvailabilityFinder } from './components/student/RoomAvailabilityFinder';
import { HardwareCostingModal } from './components/hardware/HardwareCostingModal';
import { AssumptionsModal } from './components/analytics/AssumptionsModal';

const MainLayout: React.FC = () => {
  const { currentRole } = useSimulation();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return localStorage.getItem('vidyutiq-theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
  });
  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('vidyutiq-theme', theme); } catch { /* Storage can be unavailable. */ }
  }, [theme]);

  const [currentView, setCurrentView] = useState<NavView>('DASHBOARD');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState<boolean>(false);
  const [inspectingRoomId, setInspectingRoomId] = useState<string | null>(null);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);
  const [isAssumptionsModalOpen, setIsAssumptionsModalOpen] = useState<boolean>(false);

  // Sync role changes with respective default portal views
  React.useEffect(() => {
    if (currentRole === 'TEACHER') {
      setCurrentView('TEACHER');
    } else if (currentRole === 'STUDENT') {
      setCurrentView('STUDENT_FINDER');
    } else if (currentRole === 'ADMIN' && (currentView === 'TEACHER' || currentView === 'STUDENT_FINDER')) {
      setCurrentView('DASHBOARD');
    }
  }, [currentRole]);

  return (
    <div className={`app-shell${currentView === 'RADAR' ? ' is-radar' : ''}`}>
      
      {/* SaaS Vertical Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
      />

      {/* Main Content Area (Offset for Desktop Sidebar) */}
      <div className="app-content">
        
        {/* Top Header */}
        <Header theme={theme} onToggleTheme={() => setTheme(value => value === 'dark' ? 'light' : 'dark')} 
          currentView={currentView}
          onOpenMobileSidebar={() => setIsOpenMobileSidebar(true)}
          onOpenAssumptions={() => setIsAssumptionsModalOpen(true)}
          onOpenHardwareBOM={() => setIsHardwareModalOpen(true)}
        />

        {/* Global Simulation Bar (Time slider, speed, & judge presets) */}
        <SimulationBar />

        {/* Dynamic Page Views with Smooth Crossfade */}
        <main className="page-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* View 1: Executive Dashboard */}
              {currentView === 'DASHBOARD' && (
                <DashboardOverview
                  onNavigate={setCurrentView}
                  onInspectRoom={id => setInspectingRoomId(id)}
                />
              )}

              {/* View 2: Live Monitoring Campus Radar */}
              {currentView === 'RADAR' && (
                <CampusRadar onInspectRoom={id => setInspectingRoomId(id)} />
              )}

              {/* View 3: Energy Analytics */}
              {currentView === 'ANALYTICS' && (
                <div className="space-y-6">
                  <ImpactSummaryCards />
                  <HourlyEnergyChart />
                  <DepartmentLeaderboard />
                </div>
              )}

              {/* View 4: Waste Alerts Triage */}
              {currentView === 'ALERTS' && (
                <AlertsTriageView onInspectRoom={id => setInspectingRoomId(id)} />
              )}

              {/* View 5: Audit Trail Log */}
              {currentView === 'AUDIT' && (
                <AuditTrail />
              )}

              {/* View 6: System Settings & Hardware BOM */}
              {currentView === 'SETTINGS' && (
                <SettingsView />
              )}

              {/* View 7: Faculty Lecture Cancellation Portal */}
              {currentView === 'TEACHER' && (
                <TeacherScheduleView />
              )}

              {/* View 8: Student Room Availability Finder */}
              {currentView === 'STUDENT_FINDER' && (
                <RoomAvailabilityFinder />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Light Minimalist Footer */}
        <footer className="border-t border-line/80 bg-panel px-4 py-4 text-center text-xs text-muted space-y-1">
          <div className="flex items-center justify-center gap-2">
            
            <span className="font-semibold text-ink">VidyutIQ</span>
            <span className="text-muted">•</span>
            <span className="text-muted">Smarter Energy. Greener Campus.</span>
          </div>
          <p className="text-xs text-muted">
            Timetable-Aware Energy Radar & Classroom Availability
          </p>
        </footer>

      </div>

      {/* Modals with AnimatePresence */}
      <AnimatePresence>
        {inspectingRoomId && (
          <RoomDetailModal
            key="room-detail"
            roomId={inspectingRoomId}
            onClose={() => setInspectingRoomId(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHardwareModalOpen && (
          <HardwareCostingModal
            key="hardware-costing"
            onClose={() => setIsHardwareModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAssumptionsModalOpen && (
          <AssumptionsModal
            key="assumptions"
            onClose={() => setIsAssumptionsModalOpen(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SimulationProvider>
      <MainLayout />
    </SimulationProvider>
  );
};

export default App;
