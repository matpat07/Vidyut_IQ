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
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <BarChart2 className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-sm text-slate-900">
              Hourly Energy: Actual vs. Optimized
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulated campus load curve vs. automated power optimization.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          <span className="text-slate-500">Live Load:</span>
          <span className="font-bold text-slate-900">
            {(impactSummary.currentTotalDrawWatts / 1000).toFixed(2)} kW
          </span>
          <span className="text-emerald-700 font-bold flex items-center gap-0.5">
            <TrendingDown className="w-3.5 h-3.5" />
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
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="optimizedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" kW" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#0f172a',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />

            <Area
              type="monotone"
              dataKey="actualKw"
              name="Actual / Simulated Consumption (kW)"
              stroke="#f43f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#actualGradient)"
            />
            <Area
              type="monotone"
              dataKey="optimizedKw"
              name="Optimized with VidyutIQ (kW)"
              stroke="#10b981"
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
