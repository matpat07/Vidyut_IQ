import React from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import { History, Trash2, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import {DEMO_SEED_AUDIT_ID} from '../../config/demoSeed';

export const AuditTrail: React.FC = () => {
  const { auditTrail, clearAuditTrail } = useSimulation();

  return (
    <div className="card-base p-6 space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            
            <h3 className="font-medium text-sm text-ink">
              Shutdown Audit Trail
            </h3>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Software Eco-Off actions and estimated savings. Preloaded examples are marked as demo seeds.
          </p>
        </div>

        {auditTrail.length > 0 && (
          <button
            onClick={clearAuditTrail}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-soft hover:bg-soft text-ink hover:text-ink border border-line/30 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            
            <span>Clear Log</span>
          </button>
        )}
      </div>

      {/* Table */}
      {auditTrail.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-line/30 bg-panel">
          <table className="w-full text-left text-xs">
            <thead className="bg-panel text-muted uppercase text-xs tracking-wider border-b border-line/30">
              <tr>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Target Room</th>
                <th className="px-4 py-3 font-medium">Remediated Action</th>
                <th className="px-4 py-3 font-medium">Modeled W removed</th>
                <th className="px-4 py-3 font-medium">Est. kWh Saved</th>
                <th className="px-4 py-3 font-medium">Est. INR Saved</th>
                <th className="px-4 py-3 font-medium">Initiated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink">
              {auditTrail.map((record, idx) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut', delay: Math.min(idx * 0.02, 0.25) }}
                  className="hover:bg-panel/60 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-muted whitespace-nowrap">
                    {record.timestamp}
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink">
                    <span className="font-mono text-ink mr-1.5 font-semibold">{record.roomId}</span>
                    <span className="text-muted text-xs">({record.roomName})</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-panel text-ink border border-line/30">
                      
                      <span>{record.action}</span>
                      {record.id===DEMO_SEED_AUDIT_ID&&<small className="ml-2 text-muted">Demo seed · preloaded</small>}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-ink whitespace-nowrap">
                    -{record.wattsRemediated.toLocaleString()} W
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-ink whitespace-nowrap">
                    +{record.estimatedKwhSaved.toFixed(2)} kWh
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-ink whitespace-nowrap">
                    +₹{record.estimatedCostSavedInr.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-soft text-ink text-xs font-medium">
                      {record.initiatedBy}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl bg-panel border border-line/30 text-muted text-xs space-y-1">
          
          <p className="font-medium text-ink">No remediation actions recorded yet.</p>
          <p className="text-xs text-muted">
            Run an Eco-Off simulation from the Campus Radar or click the 1-Click Remediation button.
          </p>
        </div>
      )}

    </div>
  );
};
