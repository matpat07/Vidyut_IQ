export type AnomalySeverity = 'STANDBY' | 'OPTIMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SimulatedTelemetry {
  roomId: string;
  timestamp: number;
  simulatedVoltage: number;
  simulatedCurrent: number;
  simulatedPowerWatts: number;
  simulatedPowerFactor: number;
  cumulativeKWh: number;
  simulatedPirPresence: boolean;
  simulatedOccupantCount: number;
  simulatedTempCelsius: number;
  baselineStandbyWatts: number;
  severity: AnomalySeverity;
  isWastingPower: boolean;
}

export interface WastageAlert {
  id: string;
  roomId: string;
  roomName: string;
  timestamp: string;
  severity: AnomalySeverity;
  reason: string;
  excessWatts: number;
  estimatedHourlyCostWastedInr: number;
  recommendedAction: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  roomId: string;
  roomName: string;
  action: string;
  wattsRemediated: number;
  estimatedKwhSaved: number;
  estimatedCostSavedInr: number;
  estimatedCo2AvoidedKg: number;
  initiatedBy: string;
}
