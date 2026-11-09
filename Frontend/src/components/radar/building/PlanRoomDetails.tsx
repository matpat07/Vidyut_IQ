import React from 'react';
import { FLOOR_PLANS, PlanRoom, ROOM_TYPES } from './floorPlans';
import { roomEnergy } from '../energy/energyAdapter';
import { EnergyReadings } from '../energy/EnergyReadings';
import { RoomHistory } from '../energy/RoomHistory';
import type { EnergyDataset } from '../energy/energyTypes';

export function PlanRoomDetails({ room, dataset, onInspectRoom, onClose }: { room: PlanRoom; dataset: EnergyDataset; onInspectRoom: (id: string) => void; onClose: () => void }) {
  const data = roomEnergy(room, dataset), reading = data.reading;
  const accessNames = [...new Set(room.doors.map(door => FLOOR_PLANS[room.floor-1].find(space => space.id === door.corridor)?.name).filter(Boolean))];
  return <section className="plan-room-detail" aria-label="Selected plan room">
    <button className="plan-close" onClick={onClose}>Close room</button>
    <p className="eyebrow">{room.number ? `Room ${room.number}` : room.label}</p><p className="floor-energy-source">Floor {room.floor} / {ROOM_TYPES[room.kind]}</p>
    <p className="plan-room-name">{room.name}</p>
    {room.aliases.length > 0 && <p className="plan-room-note">One physical space. Legacy aliases: {room.aliases.join(', ')}.</p>}
    <EnergyReadings data={data} />
    {reading && <>
      <p className="plan-room-note">Period: {dataset.periodLabel}</p>
      <div className="plan-detail-section"><h3>Historical consumption / kWh</h3><RoomHistory points={reading.history} /><p>{dataset.historyBasis}</p></div>
      <div className="plan-detail-section"><h3>Appliance demand</h3>
        {reading.appliances.length ? reading.appliances.map(appliance => <p key={appliance.name}>{appliance.name}: {appliance.kw === null ? 'Unavailable' : `${appliance.kw.toFixed(2)} kW`}</p>) : <p>Appliance readings unavailable.</p>}
        {dataset.mode === 'demo' && <p>Demo nameplate estimates from the existing inventory; not submeter readings. Standby and simulator fluctuation are excluded.</p>}
      </div>
      <div className="plan-detail-section"><h3>Occupancy &amp; timetable</h3><p>Occupants: {reading.occupants ?? 'Unavailable'}</p>
        {reading.occupancy ? <><p>{reading.occupancy.day} / {reading.occupancy.expectedStatus}</p><p>{reading.occupancy.currentLecture?.subject ?? 'No current lecture.'}</p><p>{reading.occupancy.nextLecture ? `Next: ${reading.occupancy.nextLecture.subject} (${reading.occupancy.nextLecture.slotLabel})` : 'No upcoming lecture in this profile.'}</p></> : <p>Timetable unavailable.</p>}
      </div>
      <div className="plan-detail-section"><h3>Energy anomalies</h3>{reading.anomaly ? <><p className="radar-anomaly" data-severity={reading.anomaly.severity}>{reading.anomaly.reason}</p><p>Evidence: {reading.anomaly.evidence}</p></> : <p>{reading.anomaliesAssessed ? 'No active supported anomaly.' : 'Anomaly assessment unavailable.'}</p>}</div>
      <div className="plan-detail-section"><h3>Operational insights</h3>{reading.recommendations.length ? reading.recommendations.map((text,index) => <p key={index}>{text}</p>) : <p>No operational recommendation available.</p>}</div>
      {dataset.mode === 'demo' && <button className="plan-inspect" onClick={() => onInspectRoom(reading.metadata.id)}>Open simulation controls</button>}
    </>}
    <div className="plan-detail-section"><h3>Plan access</h3><p>{room.kind === 'CORRIDOR' ? 'Documented circulation or passage.' : room.doors.length ? `${room.doors.length} diagram openings. ${accessNames.length ? `Access: ${accessNames.join(', ')}.` : 'Access route unverified.'}` : 'No access opening is legible.'}</p></div>
    {room.note && <p className="plan-room-note">{room.note}</p>}
  </section>;
}
