import React from 'react';
import { motion } from 'framer-motion';
import { RoomViewData, useSimulation } from '../../context/SimulationContext';
import { Zap, Users, ShieldAlert, CheckCircle, Power, Clock, ArrowRight } from 'lucide-react';

interface RoomCardProps {
  data: RoomViewData;
  onInspect: (roomId: string) => void;
  index?: number;
}

export const RoomCard: React.FC<RoomCardProps> = ({ data, onInspect, index = 0 }) => {
  const { simulateEcoOff } = useSimulation();
  const { metadata, roomState, telemetry, occupancyProfile, activeAlert } = data;

  const isAlerting = !!activeAlert;
  const isEcoOff = roomState.isEcoOff;

  // Single consolidated status badge
  const getStatusBadge = () => {
    if (isAlerting) {
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          Waste Alert
        </span>
      );
    }
    if (isEcoOff) {
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          Eco-Saved
        </span>
      );
    }
    if (occupancyProfile.expectedStatus === 'SCHEDULED') {
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          In Session
        </span>
      );
    }
    if (occupancyProfile.expectedStatus === 'BREAK') {
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          Break
        </span>
      );
    }
    if (occupancyProfile.expectedStatus === 'CANCELLED') {
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          Cancelled
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Vacant
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: Math.min(index * 0.025, 0.3) }}
      onClick={() => onInspect(metadata.id)}
      className={`card-base p-4 cursor-pointer relative flex flex-col justify-between group ${
        isAlerting
          ? 'border-rose-300 bg-rose-50/20'
          : isEcoOff
          ? 'border-emerald-200 bg-emerald-50/15'
          : 'hover:border-indigo-200'
      }`}
    >
      <div>
        {/* Top Header: Room ID & Type */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-black text-slate-900">{metadata.id}</span>
              <span className="text-xs text-slate-400 font-medium">({metadata.block} • F{metadata.floor})</span>
            </div>
            <h4 className="text-xs font-semibold text-slate-700 truncate max-w-[170px]">
              {metadata.name}
            </h4>
          </div>

          <div className="flex flex-col items-end gap-1">
            {getStatusBadge()}
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              {metadata.roomType === 'LABORATORY' ? 'Lab' : 'Classroom'}
            </span>
          </div>
        </div>

        {/* Telemetry Metrics: Power Draw & Occupancy */}
        <div
          className={`mt-3 grid grid-cols-2 gap-2 p-2.5 rounded-xl border text-xs ${
            isAlerting
              ? 'bg-rose-50/60 border-rose-200 text-rose-900'
              : isEcoOff
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
              : 'bg-slate-50 border-slate-100'
          }`}
        >
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-medium">
              Simulated Power
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={`font-mono font-black ${
                  isAlerting
                    ? 'text-rose-600'
                    : isEcoOff
                    ? 'text-emerald-600'
                    : 'text-slate-900'
                }`}
              >
                {telemetry.simulatedPowerWatts} W
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-medium">
              Radar Presence
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  telemetry.simulatedPirPresence ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              />
              <span className="text-slate-700 font-medium text-xs">
                {telemetry.simulatedPirPresence
                  ? `${telemetry.simulatedOccupantCount} seated`
                  : '0 occupants'}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule Info / Free Slot Countdown */}
        <div className="mt-2.5 text-xs">
          {occupancyProfile.currentLecture ? (
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
              <div className="font-semibold text-slate-800 truncate text-xs">
                {occupancyProfile.currentLecture.subject}
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-between mt-0.5">
                <span>{occupancyProfile.currentLecture.faculty}</span>
                <span className="font-mono text-indigo-600 font-bold">{occupancyProfile.currentLecture.division}</span>
              </div>
            </div>
          ) : occupancyProfile.nextLecture ? (
            <div className="text-xs text-slate-600 flex items-center gap-1 py-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>
                Free for next{' '}
                <strong className="text-emerald-600 font-bold">
                  {occupancyProfile.minutesUntilNext} mins
                </strong>{' '}
                (until {occupancyProfile.nextLecture.slotLabel.split(' - ')[0]})
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>No further lectures scheduled today</span>
            </div>
          )}
        </div>

        {/* Waste Alert Box if Alerting */}
        {isAlerting && (
          <div className="mt-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-900 text-xs">{activeAlert?.reason}</p>
              <p className="text-xs text-rose-700 mt-0.5">
                Excess Draw: +{activeAlert?.excessWatts}W (₹{activeAlert?.estimatedHourlyCostWastedInr}/hr)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors flex items-center gap-0.5">
          <span>Diagnostics</span>
          <ArrowRight className="w-3 h-3" />
        </span>

        {isAlerting ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              simulateEcoOff(metadata.id);
            }}
            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1"
          >
            <Power className="w-3 h-3" />
            <span>Simulate Eco-Off</span>
          </button>
        ) : isEcoOff ? (
          <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Remediated</span>
          </span>
        ) : null}
      </div>
    </motion.div>
  );
};
