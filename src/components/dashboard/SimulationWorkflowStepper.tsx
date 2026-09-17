import React from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import {
  Calendar,
  Activity,
  AlertTriangle,
  Radio,
  Power,
  Leaf,
  ArrowRight
} from 'lucide-react';

export const SimulationWorkflowStepper: React.FC = () => {
  const { activeAlerts, auditTrail } = useSimulation();

  const hasAlerts = activeAlerts.length > 0;
  const hasRemediation = auditTrail.length > 0;

  const steps = [
    {
      step: 1,
      name: 'Timetable',
      sub: 'Schedule Sync',
      icon: Calendar,
      status: 'Active',
      statusColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      step: 2,
      name: 'Telemetry',
      sub: 'Power Draw (W)',
      icon: Activity,
      status: 'Live',
      statusColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      step: 3,
      name: 'Waste Alert',
      sub: 'Ghost Load',
      icon: AlertTriangle,
      status: hasAlerts ? `${activeAlerts.length} Flagged` : '0 Alerts',
      statusColor: hasAlerts
        ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse font-bold'
        : 'bg-slate-100 text-slate-600 border-slate-200',
    },
    {
      step: 4,
      name: 'Presence Check',
      sub: 'mmWave Radar',
      icon: Radio,
      status: hasAlerts ? 'Verified Empty' : 'Standby',
      statusColor: hasAlerts
        ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
        : 'bg-slate-100 text-slate-600 border-slate-200',
    },
    {
      step: 5,
      name: 'Shutdown',
      sub: 'Contactor Trip',
      icon: Power,
      status: hasRemediation ? 'Remediated' : 'Ready',
      statusColor: hasRemediation
        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
        : 'bg-slate-100 text-slate-600 border-slate-200',
    },
    {
      step: 6,
      name: 'Savings',
      sub: 'Logged & Verified',
      icon: Leaf,
      status: hasRemediation ? 'Verified' : 'Projected',
      statusColor: hasRemediation
        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
        : 'bg-slate-100 text-slate-600 border-slate-200',
    },
  ];

  return (
    <div className="card-base p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
            Automated Waste Mitigation Pipeline
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Closed-Loop Software & Sensor Architecture
        </span>
      </div>

      {/* 6 Steps Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              className="relative p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs font-mono">
                    {item.step}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-indigo-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {item.sub}
                    </p>
                  </div>
                </div>
              </div>

              {/* Arrow connector for large screens (except last) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
