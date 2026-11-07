import React from 'react';
import { useSimulation, UserRole } from '../../context/SimulationContext';
import { NavView } from './Sidebar';
interface HeaderProps {
    currentView: NavView;
    onOpenMobileSidebar: () => void;
    onOpenAssumptions: () => void;
    onOpenHardwareBOM: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}
const titles: Record<NavView, string> = { DASHBOARD: 'Dashboard', RADAR: 'Campus Radar', ANALYTICS: 'Analytics', ALERTS: 'Waste Alerts', AUDIT: 'Audit Trail', SETTINGS: 'Settings', TEACHER: 'Faculty Portal', STUDENT_FINDER: 'Student Room Finder' };
export const Header: React.FC<HeaderProps> = ({ currentView, onOpenMobileSidebar, onOpenAssumptions, onOpenHardwareBOM, theme, onToggleTheme }) => {
    const { currentRole, setCurrentRole, activeAlerts, simulateCampusEcoRemediation } = useSimulation();
    return <header className="app-header"><div><button className="menu-trigger" aria-controls="primary-navigation" onClick={onOpenMobileSidebar}>Menu</button><p className="eyebrow">VidyutIQ / Workspace</p><h1>{titles[currentView]}</h1></div>
 <div className="header-actions"><button onClick={onOpenAssumptions}>Assumptions</button><button onClick={onOpenHardwareBOM}>Hardware</button><button onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
 <div className="role-switch" aria-label="User role">{(['ADMIN', 'TEACHER', 'STUDENT'] as UserRole[]).map(role => <button key={role} aria-pressed={currentRole === role} onClick={() => setCurrentRole(role)}>{role === 'ADMIN' ? 'Admin' : role === 'TEACHER' ? 'Faculty' : 'Student'}</button>)}</div>
 {activeAlerts.length > 0 && <button className="remediate-button" onClick={simulateCampusEcoRemediation}>Remediate all ({activeAlerts.length})</button>}</div></header>;
};
