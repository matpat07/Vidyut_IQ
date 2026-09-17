import React from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import { MACRO_CAMPUS_PROJECTIONS } from '../../config/assumptions';
import { X, Sliders, IndianRupee, CloudRain, Calendar, Clock, RotateCcw } from 'lucide-react';

interface AssumptionsModalProps {
  onClose: () => void;
}

export const AssumptionsModal: React.FC<AssumptionsModalProps> = ({ onClose }) => {
  const { assumptions, updateAssumptions } = useSimulation();

  const handleReset = () => {
    updateAssumptions({
      tariffInrPerKwh: 9.0,
      carbonEmissionFactorKgPerKwh: 0.82,
      averageOperatingHoursPerDay: 8,
      operatingDaysPerYear: 250,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-50 text-amber-700">
                <Sliders className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">Financial & Environmental Model Assumptions</h2>
                <p className="text-xs text-slate-500">
                  Configure local utility tariffs and grid emission factors to test financial sensitivities.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Tariff Input */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <IndianRupee className="w-4 h-4 text-amber-600" />
                <span>Commercial Electricity Tariff (₹ / kWh)</span>
              </label>
              <span className="font-mono text-sm font-black text-slate-900">
                ₹{assumptions.tariffInrPerKwh.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={6.0}
              max={14.0}
              step={0.25}
              value={assumptions.tariffInrPerKwh}
              onChange={e => updateAssumptions({ tariffInrPerKwh: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <p className="text-xs text-slate-500">
              Commercial / institutional rate for urban supply (assumed ~₹8.50 - ₹10.50/kWh).
            </p>
          </div>

          {/* Carbon Factor Input */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <CloudRain className="w-4 h-4 text-teal-600" />
                <span>Grid Carbon Factor (kg CO₂ / kWh)</span>
              </label>
              <span className="font-mono text-sm font-black text-slate-900">
                {assumptions.carbonEmissionFactorKgPerKwh.toFixed(2)} kg
              </span>
            </div>
            <input
              type="range"
              min={0.65}
              max={0.95}
              step={0.01}
              value={assumptions.carbonEmissionFactorKgPerKwh}
              onChange={e => updateAssumptions({ carbonEmissionFactorKgPerKwh: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <p className="text-xs text-slate-500">
              Central Electricity Authority (CEA) official baseline CO₂ emissions factor for the Indian national grid.
            </p>
          </div>

          {/* Operating Days */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <label className="font-bold text-slate-700 text-xs block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Working Days / Year</span>
              </label>
              <span className="font-mono text-lg font-black text-slate-900 block mt-1">
                {assumptions.operatingDaysPerYear} days
              </span>
              <p className="text-xs text-slate-400 mt-0.5">Excludes breaks & vacations</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <label className="font-bold text-slate-700 text-xs block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>College Hours / Day</span>
              </label>
              <span className="font-mono text-lg font-black text-slate-900 block mt-1">
                {assumptions.averageOperatingHoursPerDay} hrs/day
              </span>
              <p className="text-xs text-slate-400 mt-0.5">09:00 AM - 05:00 PM core window</p>
            </div>
          </div>

          {/* 100-Room Campus Projection Callout */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950">
            <span className="font-bold text-xs text-emerald-900 block">
              Macro 100-Room Campus Projection (Modeled)
            </span>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {MACRO_CAMPUS_PROJECTIONS.basisNote} At ₹{assumptions.tariffInrPerKwh}/kWh, this yields an estimated{' '}
              <strong className="text-emerald-700 font-bold">
                ₹{((MACRO_CAMPUS_PROJECTIONS.annualAvoidableEnergyKwh * assumptions.tariffInrPerKwh) / 100000).toFixed(2)} Lakhs
              </strong>{' '}
              in yearly electricity bill savings and avoids ~
              <strong className="text-teal-700 font-bold">
                {((MACRO_CAMPUS_PROJECTIONS.annualAvoidableEnergyKwh * assumptions.carbonEmissionFactorKgPerKwh) / 1000).toFixed(1)} Tonnes CO₂
              </strong>.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 transition-colors text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Apply & Close
          </button>
        </div>

      </motion.div>
    </div>
  );
};
