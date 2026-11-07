import React from 'react';
import type { RoomViewData } from '../../../context/SimulationContext';
import { PlanRoom, resolvePlanRoom } from './floorPlans';

export function PlanRoomDetails({ room, records, onInspectRoom }: { room: PlanRoom; records: RoomViewData[]; onInspectRoom: (id: string) => void }) {
  const link = resolvePlanRoom(room, records.map(record => record.metadata));
  const data = records.find(record => record.metadata.id === link.roomId);
  return <section className="plan-room-detail" aria-label="Selected plan room" aria-live="polite">
    <p className="eyebrow">{room.number ? `Room ${room.number}` : room.label}</p><p className="floor-energy-source">Floor {room.floor} · {room.kind}</p>
    {data ? <>
      <p className="floor-energy-source">Existing simulated readings</p>
      <dl><div><dt>Power draw</dt><dd>{(data.telemetry.simulatedPowerWatts / 1000).toFixed(2)} <small>kW</small></dd></div>
        <div><dt>Energy</dt><dd>{data.telemetry.cumulativeKWh.toFixed(2)} <small>kWh</small></dd></div>
        <div><dt>Occupants</dt><dd>{data.telemetry.simulatedOccupantCount}</dd></div></dl>
      <p className={data.activeAlert ? 'plan-alert' : 'floor-energy-source'}>{data.activeAlert?.reason ?? 'No active alert'}</p>
      <button className="plan-inspect" onClick={() => onInspectRoom(data.metadata.id)}>Open room details ↗</button>
    </> : <p className="floor-data-unavailable">{link.reason}</p>}
  </section>;
}
