import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  Power,
  Users,
  ExternalLink,
  Radar,
  ArrowRight,
  Filter
} from 'lucide-react';
import { AnomalySeverity } from '../../types/telemetry.types';

interface AlertsTriageViewProps {
  onInspectRoom: (roomId: string) => void;
}

export const AlertsTriageView: React.FC<AlertsTriageViewProps> = ({ onInspectRoom }) => {
  const {
    activeAlerts,
    roomDataList,
    simulateEcoOff,
    simulateCampusEcoRemediation,
    timeString,
  } = useSimulation();

  const [severityFilter, setSeverityFilter] = useState<'ALL' | AnomalySeverity>('ALL');
  const [checkedPresenceRooms, setCheckedPresenceRooms] = useState<Record<string, boolean>>({});

  const handleCheckPresence = (roomId: string) => {
    setCheckedPresenceRooms(prev => ({ ...prev, [roomId]: true }));
  };

  const filteredAlerts = useMemo(() => {
    if (severityFilter === 'ALL') return activeAlerts;
    return activeAlerts.filter(a => a.severity === severityFilter);
  }, [activeAlerts, severityFilter]);

  const totalExcessWatts = useMemo(() => {
    return activeAlerts.reduce((sum, a) => sum + a.excessWatts, 0);
  }, [activeAlerts]);

  const totalHourlyCost = useMemo(() => {
    return activeAlerts.reduce((sum, a) => sum + a.estimatedHourlyCostWastedInr, 0);
  }, [activeAlerts]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Status & 1-Click Bulk Action */}
      <div className="card-base p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Energy Wastage Alerts
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time anomalies from timetable, radar, and power meter correlation.
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 mr-1.5">Active Alerts:</span>
                <strong className="text-rose-600 font-mono font-black">{activeAlerts.length} Rooms</strong>
              </div>
              <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 mr-1.5">Total Waste:</span>
                <strong className="text-rose-600 font-mono font-black">+{totalExcessWatts.toLocaleString()} W</strong>
              </div>
              <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 mr-1.5">Estimated Burn:</span>
                <strong className="text-amber-700 font-mono font-black">₹{totalHourlyCost.toFixed(2)}/hr</strong>
              </div>
            </div>
          </div>

          {activeAlerts.length > 0 && (
            <button
              onClick={simulateCampusEcoRemediation}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start lg:self-auto"
            >
              <Power className="w-4 h-4" />
              <span>1-Click Remediate All Waste ({activeAlerts.length} Rooms)</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-xs mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(sev => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              severityFilter === sev
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {sev} {sev !== 'ALL' && `(${activeAlerts.filter(a => a.severity === sev).length})`}
          </button>
        ))}
      </div>

      {/* Compact Alert Cards */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredAlerts.map(alert => {
              const roomData = roomDataList.find(r => r.metadata.id === alert.roomId);
              const isPresenceChecked = checkedPresenceRooms[alert.roomId];

              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="card-base p-4 border-slate-200 hover:border-rose-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Room & Problem Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <span className="font-mono text-sm font-black px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                      {alert.roomId}
                    </span>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-slate-900 truncate">
                          {alert.roomName}
                        </h3>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : alert.severity === 'HIGH'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-xs text-slate-400">
                          {roomData?.metadata.block} • Fl {roomData?.metadata.floor}
                        </span>
                      </div>

                      {/* Problem Short Summary */}
                      <p className="text-xs text-slate-600 font-medium">
                        {alert.reason}
                      </p>

                      {/* Optional Presence Checked Badge */}
                      {isPresenceChecked && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Radar scan confirmed: 0 occupants (Room vacant)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle: Power & Loss */}
                  <div className="flex items-center gap-6 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Excess Draw</span>
                      <span className="font-mono text-sm font-black text-rose-600 block">
                        +{alert.excessWatts} W
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Wasted Rate</span>
                      <span className="font-mono text-sm font-bold text-amber-700 block">
                        ₹{alert.estimatedHourlyCostWastedInr}/hr
                      </span>
                    </div>
                  </div>

                  {/* Right: Three Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCheckPresence(alert.roomId)}
                      title="Run radar mmWave presence check"
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border ${
                        isPresenceChecked
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Radar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isPresenceChecked ? 'Verified' : 'Check Presence'}</span>
                    </button>

                    <button
                      onClick={() => simulateEcoOff(alert.roomId)}
                      title="Simulate immediate contactor shutdown"
                      className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Simulate Shutdown</span>
                    </button>

                    <button
                      onClick={() => onInspectRoom(alert.roomId)}
                      title="View full room diagnostics"
                      className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 card-base space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">All Campus Circuits Are Optimal</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No active energy waste detected at {timeString}. To test how the triage works, select a scenario like <strong>Teacher Cancel</strong> or <strong>Lunch Break</strong> from the simulation bar above.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
