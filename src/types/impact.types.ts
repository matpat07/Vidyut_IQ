export interface ConfigurableAssumptions {
  tariffInrPerKwh: number; // e.g. 9.00
  carbonEmissionFactorKgPerKwh: number; // e.g. 0.82
  averageOperatingHoursPerDay: number; // e.g. 8
  operatingDaysPerYear: number; // e.g. 250
}

export interface EstimatedImpactSummary {
  // Live session calculated stats
  currentTotalDrawWatts: number;
  currentWastedDrawWatts: number;
  
  // Accumulated estimated savings from Eco-Off actions
  accumulatedKwhSaved: number;
  accumulatedCostSavedInr: number;
  accumulatedCo2AvoidedKg: number;
  
  // Macro Campus 100-Room Projections
  projectedAnnualKwh: number;            // 75000 kWh
  projectedAnnualSavingsInr: number;     // 640000 (₹6.4 Lakhs)
  projectedAnnualCo2Tonnes: number;      // 56 Tonnes
  projectedHardwareOutlayInr: number;    // 265000 (₹2.65 Lakhs)
}
