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
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">Faculty Schedule & Cancellation</h2>
                <p className="text-xs text-slate-500">
                  Release classroom & trigger automated contactor shutoff.
                </p>
              </div>
            </div>
          </div>

          {/* Faculty Selector */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <select
              value={selectedFaculty}
              onChange={e => setSelectedFaculty(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {facultyList.map(f => (
                <option key={f} value={f} className="bg-white text-slate-800">
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Informational Callout */}
        <div className="mt-4 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-slate-600 flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
          <p className="leading-relaxed">
            Cancelling a lecture releases the room to students for study and triggers VidyutIQ contactor shutoff to eliminate waste.
          </p>
        </div>
      </div>

      {/* Lectures for Today */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Assigned Schedule for {selectedFaculty} on {day}
          </h3>
          <span className="text-xs text-indigo-600 font-mono font-bold">Current Simulation: {timeString}</span>
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
                        ? 'border-rose-300 bg-rose-50/20'
                        : 'hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-slate-900">
                            {lecture.roomId}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                            {lecture.division} {lecture.batch ? `(${lecture.batch})` : ''}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {lecture.subject}
                        </h4>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                          isCancelled
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isCancelled ? 'Cancelled' : 'Scheduled'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {lecture.slotLabel}
                      </span>
                      <span className="flex items-center gap-1 font-sans">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {roomData?.metadata.block || 'Campus'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      {isCancelled ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs text-rose-700 font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Room Released & Power Flagged</span>
                          </span>
                          <button
                            onClick={() => restoreLecture(lecture.id)}
                            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                          >
                            Restore Class
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => cancelLecture(lecture.id)}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-xs active:scale-95"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
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
          <div className="text-center py-12 card-base text-slate-500 text-xs space-y-1">
            <Calendar className="w-6 h-6 mx-auto text-slate-400" />
            <p className="font-bold text-slate-700">No lectures scheduled for {selectedFaculty} on {day}.</p>
            <p className="text-slate-400">Select another day in the simulation bar or choose a different faculty member.</p>
          </div>
        )}
      </div>

    </div>
  );
};
