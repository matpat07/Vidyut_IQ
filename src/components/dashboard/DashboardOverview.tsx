import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import { SimulationWorkflowStepper } from './SimulationWorkflowStepper';
import { HourlyEnergyChart } from '../analytics/HourlyEnergyChart';
import {
  Building2,
  Users,
  AlertTriangle,
  Leaf,
  ShieldAlert,
  Radio,
  Power,
  ArrowRight,
  Sparkles,
  Zap,
  CalendarX,
  Monitor,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { NavView } from '../layout/Sidebar';

interface DashboardOverviewProps {
  onNavigate: (view: NavView) => void;
  onInspectRoom: (roomId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  onInspectRoom,
}) => {
  const {
    roomDataList,
    activeAlerts,
    impactSummary,
    assumptions,
    simulateEcoOff,
    simulateCampusEcoRemediation,
    loadPresetScenario,
    timeString,
    day,
  } = useSimulation();

  const totalRooms = roomDataList.length;
  const inSessionCount = roomDataList.filter(
    r => r.occupancyProfile.expectedStatus === 'SCHEDULED'
  ).length;

  const totalKw = (impactSummary.currentTotalDrawWatts / 1000).toFixed(1);
  const wastedKw = (impactSummary.currentWastedDrawWatts / 1000).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* 1. TOP SUMMARY SECTION: 4 Clean KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Total Rooms */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="card-base p-4 sm:p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Rooms
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 block">
              {totalRooms}
            </span>
            <span className="text-xs text-indigo-700 font-semibold mt-1 inline-block">
              16 Node Campus Pilot
            </span>
          </div>
        </motion.div>

        {/* Metric 2: Currently Occupied */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2, delay: 0.04 }}
          className="card-base p-4 sm:p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Occupied Rooms
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 block">
              {inSessionCount}
            </span>
            <span className="text-xs text-blue-700 font-semibold mt-1 inline-block">
              Active Lectures Verified
            </span>
          </div>
        </motion.div>

        {/* Metric 3: Rooms Using Unnecessary Energy */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2, delay: 0.08 }}
          className={`card-base p-4 sm:p-5 flex flex-col justify-between ${
            activeAlerts.length > 0 ? 'border-rose-300 bg-rose-50/15' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Waste Detected
            </span>
            <div className={`p-2 rounded-xl ${
              activeAlerts.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`font-mono text-2xl sm:text-3xl font-black block ${
              activeAlerts.length > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {activeAlerts.length}
            </span>
            <span className={`text-xs font-bold mt-1 inline-block ${
              activeAlerts.length > 0 ? 'text-rose-600' : 'text-emerald-700'
            }`}>
              {activeAlerts.length > 0 ? `+${wastedKw} kW Avoidable` : '0 Wastage • All Optimal'}
            </span>
          </div>
        </motion.div>

        {/* Metric 4: Estimated Energy Saved */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2, delay: 0.12 }}
          className="card-base p-4 sm:p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Energy Saved
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 block">
              {impactSummary.accumulatedKwhSaved.toFixed(1)} <span className="text-sm font-bold text-emerald-600">kWh</span>
            </span>
            <span className="text-xs text-emerald-700 font-bold mt-1 inline-block">
              ₹{impactSummary.accumulatedCostSavedInr.toFixed(0)} Saved (@ ₹{assumptions.tariffInrPerKwh}/kWh)
            </span>
          </div>
        </motion.div>

      </div>

      {/* 2. SIMULATION WORKFLOW STEPPER */}
      <SimulationWorkflowStepper />

      {/* 3. MAIN VISUAL SECTION: Campus Room Grid & Interactive Monitoring */}
      <div className="card-base p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900">
                Campus Live Matrix (16 Rooms)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any room to inspect telemetry and controls.
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Normal</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600">Needs Attention</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-slate-600">Active Wastage</span>
            </span>
          </div>
        </div>

        {/* 16-Room Interactive Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
          {roomDataList.map((room) => {
            const isAlerting = !!room.activeAlert;
            const isEcoOff = room.roomState.isEcoOff;
            const status = room.occupancyProfile.expectedStatus;

            // Determine status badge and color
            let tileBorder = 'border-slate-200 hover:border-indigo-300';
            let tileBg = 'bg-white';
            let dotColor = 'bg-emerald-500';
            let statusText = status === 'SCHEDULED' ? 'In Session' : 'Vacant';

            if (isAlerting) {
              tileBorder = 'border-rose-400 bg-rose-50/50 shadow-sm';
              tileBg = 'bg-rose-50/40';
              dotColor = 'bg-rose-500 animate-ping';
              statusText = 'Wasting';
            } else if (isEcoOff) {
              tileBorder = 'border-emerald-300 bg-emerald-50/30';
              tileBg = 'bg-emerald-50/20';
              dotColor = 'bg-emerald-600';
              statusText = 'Eco-Saved';
            } else if (status === 'BREAK' || status === 'CANCELLED') {
              tileBorder = 'border-amber-300 bg-amber-50/30';
              tileBg = 'bg-amber-50/20';
              dotColor = 'bg-amber-500';
              statusText = status === 'BREAK' ? 'Break' : 'Cancelled';
            }

            return (
              <motion.button
                key={room.metadata.id}
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ duration: 0.15 }}
                onClick={() => onInspectRoom(room.metadata.id)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${tileBorder} ${tileBg}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-xs font-black text-slate-900">
                      {room.metadata.id}
                    </span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                  </div>
                  <span className="text-xs text-slate-500 block truncate leading-tight">
                    {room.metadata.name.replace('Classroom', 'CR').replace('Laboratory', 'Lab')}
                  </span>
                </div>

                <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {room.telemetry.simulatedPowerWatts}W
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {statusText}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 4. ENERGY OVERVIEW & ALERTS SECTION (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left 3 Cols: Hourly Energy Consumption Profile */}
        <div className="lg:col-span-3">
          <HourlyEnergyChart />
        </div>

        {/* Right 2 Cols: Compact Action-Oriented Alerts */}
        <div className="lg:col-span-2 card-base p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded-lg ${
                  activeAlerts.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  Active Alerts ({activeAlerts.length})
                </h3>
              </div>

              {activeAlerts.length > 0 && (
                <button
                  onClick={simulateCampusEcoRemediation}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Power className="w-3 h-3" />
                  <span>Remediate All</span>
                </button>
              )}
            </div>

            {/* Compact Alert Cards */}
            <div className="mt-3 space-y-3">
              {activeAlerts.length > 0 ? (
                activeAlerts.slice(0, 3).map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2.5"
                  >
                    {/* Header line: Room + Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-rose-950 px-2 py-0.5 rounded bg-white border border-rose-200">
                          {alert.roomId}
                        </span>
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                          {alert.roomName}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-black text-rose-700">
                        +{alert.excessWatts}W
                      </span>
                    </div>

                    {/* Short one-sentence description */}
                    <p className="text-xs text-rose-900 leading-snug">
                      {alert.reason}
                    </p>

                    {/* 3 Clear Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onInspectRoom(alert.roomId)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Radio className="w-3 h-3 text-indigo-600" />
                        <span>Check Presence</span>
                      </button>

                      <button
                        onClick={() => simulateEcoOff(alert.roomId)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
                      >
                        <Power className="w-3 h-3" />
                        <span>Shutdown</span>
                      </button>

                      <button
                        onClick={() => onInspectRoom(alert.roomId)}
                        className="py-1.5 px-2 rounded-lg hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center gap-0.5 transition-colors"
                        title="View Details"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-xs text-slate-800">All Circuits Running Optimally</p>
                  <p className="text-xs text-slate-400">
                    No unattended ghost loads detected at {timeString}.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Scenario Preset Triggers for Judges */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Quick Scenarios (1-Click)</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => loadPresetScenario('LUNCH_BREAK')}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-semibold text-left flex items-center gap-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="truncate">1:15 PM Lunch Break</span>
              </button>

              <button
                onClick={() => loadPresetScenario('TEACHER_CANCEL')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold text-left flex items-center gap-1.5 transition-colors"
              >
                <CalendarX className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Teacher Cancel</span>
              </button>

              <button
                onClick={() => loadPresetScenario('IDLE_LAB')}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-semibold text-left flex items-center gap-1.5 transition-colors"
              >
                <Monitor className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">3:30 PM Idle Lab</span>
              </button>

              <button
                onClick={() => loadPresetScenario('NORMAL_CLASS')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-left flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Normal Schedule</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
