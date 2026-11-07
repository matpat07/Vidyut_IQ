import { useDialog } from '../../hooks/useDialog';
import React from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import { MACRO_CAMPUS_PROJECTIONS } from '../../config/assumptions';
import { X, Sliders, IndianRupee, CloudRain, Calendar, Clock, RotateCcw } from 'lucide-react';

interface AssumptionsModalProps {
  onClose: () => void;
}

export const AssumptionsModal: React.FC<AssumptionsModalProps> = ({ onClose }) => {
  const dialogRef = useDialog(onClose);
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
        className="fixed inset-0 bg-ink/70 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        ref={dialogRef} role="dialog" aria-modal="true" aria-label="Economic assumptions" tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 bg-panel border border-line/30 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl"
      >
        {/* Header */}
        <div className="p-5 border-b border-line/30 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              
              <div>
                <h2 className="text-base font-medium text-ink">Financial & Environmental Model Assumptions</h2>
                <p className="text-xs text-muted">
                  Configure local utility tariffs and grid emission factors to test financial sensitivities.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-soft transition-colors"
          >
            <span>Close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Tariff Input */}
          <div className="bg-panel p-4 rounded-xl border border-line/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium text-ink flex items-center gap-1.5 text-xs">
                
                <span>Commercial Electricity Tariff (₹ / kWh)</span>
              </label>
              <span className="font-mono text-sm font-semibold text-ink">
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
              className="w-full accent-accent cursor-pointer h-1.5 bg-soft rounded-lg appearance-none"
            />
            <p className="text-xs text-muted">
              Commercial / institutional rate for urban supply (assumed ~₹8.50 - ₹10.50/kWh).
            </p>
          </div>

          {/* Carbon Factor Input */}
          <div className="bg-panel p-4 rounded-xl border border-line/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium text-ink flex items-center gap-1.5 text-xs">
                
                <span>Grid Carbon Factor (kg CO₂ / kWh)</span>
              </label>
              <span className="font-mono text-sm font-semibold text-ink">
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
              className="w-full accent-accent cursor-pointer h-1.5 bg-soft rounded-lg appearance-none"
            />
            <p className="text-xs text-muted">
              Central Electricity Authority (CEA) official baseline CO₂ emissions factor for the Indian national grid.
            </p>
          </div>

          {/* Operating Days */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-panel p-3 rounded-xl border border-line/30">
              <label className="font-medium text-ink text-xs block flex items-center gap-1">
                
                <span>Working Days / Year</span>
              </label>
              <span className="font-mono text-lg font-semibold text-ink block mt-1">
                {assumptions.operatingDaysPerYear} days
              </span>
              <p className="text-xs text-muted mt-0.5">Excludes breaks & vacations</p>
            </div>

            <div className="bg-panel p-3 rounded-xl border border-line/30">
              <label className="font-medium text-ink text-xs block flex items-center gap-1">
                
                <span>College Hours / Day</span>
              </label>
              <span className="font-mono text-lg font-semibold text-ink block mt-1">
                {assumptions.averageOperatingHoursPerDay} hrs/day
              </span>
              <p className="text-xs text-muted mt-0.5">09:00 AM - 05:00 PM core window</p>
            </div>
          </div>

          {/* 100-Room Campus Projection Callout */}
          <div className="p-3.5 rounded-xl bg-panel/60 border border-line/30 text-ink">
            <span className="font-medium text-xs text-ink block">
              Macro 100-Room Campus Projection (Modeled)
            </span>
            <p className="text-xs text-ink mt-1 leading-relaxed">
              {MACRO_CAMPUS_PROJECTIONS.basisNote} At ₹{assumptions.tariffInrPerKwh}/kWh, this yields an estimated{' '}
              <strong className="text-ink font-medium">
                ₹{((MACRO_CAMPUS_PROJECTIONS.annualAvoidableEnergyKwh * assumptions.tariffInrPerKwh) / 100000).toFixed(2)} Lakhs
              </strong>{' '}
              in yearly electricity bill savings and avoids ~
              <strong className="text-ink font-medium">
                {((MACRO_CAMPUS_PROJECTIONS.annualAvoidableEnergyKwh * assumptions.carbonEmissionFactorKgPerKwh) / 1000).toFixed(1)} Tonnes CO₂
              </strong>.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line/30 bg-panel/60 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted hover:text-ink transition-colors text-xs font-semibold"
          >
            
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-accent hover:bg-accent text-on-accent font-medium text-xs transition-colors shadow-xs"
          >
            Apply & Close
          </button>
        </div>

      </motion.div>
    </div>
  );
};
