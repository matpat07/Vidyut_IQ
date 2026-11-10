import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import { INSTITUTIONAL_SCHEDULE } from '../../services/timetableParser';
import { Calendar, UserCheck, XCircle, Clock, MapPin, Shield, CheckCircle2 } from 'lucide-react';

export const TeacherScheduleView: React.FC = () => {
  const { day, timeString, cancelLecture, restoreLecture, roomDataList } = useSimulation();

  // List of unique faculty extracted from real PCCOE schedule
  const facultyList = useMemo(() => {
    const set = new Set<string>();
    INSTITUTIONAL_SCHEDULE.forEach(lec => {
      if (lec.faculty) set.add(lec.faculty);
    });
    return Array.from(set).sort();
  }, []);

  const [selectedFaculty, setSelectedFaculty] = useState<string>(facultyList[0] || 'Prof. N. Gaikwad');

  // Filter lectures for selected faculty on the currently simulated day
  const facultyLectures = useMemo(() => {
    return INSTITUTIONAL_SCHEDULE.filter(
      lec => lec.faculty === selectedFaculty && lec.day === day
    );
  }, [selectedFaculty, day]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="card-base p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              
              <div>
                <h2 className="text-base font-medium text-ink">Faculty Schedule & Cancellation</h2>
                <p className="text-xs text-muted">
                  Update simulated room availability and review powered appliances.
                </p>
              </div>
            </div>
          </div>

          {/* Faculty Selector */}
          <div className="flex items-center gap-2 bg-panel p-2 rounded-xl border border-line/30">
            
            <select
              value={selectedFaculty}
              onChange={e => setSelectedFaculty(e.target.value)}
              className="bg-transparent text-xs font-medium text-ink focus:outline-none cursor-pointer"
            >
              {facultyList.map(f => (
                <option key={f} value={f} className="bg-panel text-ink">
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Informational Callout */}
        <div className="mt-4 p-3 rounded-xl bg-panel/70 border border-line/30 text-xs text-ink flex items-center gap-2.5">
          
          <p className="leading-relaxed">
            Cancelling a lecture updates timetable-based room availability. Appliance states remain unchanged until you run an Eco-Off simulation.
          </p>
        </div>
      </div>

      {/* Lectures for Today */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted">
            Assigned Schedule for {selectedFaculty} on {day}
          </h3>
          <span className="text-xs text-ink font-mono font-medium">Current Simulation: {timeString}</span>
        </div>

        {facultyLectures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {facultyLectures.map((lecture, idx) => {
                const roomData = roomDataList.find(r => r.metadata.id === lecture.roomId);
                const isCancelled = roomData?.occupancyProfile.expectedStatus === 'CANCELLED' || lecture.isCancelled;

                return (
                  <motion.div
                    key={lecture.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2, ease: 'easeOut', delay: idx * 0.04 }}
                    className={`card-base p-5 transition-all ${
                      isCancelled
                        ? 'border-danger bg-panel/20'
                        : 'hover:border-line/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-ink">
                            {lecture.roomId}
                          </span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-soft text-ink font-mono">
                            {lecture.division} {lecture.batch ? `(${lecture.batch})` : ''}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-ink mt-1">
                          {lecture.subject}
                        </h4>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
                          isCancelled
                            ? 'bg-soft text-danger border border-line/30'
                            : 'bg-soft text-ink border border-line/30'
                        }`}
                      >
                        {isCancelled ? 'Cancelled' : 'Scheduled'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-muted font-mono">
                      <span className="flex items-center gap-1">
                        
                        {lecture.slotLabel}
                      </span>
                      <span className="flex items-center gap-1 font-sans">
                        
                        {roomData?.metadata.block || 'Campus'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-line/30 flex items-center justify-between">
                      {isCancelled ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs text-danger font-medium flex items-center gap-1">
                            
                            <span>Room Released & Power Flagged</span>
                          </span>
                          <button
                            onClick={() => restoreLecture(lecture.id)}
                            className="px-3 py-1 rounded-xl bg-soft hover:bg-soft text-ink text-xs font-medium transition-colors"
                          >
                            Restore Class
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => cancelLecture(lecture.id)}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-panel hover:bg-soft text-danger border border-line/30 text-xs font-medium transition-all shadow-xs active:scale-95"
                        >
                          
                          <span>1-Click Cancel Lecture (Release Room & Cut Power)</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12 card-base text-muted text-xs space-y-1">
            
            <p className="font-medium text-ink">No lectures scheduled for {selectedFaculty} on {day}.</p>
            <p className="text-muted">Select another day in the simulation bar or choose a different faculty member.</p>
          </div>
        )}
      </div>

    </div>
  );
};
