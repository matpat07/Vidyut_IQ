import React from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import { History, Trash2, CheckCircle2, ShieldCheck, Download } from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const { auditTrail, clearAuditTrail } = useSimulation();

  return (
    <div className="card-base p-6 space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <History className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-sm text-slate-900">
              Shutdown Audit Trail
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Log of relay interventions, power cut, and estimated savings.
          </p>
        </div>

        {auditTrail.length > 0 && (
          <button
            onClick={clearAuditTrail}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        )}
      </div>

      {/* Table */}
      {auditTrail.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold">Time</th>
                <th className="px-4 py-3 font-bold">Target Room</th>
                <th className="px-4 py-3 font-bold">Remediated Action</th>
                <th className="px-4 py-3 font-bold">Watts Cut</th>
                <th className="px-4 py-3 font-bold">Est. kWh Saved</th>
                <th className="px-4 py-3 font-bold">Est. INR Saved</th>
                <th className="px-4 py-3 font-bold">Initiated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {auditTrail.map((record, idx) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut', delay: Math.min(idx * 0.02, 0.25) }}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                    {record.timestamp}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    <span className="font-mono text-indigo-700 mr-1.5 font-black">{record.roomId}</span>
                    <span className="text-slate-500 text-xs">({record.roomName})</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{record.action}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    -{record.wattsRemediated.toLocaleString()} W
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-700 whitespace-nowrap">
                    +{record.estimatedKwhSaved.toFixed(2)} kWh
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-amber-700 whitespace-nowrap">
                    +₹{record.estimatedCostSavedInr.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                      {record.initiatedBy}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-500 text-xs space-y-1">
          <ShieldCheck className="w-6 h-6 mx-auto text-slate-400" />
          <p className="font-bold text-slate-700">No remediation actions recorded yet.</p>
          <p className="text-xs text-slate-400">
            Trigger an Eco-Off contactor cutoff from the Campus Radar or click the 1-Click Remediation button.
          </p>
        </div>
      )}

    </div>
  );
};
