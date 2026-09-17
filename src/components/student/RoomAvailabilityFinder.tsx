import React, { useState, useMemo } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Search, Users, Wind, Monitor, CheckCircle, Clock, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RoomAvailabilityFinder: React.FC = () => {
  const { roomDataList } = useSimulation();

  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [filterAcOnly, setFilterAcOnly] = useState<boolean>(false);
  const [filterProjectorOnly, setFilterProjectorOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Available rooms right now: status is 'VACANT', 'CANCELLED', or 'BREAK'
  const availableRooms = useMemo(() => {
    return roomDataList.filter(item => {
      const isFree =
        item.occupancyProfile.expectedStatus === 'VACANT' ||
        item.occupancyProfile.expectedStatus === 'CANCELLED' ||
        item.occupancyProfile.expectedStatus === 'BREAK';

      if (!isFree) return false;

      // Block filter
      if (selectedBlock !== 'ALL' && item.metadata.block !== selectedBlock) return false;

      // Type filter
      if (selectedType !== 'ALL' && item.metadata.roomType !== selectedType) return false;

      // Amenity filters
      if (filterAcOnly && !item.metadata.hasAc) return false;
      if (filterProjectorOnly && !item.metadata.hasProjector) return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.metadata.id.toLowerCase().includes(q) ||
          item.metadata.name.toLowerCase().includes(q) ||
          item.metadata.department.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [roomDataList, selectedBlock, selectedType, filterAcOnly, filterProjectorOnly, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Search Header Banner */}
      <div className="card-base p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <Search className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">Student Room Finder</h2>
                <p className="text-xs text-slate-500">
                  Find vacant classrooms and labs for study sessions and teamwork.
                </p>
              </div>
            </div>
          </div>

          {/* Merged Available Rooms Counter Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 self-start md:self-auto shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{availableRooms.length} Rooms Available Now</span>
          </div>
        </div>

        {/* Filter Row with framer-motion entrance */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"
        >
          {/* Search by name/id */}
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
              Search Room / Lab
            </label>
            <input
              type="text"
              placeholder="e.g. 6102, DSAL..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Building Block */}
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
              Building Block
            </label>
            <select
              value={selectedBlock}
              onChange={e => setSelectedBlock(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Campus Blocks</option>
              <option value="Block 6">Block 6 (Computer / ENTC)</option>
              <option value="Block 5">Block 5 (AIML)</option>
              <option value="Block 9">Block 9 (Lecture Complex)</option>
            </select>
          </div>

          {/* Room Type */}
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
              Room Type
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">Classrooms & Labs</option>
              <option value="CLASSROOM">Classrooms Only (Theory)</option>
              <option value="LABORATORY">Laboratories Only (Workstations)</option>
            </select>
          </div>

          {/* Amenity Toggles */}
          <div className="flex items-end gap-2 pb-0.5">
            <button
              onClick={() => setFilterAcOnly(p => !p)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all flex-1 justify-center ${
                filterAcOnly
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-indigo-600" />
              <span>AC Only</span>
            </button>

            <button
              onClick={() => setFilterProjectorOnly(p => !p)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all flex-1 justify-center ${
                filterProjectorOnly
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-indigo-600" />
              <span>Projector</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Free Rooms Results Grid with Staggered Entrance */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Available Classrooms & Laboratories
          </h3>
          <span className="text-xs text-slate-400">Auto-calculated from college timetable & cancellations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {availableRooms.map((room, index) => {
              const nextLec = room.occupancyProfile.nextLecture;
              const isReleasedByCancellation = room.occupancyProfile.expectedStatus === 'CANCELLED';

              // Compute single consolidated status badge
              const renderAvailabilityBadge = () => {
                if (isReleasedByCancellation) {
                  return (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                      <span>Freed by Cancel</span>
                    </span>
                  );
                }
                if (nextLec && room.occupancyProfile.minutesUntilNext !== undefined) {
                  return (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Free {room.occupancyProfile.minutesUntilNext}min</span>
                    </span>
                  );
                }
                return (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Free all day</span>
                  </span>
                );
              };

              return (
                <motion.div
                  key={room.metadata.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.04, ease: 'easeOut' }}
                  whileHover={{ y: -2 }}
                  className="card-base p-5 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="space-y-3">
                    {/* Top Row: Room ID & Single Consolidated Availability Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-base font-black text-slate-900">
                            {room.metadata.id}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            ({room.metadata.block} • F{room.metadata.floor})
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 mt-0.5">
                          {room.metadata.name}
                        </h4>
                      </div>

                      {renderAvailabilityBadge()}
                    </div>

                    {/* Amenities Row: Single Muted Inline Row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{room.metadata.capacity} seats</span>
                      </span>

                      {room.metadata.hasAc && (
                        <span className="flex items-center gap-1">
                          <Wind className="w-3.5 h-3.5 text-slate-400" />
                          <span>AC</span>
                        </span>
                      )}

                      {room.metadata.hasProjector && (
                        <span className="flex items-center gap-1">
                          <Monitor className="w-3.5 h-3.5 text-slate-400" />
                          <span>Projector</span>
                        </span>
                      )}

                      {room.metadata.smartBoard && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Smart Board</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hover Only Info Row */}
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span>{room.metadata.department}</span>
                    <span className="text-indigo-600 font-bold">Open for study</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {availableRooms.length === 0 && (
          <div className="text-center py-12 card-base text-slate-500 text-xs space-y-1">
            <p className="font-bold text-slate-700">No rooms currently available matching these filters.</p>
            <p className="text-slate-400">Try switching the time slider or clearing amenity filters.</p>
          </div>
        )}
      </div>

    </div>
  );
};
