import React, { Component, lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from 'react';
import type { CameraView, ViewCommand } from './BuildingScene';
import { createExplosionController } from './explosion';
import { useExplosionInput } from './useExplosionInput';
import { useSimulation } from '../../../context/SimulationContext';
import { createFloorFocus } from './floorFocus';
import { FLOOR_NAMES, FLOOR_PLANS, PLAN_MARKERS, floorNavigation, resolvePlanRoom } from './floorPlans';
import { PlanRoomDetails } from './PlanRoomDetails';
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

export default function BuildingViewer({ onShowRooms, onInspectRoom }: { onShowRooms: () => void; onInspectRoom: (id: string) => void }) {
  const controller = useMemo(createExplosionController, []);
  const focus = useMemo(createFloorFocus, []);
  const progress = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const surface = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const roomLabels = useRef<(HTMLElement | null)[]>([]);
  const [command, setCommand] = useState<ViewCommand>({ view: 'perspective', zoom: 1, revision: 0 });
  const [navigation, dispatch] = useReducer(floorNavigation, { floor: null, room: null });
  const selectedFloor = useSyncExternalStore(focus.subscribe, focus.getSnapshot, focus.getSnapshot);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const plan = selectedFloor ? FLOOR_PLANS[selectedFloor - 1] : [];
  const selectedRoom = navigation.floor === selectedFloor ? plan.find(room => room.id === navigation.room) : undefined;
  const hoverRoom = plan.find(room => room.id === hoveredRoom);
  const [ready, setReady] = useState(false);
  const [lost, setLost] = useState(false);
  const { roomDataList } = useSimulation();
  const rooms = roomDataList.filter(room => room.metadata.block === 'Block 6' && (selectedFloor === null || room.metadata.floor === selectedFloor));
  const draw = rooms.reduce((sum, room) => sum + room.telemetry.simulatedPowerWatts, 0);
  const alerts = rooms.filter(room => room.activeAlert).length;
  const onReady = useCallback(() => setReady(true), []);
  const onContextLost = useCallback(() => setLost(true), []);
  useExplosionInput(surface, controller, selectedFloor === null && navigation.floor === null);
  useEffect(() => controller.subscribe(() => {
    // A new scroll/slider gesture returns to the architectural isometric angle.
    setCommand(previous => previous.view === 'perspective' ? previous : { view: 'perspective', zoom: previous.zoom, revision: previous.revision + 1 });
  }), [controller]);
  const setView = (view: CameraView) => setCommand(previous => ({ view, zoom: 1, revision: previous.revision + 1 }));
  const leaveFloor = () => { dispatch({ type: 'exit' }); focus.select(null); setHoveredRoom(null); };
  const reset = () => { leaveFloor(); controller.set(0); setView('perspective'); };
  const stack = () => { leaveFloor(); controller.set(1); setView('perspective'); };
  const selectFloor = (floor: number) => {
    if (floor === navigation.floor) return;
    dispatch({ type: 'floor', floor }); setHoveredRoom(null); focus.select(floor); controller.set(1); setView('perspective');
  };
  const selectRoom = useCallback((room: string) => dispatch({ type: 'room', room }), []);
  const changeProgress = (value: number) => { leaveFloor(); controller.set(value); };
  const stage = selectedFloor ? `F${selectedFloor} — ${FLOOR_NAMES[selectedFloor - 1]}` : progress < .25 ? 'Assembled building' : progress < .75 ? 'Separating floors' : 'Exploded building';
  const hoverLink = hoverRoom ? resolvePlanRoom(hoverRoom, roomDataList.map(room => room.metadata)) : null;
  const hoverData = roomDataList.find(room => room.metadata.id === hoverLink?.roomId);
  return <section className={`building-viewer${selectedFloor ? ' is-focused' : ''}`} aria-labelledby="building-title">
    <div className="building-heading"><div><p className="eyebrow">PCCOE / Campus digital twin</p><h2 id="building-title">{selectedFloor ? stage : 'Building No. 6'}<span>Scroll inside the model to explore all five floors.</span></h2></div>
      <select className="plan-room-picker" aria-label="Select a room on this floor" disabled={!selectedFloor || selectedFloor !== navigation.floor} value={selectedRoom?.id ?? ''} onChange={event => event.target.value && selectRoom(event.target.value)}>
        <option value="">{selectedFloor ? 'Select a room' : 'Select a floor first'}</option>
        {plan.map(room => <option key={room.id} value={room.id}>{room.label} · {room.kind}</option>)}
      </select></div>
    <div className="building-workbench">
      <div className="building-stage" aria-label="Interactive architectural model of PCCOE Building No. 6">
        <div className="building-stage-label"><span className="status-dot" /> Building 06<span>{stage}</span></div>
        <div ref={surface} className="building-scene-surface" tabIndex={0} role="region" aria-label="Building explosion viewport" aria-describedby="building-scroll-help">
          {lost ? <div className="building-fallback" role="status"><h3>3D connection interrupted</h3><p>Switch to the room list or reload the model.</p><button onClick={() => { setLost(false); setReady(false); }}>Reload model</button><button onClick={onShowRooms}>Open room list</button></div> :
            <SceneBoundary onFallback={onShowRooms} onFailure={onReady}><Suspense fallback={null}><BuildingScene command={command} controller={controller} selectedFloor={selectedFloor} focus={focus} labels={labels} roomLabels={roomLabels} selectedRoom={selectedRoom?.id ?? null} hoveredRoom={hoveredRoom} onRoomSelect={selectRoom} onRoomHover={setHoveredRoom} onReady={onReady} onContextLost={onContextLost} /></Suspense></SceneBoundary>}
          <div className="building-floor-labels" aria-hidden="true">{[1, 2, 3, 4, 5].map((floor, index) => <div key={floor} ref={element => { labels.current[index] = element; }} className="building-floor-label"><span />Floor {floor}</div>)}</div>
          <div className="plan-room-labels" hidden={lost || !ready}>{plan.map((room, index) => <button key={room.id} ref={element => { roomLabels.current[index] = element; }} className="plan-room-label" data-numbered={Boolean(room.number)} aria-label={`${room.label}, ${room.kind}, floor ${room.floor}`} aria-pressed={navigation.room === room.id}
            onFocus={() => setHoveredRoom(room.id)} onBlur={() => setHoveredRoom(null)} onMouseEnter={() => setHoveredRoom(room.id)} onMouseLeave={() => setHoveredRoom(null)} onClick={() => selectRoom(room.id)}>{room.number ?? (room.kind === 'WF' ? 'WF' : room.kind === 'CABIN' ? 'Cabin' : room.label)}<small>{room.number ? room.kind : ''}</small></button>)}
            {selectedFloor && PLAN_MARKERS.map((marker, index) => <span key={index} className="plan-room-label plan-marker" ref={element => { roomLabels.current[plan.length + index] = element; }}>{marker.label}</span>)}
          </div>
        </div>
        {hoverRoom && <div className="plan-hover" role="status"><strong>{hoverRoom.label}</strong><span>{hoverData ? `${(hoverData.telemetry.simulatedPowerWatts / 1000).toFixed(2)} kW · ${hoverData.activeAlert ? 'Active alert' : 'No active alert'}` : hoverLink?.reason}</span></div>}
        {!ready && !lost && <p className="building-loading" role="status">Preparing architectural model…</p>}
        <div className="building-camera-controls" role="group" aria-label="Building camera" data-scene-ui>
          {(['perspective', 'front', 'aerial', 'top'] as CameraView[]).map(view => <button key={view} aria-pressed={command.view === view} onClick={() => setView(view)}>{view === 'perspective' ? 'Isometric' : view === 'front' ? 'Front' : view === 'top' ? 'Top' : 'Aerial'}</button>)}
          <span className="camera-separator" />
          <button aria-label="Zoom out" disabled={command.zoom <= .7} onClick={() => setCommand(previous => ({ ...previous, zoom: Math.max(.7, previous.zoom - .15) }))}>−</button>
          <button aria-label="Zoom in" disabled={command.zoom >= 1.6} onClick={() => setCommand(previous => ({ ...previous, zoom: Math.min(1.6, previous.zoom + .15) }))}>+</button>
          <button onClick={stack}>Reset View</button>
        </div>
        <p id="building-scroll-help" className="building-gesture">{selectedFloor ? 'Select a room · Drag to orbit · Back to Floor Stack to resume scrolling' : 'Scroll / swipe to separate · Drag to orbit · Two fingers to orbit on touch'}</p>
      </div>
      <aside className="building-floor-panel" aria-label="Floor selection and energy summary">
        <div className="floor-panel-heading"><p className="eyebrow">Floors</p><button onClick={stack} aria-pressed={selectedFloor === null}>All</button></div>
        <nav className="floor-panel-buttons" aria-label="Building floors">{[5, 4, 3, 2, 1].map(floor => <button key={floor} aria-label={`F${floor} — ${FLOOR_NAMES[floor - 1]}`} aria-pressed={selectedFloor === floor} onClick={() => selectFloor(floor)}><b>F{floor}</b><span>{FLOOR_NAMES[floor - 1]}</span></button>)}</nav>
        <div className="floor-panel-content">
        {selectedRoom ? <PlanRoomDetails room={selectedRoom} records={roomDataList} onInspectRoom={onInspectRoom} /> :
        <div className="floor-energy-summary"><p className="eyebrow">{selectedFloor ? `Floor ${selectedFloor}` : 'Building 06'}</p><p className="floor-energy-source">Simulated readings</p>
          {rooms.length ? <dl><div><dt>Power draw</dt><dd>{(draw / 1000).toFixed(1)} <small>kW</small></dd></div><div><dt>Active alerts</dt><dd>{alerts}</dd></div><div><dt>Known nodes</dt><dd>{rooms.length}</dd></div></dl> : <p className="floor-data-unavailable">No telemetry mapped to this floor.</p>}
        </div>}
        </div>
        <div className="floor-exits"><button onClick={reset}>Back to Building</button><button onClick={stack}>Back to Floor Stack</button><button onClick={stack}>Reset View</button></div>
      </aside>
    </div>
    <div className="building-scrub" data-scene-ui><button onClick={() => changeProgress(0)}>Assembled</button><label htmlFor="building-separation">Separation</label><input id="building-separation" type="range" min={0} max={1} step={.001} value={progress} aria-valuetext={`${Math.round(progress * 100)} percent separated`} onChange={event => changeProgress(Number(event.target.value))} /><output htmlFor="building-separation">{Math.round(progress * 100)}%</output><button onClick={() => changeProgress(1)}>Exploded</button></div>
    <div className="building-caption"><p>Conceptual plans normalized to the approved envelope. Unmatched rooms show unavailable data.</p><span>PCCOE · Building 06</span></div>
  </section>;
}
