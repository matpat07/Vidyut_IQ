import type { RoomMetadata } from '../../../types/room.types';
import type { RoomOccupancyProfile, DayOfWeek } from '../../../types/timetable.types';
export type DataMode = 'demo' | 'connected';
export type EnergyPeriod = 'hour' | 'day';
export type MapMode = 'room' | 'energy' | 'anomaly';
export type EnergyMetric = 'total' | 'perSeat';
export interface EnergyPreferences {mode:DataMode;period:EnergyPeriod;setMode:(mode:DataMode)=>void;setPeriod:(period:EnergyPeriod)=>void}
export interface EnergyPoint { label: string; kwh: number }
export interface EnergyAnomaly { severity: 'warning' | 'critical'; reason: string; recommendation?: string; evidence: string }
export interface ApplianceReading { name: string; kw: number | null; basis: 'demo-nameplate' | 'measured' }
export interface EnergyReading {
  metadata: RoomMetadata; powerKw: number | null; energyKwh: number | null;
  history: EnergyPoint[]; appliances: ApplianceReading[]; tariffInrPerKwh: number | null;
  updatedLabel: string | null; status: string; anomaly: EnergyAnomaly | null; anomaliesAssessed: boolean;
  occupancy?: RoomOccupancyProfile; occupants: number | null; recommendations: string[];
}
export interface EnergyDataset {
  mode: DataMode; state: 'ready' | 'loading' | 'disconnected' | 'error'; message: string;
  period: EnergyPeriod; periodLabel: string; historyBasis: string; readings: EnergyReading[];
}
export interface ConnectedEnergyQuery { period: EnergyPeriod; asOf: string; timeZone: 'Asia/Kolkata' }
export interface ConnectedEnergyRecord {
  provenance: 'connected'; metadata: RoomMetadata; powerKw?: number; energyKwh?: number;
  history?: EnergyPoint[]; appliances?: { name: string; measuredKw: number }[];
  tariffInrPerKwh?: number; updatedAt?: string; status?: string; anomaly?: EnergyAnomaly; anomaliesAssessed?: boolean;
  occupancy?: RoomOccupancyProfile; occupants?: number; recommendations?: string[];
}
/** Frontend provider boundary, not a new HTTP endpoint. Existing transport stays with its owner. */
export interface ConnectedEnergyProvider {
  name: string;
  read(query: ConnectedEnergyQuery, signal: AbortSignal): Promise<{
    period: EnergyPeriod; periodLabel: string; records: ConnectedEnergyRecord[];
  }>;
}
export interface DemoEnergyInput {
  day: DayOfWeek; minutes: number; tariff: number;
}
export interface RoomEnergy {
  available: boolean; reason: string | null; reading: EnergyReading | null;
  costInr: number | null; sourceLabel: string;
}
export interface RoomVisual { color: string; unavailable: boolean; label: string; severity: 'normal' | 'warning' | 'critical' | 'unavailable' }
