import React, { lazy, Suspense, useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import { RoomCard } from './RoomCard';
import { Search, AlertTriangle, Building2, Layers } from 'lucide-react';
import './building/building.css';
import type { ConnectedEnergyProvider,DataMode,EnergyPeriod } from './energy/energyTypes';

const BuildingViewer = lazy(() => import('./building/BuildingViewer'));
const PlanRoomList=lazy(()=>import('./PlanRoomList'));

interface CampusRadarProps {
  onInspectRoom: (roomId: string) => void;
  energyProvider?: ConnectedEnergyProvider;
}

type FilterType = 'ALL' | 'CLASSROOM' | 'LAB' | 'ALERTS_ONLY';

export const CampusRadar: React.FC<CampusRadarProps> = ({ onInspectRoom, energyProvider }) => {
  const [view, setView] = useState<'building' | 'rooms'>('building');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [energyMode,setEnergyMode]=useState<DataMode>('demo');
  const [energyPeriod,setEnergyPeriod]=useState<EnergyPeriod>('hour');
  const preferences={mode:energyMode,period:energyPeriod,setMode:setEnergyMode,setPeriod:setEnergyPeriod};
  const showRoomList=()=>{setView('rooms');requestAnimationFrame(()=>document.getElementById('rooms-tab')?.focus());};
  const onViewKey: React.KeyboardEventHandler<HTMLDivElement> = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 'building' : event.key === 'End' ? 'rooms' : view === 'building' ? 'rooms' : 'building';
    setView(next);
    event.currentTarget.querySelector<HTMLButtonElement>(`#${next === 'building' ? 'building' : 'rooms'}-tab`)?.focus();
  };
  return <div className="radar-workspace">
    <div className="radar-view-switch">
      <div className="radar-tabs" role="tablist" aria-label="Campus Radar view" onKeyDown={onViewKey}>
        <button id="building-tab" role="tab" tabIndex={view === 'building' ? 0 : -1} aria-selected={view === 'building'} aria-controls="radar-panel" onClick={() => setView('building')}>Building 06</button>
        <button id="rooms-tab" role="tab" tabIndex={view === 'rooms' ? 0 : -1} aria-selected={view === 'rooms'} aria-controls="radar-panel" onClick={() => setView('rooms')}>Room list</button>
      </div>
      <p>Architecture and energy monitoring</p>
    </div>
    <div id="radar-panel" role="tabpanel" aria-labelledby={view === 'building' ? 'building-tab' : 'rooms-tab'} className={view === 'building' ? 'building-viewer' : 'radar-room-list'}>
      <Suspense fallback={<p role="status">Loading campus view…</p>}>{view === 'building' ? <BuildingViewer onShowRooms={showRoomList} onInspectRoom={onInspectRoom} energyProvider={energyProvider} preferences={preferences} /> : <><PlanRoomList energyProvider={energyProvider} preferences={preferences} onInspectRoom={onInspectRoom}/><details className="radar-existing-nodes"><summary>Existing simulation node cards</summary><RoomList onInspectRoom={onInspectRoom} activeFilter={activeFilter} setActiveFilter={setActiveFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} /></details></>}</Suspense>
    </div>
  </div>;
};

interface RoomListProps extends CampusRadarProps {
  activeFilter: FilterType;
  setActiveFilter: (value: FilterType) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const RoomList: React.FC<RoomListProps> = ({ onInspectRoom, activeFilter, setActiveFilter, searchQuery, setSearchQuery }) => {
  const { roomDataList, activeAlerts } = useSimulation();

  const filteredRooms = useMemo(() => {
    return roomDataList.filter(item => {
      // Search filter
      const matchesSearch =
        item.metadata.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.metadata.department.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Category filter
      if (activeFilter === 'CLASSROOM') return item.metadata.roomType === 'CLASSROOM';
      if (activeFilter === 'LAB') return item.metadata.roomType === 'LABORATORY';
      if (activeFilter === 'ALERTS_ONLY') return !!item.activeAlert;

      return true;
    });
  }, [roomDataList, activeFilter, searchQuery]);

  return (
    <div className="space-y-4">
      
      {/* Control Bar: Filters & Search */}
      <div className="card-base p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              activeFilter === 'ALL'
                ? 'bg-accent text-on-accent shadow-xs'
                : 'text-ink hover:text-ink hover:bg-soft'
            }`}
          >
            All Rooms ({roomDataList.length})
          </button>

          <button
            onClick={() => setActiveFilter('CLASSROOM')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              activeFilter === 'CLASSROOM'
                ? 'bg-accent text-on-accent shadow-xs'
                : 'text-ink hover:text-ink hover:bg-soft'
            }`}
          >
            Classrooms (CR)
          </button>

          <button
            onClick={() => setActiveFilter('LAB')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              activeFilter === 'LAB'
                ? 'bg-accent text-on-accent shadow-xs'
                : 'text-ink hover:text-ink hover:bg-soft'
            }`}
          >
            Labs (LA)
          </button>

          <button
            onClick={() => setActiveFilter('ALERTS_ONLY')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              activeFilter === 'ALERTS_ONLY'
                ? 'bg-danger text-on-accent shadow-xs'
                : 'text-danger bg-panel hover:bg-soft border border-line/30'
            }`}
          >
            
            <span>Waste Alerts ({activeAlerts.length})</span>
          </button>
        </div>

        {/* Legend & Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Color Legend */}
          <div className="flex items-center gap-3 text-xs text-muted bg-panel px-3 py-1.5 rounded-xl border border-line/30">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span>Normal</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span>Break / Idle</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-danger" />
              <span>Waste Alert</span>
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            
            <input
              type="text"
              aria-label="Search simulation nodes"
              placeholder="Search room (e.g. 6102, IoT)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 rounded-xl bg-panel border border-line/30 text-xs text-ink placeholder-muted focus:outline-none focus:border-line/30 focus:bg-panel"
            />
          </div>
        </div>

      </div>

      {/* Grid of Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredRooms.map((item, idx) => (
            <RoomCard
              key={item.metadata.id}
              data={item}
              onInspect={onInspectRoom}
              index={idx}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12 card-base text-muted space-y-1">
          <p className="text-sm font-medium text-ink">No rooms match your filter.</p>
          <p className="text-xs text-muted">Try clearing your search query or selecting 'All Rooms'.</p>
        </div>
      )}

    </div>
  );
};
