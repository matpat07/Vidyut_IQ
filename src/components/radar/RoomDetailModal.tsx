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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-black px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              {metadata.id}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {metadata.name}
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    roomState.isEcoOff
                      ? 'bg-slate-100 text-slate-600'
                      : isWasting
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {roomState.isEcoOff ? 'Eco-Off' : isWasting ? 'Wastage' : 'Normal'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {metadata.block} • Floor {metadata.floor} • {metadata.department} (Cap: {metadata.capacity})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-100 bg-white flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.id === 'actions' && isWasting && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
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
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-rose-900 block">
                          {activeAlert.reason}
                        </span>
                        <span className="text-xs text-rose-600 font-mono font-bold">
                          Excess: +{activeAlert.excessWatts} W (₹{activeAlert.estimatedHourlyCostWastedInr}/hr)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => simulateEcoOff(metadata.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
                    >
                      Simulate Shutdown
                    </button>
                  </div>
                )}

                {/* 3 Core Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Occupancy Card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-medium">Radar Occupancy</span>
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <span className="font-mono text-lg font-black text-slate-900 block">
                      {telemetry.simulatedPirPresence ? `${telemetry.simulatedOccupantCount} Seated` : 'Vacant (0)'}
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {telemetry.simulatedPirPresence ? 'mmWave: Active Motion' : 'mmWave: Room Clear'}
                    </span>
                  </div>

                  {/* Power Draw Card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-medium">Power Draw</span>
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <span className="font-mono text-lg font-black text-slate-900 block">
                      {telemetry.simulatedPowerWatts} <span className="text-xs font-normal text-slate-500">W</span>
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Baseline Standby: {telemetry.baselineStandbyWatts} W
                    </span>
                  </div>

                  {/* Schedule Card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-medium">Schedule State</span>
                      <Calendar className="w-3.5 h-3.5 text-teal-500" />
                    </div>
                    <span className="font-mono text-base font-black text-slate-900 block truncate">
                      {occupancyProfile.expectedStatus}
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5 truncate">
                      {occupancyProfile.currentLecture?.subject || 'No session scheduled'}
                    </span>
                  </div>
                </div>

                {/* Quick Status Comparison */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Contactor Relay State</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${roomState.isEcoOff ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                      {roomState.isEcoOff ? 'TRIPPED (Eco-Off)' : 'CLOSED (Active)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Ambient Temperature (BME280)</span>
                    <span className="font-mono font-bold text-slate-900">{telemetry.simulatedTempCelsius} °C</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Grid Voltage & Current</span>
                    <span className="font-mono font-bold text-slate-900">{telemetry.simulatedVoltage}V / {telemetry.simulatedCurrent}A</span>
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
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Active Draw</span>
                    <span className="font-mono text-base font-black text-slate-900 block mt-0.5">
                      {telemetry.simulatedPowerWatts} W
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Baseline Standby</span>
                    <span className="font-mono text-base font-black text-slate-600 block mt-0.5">
                      {telemetry.baselineStandbyWatts} W
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Excess Wastage</span>
                    <span className={`font-mono text-base font-black block mt-0.5 ${excessWatts > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {excessWatts > 0 ? `+${excessWatts} W` : '0 W'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Est. Cost Burn</span>
                    <span className={`font-mono text-base font-black block mt-0.5 ${activeAlert ? 'text-amber-600' : 'text-slate-600'}`}>
                      ₹{activeAlert ? activeAlert.estimatedHourlyCostWastedInr : '0.00'}/hr
                    </span>
                  </div>
                </div>

                {/* Circuit Load Distribution */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Connected Sub-Circuits & Power Draw
                  </h4>
                  <div className="space-y-2">
                    {roomState.appliances.map((app, idx) => {
                      const totalAppWatts = app.count * app.wattageEach;
                      const isPowering = app.isOn && !roomState.isEcoOff;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isPowering ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <span className="font-bold text-slate-800">{app.name}</span>
                            <span className="text-slate-400 font-mono">({app.count} units × {app.wattageEach}W)</span>
                          </div>
                          <span className={`font-mono font-bold ${isPowering ? 'text-slate-900' : 'text-slate-400'}`}>
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
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Timetable Schedule
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {occupancyProfile.expectedStatus}
                      </span>
                    </div>

                    {occupancyProfile.currentLecture ? (
                      <div className="space-y-1 pt-1 text-xs">
                        <div className="font-bold text-slate-900 text-sm">
                          {occupancyProfile.currentLecture.subject}
                        </div>
                        <div className="text-slate-600">
                          Faculty: <strong className="text-slate-900">{occupancyProfile.currentLecture.faculty}</strong>
                        </div>
                        <div className="text-slate-500 font-mono">
                          Slot: {occupancyProfile.currentLecture.slotLabel} • Div: {occupancyProfile.currentLecture.division}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 pt-1">
                        No scheduled class or lab at the current simulation timestamp.
                      </p>
                    )}
                  </div>

                  {/* Sensor Reality */}
                  <div className={`p-4 rounded-xl border space-y-2 ${isWasting ? 'bg-rose-50/70 border-rose-200' : 'bg-emerald-50/70 border-emerald-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Sensor Reality
                      </span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${isWasting ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {telemetry.simulatedPirPresence ? 'Occupied' : 'Vacant'}
                      </span>
                    </div>

                    <div className="space-y-1 pt-1 text-xs">
                      <div className="font-bold text-slate-900 text-sm">
                        {telemetry.simulatedPirPresence ? `${telemetry.simulatedOccupantCount} People Detected` : 'Zero Physical Presence'}
                      </div>
                      <div className="text-slate-600">
                        Power Draw: <strong className="font-mono text-slate-900">{telemetry.simulatedPowerWatts} W</strong>
                      </div>
                      <div className="text-xs font-medium text-slate-500">
                        {isWasting ? '⚠️ Conflict: Schedule & sensor state mismatch' : '✓ Normal: State matches expectations'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Lecture Preview */}
                {occupancyProfile.nextLecture && (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Next Scheduled Class</span>
                      <span className="font-bold text-slate-800">{occupancyProfile.nextLecture.subject}</span>
                      <span className="text-slate-500 ml-1">({occupancyProfile.nextLecture.faculty})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-indigo-600 block">
                        in {occupancyProfile.minutesUntilNext} mins
                      </span>
                      <span className="text-slate-400">{occupancyProfile.nextLecture.slotLabel}</span>
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
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">PZEM Active Power</span>
                    <span className="font-mono text-base font-black text-slate-900 block mt-0.5">
                      {telemetry.simulatedPowerWatts} W
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">RMS Voltage</span>
                    <span className="font-mono text-base font-black text-slate-900 block mt-0.5">
                      {telemetry.simulatedVoltage} V
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">RMS Current</span>
                    <span className="font-mono text-base font-black text-slate-900 block mt-0.5">
                      {telemetry.simulatedCurrent} A
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Power Factor (PF)</span>
                    <span className="font-mono text-base font-black text-slate-900 block mt-0.5">
                      {telemetry.simulatedPowerFactor}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">LD2410C mmWave</span>
                    <span className="font-mono text-base font-black text-indigo-600 block mt-0.5">
                      {telemetry.simulatedPirPresence ? `${telemetry.simulatedOccupantCount} Occ` : '0 Occ'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">BME280 Temp</span>
                    <span className="font-mono text-base font-black text-teal-600 block mt-0.5">
                      {telemetry.simulatedTempCelsius} °C
                    </span>
                  </div>
                </div>

                {/* AI Root-Cause Diagnostic Preview */}
                {aiInsight && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-indigo-900 text-xs">
                        <BrainCircuit className="w-4 h-4 text-indigo-600" />
                        <span>AI Diagnostic Insight</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-700">
                        {(aiInsight.confidenceScore * 100).toFixed(0)}% Confidence
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {aiInsight.rootCauseAnalysis}
                    </p>
                    <p className="text-xs text-indigo-800 font-semibold pt-0.5">
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
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      Master Contactor Relay Control
                    </span>
                    <span className="text-xs text-slate-500">
                      Simulate automatic or manual emergency shutoff for this classroom.
                    </span>
                  </div>
                  <button
                    onClick={() => simulateEcoOff(metadata.id)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Simulate Eco-Off Now</span>
                  </button>
                </div>

                {/* Individual Circuit Load Toggles */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Individual Circuit Breakers
                  </h4>
                  {roomState.appliances.map((app, index) => {
                    const isPowered = app.isOn && !roomState.isEcoOff;
                    return (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200"
                      >
                        <div>
                          <span className="font-bold text-slate-800 text-xs block">{app.name}</span>
                          <span className="text-xs text-slate-500 font-mono">
                            {app.count} units × {app.wattageEach}W ({app.count * app.wattageEach}W total)
                          </span>
                        </div>

                        <button
                          onClick={() => toggleAppliance(metadata.id, index)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isPowered
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
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
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">
            Simulated edge telemetry & contactor relay control
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                simulateEcoOff(metadata.id);
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-xs"
            >
              Simulate Eco-Off & Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
