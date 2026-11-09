import React,{useEffect,useRef,useState} from 'react';
import {FLOOR_PLANS,FLOOR_NAMES,ROOM_TYPES} from './building/floorPlans';
import {filterPlanSpaces} from './building/labelLayout';
import {PlanRoomDetails} from './building/PlanRoomDetails';
import {EnergyControls} from './energy/EnergyControls';
import {useRoomAnalytics} from './energy/useRoomAnalytics';
import {roomEnergy} from './energy/energyAdapter';
import {metricText} from './energy/EnergyReadings';
import {visualForRoom} from './energy/energyVisuals';
import type {ConnectedEnergyProvider,EnergyPreferences,MapMode,EnergyMetric} from './energy/energyTypes';

export default function PlanRoomList({energyProvider,preferences,onInspectRoom}:{energyProvider?:ConnectedEnergyProvider;preferences:EnergyPreferences;onInspectRoom:(id:string)=>void}) {
  const [query,setQuery]=useState(''),[floor,setFloor]=useState('all'),[selected,setSelected]=useState<string|null>(null);
  const [view,setView]=useState<MapMode>('room'),[metric,setMetric]=useState<EnergyMetric>('total');
  const {dataset,refresh}=useRoomAnalytics(preferences.mode,preferences.period,energyProvider);
  const rooms=filterPlanSpaces(query,floor==='all'?undefined:Number(floor));
  const room=FLOOR_PLANS.flat().find(space=>space.id===selected);
  const detail=useRef<HTMLElement>(null);
  useEffect(()=>{if(selected)detail.current?.focus();},[selected]);
  const close=()=>{const id=selected;setSelected(null);requestAnimationFrame(()=>document.getElementById(`plan-list-${id}`)?.focus({preventScroll:true}));};
  return <section className="radar-plan-list" aria-label="Searchable building floor plans">
    <EnergyControls mode={preferences.mode} setMode={preferences.setMode} period={preferences.period} setPeriod={preferences.setPeriod} view={view} setView={setView} metric={metric} setMetric={setMetric} dataset={dataset} focused refresh={refresh} />
    <div className="radar-plan-filters"><label>Find a room or facility<input type="search" value={query} placeholder="Number, type, name or legacy alias" onChange={event=>{setQuery(event.target.value);setSelected(null);}} /></label>
      <label>Floor<select value={floor} onChange={event=>{setFloor(event.target.value);setSelected(null);}}><option value="all">All floors</option>{FLOOR_NAMES.map((name,index)=><option key={name} value={index+1}>{name}</option>)}</select></label><p role="status">{rooms.length} plan spaces</p></div>
    <div className="radar-list-workbench">
      <div className="radar-plan-table" tabIndex={0} role="region" aria-label="Room readings table"><table><caption>Actual plan rooms and facilities. Select a room for its available analytics.</caption><thead><tr><th scope="col">Floor</th><th scope="col">Room / facility</th><th scope="col">Demand / kW</th><th scope="col">Period / kWh</th><th scope="col">{view==='energy'?'Comparison':'Energy status'}</th></tr></thead><tbody>
        {rooms.map(space=>{const data=roomEnergy(space,dataset),visual=visualForRoom(space,dataset,view,metric);return <tr key={space.uid} data-selected={selected===space.id}>
          <td>F{space.floor}</td><td><button id={`plan-list-${space.id}`} aria-controls="list-room-detail" aria-pressed={selected===space.id} onClick={()=>setSelected(space.id)}>{space.number??space.name}<small>{ROOM_TYPES[space.kind]}{space.aliases.length?` / alias ${space.aliases.join(', ')}`:''}</small></button></td>
          <td>{metricText(data.reading?.powerKw)}</td><td>{metricText(data.reading?.energyKwh)}</td><td>{view==='room'?data.reading?.status??'Unavailable':<span className="radar-list-classification"><i style={{background:visual.color,opacity:visual.unavailable?.25:1}} />{visual.label}</span>}</td>
        </tr>;})}
      </tbody></table>{!rooms.length&&<p className="floor-data-unavailable">No matching plan spaces. Try a different room number, type or floor.</p>}</div>
      <aside id="list-room-detail" ref={detail} tabIndex={-1} className="radar-list-detail" aria-label="Selected room analytics">{room?<PlanRoomDetails room={room} dataset={dataset} onClose={close} onInspectRoom={onInspectRoom}/>:<p>Choose a room or facility to inspect its available readings.</p>}</aside>
    </div>
  </section>;
}
