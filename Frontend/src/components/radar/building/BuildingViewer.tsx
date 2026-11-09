import React, { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {createTransitionController,CameraView} from './transitionController';
import { useExplosionInput } from './useExplosionInput';
import { FLOOR_NAMES, FLOOR_PLANS, ROOM_TYPES } from './floorPlans';
import {RoomSearch} from './RoomSearch';
import { PlanRoomDetails } from './PlanRoomDetails';
import { useRoomAnalytics } from '../energy/useRoomAnalytics';
import { EnergyControls } from '../energy/EnergyControls';
import { EnergyReadings } from '../energy/EnergyReadings';
import { roomEnergy } from '../energy/energyAdapter';
import { visualForRoom } from '../energy/energyVisuals';
import type { ConnectedEnergyProvider, EnergyMetric, MapMode,EnergyPreferences } from '../energy/energyTypes';
import './building.css';
const BuildingScene = lazy(() => import('./BuildingScene'));

class SceneBoundary extends Component<{ children: React.ReactNode; onFallback: () => void; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() {
    if (this.state.failed) return <div className="building-fallback" role="status"><h3>3D view unavailable</h3><p>Your room monitoring data is still available.</p><button onClick={this.props.onFallback}>Open room list</button></div>;
    return this.props.children;
  }
}

export default function BuildingViewer({ onShowRooms, onInspectRoom, energyProvider,preferences }: { onShowRooms: () => void; onInspectRoom: (id: string) => void; energyProvider?: ConnectedEnergyProvider;preferences:EnergyPreferences }) {
  const transitions=useMemo(createTransitionController,[]);
  const {explosion:controller,focus}=transitions;
  const cameraState=useSyncExternalStore(transitions.subscribe,transitions.getSnapshot,transitions.getSnapshot);
  const command=cameraState.command;
  const progress = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const surface = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const roomLabels = useRef<(HTMLElement | null)[]>([]);
  const hoverCard = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | null>(null);
  const selectedFloor=cameraState.presentedFloor;
  const restorePicker=useRef(false);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const setRoomHover = useCallback((room: string | null) => {
    if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
    if (room !== null) setHoveredRoom(room);
    else hoverTimer.current = window.setTimeout(() => { setHoveredRoom(null); hoverTimer.current = null; }, 160);
  }, []);
  const clearHover = () => { if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current); hoverTimer.current = null; setHoveredRoom(null); };
  useEffect(() => () => { if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current); }, []);
  const plan = selectedFloor ? FLOOR_PLANS[selectedFloor - 1] : [];
  const selectedRoom = plan.find(room => room.id === cameraState.roomId);
  const hoverRoom = plan.find(room => room.id === hoveredRoom);
  const [ready, setReady] = useState(false);
  const [lost, setLost] = useState(false);
  const [failed,setFailed]=useState(false);
  const {mode:dataMode,setMode:setDataMode,period,setPeriod}=preferences;
  const [mapMode, setMapMode] = useState<MapMode>('room');
  const [metric, setMetric] = useState<EnergyMetric>('total');
  const {dataset, refresh} = useRoomAnalytics(dataMode, period, energyProvider);
  const visuals = useMemo(() => Object.fromEntries(FLOOR_PLANS.flat().map(room => [room.id, visualForRoom(room,dataset,mapMode,metric)])), [dataset,mapMode,metric]);
  // Summaries include only verified spatial mappings, never unlocated dataset nodes.
  const rooms = FLOOR_PLANS.flat().filter(room => selectedFloor === null || room.floor === selectedFloor).map(room => roomEnergy(room,dataset)).flatMap(data => data.reading ? [data.reading] : []);
  const powers = rooms.flatMap(room => room.powerKw === null ? [] : [room.powerKw]);
  const draw = powers.reduce((sum,value) => sum + value, 0);
  const alerts = rooms.filter(room => room.anomaly).length;
  const hasAssessment = rooms.some(room => room.anomaliesAssessed);
  const onReady = useCallback(() => setReady(true), []);
  const onContextLost = useCallback(() => setLost(true), []);
  const onFailure=useCallback(()=>setFailed(true),[]);
  useExplosionInput(surface,transitions.scrub,selectedFloor===null&&cameraState.requestedFloor===null);
  useEffect(()=>{
    if(cameraState.busy)clearHover();
    else if(restorePicker.current){
      restorePicker.current=false;
      const active=document.activeElement;
      if(active===document.body||active?.closest('.plan-room-label,.plan-room-picker,.plan-hover'))surface.current?.closest('section')?.querySelector<HTMLSelectElement>('.plan-room-picker')?.focus({preventScroll:true});
    }
  },[cameraState.busy]);
  const setView=(view:CameraView)=>transitions.setView(view);
  const reset=()=>{clearHover();transitions.overview();};
  const stack=()=>{clearHover();transitions.stack();};
  const selectFloor=(floor:number)=>{clearHover();transitions.selectFloor(floor);};
  const selectRoom=useCallback((room:string)=>{
    if(!transitions.canPick)return;
    restorePicker.current=Boolean(document.activeElement?.closest('.plan-room-label,.plan-room-picker,.plan-hover'));
    transitions.selectRoom(room);
  },[transitions]);
  const closeRoom=()=>{restorePicker.current=true;transitions.selectRoom(null);clearHover();};
  const changeProgress=(value:number)=>{clearHover();transitions.setProgress(value);};
  const stage = selectedFloor ? `F${selectedFloor} — ${FLOOR_NAMES[selectedFloor - 1]}` : progress < .25 ? 'Assembled building' : progress < .75 ? 'Separating floors' : 'Exploded building';
  const hoverData = hoverRoom ? roomEnergy(hoverRoom,dataset) : null;
  return <section className={`building-viewer${selectedFloor ? ' is-focused' : ''}`} aria-labelledby="building-title" data-camera-state={cameraState.state} data-camera-busy={cameraState.busy}>
    <div className="building-heading"><div><p className="eyebrow">PCCOE / Campus digital twin</p><h2 id="building-title">{selectedFloor ? stage : 'Building No. 6'}<span>Scroll inside the model to explore all five floors.</span></h2></div>
      <div className="building-room-tools"><RoomSearch onSelect={id=>transitions.inspectSpace(id)} /><select className="plan-room-picker" aria-label="Select a room on this floor" disabled={!ready||cameraState.busy||!selectedFloor} value={selectedRoom?.id ?? ''} onChange={event => event.target.value && selectRoom(event.target.value)}>
        <option value="">{selectedFloor ? 'Select a room' : 'Select a floor first'}</option>
        {plan.map(room => <option key={room.id} value={room.id}>{room.label}{room.aliases.length ? ` (also ${room.aliases.join(', ')})` : ''} · {ROOM_TYPES[room.kind]}</option>)}
      </select></div></div>
    <p className="sr-only" role="status">{failed||lost?'3D view unavailable. Room list remains available.':cameraState.busy?'Changing view.':selectedRoom?`Room ${selectedRoom.label} selected.`:selectedFloor?`Floor ${selectedFloor} ready.`:stage}</p>
    <EnergyControls mode={dataMode} setMode={setDataMode} period={period} setPeriod={setPeriod} view={mapMode} setView={setMapMode} metric={metric} setMetric={setMetric} dataset={dataset} focused={selectedFloor !== null} refresh={refresh} />
    <div className="building-workbench">
      <div className="building-stage" aria-label="Interactive architectural model of PCCOE Building No. 6">
        <div className="building-stage-label"><span className="status-dot" /> Building 06<span>{stage}</span></div>
        <div ref={surface} className="building-scene-surface" style={{cursor: hoveredRoom ? 'pointer' : undefined}} tabIndex={0} role="region" aria-label="Building explosion viewport" aria-describedby="building-scroll-help" aria-busy={!failed&&!lost&&(!ready||cameraState.busy)}>
          {lost ? <div className="building-fallback" role="status"><h3>3D connection interrupted</h3><p>Switch to the room list or reload the model.</p><button onClick={() => { setLost(false); setReady(false); }}>Reload model</button><button onClick={onShowRooms}>Open room list</button></div> :
            <SceneBoundary onFallback={onShowRooms} onFailure={onFailure}><Suspense fallback={null}><BuildingScene command={command} controller={controller} selectedFloor={selectedFloor} focus={focus} labels={labels} roomLabels={roomLabels} hoverCard={hoverCard} selectedRoom={selectedRoom?.id ?? null} hoveredRoom={hoveredRoom} mapMode={mapMode} visuals={visuals} transitions={transitions} onRoomSelect={selectRoom} onRoomHover={setRoomHover} onReady={onReady} onContextLost={onContextLost} onFallback={onShowRooms} /></Suspense></SceneBoundary>}
          <div className="building-floor-labels" aria-hidden="true">{[1, 2, 3, 4, 5].map((floor, index) => <div key={floor} ref={element => { labels.current[index] = element; }} className="building-floor-label"><span />Floor {floor}</div>)}</div>
          <div className="plan-room-labels" hidden={lost || failed || !ready}>{plan.map((room, index) => <button key={room.id} ref={element => { roomLabels.current[index] = element; }} className="plan-room-label" disabled={cameraState.busy} data-numbered={Boolean(room.number)} data-kind={room.kind} data-anomaly={mapMode === 'anomaly' ? visuals[room.id]?.severity : undefined} aria-label={`${room.label}, ${ROOM_TYPES[room.kind]}, floor ${room.floor}${mapMode !== 'room' ? `, ${visuals[room.id]?.label}` : ''}`} aria-pressed={selectedRoom?.id === room.id}
            onFocus={() => setRoomHover(room.id)} onBlur={() => setRoomHover(null)} onMouseEnter={() => setRoomHover(room.id)} onMouseLeave={() => setRoomHover(null)} onClick={() => selectRoom(room.id)}>{room.number ?? (room.kind === 'WF' ? 'WR' : room.kind === 'CABIN' ? 'Cabin' : room.kind === 'STAIR' ? 'Stair' : room.kind === 'LIFT' ? 'Lift' : room.kind === 'CORRIDOR' ? (room.id.includes('passage') ? 'Passage' : 'Corridor') : room.kind === 'OTHER' ? (room.id.includes('landing') ? 'Landing' : 'Unlabelled') : room.label)}<small>{room.number ? room.kind : ''}</small></button>)}
          </div>
        </div>
        {hoverRoom && <div ref={hoverCard} className="plan-hover" id="plan-hover" role="status" onMouseEnter={() => setRoomHover(hoverRoom.id)} onMouseLeave={() => setRoomHover(null)} onFocus={() => setRoomHover(hoverRoom.id)} onBlur={() => setRoomHover(null)}>
          <strong>{hoverRoom.number ? `Room ${hoverRoom.number}` : hoverRoom.name}</strong><span>{ROOM_TYPES[hoverRoom.kind]}</span>
          <span>{hoverRoom.name}</span>
          {hoverData && <EnergyReadings data={hoverData} compact />}
          <span>Period: {dataset.periodLabel}</span>
          <button onClick={() => selectRoom(hoverRoom.id)}>View details ↗</button>
        </div>}
        {!ready && !lost && !failed && <p className="building-loading" role="status">Preparing architectural model…</p>}
        <div className="building-camera-controls" role="group" aria-label="Building camera" data-scene-ui>
          {(['perspective', 'front', 'aerial', 'top'] as CameraView[]).map(view => <button key={view} aria-pressed={command.view === view} onClick={() => setView(view)}>{view === 'perspective' ? 'Isometric' : view === 'front' ? 'Front' : view === 'top' ? 'Top' : 'Aerial'}</button>)}
          <span className="camera-separator" />
          <button aria-label="Zoom out" disabled={command.zoom <= .7} onClick={() => transitions.zoomBy(-.15)}>−</button>
          <button aria-label="Zoom in" disabled={command.zoom >= 1.6} onClick={() => transitions.zoomBy(.15)}>+</button>
          <button onClick={stack}>Reset View</button>
        </div>
        <p id="building-scroll-help" className="building-gesture">{selectedFloor ? 'Select a room · Drag to orbit · Back to Floor Stack to resume scrolling' : 'Scroll / swipe to separate · Drag to orbit · Two fingers to orbit on touch'}</p>
      </div>
      <aside className="building-floor-panel" aria-label="Floor selection and energy summary">
        <div className="floor-panel-heading"><p className="eyebrow">Floors</p><button onClick={stack} aria-pressed={selectedFloor === null}>All</button></div>
        <nav className="floor-panel-buttons" aria-label="Building floors">{[5, 4, 3, 2, 1].map(floor => <button key={floor} aria-label={`F${floor} — ${FLOOR_NAMES[floor - 1]}`} aria-pressed={selectedFloor === floor} onClick={() => selectFloor(floor)}><b>F{floor}</b><span>{FLOOR_NAMES[floor - 1]}</span></button>)}</nav>
        <div className="floor-panel-content"><div key={selectedRoom?.uid??'summary'} className="radar-context-content">
        {selectedRoom ? <PlanRoomDetails room={selectedRoom} dataset={dataset} onInspectRoom={onInspectRoom} onClose={closeRoom} /> :
        <div className="floor-energy-summary"><p className="eyebrow">{selectedFloor ? `Floor ${selectedFloor}` : 'Building 06'}</p><p className="floor-energy-source">{dataMode === 'demo' ? 'DEMO DATA' : 'CONNECTED DATA'} / mapped rooms only</p>
          {rooms.length ? <dl><div><dt>Known demand</dt><dd>{powers.length ? draw.toFixed(1) : 'Unavailable'} <small>{powers.length ? 'kW' : ''}</small></dd></div><div><dt>Rule alerts</dt><dd>{hasAssessment ? alerts : 'Unavailable'}</dd></div><div><dt>Mapped nodes</dt><dd>{rooms.length}</dd></div></dl> : <p className="floor-data-unavailable">{dataset.state !== 'ready' ? dataset.message : 'No telemetry mapped to this floor.'}</p>}
        </div>}
        </div></div>
        <div className="floor-exits"><button onClick={reset}>Back to Building</button><button onClick={stack}>Back to Floor Stack</button><button onClick={stack}>Reset View</button></div>
      </aside>
    </div>
    <div className="building-scrub" data-scene-ui><button onClick={() => changeProgress(0)}>Assembled</button><label htmlFor="building-separation">Separation</label><input id="building-separation" type="range" min={0} max={1} step={.001} value={progress} aria-valuetext={`${Math.round(progress * 100)} percent separated`} onChange={event => changeProgress(Number(event.target.value))} /><output htmlFor="building-separation">{Math.round(progress * 100)}%</output><button onClick={() => changeProgress(1)}>Exploded</button></div>
    <div className="building-caption"><p>Conceptual plans normalized to the approved envelope. Unmatched rooms show unavailable data.</p><span>PCCOE · Building 06</span></div>
  </section>;
}
