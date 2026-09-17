import React from 'react';
import { motion } from 'framer-motion';
import { HARDWARE_BOM, BOM_SUMMARY } from '../../config/hardwareBOM';
import { X, Cpu, Layers, ShieldCheck, AlertCircle } from 'lucide-react';

interface HardwareCostingModalProps {
  onClose: () => void;
}

export const HardwareCostingModal: React.FC<HardwareCostingModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">Hardware BOM & Node Costing</h2>
                <p className="text-xs text-slate-500">
                  Per-room IoT sensing node specifications and safety architecture.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <span className="text-slate-500 text-xs uppercase tracking-wider font-bold block">
                Approx. Cost Per Room Node
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-black text-indigo-700">
                  ~₹{BOM_SUMMARY.approxPerRoomNodeCostInr.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">/ room</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Retrofit estimate (no building rewiring required)</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <span className="text-slate-500 text-xs uppercase tracking-wider font-bold block">
                2-Node Demonstration Bench
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-black text-amber-700">
                  ~₹{BOM_SUMMARY.twoNodeBenchCostInr.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">one-time</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Classroom node + Lab node for demo test bench</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <span className="text-slate-500 text-xs uppercase tracking-wider font-bold block">
                Software Platform Cost
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-black text-emerald-600">
                  ₹0
                </span>
                <span className="text-xs text-slate-500">recurring</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Built entirely on open-source web stack</p>
            </div>
          </div>

          {/* Safety & Contactor Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Electrical Safety & Contactor Isolation Architecture</span>
            </div>
            <p className="text-slate-700 text-xs leading-relaxed">
              {BOM_SUMMARY.safetyNote}
            </p>
            <p className="text-slate-500 text-xs italic">
              All switching circuits incorporate a manual physical override switch, ensuring uninterrupted facility operation during any software or network anomaly.
            </p>
          </div>

          {/* Data Flow Blueprint */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Closed-Loop Hardware Flow</span>
            </h4>
            <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed overflow-x-auto">
              [Mains Supply] → [PZEM-004T Meter] → [ESP32 Node] → [Wi-Fi / MQTT Broker] → [Dashboard]
              <br />
              <span className="text-emerald-700 font-bold">↳ [Relay Driver] → [External Contactor] ← (Deterministic Safety Validation Layer)</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              The ESP32 continuously samples active power over UART. If the timetable marks the room empty and the LD2410 mmWave presence sensor detects zero occupants for a sustained duration, the deterministic safety engine authorises a staged switch-off.
            </p>
          </div>

          {/* Bill of Materials Table */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs mb-3 flex items-center justify-between">
              <span>Indicative Bill of Materials (Per Node Breakdown)</span>
              <span className="text-slate-400 font-normal text-xs">Approximate market rates</span>
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase">
                    <th className="py-2.5 px-3">Component</th>
                    <th className="py-2.5 px-3">Specification</th>
                    <th className="py-2.5 px-3">Role in VidyutIQ</th>
                    <th className="py-2.5 px-3 text-right">Approx. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {HARDWARE_BOM.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">
                        {item.component}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">
                        {item.specification}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">
                        {item.purpose}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ~₹{item.approxUnitCostInr}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-indigo-50/40 border-t border-indigo-200 font-bold text-xs">
                    <td colSpan={3} className="py-3 px-3 text-indigo-900 font-sans">
                      Estimated Cost Per Additional Room Node (Retrofit)
                    </td>
                    <td className="py-3 px-3 text-right text-indigo-700 font-mono font-black">
                      ~₹{BOM_SUMMARY.approxPerRoomNodeCostInr.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payback & Operational Disclaimers */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Assumptions & Operational Disclaimers</span>
            </div>
            <p>• {BOM_SUMMARY.stagedShutdownNote}</p>
            <p>• {BOM_SUMMARY.paybackNote}</p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
          >
            Close Specifications
          </button>
        </div>

      </motion.div>
    </div>
  );
};
