import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { BarChart2, TrendingDown } from 'lucide-react';

interface HourlyDataPoint {
  time: string;
  actualKw: number;
  optimizedKw: number;
}

export const HourlyEnergyChart: React.FC = () => {
  const { impactSummary } = useSimulation();

  // Synthetic diurnal curve modeled after PCCOE institutional campus load profile
  const data: HourlyDataPoint[] = [
    { time: '09:00 AM', actualKw: 44.1, optimizedKw: 42.5 },
    { time: '10:00 AM', actualKw: 60.2, optimizedKw: 58.0 },
    { time: '11:00 AM', actualKw: 56.4, optimizedKw: 52.0 },
    { time: '12:00 PM', actualKw: 67.8, optimizedKw: 64.0 },
    { time: '01:00 PM', actualKw: 48.5, optimizedKw: 14.2 }, // Lunch break peak waste
    { time: '02:00 PM', actualKw: 63.2, optimizedKw: 59.0 },
    { time: '03:00 PM', actualKw: 59.1, optimizedKw: 54.0 },
    { time: '04:00 PM', actualKw: 53.4, optimizedKw: 45.0 },
    { time: '05:00 PM', actualKw: 41.2, optimizedKw: 28.0 },
    { time: '06:00 PM', actualKw: 26.0, optimizedKw: 8.5 },
  ];

  return (
    <div className="card-base p-5 sm:p-6 space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            
            <h3 className="font-medium text-sm text-ink">
            Power demand
            </h3>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Illustrative profile · simulated baseline vs. modeled optimization
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-panel px-3 py-1.5 rounded-xl border border-line/30 self-start sm:self-auto">
          <span className="text-muted">Simulated Power:</span>
          <span className="font-medium text-ink">
            {(impactSummary.currentTotalDrawWatts / 1000).toFixed(2)} kW
          </span>
          <span className="text-ink font-medium flex items-center gap-0.5">
            
            -{(impactSummary.currentWastedDrawWatts / 1000).toFixed(2)} kW avoidable
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#CA2127" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#CA2127" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="optimizedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9B829A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9B829A" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeOpacity={0.16} strokeDasharray="3 6" stroke="#9B829A" vertical={false} />
            <XAxis dataKey="time" stroke="#9B829A" fontSize={11} tickLine={false} />
            <YAxis stroke="#9B829A" fontSize={11} tickLine={false} unit=" kW" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--panel)',
                borderColor: 'var(--line)',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: 'var(--ink)',
                boxShadow: 'none',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />

            <Area
              type="monotone"
              dataKey="actualKw"
              name="Simulated Baseline (kW)"
              stroke="#CA2127"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#actualGradient)"
            />
            <Area
              type="monotone"
              dataKey="optimizedKw"
              name="Modeled Optimized (kW)"
              stroke="#9B829A"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#optimizedGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
