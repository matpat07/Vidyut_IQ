import { useEffect, useMemo, useState } from 'react';
import { useSimulation } from '../../../context/SimulationContext';
import { createConnectedDataset, createDemoDataset, emptyDataset } from './energyAdapter';
import type { ConnectedEnergyProvider, EnergyPeriod, DataMode, EnergyDataset } from './energyTypes';

export function useRoomAnalytics(mode: DataMode, period: EnergyPeriod, provider?: ConnectedEnergyProvider) {
  const { roomDataList, day, simulationMinutes, assumptions } = useSimulation();
  const demo = useMemo(() => createDemoDataset(roomDataList, period, {
    day, minutes: simulationMinutes, tariff: assumptions.tariffInrPerKwh,
  }), [roomDataList, period, day, simulationMinutes, assumptions.tariffInrPerKwh]);
  const [revision, refresh] = useState(0);
  const request = useMemo(() => ({mode,period,provider,revision}), [mode,period,provider,revision]);
  const [result, setResult] = useState<{request: typeof request; data: EnergyDataset} | null>(null);
  useEffect(() => {
    if (mode !== 'connected' || !provider) return;
    const abort = new AbortController();
    const query = { period, asOf: new Date().toISOString(), timeZone: 'Asia/Kolkata' as const };
    setResult(null);
    void Promise.resolve().then(() => provider.read(query, abort.signal)).then(response => {
      if (!abort.signal.aborted) setResult({request, data: createConnectedDataset(response, period)});
    }).catch(() => {
      if (!abort.signal.aborted) setResult({request, data: emptyDataset('connected', period, 'error', 'Connected readings could not be loaded. Retry or select Demo mode.')});
    });
    return () => abort.abort();
  }, [mode, provider, period, request]);
  const connected = !provider ? emptyDataset('connected', period, 'disconnected', 'Not connected. No live energy source is configured in this project.')
    : result?.request === request ? result.data
    : emptyDataset('connected', period, 'loading', 'Loading connected readings...');
  return { dataset: mode === 'demo' ? demo : connected, refresh: () => refresh(value => value + 1) };
}
