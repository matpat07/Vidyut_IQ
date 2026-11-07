import { ConfigurableAssumptions } from '../types/impact.types';

export const DEFAULT_ASSUMPTIONS: ConfigurableAssumptions = {
  tariffInrPerKwh: 9.00, // Assumed commercial college electricity tariff (₹/kWh)
  carbonEmissionFactorKgPerKwh: 0.82, // Assumed CEA Indian grid emissions factor (kg CO2/kWh)
  averageOperatingHoursPerDay: 8,
  operatingDaysPerYear: 250,
};

export const MACRO_CAMPUS_PROJECTIONS = {
  annualAvoidableEnergyKwh: 75000, // 100 rooms × 1.5 kW × 2 hrs/day × 250 days
  annualCostSavingsInr: 640000,    // ~₹6.4 Lakhs (@ ~₹8.50-₹9.50/kWh)
  annualCo2AvoidedTonnes: 56,      // ~56 Tonnes CO2 (@ 0.71-0.82 kg/kWh)
  approxHardwareOutlayInr: 265000, // 100 rooms × ~₹2,650
  paybackNote:
    'Illustrative simple payback may be below six months under these assumptions; actual payback requires measured consumption, tariff confirmation, installation cost, and verified savings.',
  basisNote:
    'Modeled estimate: 100 rooms × 1.5 kW average avoidable load × 2 idle hours/day × 250 working days ≈ 75,000 kWh/year.',
};
