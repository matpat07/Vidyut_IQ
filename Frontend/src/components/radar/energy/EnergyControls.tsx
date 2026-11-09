import React from 'react';
import { ENERGY_COLORS, thresholds } from './energyVisuals';
import type { DataMode, EnergyDataset, EnergyMetric, EnergyPeriod, MapMode } from './energyTypes';

interface Props {
  mode: DataMode; period: EnergyPeriod; view: MapMode; metric: EnergyMetric; dataset: EnergyDataset; focused: boolean;
  setMode: (value: DataMode) => void; setPeriod: (value: EnergyPeriod) => void;
  setView: (value: MapMode) => void; setMetric: (value: EnergyMetric) => void; refresh: () => void;
}
export function EnergyControls(props: Props) {
  const {mode,period,view,metric,dataset,focused} = props;
  const cuts = thresholds(metric);
  return <div className="radar-analytics" data-scene-ui>
    <div className="radar-analytics-controls">
      <div className="radar-map-modes" role="group" aria-label="Floor map view">{(['room','energy','anomaly'] as MapMode[]).map(value =>
        <button key={value} disabled={!focused} aria-pressed={view === value} onClick={() => props.setView(value)}>{value === 'room' ? 'Room View' : value === 'energy' ? 'Energy View' : 'Anomaly View'}</button>)}</div>
      <label>Source<select aria-label="Energy data source" value={mode} onChange={event => props.setMode(event.target.value as DataMode)}><option value="demo">Demo Mode</option><option value="connected">Live / Connected</option></select></label>
      <label>Period<select aria-label="Energy period" value={period} onChange={event => props.setPeriod(event.target.value as EnergyPeriod)}><option value="hour">Past hour</option><option value="day">Today (from 09:00)</option></select></label>
      <label>Compare<select aria-label="Energy comparison metric" disabled={view !== 'energy'} value={metric} onChange={event => props.setMetric(event.target.value as EnergyMetric)}><option value="total">Total kWh</option><option value="perSeat">kWh / capacity seat</option></select></label>
      <button className="radar-refresh" disabled={mode !== 'connected'} onClick={props.refresh}>Refresh</button>
    </div>
    <p className="radar-source-status" role="status"><b>{mode === 'demo' ? 'DEMO DATA' : 'CONNECTED MODE'}</b> {dataset.message} <span>{dataset.state === 'ready' ? dataset.periodLabel : ''}</span></p>
    <div className="radar-energy-legend" aria-label="Map legend">
      {view === 'energy' ? <><span>{metric === 'total' ? 'kWh' : 'kWh / capacity seat'}</span>{ENERGY_COLORS.map((color,index) => <span key={color}><i style={{background:color}} />{index === 0 ? `< ${cuts[0]}` : index === 3 ? `>= ${cuts[2]}` : `${cuts[index-1]} - < ${cuts[index]}`}</span>)}<span>Faded: unavailable</span><em>{metric === 'total' ? 'Totals are not normalized for room size.' : 'Capacity normalization; not floor area or actual attendance.'}</em></>
      : view === 'anomaly' ? <><span><i style={{background:'#FFFCFC'}} />No active rule alert</span><span><i style={{background:'#9B829A'}} />Warning</span><span><i style={{background:'#CA2127'}} />Critical</span><span>Faded: unavailable</span><em>Highlights require rule or source evidence.</em></>
      : <span>Select a floor, then hover or choose a room to explore its available readings.</span>}
    </div>
  </div>;
}
