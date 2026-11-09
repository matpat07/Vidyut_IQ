import React from 'react';
import type { RoomEnergy } from './energyTypes';
export const metricText = (value: number | null | undefined, unit = '') => value === null || value === undefined ? 'Unavailable' : `${value.toFixed(2)}${unit ? ` ${unit}` : ''}`;
export function EnergyReadings({data,compact=false}:{data:RoomEnergy;compact?:boolean}) {
  const reading = data.reading;
  return <>
    <p className="radar-data-badge">{data.sourceLabel}</p>
    {reading ? <>
      <dl className={compact ? 'radar-hover-metrics' : ''}>
        <div><dt>Current demand</dt><dd>{metricText(reading.powerKw,'kW')}</dd></div>
        <div><dt>Period energy</dt><dd>{metricText(reading.energyKwh,'kWh')}</dd></div>
        <div><dt>Estimated cost</dt><dd>{metricText(data.costInr,'INR')}</dd></div>
      </dl>
      <p className="radar-reading-status">{reading.status}</p>
      <p className="radar-updated">Updated: {reading.updatedLabel ?? 'Unavailable'}</p>
      {!compact && <p className="plan-room-note">{reading.tariffInrPerKwh === null ? 'Tariff unavailable.' : `${data.sourceLabel === 'DEMO DATA' ? 'Assumed tariff' : 'Source tariff'}: ${reading.tariffInrPerKwh.toFixed(2)} INR / kWh.`}</p>}
    </> : <p className="floor-data-unavailable">{data.reason}</p>}
  </>;
}
