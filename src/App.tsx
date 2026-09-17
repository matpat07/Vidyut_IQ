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
    <div className="min-h-screen flex bg-[#f8f9fe] text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* SaaS Vertical Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
      />

      {/* Main Content Area (Offset for Desktop Sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Top Header */}
        <Header
          currentView={currentView}
          onOpenMobileSidebar={() => setIsOpenMobileSidebar(true)}
          onOpenAssumptions={() => setIsAssumptionsModalOpen(true)}
          onOpenHardwareBOM={() => setIsHardwareModalOpen(true)}
        />

        {/* Global Simulation Bar (Time slider, speed, & judge presets) */}
        <SimulationBar />

        {/* Dynamic Page Views with Smooth Crossfade */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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
        <footer className="border-t border-slate-200/80 bg-white px-4 py-4 text-center text-xs text-slate-400 space-y-1">
          <div className="flex items-center justify-center gap-2">
            <img src="/vidyutiq-logo.jpg" alt="VidyutIQ" className="h-6 w-auto object-contain rounded" />
            <span className="font-semibold text-slate-700">VidyutIQ</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Smarter Energy. Greener Campus.</span>
          </div>
          <p className="text-xs text-slate-400">
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
