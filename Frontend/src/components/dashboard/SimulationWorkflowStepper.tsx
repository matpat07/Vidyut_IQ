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
      statusColor: 'bg-panel text-ink border-line/30',
    },
    {
      step: 2,
      name: 'Telemetry',
      sub: 'Power Draw (W)',
      icon: Activity,
      status: 'Live',
      statusColor: 'bg-panel text-ink border-line/30',
    },
    {
      step: 3,
      name: 'Waste Alert',
      sub: 'Ghost Load',
      icon: AlertTriangle,
      status: hasAlerts ? `${activeAlerts.length} Flagged` : '0 Alerts',
      statusColor: hasAlerts
        ? 'bg-soft text-danger border-danger  font-medium'
        : 'bg-soft text-ink border-line/30',
    },
    {
      step: 4,
      name: 'Presence Check',
      sub: 'mmWave Radar',
      icon: Radio,
      status: hasAlerts ? 'Verified Empty' : 'Standby',
      statusColor: hasAlerts
        ? 'bg-soft text-ink border-line/30 font-medium'
        : 'bg-soft text-ink border-line/30',
    },
    {
      step: 5,
      name: 'Shutdown',
      sub: 'Contactor Trip',
      icon: Power,
      status: hasRemediation ? 'Remediated' : 'Ready',
      statusColor: hasRemediation
        ? 'bg-soft text-ink border-line/30 font-medium'
        : 'bg-soft text-ink border-line/30',
    },
    {
      step: 6,
      name: 'Savings',
      sub: 'Logged & Verified',
      icon: Leaf,
      status: hasRemediation ? 'Verified' : 'Projected',
      statusColor: hasRemediation
        ? 'bg-soft text-ink border-line/30 font-medium'
        : 'bg-soft text-ink border-line/30',
    },
  ];

  return (
    <div className="card-base p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent " />
          <h3 className="font-medium text-xs uppercase tracking-wider text-muted">
            Automated Waste Mitigation Pipeline
          </h3>
        </div>
        <span className="text-xs text-muted font-medium hidden sm:inline">
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
              className="relative p-3 rounded-xl bg-panel/70 border border-line/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-5 h-5 rounded-full bg-panel border border-line/30 text-ink flex items-center justify-center font-medium text-xs font-mono">
                    {item.step}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  
                  <div>
                    <h4 className="font-medium text-xs text-ink leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted">
                      {item.sub}
                    </p>
                  </div>
                </div>
              </div>

              {/* Arrow connector for large screens (except last) */}
              
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
