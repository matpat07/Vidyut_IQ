import { useDialog } from '../../hooks/useDialog';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import { generateAIAnomalyInsight } from '../../services/aiAnomalyPreview';
import {
  X,
  ShieldAlert,
  Power,
  BrainCircuit,
  Users,
  Activity,
  Zap,
  Calendar,
  Sliders,
  Cpu,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface RoomDetailModalProps {
  roomId: string;
  onClose: () => void;
  initialTab?: 'status' | 'energy' | 'timetable' | 'sensors' | 'actions';
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  roomId,
  onClose,
  initialTab = 'status'
}) => {
  const dialogRef = useDialog(onClose);
  const { roomDataList, toggleAppliance, simulateEcoOff } = useSimulation();
  const [activeTab, setActiveTab] = useState<'status' | 'energy' | 'timetable' | 'sensors' | 'actions'>(initialTab);

  const data = roomDataList.find(r => r.metadata.id === roomId);

  if (!data) return null;

  const { metadata, roomState, telemetry, occupancyProfile, activeAlert } = data;

  const aiInsight = activeAlert
    ? generateAIAnomalyInsight(activeAlert, telemetry, metadata)
    : null;

  const excessWatts = activeAlert ? activeAlert.excessWatts : 0;
  const isWasting = Boolean(activeAlert);

  const tabs = [
    { id: 'status' as const, label: 'Current Status', icon: Activity },
    { id: 'energy' as const, label: 'Energy Usage', icon: Zap },
    { id: 'timetable' as const, label: 'Timetable', icon: Calendar },
    { id: 'sensors' as const, label: 'Sensors & Simulation', icon: Cpu },
    { id: 'actions' as const, label: 'Actions', icon: Sliders },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink/70 backdrop-blur-xs"
      />

      {/* Modal Container */}
      <motion.div
        ref={dialogRef} role="dialog" aria-modal="true" aria-label="Room details" tabIndex={-1}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 bg-panel border border-line/30 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-line/30 flex items-center justify-between bg-panel/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold px-2.5 py-1 rounded-lg bg-panel text-ink border border-line/30">
              {metadata.id}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-medium text-ink leading-tight">
                  {metadata.name}
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                    roomState.isEcoOff
                      ? 'bg-soft text-ink'
                      : isWasting
                      ? 'bg-soft text-danger'
                      : 'bg-soft text-ink'
                  }`}
                >
                  {roomState.isEcoOff ? 'Eco-Off' : isWasting ? 'Wastage' : 'Normal'}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {metadata.block} • Floor {metadata.floor} • {metadata.department} (Cap: {metadata.capacity})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted hover:text-ink hover:bg-soft transition-colors"
          >
            <span>Close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-line/30 bg-panel flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-line/30 text-ink'
                    : 'border-transparent text-muted hover:text-ink hover:border-line/30'
                }`}
              >
                
                <span>{tab.label}</span>
                {tab.id === 'actions' && isWasting && (
                  <span className="w-2 h-2 rounded-full bg-danger " />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <AnimatePresence mode="wait">
            {/* TAB 1: Current Status */}
            {activeTab === 'status' && (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Active Alert Banner */}
                {activeAlert && (
                  <div className="p-3.5 rounded-xl bg-panel border border-line/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      
                      <div>
                        <span className="font-medium text-xs text-danger block">
                          {activeAlert.reason}
                        </span>
                        <span className="text-xs text-danger font-mono font-medium">
                          Excess: +{activeAlert.excessWatts} W (₹{activeAlert.estimatedHourlyCostWastedInr}/hr)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => simulateEcoOff(metadata.id)}
                      className="px-3 py-1.5 rounded-lg bg-danger hover:bg-danger text-on-accent text-xs font-medium transition-colors whitespace-nowrap shadow-xs"
                    >
                      Simulate Shutdown
                    </button>
                  </div>
                )}

                {/* 3 Core Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Occupancy Card */}
                  <div className="p-4 rounded-xl bg-panel border border-line/30">
                    <div className="flex items-center justify-between text-muted mb-1">
                      <span className="text-xs font-medium">Radar Occupancy</span>
                      
                    </div>
                    <span className="font-mono text-lg font-semibold text-ink block">
                      {telemetry.simulatedPirPresence ? `${telemetry.simulatedOccupantCount} Seated` : 'Vacant (0)'}
                    </span>
                    <span className="text-xs text-muted block mt-0.5">
                      {telemetry.simulatedPirPresence ? 'mmWave: Active Motion' : 'mmWave: Room Clear'}
                    </span>
                  </div>

                  {/* Power Draw Card */}
                  <div className="p-4 rounded-xl bg-panel border border-line/30">
                    <div className="flex items-center justify-between text-muted mb-1">
                      <span className="text-xs font-medium">Power Draw</span>
                      
                    </div>
                    <span className="font-mono text-lg font-semibold text-ink block">
                      {telemetry.simulatedPowerWatts} <span className="text-xs font-normal text-muted">W</span>
                    </span>
                    <span className="text-xs text-muted block mt-0.5">
                      Baseline Standby: {telemetry.baselineStandbyWatts} W
                    </span>
                  </div>

                  {/* Schedule Card */}
                  <div className="p-4 rounded-xl bg-panel border border-line/30">
                    <div className="flex items-center justify-between text-muted mb-1">
                      <span className="text-xs font-medium">Schedule State</span>
                      
                    </div>
                    <span className="font-mono text-base font-semibold text-ink block truncate">
                      {occupancyProfile.expectedStatus}
                    </span>
                    <span className="text-xs text-muted block mt-0.5 truncate">
                      {occupancyProfile.currentLecture?.subject || 'No session scheduled'}
                    </span>
                  </div>
                </div>

                {/* Quick Status Comparison */}
                <div className="p-4 rounded-xl bg-panel border border-line/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-ink">Contactor Relay State</span>
                    <span className={`font-mono font-medium px-2 py-0.5 rounded ${roomState.isEcoOff ? 'bg-panel text-danger border border-line/30' : 'bg-panel text-ink border border-line/30'}`}>
                      {roomState.isEcoOff ? 'TRIPPED (Eco-Off)' : 'CLOSED (Active)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-ink">Ambient Temperature (BME280)</span>
                    <span className="font-mono font-medium text-ink">{telemetry.simulatedTempCelsius} °C</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-ink">Grid Voltage & Current</span>
                    <span className="font-mono font-medium text-ink">{telemetry.simulatedVoltage}V / {telemetry.simulatedCurrent}A</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: Energy Usage */}
            {activeTab === 'energy' && (
              <motion.div
                key="energy"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* 4 Energy Stat Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-panel border border-line/30">
                    <span className="text-xs text-muted block">Active Draw</span>
                    <span className="font-mono text-base font-semibold text-ink block mt-0.5">
                      {telemetry.simulatedPowerWatts} W
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-panel border border-line/30">
                    <span className="text-xs text-muted block">Baseline Standby</span>
                    <span className="font-mono text-base font-semibold text-ink block mt-0.5">
                      {telemetry.baselineStandbyWatts} W
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-panel border border-line/30">
                    <span className="text-xs text-muted block">Excess Wastage</span>
                    <span className={`font-mono text-base font-semibold block mt-0.5 ${excessWatts > 0 ? 'text-danger' : 'text-ink'}`}>
                      {excessWatts > 0 ? `+${excessWatts} W` : '0 W'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-panel border border-line/30">
                    <span className="text-xs text-muted block">Est. Cost Burn</span>
                    <span className={`font-mono text-base font-semibold block mt-0.5 ${activeAlert ? 'text-ink' : 'text-ink'}`}>
                      ₹{activeAlert ? activeAlert.estimatedHourlyCostWastedInr : '0.00'}/hr
                    </span>
                  </div>
                </div>

                {/* Circuit Load Distribution */}
                <div className="p-4 rounded-xl bg-panel border border-line/30 space-y-3">
                  <h4 className="text-xs font-medium text-ink uppercase tracking-wider">
                    Connected Sub-Circuits & Power Draw
                  </h4>
                  <div className="space-y-2">
                    {roomState.appliances.map((app, idx) => {
                      const totalAppWatts = app.count * app.wattageEach;
                      const isPowering = app.isOn && !roomState.isEcoOff;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-panel border border-line/30 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isPowering ? 'bg-accent' : 'bg-soft'}`} />
                            <span className="font-medium text-ink">{app.name}</span>
                            <span className="text-muted font-mono">({app.count} units × {app.wattageEach}W)</span>
                          </div>
                          <span className={`font-mono font-medium ${isPowering ? 'text-ink' : 'text-muted'}`}>
                            {isPowering ? `${totalAppWatts} W` : '0 W'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: Timetable */}
            {activeTab === 'timetable' && (
              <motion.div
                key="timetable"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Schedule vs Reality Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Expected Schedule */}
                  <div className="p-4 rounded-xl bg-panel border border-line/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted uppercase tracking-wider">
                        Timetable Schedule
                      </span>
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-panel text-ink border border-line/30">
                        {occupancyProfile.expectedStatus}
                      </span>
                    </div>

                    {occupancyProfile.currentLecture ? (
                      <div className="space-y-1 pt-1 text-xs">
                        <div className="font-medium text-ink text-sm">
                          {occupancyProfile.currentLecture.subject}
                        </div>
                        <div className="text-ink">
                          Faculty: <strong className="text-ink">{occupancyProfile.currentLecture.faculty}</strong>
                        </div>
                        <div className="text-muted font-mono">
                          Slot: {occupancyProfile.currentLecture.slotLabel} • Div: {occupancyProfile.currentLecture.division}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted pt-1">
                        No scheduled class or lab at the current simulation timestamp.
                      </p>
                    )}
                  </div>

                  {/* Sensor Reality */}
                  <div className={`p-4 rounded-xl border space-y-2 ${isWasting ? 'bg-panel/70 border-line/30' : 'bg-panel/70 border-line/30'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-ink">
                        Sensor Reality
                      </span>
                      <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded ${isWasting ? 'bg-soft text-danger' : 'bg-soft text-ink'}`}>
                        {telemetry.simulatedPirPresence ? 'Occupied' : 'Vacant'}
                      </span>
                    </div>

                    <div className="space-y-1 pt-1 text-xs">
                      <div className="font-medium text-ink text-sm">
                        {telemetry.simulatedPirPresence ? `${telemetry.simulatedOccupantCount} People Detected` : 'Zero Physical Presence'}
                      </div>
                      <div className="text-ink">
                        Power Draw: <strong className="font-mono text-ink">{telemetry.simulatedPowerWatts} W</strong>
                      </div>
                      <div className="text-xs font-medium text-muted">
                        {isWasting ? '⚠️ Conflict: Schedule & sensor state mismatch' : '✓ Normal: State matches expectations'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Lecture Preview */}
                {occupancyProfile.nextLecture && (
                  <div className="p-3.5 rounded-xl bg-panel border border-line/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted block font-medium">Next Scheduled Class</span>
                      <span className="font-medium text-ink">{occupancyProfile.nextLecture.subject}</span>
                      <span className="text-muted ml-1">({occupancyProfile.nextLecture.faculty})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-medium text-ink block">
                        in {occupancyProfile.minutesUntilNext} mins
                      </span>
                      <span className="text-muted">{occupancyProfile.nextLecture.slotLabel}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: Sensors & Simulation */}
            {activeTab === 'sensors' && (
              <motion.div
                key="sensors"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-panel border border-line/30">
                    <span className="text-xs text-muted block">PZEM Active Power</span>
                    <span className="font-mono text-base font-semibold text-ink block mt-0.5">
                      {telemetry.simulatedPowerWatts} W
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-panel border border-line/30">
                    <span className="text-xs text-muted block">RMS Voltage</span>
                    <span className="font-mono text-base font-semibold text-ink block mt-0.5">
                      {telemetry.simulatedVoltage} V
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-panel border border-line/30">
                    <span className="text-xs text-muted block">RMS Current</span>
                    <span className="font-mono text-base font-semibold text-ink block mt-0.5">
                      {telemetry.simulatedCurrent} A
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-panel border border-line/30">
                    <span className="text-xs text-muted block">Power Factor (PF)</span>
                    <span className="font-mono text-base font-semibold text-ink block mt-0.5">
                      {telemetry.simulatedPowerFactor}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-panel border border-line/30">
                    <span className="text-xs text-muted block">LD2410C mmWave</span>
                    <span className="font-mono text-base font-semibold text-ink block mt-0.5">
                      {telemetry.simulatedPirPresence ? `${telemetry.simulatedOccupantCount} Occ` : '0 Occ'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-panel border border-line/30">
                    <span className="text-xs text-muted block">BME280 Temp</span>
                    <span className="font-mono text-base font-semibold text-ink block mt-0.5">
                      {telemetry.simulatedTempCelsius} °C
                    </span>
                  </div>
                </div>

                {/* AI Root-Cause Diagnostic Preview */}
                {aiInsight && (
                  <div className="p-3.5 rounded-xl bg-panel/80 border border-line/30 text-ink space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium text-ink text-xs">
                        
                        <span>AI Diagnostic Insight</span>
                      </span>
                      <span className="text-xs font-mono font-medium text-ink">
                        {(aiInsight.confidenceScore * 100).toFixed(0)}% Confidence
                      </span>
                    </div>
                    <p className="text-xs text-ink leading-relaxed">
                      {aiInsight.rootCauseAnalysis}
                    </p>
                    <p className="text-xs text-ink font-semibold pt-0.5">
                      Recommendation: {aiInsight.recommendedAction}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 5: Actions */}
            {activeTab === 'actions' && (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Master Shutdown Simulation */}
                <div className="p-4 rounded-xl bg-panel border border-line/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-medium text-ink text-xs block">
                      Master Contactor Relay Control
                    </span>
                    <span className="text-xs text-muted">
                      Simulate automatic or manual emergency shutoff for this classroom.
                    </span>
                  </div>
                  <button
                    onClick={() => simulateEcoOff(metadata.id)}
                    className="px-4 py-2 rounded-xl bg-danger hover:bg-danger text-on-accent font-medium text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
                  >
                    
                    <span>Simulate Eco-Off Now</span>
                  </button>
                </div>

                {/* Individual Circuit Load Toggles */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-ink uppercase tracking-wider">
                    Individual Circuit Breakers
                  </h4>
                  {roomState.appliances.map((app, index) => {
                    const isPowered = app.isOn && !roomState.isEcoOff;
                    return (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-panel border border-line/30"
                      >
                        <div>
                          <span className="font-medium text-ink text-xs block">{app.name}</span>
                          <span className="text-xs text-muted font-mono">
                            {app.count} units × {app.wattageEach}W ({app.count * app.wattageEach}W total)
                          </span>
                        </div>

                        <button
                          onClick={() => toggleAppliance(metadata.id, index)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isPowered
                              ? 'bg-soft text-ink border border-line/30'
                              : 'bg-soft text-muted hover:bg-soft'
                          }`}
                        >
                          
                          <span>{isPowered ? 'ON' : 'OFF'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-line/30 bg-panel/50 flex items-center justify-between text-xs">
          <span className="text-muted font-medium">
            Simulated edge telemetry & contactor relay control
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-soft hover:bg-soft text-ink font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                simulateEcoOff(metadata.id);
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent text-on-accent font-medium transition-colors shadow-xs"
            >
              Simulate Eco-Off & Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
