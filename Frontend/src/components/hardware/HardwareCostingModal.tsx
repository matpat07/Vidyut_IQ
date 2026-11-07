import { useDialog } from '../../hooks/useDialog';
import React from 'react';
import { motion } from 'framer-motion';
import { HARDWARE_BOM, BOM_SUMMARY } from '../../config/hardwareBOM';
import { X, Cpu, Layers, ShieldCheck, AlertCircle } from 'lucide-react';

interface HardwareCostingModalProps {
  onClose: () => void;
}

export const HardwareCostingModal: React.FC<HardwareCostingModalProps> = ({ onClose }) => {
  const dialogRef = useDialog(onClose);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onClose}
        className="fixed inset-0 bg-ink/70 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        ref={dialogRef} role="dialog" aria-modal="true" aria-label="Hardware costing" tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 bg-panel border border-line/30 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl"
      >
        {/* Header */}
        <div className="p-5 border-b border-line/30 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              
              <div>
                <h2 className="text-base font-medium text-ink">Hardware BOM & Node Costing</h2>
                <p className="text-xs text-muted">
                  Per-room IoT sensing node specifications and safety architecture.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-soft transition-colors"
          >
            <span>Close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-panel rounded-xl p-4 border border-line/30">
              <span className="text-muted text-xs uppercase tracking-wider font-medium block">
                Approx. Cost Per Room Node
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-semibold text-ink">
                  ~₹{BOM_SUMMARY.approxPerRoomNodeCostInr.toLocaleString()}
                </span>
                <span className="text-xs text-muted">/ room</span>
              </div>
              <p className="text-xs text-muted mt-1">Retrofit estimate (no building rewiring required)</p>
            </div>

            <div className="bg-panel rounded-xl p-4 border border-line/30">
              <span className="text-muted text-xs uppercase tracking-wider font-medium block">
                2-Node Demonstration Bench
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-semibold text-ink">
                  ~₹{BOM_SUMMARY.twoNodeBenchCostInr.toLocaleString()}
                </span>
                <span className="text-xs text-muted">one-time</span>
              </div>
              <p className="text-xs text-muted mt-1">Classroom node + Lab node for demo test bench</p>
            </div>

            <div className="bg-panel rounded-xl p-4 border border-line/30">
              <span className="text-muted text-xs uppercase tracking-wider font-medium block">
                Software Platform Cost
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-semibold text-ink">
                  ₹0
                </span>
                <span className="text-xs text-muted">recurring</span>
              </div>
              <p className="text-xs text-muted mt-1">Built entirely on open-source web stack</p>
            </div>
          </div>

          {/* Safety & Contactor Notice */}
          <div className="p-3.5 rounded-xl bg-panel border border-line/30 text-ink space-y-1">
            <div className="flex items-center gap-2 text-ink font-medium text-xs">
              
              <span>Electrical Safety & Contactor Isolation Architecture</span>
            </div>
            <p className="text-ink text-xs leading-relaxed">
              {BOM_SUMMARY.safetyNote}
            </p>
            <p className="text-muted text-xs italic">
              All switching circuits incorporate a manual physical override switch, ensuring uninterrupted facility operation during any software or network anomaly.
            </p>
          </div>

          {/* Data Flow Blueprint */}
          <div className="bg-panel rounded-xl p-4 border border-line/30 space-y-2">
            <h4 className="font-medium text-ink text-xs flex items-center gap-2">
              
              <span>Closed-Loop Hardware Flow</span>
            </h4>
            <div className="p-3 bg-panel rounded-lg border border-line/30 font-mono text-xs text-ink leading-relaxed overflow-x-auto">
              [Mains Supply] → [PZEM-004T Meter] → [ESP32 Node] → [Wi-Fi / MQTT Broker] → [Dashboard]
              <br />
              <span className="text-ink font-medium">↳ [Relay Driver] → [External Contactor] ← (Deterministic Safety Validation Layer)</span>
            </div>
            <p className="text-ink text-xs leading-relaxed">
              The ESP32 continuously samples active power over UART. If the timetable marks the room empty and the LD2410 mmWave presence sensor detects zero occupants for a sustained duration, the deterministic safety engine authorises a staged switch-off.
            </p>
          </div>

          {/* Bill of Materials Table */}
          <div>
            <h4 className="font-medium text-ink text-xs mb-3 flex items-center justify-between">
              <span>Indicative Bill of Materials (Per Node Breakdown)</span>
              <span className="text-muted font-normal text-xs">Approximate market rates</span>
            </h4>

            <div className="overflow-x-auto border border-line/30 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-panel border-b border-line/30 text-muted font-medium text-xs uppercase">
                    <th className="py-2.5 px-3">Component</th>
                    <th className="py-2.5 px-3">Specification</th>
                    <th className="py-2.5 px-3">Role in VidyutIQ</th>
                    <th className="py-2.5 px-3 text-right">Approx. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-ink">
                  {HARDWARE_BOM.map((item, idx) => (
                    <tr key={idx} className="hover:bg-panel/60">
                      <td className="py-2.5 px-3 font-medium text-ink font-sans">
                        {item.component}
                      </td>
                      <td className="py-2.5 px-3 text-ink font-sans text-xs">
                        {item.specification}
                      </td>
                      <td className="py-2.5 px-3 text-ink font-sans text-xs">
                        {item.purpose}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-ink">
                        ~₹{item.approxUnitCostInr}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-panel/40 border-t border-line/30 font-medium text-xs">
                    <td colSpan={3} className="py-3 px-3 text-ink font-sans">
                      Estimated Cost Per Additional Room Node (Retrofit)
                    </td>
                    <td className="py-3 px-3 text-right text-ink font-mono font-semibold">
                      ~₹{BOM_SUMMARY.approxPerRoomNodeCostInr.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payback & Operational Disclaimers */}
          <div className="p-3 bg-panel rounded-xl border border-line/30 space-y-1.5 text-xs text-muted">
            <div className="flex items-center gap-1.5 text-ink font-medium">
              
              <span>Assumptions & Operational Disclaimers</span>
            </div>
            <p>• {BOM_SUMMARY.stagedShutdownNote}</p>
            <p>• {BOM_SUMMARY.paybackNote}</p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-panel border-t border-line/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-soft hover:bg-soft text-ink font-medium text-xs transition-colors"
          >
            Close Specifications
          </button>
        </div>

      </motion.div>
    </div>
  );
};
