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
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Settings & Hardware BOM
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Economic parameters & IoT retrofit specifications.
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Grid: Financial Config & Macro Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Financial & Emission Controls */}
        <div className="card-base p-6 space-y-5">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Configurable Economic Assumptions</span>
          </h3>

          {/* Tariff Slider */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
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
              Commercial / institutional rate for urban grid supply (typical ₹8.50 - ₹10.50/kWh).
            </p>
          </div>

          {/* Carbon Factor Slider */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-teal-600" />
                <span>CEA Grid Carbon Factor (kg CO₂ / kWh)</span>
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
              onChange={e =>
                updateAssumptions({ carbonEmissionFactorKgPerKwh: parseFloat(e.target.value) })
              }
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <p className="text-xs text-slate-500">
              Central Electricity Authority (CEA) official baseline CO₂ emissions factor for the Indian national grid.
            </p>
          </div>

          {/* Operating Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Working Days / Yr</span>
              </span>
              <span className="font-mono text-lg font-black text-slate-900 block mt-1">
                {assumptions.operatingDaysPerYear} days
              </span>
              <span className="text-xs text-slate-400">Excludes exams & vacations</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Operating Window</span>
              </span>
              <span className="font-mono text-lg font-black text-slate-900 block mt-1">
                {assumptions.averageOperatingHoursPerDay} hrs/day
              </span>
              <span className="text-xs text-slate-400">09:00 AM - 05:00 PM standard</span>
            </div>
          </div>

        </div>

        {/* Right Column: 100-Room Campus Impact & Payback Model */}
        <div className="card-base p-6 space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              <span>100-Room Campus Macro Projection Model (Slide 16)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Extrapolated financial return on investment based on current calibrated parameters.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Projected Yearly Savings
                </span>
                <span className="font-mono text-2xl font-black text-emerald-700 block mt-1">
                  ₹{dynamicAnnualSavings} L
                </span>
                <span className="text-xs text-emerald-600 font-medium">
                  ~75,000 kWh avoidable / yr
                </span>
              </div>

              <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200">
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                  Carbon Emission Avoided
                </span>
                <span className="font-mono text-2xl font-black text-teal-700 block mt-1">
                  {dynamicAnnualCo2} T
                </span>
                <span className="text-xs text-teal-600 font-medium">Tonnes CO₂ / year</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Hardware Outlay (100 Nodes)
                </span>
                <span className="font-mono text-xl font-black text-slate-900 block mt-1">
                  ₹2.65 L
                </span>
                <span className="text-xs text-slate-500 font-medium">100 rooms × ~₹2,650</span>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200">
                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block">
                  Simple Payback Period
                </span>
                <span className="font-mono text-xl font-black text-indigo-700 block mt-1">
                  &lt; 6 Months
                </span>
                <span className="text-xs text-indigo-600 font-medium">Illustrative projection</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Methodology Basis:</p>
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
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <Cpu className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-sm text-slate-900">
                IoT Hardware BOM (Per-Room Node)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Split-core CT clamp + 24GHz mmWave radar retrofit.
            </p>
          </div>

          <span className="font-mono font-black text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 self-start sm:self-auto">
            Approx. Retrofit Cost: ~₹{BOM_SUMMARY.approxPerRoomNodeCostInr} / room
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold">Component</th>
                <th className="px-4 py-3 font-bold">Hardware Specification</th>
                <th className="px-4 py-3 font-bold">Role in VidyutIQ</th>
                <th className="px-4 py-3 font-bold text-right">Approx Unit Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {HARDWARE_BOM.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{item.component}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{item.specification}</td>
                  <td className="px-4 py-3 text-slate-600">{item.purpose}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 text-right">
                    ₹{item.approxUnitCostInr}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            <strong>Electrical Safety:</strong> Low-voltage ESP32 drives optocoupled relays to actuate external industrial contactors.
          </p>
        </div>
      </div>

    </div>
  );
};
