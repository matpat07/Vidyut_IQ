import React from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import { Zap, IndianRupee, CloudRain, TrendingUp, Info } from 'lucide-react';

export const ImpactSummaryCards: React.FC = () => {
  const { impactSummary, assumptions } = useSimulation();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Estimated Energy Saved */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2, ease: 'easeOut', delay: 0 }}
          className="card-base p-5"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="uppercase tracking-wider font-bold text-emerald-800">
              Estimated Energy Saved
            </span>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-black text-slate-900">
              {impactSummary.accumulatedKwhSaved.toFixed(2)}
            </span>
            <span className="font-mono text-sm text-emerald-600 font-bold">kWh</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Measured reduction in simulated test sessions via controlled Eco-Off actions.
          </p>
        </motion.div>

        {/* Card 2: Estimated Cost Saved */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2, ease: 'easeOut', delay: 0.05 }}
          className="card-base p-5"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="uppercase tracking-wider font-bold text-amber-800">
              Estimated Cost Saved
            </span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-black text-slate-900">
              ₹{impactSummary.accumulatedCostSavedInr.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-500">
              (@ assumed ₹{assumptions.tariffInrPerKwh}/kWh)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Direct operational electricity bill reduction (illustrative tariff).
          </p>
        </motion.div>

        {/* Card 3: Estimated CO2 Avoided */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2, ease: 'easeOut', delay: 0.1 }}
          className="card-base p-5"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="uppercase tracking-wider font-bold text-teal-800">
              Estimated CO₂ Avoided
            </span>
            <span className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <CloudRain className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-black text-slate-900">
              {impactSummary.accumulatedCo2AvoidedKg.toFixed(2)}
            </span>
            <span className="font-mono text-sm text-teal-600 font-bold">kg CO₂</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Based on CEA Indian grid emissions factor ({assumptions.carbonEmissionFactorKgPerKwh} kg/kWh).
          </p>
        </motion.div>

      </div>
    </div>
  );
};
