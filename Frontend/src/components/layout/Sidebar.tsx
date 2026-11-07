import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
export type NavView = 'DASHBOARD' | 'RADAR' | 'ANALYTICS' | 'ALERTS' | 'AUDIT' | 'SETTINGS' | 'TEACHER' | 'STUDENT_FINDER';
interface SidebarProps {
    currentView: NavView;
    onSelectView: (view: NavView) => void;
    isOpenMobile: boolean;
    onCloseMobile: () => void;
}
export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, isOpenMobile, onCloseMobile }) => {
    const { activeAlerts, roomDataList } = useSimulation();
    const groups: {
        label: string;
        items: [
            NavView,
            string
        ][];
    }[] = [
        { label: 'Workspace', items: [['DASHBOARD', 'Dashboard'], ['RADAR', 'Campus Radar'], ['ANALYTICS', 'Analytics'], ['ALERTS', 'Waste Alerts'], ['AUDIT', 'Audit Trail']] },
        { label: 'Campus', items: [['TEACHER', 'Faculty Portal'], ['STUDENT_FINDER', 'Room Finder'], ['SETTINGS', 'Settings']] }
    ];
    return <>
 {isOpenMobile && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onCloseMobile}/>}
 <aside id="primary-navigation" className={`sidebar ${isOpenMobile ? 'is-open' : ''}`}>
 <div className="brand">Vidyut<span>IQ</span><p>Campus energy intelligence</p></div>
 <button className="mobile-close" onClick={onCloseMobile}>Close menu</button>
 <nav aria-label="Main navigation">{groups.map(group => <div className="nav-group" key={group.label}><p className="eyebrow">{group.label}</p>
 {group.items.map(([id, label]) => <button key={id} aria-current={currentView === id ? 'page' : undefined} onClick={() => { onSelectView(id); onCloseMobile(); }}><span>{label}</span>{id === 'ALERTS' && activeAlerts.length > 0 ? <small>{activeAlerts.length}</small> : currentView === id ? <span aria-hidden="true">↗</span> : null}</button>)}</div>)}</nav>
 <div className="sidebar-status"><span className="status-dot"/> Simulation online<p>{roomDataList.length} connected room nodes</p></div>
 </aside></>;
};
