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
      colorClass: 'text-rose-600 bg-rose-50',
    },
    {
      id: 'TEACHER_CANCEL',
      label: 'Cancelled Lecture',
      sublabel: '11:15 AM: Released room with power on',
      icon: CalendarX,
      colorClass: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'IDLE_LAB',
      label: 'Idle Computer Lab',
      sublabel: '3:30 PM: 30 PCs + AC active with no class',
      icon: Monitor,
      colorClass: 'text-purple-600 bg-purple-50',
    },
    {
      id: 'NORMAL_CLASS',
      label: 'Normal In-Session Class',
      sublabel: '9:30 AM: Full attendance, optimal load',
      icon: CheckCircle2,
      colorClass: 'text-emerald-600 bg-emerald-50',
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        
        {/* Left: Time Slider, Play/Pause, & Day Pills */}
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Day of the Week Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
            {days.map(d => (
              <button
                key={d}
                onClick={() => setDay(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  day === d
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
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
                  ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 shadow-sm'
              }`}
              title={isClockTicking ? 'Pause Time Simulator' : 'Play Time Simulator'}
            >
              {isClockTicking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() =>
                setClockSpeedMultiplier(
                  clockSpeedMultiplier === 1 ? 5 : clockSpeedMultiplier === 5 ? 10 : 1
                )
              }
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-mono font-bold text-slate-700 transition-colors"
              title="Change simulation playback speed"
            >
              {clockSpeedMultiplier}x
            </button>
          </div>

          {/* Time Slider & Animated Readout Badge */}
          <div className="flex-1 flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200/80">
            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
            <input
              type="range"
              min={540} // 9:00 AM
              max={1080} // 6:00 PM
              step={5}
              value={simulationMinutes}
              onChange={e => setSimulationMinutes(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            
            {/* Animated Readout */}
            <div className="text-right shrink-0 min-w-[90px]">
              <motion.span
                key={timeString}
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="font-mono text-xs font-black text-slate-900 block"
              >
                {timeString}
              </motion.span>
              <motion.span
                key={activeSlot?.label || 'status'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="text-xs text-indigo-600 block font-semibold truncate max-w-[130px]"
              >
                {activeSlot?.label || (simulationMinutes >= 1080 ? 'After-Hours' : 'Off-Schedule')}
              </motion.span>
            </div>
          </div>

        </div>

        {/* Right: Consolidated "Simulate scenario" Dropdown Menu */}
        <div className="relative self-start xl:self-auto" ref={menuRef}>
          <button
            onClick={() => setIsScenarioMenuOpen(prev => !prev)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Simulate scenario</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-indigo-500 transition-transform duration-200 ${
                isScenarioMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {isScenarioMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-2 space-y-1">
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Judge Demonstration Presets
                  </div>

                  {scenarios.map(sc => {
                    const Icon = sc.icon;
                    return (
                      <button
                        key={sc.id}
                        onClick={() => handleSelectScenario(sc.id)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-start gap-2.5 group"
                      >
                        <div className={`p-1.5 rounded-lg ${sc.colorClass} mt-0.5 shrink-0`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors block">
                            {sc.label}
                          </span>
                          <span className="text-xs text-slate-500 block leading-tight mt-0.5">
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
