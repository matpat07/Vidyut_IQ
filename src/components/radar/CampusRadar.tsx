import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import { RoomCard } from './RoomCard';
import { Search, AlertTriangle, Building2, Layers } from 'lucide-react';

interface CampusRadarProps {
  onInspectRoom: (roomId: string) => void;
}

type FilterType = 'ALL' | 'CLASSROOM' | 'LAB' | 'ALERTS_ONLY';

export const CampusRadar: React.FC<CampusRadarProps> = ({ onInspectRoom }) => {
  const { roomDataList, activeAlerts } = useSimulation();

  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Rooms ({roomDataList.length})
          </button>

          <button
            onClick={() => setActiveFilter('CLASSROOM')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeFilter === 'CLASSROOM'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Classrooms (CR)
          </button>

          <button
            onClick={() => setActiveFilter('LAB')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeFilter === 'LAB'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Labs (LA)
          </button>

          <button
            onClick={() => setActiveFilter('ALERTS_ONLY')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'ALERTS_ONLY'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Waste Alerts ({activeAlerts.length})</span>
          </button>
        </div>

        {/* Legend & Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Color Legend */}
          <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Normal</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Break / Idle</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Waste Alert</span>
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room (e.g. 6102, IoT)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
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
        <div className="text-center py-12 card-base text-slate-500 space-y-1">
          <p className="text-sm font-bold text-slate-700">No rooms match your filter.</p>
          <p className="text-xs text-slate-400">Try clearing your search query or selecting 'All Rooms'.</p>
        </div>
      )}

    </div>
  );
};
