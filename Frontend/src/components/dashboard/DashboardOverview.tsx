import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useSimulation } from '../../context/SimulationContext';
import { HourlyEnergyChart } from '../analytics/HourlyEnergyChart';
import { NavView } from '../layout/Sidebar';
interface DashboardOverviewProps {
    onNavigate: (view: NavView) => void;
    onInspectRoom: (roomId: string) => void;
}
export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate, onInspectRoom }) => {
    const { roomDataList, activeAlerts, impactSummary, assumptions, timeString, day } = useSimulation();
    const occupied = roomDataList.filter(r => r.occupancyProfile.expectedStatus === 'SCHEDULED').length;
    const metrics = [
        { label: 'Connected rooms', value: roomDataList.length, detail: 'Across the campus' },
        { label: 'Occupied rooms', value: occupied, detail: 'Scheduled lectures' },
        { label: 'Active waste alerts', value: activeAlerts.length, detail: `${(impactSummary.currentWastedDrawWatts / 1000).toFixed(1)} kW avoidable`, alert: activeAlerts.length > 0 },
        { label: 'Energy saved', value: impactSummary.accumulatedKwhSaved.toFixed(1), unit: 'kWh', detail: `₹${impactSummary.accumulatedCostSavedInr.toFixed(0)} saved · ₹${assumptions.tariffInrPerKwh}/kWh` }
    ];
    // Presentation aggregation of the existing live readings; simulation formulas are unchanged.
    const consumption = Array.from(new Set(roomDataList.map(r => r.metadata.department))).map((name, i) => ({ name, value: roomDataList.filter(r => r.metadata.department === name).reduce((sum, r) => sum + r.telemetry.simulatedPowerWatts, 0) / 1000, color: ['#CA2127', '#E6D1E5', '#9B829A'][i % 3] }));
    return <div className="dashboard"><div className="page-intro"><div><p className="eyebrow">Campus overview</p><h2>A clearer view of your energy.</h2></div><p>{day} · {timeString}<span>Simulated campus readings</span></p></div>
 <div className="dashboard-grid"><div className="dashboard-chart"><HourlyEnergyChart /></div>
 <div className="kpi-grid">{metrics.map(metric => <article className={`kpi-card ${metric.alert ? 'has-alert' : ''}`} key={metric.label}><p>{metric.label}</p><strong>{metric.value}<small>{metric.unit}</small></strong><span>{metric.detail}</span></article>)}</div>
 <section className="dashboard-links" aria-label="Explore campus"><p className="eyebrow">Explore your campus</p>
 {([{ title: 'Campus Insights', description: 'Understand usage and savings', view: 'ANALYTICS' }, { title: 'Room Monitoring', description: `${roomDataList.length} rooms, one connected campus`, view: 'RADAR' }, { title: 'Active Alerts', description: `${activeAlerts.length} rooms need your attention`, view: 'ALERTS' }] as const).map(link => <button key={link.view} onClick={() => onNavigate(link.view)}><div><h3>{link.title}</h3><p>{link.description}</p></div><span aria-hidden="true">↗</span></button>)}
 <div className="quick-inspect"><label htmlFor="inspect-room">Inspect a room</label><select id="inspect-room" value="" onChange={e => e.target.value && onInspectRoom(e.target.value)}><option value="">Select room →</option>{roomDataList.map(r => <option key={r.metadata.id} value={r.metadata.id}>{r.metadata.id} · {r.metadata.name}</option>)}</select></div></section>
 <section className="card-base consumption-card"><div><p className="eyebrow">Live distribution</p><h3>Energy consumption</h3></div>
 <div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={consumption} dataKey="value" nameKey="name" innerRadius="69%" outerRadius="91%" paddingAngle={5} stroke="none" cornerRadius={6} isAnimationActive={false}>{consumption.map(item => <Cell key={item.name} fill={item.color}/>)}</Pie><Tooltip formatter={(v: number) => `${v.toFixed(2)} kW`} contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, color: 'var(--ink)' }} itemStyle={{ color: 'var(--ink)' }}/></PieChart></ResponsiveContainer><div className="donut-total"><strong>{(impactSummary.currentTotalDrawWatts / 1000).toFixed(1)}</strong><span>kW total draw</span></div></div>
 <div className="chart-legend">{consumption.map(item => <div key={item.name}><span className="legend-dot" style={{ background: item.color }}/><span>{item.name}</span><strong>{item.value.toFixed(1)} kW</strong></div>)}</div></section></div></div>;
};
