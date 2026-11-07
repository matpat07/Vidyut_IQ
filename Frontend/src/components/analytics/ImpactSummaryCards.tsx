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
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="uppercase tracking-wider font-medium text-ink">
              Estimated Energy Saved
            </span>
            
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-semibold text-ink">
              {impactSummary.accumulatedKwhSaved.toFixed(2)}
            </span>
            <span className="font-mono text-sm text-ink font-medium">kWh</span>
          </div>
          <p className="text-xs text-muted mt-1">
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
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="uppercase tracking-wider font-medium text-ink">
              Estimated Cost Saved
            </span>
            
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-semibold text-ink">
              ₹{impactSummary.accumulatedCostSavedInr.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-muted">
              (@ assumed ₹{assumptions.tariffInrPerKwh}/kWh)
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
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
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="uppercase tracking-wider font-medium text-ink">
              Estimated CO₂ Avoided
            </span>
            
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-semibold text-ink">
              {impactSummary.accumulatedCo2AvoidedKg.toFixed(2)}
            </span>
            <span className="font-mono text-sm text-ink font-medium">kg CO₂</span>
          </div>
          <p className="text-xs text-muted mt-1">
            Based on CEA Indian grid emissions factor ({assumptions.carbonEmissionFactorKgPerKwh} kg/kWh).
          </p>
        </motion.div>

      </div>
    </div>
  );
};
