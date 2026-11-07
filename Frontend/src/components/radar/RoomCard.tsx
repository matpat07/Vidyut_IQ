import React from 'react';
import { motion } from 'framer-motion';
import { RoomViewData, useSimulation } from '../../context/SimulationContext';
import { Zap, Users, ShieldAlert, CheckCircle, Power, Clock, ArrowRight } from 'lucide-react';

interface RoomCardProps {
  data: RoomViewData;
  onInspect: (roomId: string) => void;
  index?: number;
}

export const RoomCard = React.forwardRef<HTMLDivElement, RoomCardProps>(({ data, onInspect, index = 0 }, ref) => {
  const { simulateEcoOff } = useSimulation();
  const { metadata, roomState, telemetry, occupancyProfile, activeAlert } = data;

  const isAlerting = !!activeAlert;
  const isEcoOff = roomState.isEcoOff;

  // Single consolidated status badge
  const getStatusBadge = () => {
    if (isAlerting) {
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-panel text-danger border border-line/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-danger " />
          Waste Alert
        </span>
      );
    }
    if (isEcoOff) {
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-panel text-ink border border-line/30 flex items-center gap-1">
          
          Eco-Saved
        </span>
      );
    }
    if (occupancyProfile.expectedStatus === 'SCHEDULED') {
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-panel text-ink border border-line/30">
          In Session
        </span>
      );
    }
    if (occupancyProfile.expectedStatus === 'BREAK') {
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-panel text-ink border border-line/30">
          Break
        </span>
      );
    }
    if (occupancyProfile.expectedStatus === 'CANCELLED') {
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-panel text-danger border border-line/30">
          Cancelled
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-panel text-ink border border-line/30">
        Vacant
      </span>
    );
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: Math.min(index * 0.025, 0.3) }}
      onClick={() => onInspect(metadata.id)}
      className={`card-base p-4 cursor-pointer relative flex flex-col justify-between group ${
        isAlerting
          ? 'border-danger bg-panel/20'
          : isEcoOff
          ? 'border-line/30 bg-panel/15'
          : 'hover:border-line/30'
      }`}
    >
      <div>
        {/* Top Header: Room ID & Type */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-semibold text-ink">{metadata.id}</span>
              <span className="text-xs text-muted font-medium">({metadata.block} • F{metadata.floor})</span>
            </div>
            <h4 className="text-xs font-semibold text-ink truncate max-w-[170px]">
              {metadata.name}
            </h4>
          </div>

          <div className="flex flex-col items-end gap-1">
            {getStatusBadge()}
            <span className="text-xs uppercase tracking-wider font-semibold text-muted">
              {metadata.roomType === 'LABORATORY' ? 'Lab' : 'Classroom'}
            </span>
          </div>
        </div>

        {/* Telemetry Metrics: Power Draw & Occupancy */}
        <div
          className={`mt-3 grid grid-cols-2 gap-2 p-2.5 rounded-xl border text-xs ${
            isAlerting
              ? 'bg-panel/60 border-line/30 text-danger'
              : isEcoOff
              ? 'bg-panel/60 border-line/30 text-ink'
              : 'bg-panel border-line/30'
          }`}
        >
          <div>
            <span className="text-xs text-muted uppercase tracking-wider block font-medium">
              Simulated Power
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={`font-mono font-semibold ${
                  isAlerting
                    ? 'text-danger'
                    : isEcoOff
                    ? 'text-ink'
                    : 'text-ink'
                }`}
              >
                {telemetry.simulatedPowerWatts} W
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs text-muted uppercase tracking-wider block font-medium">
              Radar Presence
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  telemetry.simulatedPirPresence ? 'bg-accent' : 'bg-soft'
                }`}
              />
              <span className="text-ink font-medium text-xs">
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
            <div className="bg-panel p-2 rounded-lg border border-line/30">
              <div className="font-semibold text-ink truncate text-xs">
                {occupancyProfile.currentLecture.subject}
              </div>
              <div className="text-xs text-muted flex items-center justify-between mt-0.5">
                <span>{occupancyProfile.currentLecture.faculty}</span>
                <span className="font-mono text-ink font-medium">{occupancyProfile.currentLecture.division}</span>
              </div>
            </div>
          ) : occupancyProfile.nextLecture ? (
            <div className="text-xs text-ink flex items-center gap-1 py-1">
              
              <span>
                Free for next{' '}
                <strong className="text-ink font-medium">
                  {occupancyProfile.minutesUntilNext} mins
                </strong>{' '}
                (until {occupancyProfile.nextLecture.slotLabel.split(' - ')[0]})
              </span>
            </div>
          ) : (
            <div className="text-xs text-muted py-1 flex items-center gap-1">
              
              <span>No further lectures scheduled today</span>
            </div>
          )}
        </div>

        {/* Waste Alert Box if Alerting */}
        {isAlerting && (
          <div className="mt-2.5 p-2 rounded-lg bg-panel border border-line/30 text-xs text-danger flex items-start gap-1.5">
            
            <div className="flex-1">
              <p className="font-medium text-danger text-xs">{activeAlert?.reason}</p>
              <p className="text-xs text-danger mt-0.5">
                Excess Draw: +{activeAlert?.excessWatts}W (₹{activeAlert?.estimatedHourlyCostWastedInr}/hr)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-3 pt-2 border-t border-line/30 flex items-center justify-between gap-2">
        <button type="button" aria-label={`Inspect ${metadata.name}`} className="text-xs font-semibold text-muted group-hover:text-ink transition-colors flex items-center gap-0.5">
          <span>Diagnostics</span>
          
        </button>

        {isAlerting ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              simulateEcoOff(metadata.id);
            }}
            className="px-2.5 py-1 rounded-lg bg-danger hover:bg-danger text-on-accent text-xs font-medium transition-all shadow-xs active:scale-95 flex items-center gap-1"
          >
            
            <span>Simulate Eco-Off</span>
          </button>
        ) : isEcoOff ? (
          <span className="text-xs font-medium text-ink flex items-center gap-1">
            
            <span>Remediated</span>
          </span>
        ) : null}
      </div>
    </motion.div>
  );
});
RoomCard.displayName = 'RoomCard';
