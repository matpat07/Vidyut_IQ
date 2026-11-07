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
          <h3 className="text-sm font-medium text-ink flex items-center gap-2">
            
            <span>Departmental Behavioural Nudge Leaderboard</span>
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Energy efficiency rankings comparing departments to foster peer accountability without extra hardware.
          </p>
        </div>

        <span className="text-xs font-mono text-ink bg-panel px-2.5 py-1 rounded-xl border border-line/30 font-medium">
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
                ? 'bg-panel/40 border-line/30 shadow-sm'
                : dept.status === 'NEEDS_ATTENTION'
                ? 'bg-panel/40 border-line/30 shadow-sm'
                : 'bg-panel/70 border-line/30 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-semibold text-xs ${
                      rank === 0 ? 'bg-accent text-ink' : 'bg-soft text-ink'
                    }`}
                  >
                    {rank + 1}
                  </span>
                  <span className="font-semibold text-sm text-ink">{dept.code}</span>
                </div>
                <p className="text-xs text-muted mt-1 truncate">{dept.name}</p>
              </div>

              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  dept.status === 'EXCELLENT'
                    ? 'bg-soft text-ink border border-line/30'
                    : dept.status === 'GOOD'
                    ? 'bg-soft text-ink border border-line/30'
                    : 'bg-soft text-danger border border-line/30'
                }`}
              >
                {dept.status === 'EXCELLENT' ? 'Optimal' : dept.status === 'GOOD' ? 'Moderate' : 'High Waste'}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-line/30 space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="text-muted">Efficiency Score:</span>
                <span
                  className={`font-semibold text-sm ${
                    dept.efficiencyScore >= 80 ? 'text-ink' : 'text-ink'
                  }`}
                >
                  {dept.efficiencyScore}%
                </span>
              </div>

              <div className="w-full bg-soft h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    dept.efficiencyScore >= 80 ? 'bg-accent' : 'bg-accent'
                  }`}
                  style={{ width: `${dept.efficiencyScore}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted font-mono">
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
