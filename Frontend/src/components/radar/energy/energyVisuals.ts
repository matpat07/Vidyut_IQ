import type { PlanRoom } from '../building/planTypes';
import { roomEnergy } from './energyAdapter';
import type { EnergyDataset, EnergyMetric, MapMode, RoomEnergy, RoomVisual } from './energyTypes';

export const ENERGY_COLORS = ['#FFFCFC', '#E6D1E5', '#9B829A', '#161126'] as const;
export const thresholds = (metric: EnergyMetric) => metric === 'total' ? [1, 5, 20] : [.05, .2, .5];
export function energyValue(data: RoomEnergy, metric: EnergyMetric): number | null {
  const value = data.reading?.energyKwh;
  if (value === null || value === undefined) return null;
  if (metric === 'total') return value;
  const capacity = data.reading?.metadata.capacity;
  return capacity && Number.isFinite(capacity) && capacity > 0 ? value / capacity : null;
}
export function visualForRoom(room: PlanRoom, dataset: EnergyDataset, mode: MapMode, metric: EnergyMetric): RoomVisual {
  const data = roomEnergy(room, dataset);
  const unknown: RoomVisual = {color:'#E6D1E5', unavailable:true, label:'Unavailable', severity:'unavailable'};
  if (!data.reading) return unknown;
  if (mode === 'anomaly') {
    const anomaly = data.reading.anomaly;
    if (anomaly) return {color:anomaly.severity === 'critical' ? '#CA2127' : '#9B829A', unavailable:false, label:`${anomaly.severity} anomaly`, severity:anomaly.severity};
    // Missing status is not evidence of normal operation.
    if (!data.reading.anomaliesAssessed) return unknown;
    return {color:'#FFFCFC', unavailable:false, label:'No active rule alert', severity:'normal'};
  }
  const value = energyValue(data, metric);
  if (value === null) return unknown;
  const cuts = thresholds(metric), bin = cuts.filter(cut => value >= cut).length;
  return {color:ENERGY_COLORS[bin], unavailable:false, label:`${value.toFixed(2)} ${metric === 'total' ? 'kWh' : 'kWh / seat'}`, severity:'normal'};
}
