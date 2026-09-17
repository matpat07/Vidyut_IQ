import React from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import { Award, TrendingUp, AlertTriangle, CheckCircle2, Building2 } from 'lucide-react';

interface DepartmentStat {
  name: string;
  code: string;
  roomsCount: number;
  totalDrawWatts: number;
  wastedWatts: number;
  efficiencyScore: number; // percentage
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION';
}

export const DepartmentLeaderboard: React.FC = () => {
  const { roomDataList } = useSimulation();

  // Compute departmental statistics based on real room codes and division mappings
  const deptStats: DepartmentStat[] = React.useMemo(() => {
    // Group rooms:
    // Block 6 1st/2nd floor -> Computer Engineering
    // Block 5 -> CSE (AI & ML)
    // Block 9 / Electronics -> ENTC & Allied
    const compRooms = roomDataList.filter(r =>
      ['6102CR', '6103CR', '6201CR', '6202CR', '6204CR', '6107LA', '6115LA', '6206LA', '6208LA', '6210LA', '6104LA'].includes(r.metadata.id)
    );
    const aimlRooms = roomDataList.filter(r =>
      ['5209CR', '5211CR', '6518LA'].includes(r.metadata.id)
    );
    const entcRooms = roomDataList.filter(r =>
      ['6216LA', '9510CR'].includes(r.metadata.id)
    );

    const computeDept = (name: string, code: string, rooms: typeof roomDataList): DepartmentStat => {
      let total = 0;
      let wasted = 0;
      rooms.forEach(r => {
        total += r.telemetry.simulatedPowerWatts;
        if (r.telemetry.isWastingPower) {
          wasted += (r.telemetry.simulatedPowerWatts - r.telemetry.baselineStandbyWatts);
        }
      });
      const efficiency = total > 0 ? Math.max(0, Math.round(((total - wasted) / total) * 100)) : 100;
      const status = efficiency >= 85 ? 'EXCELLENT' : efficiency >= 60 ? 'GOOD' : 'NEEDS_ATTENTION';

      return {
        name,
        code,
        roomsCount: rooms.length,
        totalDrawWatts: total,
        wastedWatts: wasted,
        efficiencyScore: efficiency,
        status,
      };
    };

    const list = [
      computeDept('Computer Engineering Department', 'COMP', compRooms),
      computeDept('CSE (AI & Machine Learning)', 'AIML', aimlRooms),
      computeDept('Electronics & Telecom (ENTC)', 'ENTC', entcRooms),
    ];

    return list.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  }, [roomDataList]);

  return (
    <div className="card-base p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Departmental Behavioural Nudge Leaderboard</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Energy efficiency rankings comparing departments to foster peer accountability without extra hardware.
          </p>
        </div>

        <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200/80 font-bold">
          Zero-Cost Behavioral Intervention
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deptStats.map((dept, rank) => (
          <motion.div
            key={dept.code}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: rank * 0.05 }}
            className={`p-4 rounded-xl border transition-all ${
              rank === 0
                ? 'bg-emerald-50/40 border-emerald-300 shadow-sm'
                : dept.status === 'NEEDS_ATTENTION'
                ? 'bg-rose-50/40 border-rose-200 shadow-sm'
                : 'bg-slate-50/70 border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-xs ${
                      rank === 0 ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {rank + 1}
                  </span>
                  <span className="font-black text-sm text-slate-900">{dept.code}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">{dept.name}</p>
              </div>

              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  dept.status === 'EXCELLENT'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : dept.status === 'GOOD'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {dept.status === 'EXCELLENT' ? 'Optimal' : dept.status === 'GOOD' ? 'Moderate' : 'High Waste'}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-500">Efficiency Score:</span>
                <span
                  className={`font-black text-sm ${
                    dept.efficiencyScore >= 80 ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {dept.efficiencyScore}%
                </span>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    dept.efficiencyScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${dept.efficiencyScore}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Rooms: {dept.roomsCount}</span>
                <span>Avoidable: {(dept.wastedWatts / 1000).toFixed(2)} kW</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
