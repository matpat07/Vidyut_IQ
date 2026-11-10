import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { HARDWARE_BOM, BOM_SUMMARY } from '../../config/hardwareBOM';
import { MACRO_CAMPUS_PROJECTIONS } from '../../config/assumptions';
import {
  Sliders,
  Cpu,
  IndianRupee,
  CloudRain,
  Calendar,
  Clock,
  RotateCcw,
  Shield,
  Layers,
  CheckCircle2,
  Info
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { assumptions, updateAssumptions } = useSimulation();

  const handleReset = () => {
    updateAssumptions({
      tariffInrPerKwh: 9.0,
      carbonEmissionFactorKgPerKwh: 0.82,
      averageOperatingHoursPerDay: 8,
      operatingDaysPerYear: 250,
    });
  };

  const dynamicAnnualSavings = (
    (MACRO_CAMPUS_PROJECTIONS.annualAvoidableEnergyKwh * assumptions.tariffInrPerKwh) /
    100000
  ).toFixed(2);

  const dynamicAnnualCo2 = (
    (MACRO_CAMPUS_PROJECTIONS.annualAvoidableEnergyKwh *
      assumptions.carbonEmissionFactorKgPerKwh) /
    1000
  ).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="card-base p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            
            <div>
              <h2 className="text-base font-medium text-ink">
                Settings & Hardware BOM
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Economic parameters & IoT retrofit specifications.
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-soft hover:bg-soft text-ink text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Grid: Financial Config & Macro Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Financial & Emission Controls */}
        <div className="card-base p-6 space-y-5">
          <h3 className="font-medium text-sm text-ink flex items-center gap-2">
            
            <span>Configurable Economic Assumptions</span>
          </h3>

          {/* Tariff Slider */}
          <div className="bg-panel p-4 rounded-xl border border-line/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-ink text-xs flex items-center gap-1.5">
                
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
              Illustrative tariff range; use a verified local rate before reporting financial impact.
            </p>
          </div>

          {/* Carbon Factor Slider */}
          <div className="bg-panel p-4 rounded-xl border border-line/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-ink text-xs flex items-center gap-1.5">
                
                <span>CEA Grid Carbon Factor (kg CO₂ / kWh)</span>
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
              onChange={e =>
                updateAssumptions({ carbonEmissionFactorKgPerKwh: parseFloat(e.target.value) })
              }
              className="w-full accent-accent cursor-pointer h-1.5 bg-soft rounded-lg appearance-none"
            />
            <p className="text-xs text-muted">
              Illustrative grid factor for this model; confirm a suitable published factor before reporting measured impact.
            </p>
          </div>

          {/* Operating Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-panel p-3.5 rounded-xl border border-line/30">
              <span className="text-xs font-semibold text-muted block flex items-center gap-1">
                
                <span>Working Days / Yr</span>
              </span>
              <span className="font-mono text-lg font-semibold text-ink block mt-1">
                {assumptions.operatingDaysPerYear} days
              </span>
              <span className="text-xs text-muted">Excludes exams & vacations</span>
            </div>

            <div className="bg-panel p-3.5 rounded-xl border border-line/30">
              <span className="text-xs font-semibold text-muted block flex items-center gap-1">
                
                <span>Operating Window</span>
              </span>
              <span className="font-mono text-lg font-semibold text-ink block mt-1">
                {assumptions.averageOperatingHoursPerDay} hrs/day
              </span>
              <span className="text-xs text-muted">09:00 AM - 05:00 PM standard</span>
            </div>
          </div>

        </div>

        {/* Right Column: 100-Room Campus Impact & Payback Model */}
        <div className="card-base p-6 space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-sm text-ink flex items-center gap-2">
              
              <span>100-Room Campus Macro Projection Model (Slide 16)</span>
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Extrapolated financial return on investment based on current calibrated parameters.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-xl bg-panel/60 border border-line/30">
                <span className="text-xs font-medium text-ink uppercase tracking-wider block">
                  Projected Yearly Savings
                </span>
                <span className="font-mono text-2xl font-semibold text-ink block mt-1">
                  ₹{dynamicAnnualSavings} L
                </span>
                <span className="text-xs text-ink font-medium">
                  ~75,000 kWh avoidable / yr
                </span>
              </div>

              <div className="p-4 rounded-xl bg-panel/60 border border-line/30">
                <span className="text-xs font-medium text-ink uppercase tracking-wider block">
                  Carbon Emission Avoided
                </span>
                <span className="font-mono text-2xl font-semibold text-ink block mt-1">
                  {dynamicAnnualCo2} T
                </span>
                <span className="text-xs text-ink font-medium">Tonnes CO₂ / year</span>
              </div>

              <div className="p-4 rounded-xl bg-panel border border-line/30">
                <span className="text-xs font-medium text-muted uppercase tracking-wider block">
                  Hardware Outlay (100 Nodes)
                </span>
                <span className="font-mono text-xl font-semibold text-ink block mt-1">
                  ₹2.65 L
                </span>
                <span className="text-xs text-muted font-medium">100 rooms × ~₹2,650</span>
              </div>

              <div className="p-4 rounded-xl bg-panel/60 border border-line/30">
                <span className="text-xs font-medium text-ink uppercase tracking-wider block">
                  Simple Payback Period
                </span>
                <span className="font-mono text-xl font-semibold text-ink block mt-1">
                  &lt; 6 Months
                </span>
                <span className="text-xs text-ink font-medium">Illustrative projection</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-panel border border-line/30 text-xs text-muted space-y-1">
            <p className="font-semibold text-ink">Methodology Basis:</p>
            <p className="text-xs leading-relaxed">
              {MACRO_CAMPUS_PROJECTIONS.basisNote}
            </p>
          </div>
        </div>

      </div>

      {/* Hardware Bill of Materials (BOM) Table */}
      <div className="card-base p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              
              <h3 className="font-medium text-sm text-ink">
                Proposed IoT Hardware BOM · Future Scope
              </h3>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Indicative ESP32, PZEM-004T and occupancy-sensing pilot components; not installed.
            </p>
          </div>

          <span className="font-mono font-semibold text-xs text-ink bg-panel px-3 py-1.5 rounded-xl border border-line/30 self-start sm:self-auto">
            Approx. Retrofit Cost: ~₹{BOM_SUMMARY.approxPerRoomNodeCostInr} / room
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-line/30 bg-panel">
          <table className="w-full text-left text-xs">
            <thead className="bg-panel text-muted uppercase text-xs tracking-wider border-b border-line/30">
              <tr>
                <th className="px-4 py-3 font-medium">Component</th>
                <th className="px-4 py-3 font-medium">Hardware Specification</th>
                <th className="px-4 py-3 font-medium">Role in VidyutIQ</th>
                <th className="px-4 py-3 font-medium text-right">Approx Unit Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink">
              {HARDWARE_BOM.map((item, idx) => (
                <tr key={idx} className="hover:bg-panel/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink">{item.component}</td>
                  <td className="px-4 py-3 font-mono text-ink">{item.specification}</td>
                  <td className="px-4 py-3 text-ink">{item.purpose}</td>
                  <td className="px-4 py-3 font-mono font-medium text-ink text-right">
                    ₹{item.approxUnitCostInr}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 rounded-xl bg-panel border border-line/30 text-xs text-ink flex items-start gap-2">
          
          <p className="text-xs leading-relaxed">
            <strong>Electrical Safety:</strong> Future hardware proposal: a low-voltage ESP32 would interface with optocoupled relays and rated external contactors. No electrical hardware is connected.
          </p>
        </div>
      </div>

    </div>
  );
};
