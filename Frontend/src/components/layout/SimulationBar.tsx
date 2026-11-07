import React, { useState, useRef, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import {
  Play,
  Pause,
  Clock,
  ChevronDown,
  Sparkles,
  Zap,
  CalendarX,
  Monitor,
  CheckCircle2
} from 'lucide-react';
import { DayOfWeek } from '../../types/timetable.types';
import { motion, AnimatePresence } from 'framer-motion';

export const SimulationBar: React.FC = () => {
  const {
    simulationMinutes,
    setSimulationMinutes,
    timeString,
    activeSlot,
    day,
    setDay,
    isClockTicking,
    toggleClockTicking,
    clockSpeedMultiplier,
    setClockSpeedMultiplier,
    loadPresetScenario,
  } = useSimulation();

  const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const days: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsScenarioMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectScenario = (
    scenario: 'LUNCH_BREAK' | 'TEACHER_CANCEL' | 'IDLE_LAB' | 'NORMAL_CLASS'
  ) => {
    loadPresetScenario(scenario);
    setIsScenarioMenuOpen(false);
  };

  const scenarios: {
    id: 'LUNCH_BREAK' | 'TEACHER_CANCEL' | 'IDLE_LAB' | 'NORMAL_CLASS';
    label: string;
    sublabel: string;
    icon: React.FC<{ className?: string }>;
    colorClass: string;
  }[] = [
    {
      id: 'LUNCH_BREAK',
      label: 'Lunch Break Waste',
      sublabel: '1:15 PM: Rooms empty, ACs running',
      icon: Zap,
      colorClass: 'text-danger bg-panel',
    },
    {
      id: 'TEACHER_CANCEL',
      label: 'Cancelled Lecture',
      sublabel: '11:15 AM: Released room with power on',
      icon: CalendarX,
      colorClass: 'text-ink bg-panel',
    },
    {
      id: 'IDLE_LAB',
      label: 'Idle Computer Lab',
      sublabel: '3:30 PM: 30 PCs + AC active with no class',
      icon: Monitor,
      colorClass: 'text-ink bg-panel',
    },
    {
      id: 'NORMAL_CLASS',
      label: 'Normal In-Session Class',
      sublabel: '9:30 AM: Full attendance, optimal load',
      icon: CheckCircle2,
      colorClass: 'text-ink bg-panel',
    },
  ];

  return (
    <div className="bg-panel/80 backdrop-blur-sm border-b border-line/30 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        
        {/* Left: Time Slider, Play/Pause, & Day Pills */}
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Day of the Week Pills */}
          <div className="flex items-center gap-1 bg-soft p-1 rounded-xl border border-line/30 self-start sm:self-auto">
            {days.map(d => (
              <button
                key={d}
                onClick={() => setDay(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  day === d
                    ? 'bg-accent text-on-accent shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Play/Pause Button & Speed */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={toggleClockTicking}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${
                isClockTicking
                  ? 'bg-panel text-ink border-line/30 shadow-sm'
                  : 'bg-panel text-ink border-line/30 hover:bg-soft shadow-sm'
              }`}
              title={isClockTicking ? 'Pause Time Simulator' : 'Play Time Simulator'}
            >
              {isClockTicking ? <span>Pause</span> : <span>Play</span>}
            </button>

            <button
              onClick={() =>
                setClockSpeedMultiplier(
                  clockSpeedMultiplier === 1 ? 5 : clockSpeedMultiplier === 5 ? 10 : 1
                )
              }
              className="px-2.5 py-1.5 rounded-xl bg-soft hover:bg-soft border border-line/30 text-xs font-mono font-medium text-ink transition-colors"
              title="Change simulation playback speed"
            >
              {clockSpeedMultiplier}x
            </button>
          </div>

          {/* Time Slider & Animated Readout Badge */}
          <div className="flex-1 flex items-center gap-3 bg-panel px-3.5 py-1.5 rounded-xl border border-line/30">
            
            <input
              aria-label="Simulation time"
              type="range"
              min={540} // 9:00 AM
              max={1080} // 6:00 PM
              step={5}
              value={simulationMinutes}
              onChange={e => setSimulationMinutes(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer h-1.5 bg-soft rounded-lg appearance-none"
            />
            
            {/* Animated Readout */}
            <div className="text-right shrink-0 min-w-[90px]">
              <motion.span
                key={timeString}
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="font-mono text-xs font-semibold text-ink block"
              >
                {timeString}
              </motion.span>
              <motion.span
                key={activeSlot?.label || 'status'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="text-xs text-ink block font-semibold truncate max-w-[130px]"
              >
                {activeSlot?.label || (simulationMinutes >= 1080 ? 'After-Hours' : 'Off-Schedule')}
              </motion.span>
            </div>
          </div>

        </div>

        {/* Right: Consolidated "Simulate scenario" Dropdown Menu */}
        <div className="relative self-start xl:self-auto" ref={menuRef}>
          <button
            aria-expanded={isScenarioMenuOpen}
            onClick={() => setIsScenarioMenuOpen(prev => !prev)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-panel hover:bg-soft text-ink border border-line/30 text-xs font-medium transition-all shadow-sm active:scale-95"
          >
            
            <span>Simulate scenario</span>
            
          </button>

          <AnimatePresence>
            {isScenarioMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-72 bg-panel border border-line/30 rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-2 space-y-1">
                  <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                    Judge Demonstration Presets
                  </div>

                  {scenarios.map(sc => {
                    const Icon = sc.icon;
                    return (
                      <button
                        key={sc.id}
                        onClick={() => handleSelectScenario(sc.id)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-panel transition-colors flex items-start gap-2.5 group"
                      >
                        
                        <div>
                          <span className="font-medium text-xs text-ink group-hover:text-ink transition-colors block">
                            {sc.label}
                          </span>
                          <span className="text-xs text-muted block leading-tight mt-0.5">
                            {sc.sublabel}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
