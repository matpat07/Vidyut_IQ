import type { RoomViewData } from '../../../context/SimulationContext';
import { calculateSimulatedTelemetry } from '../../../services/iotSimulator';
import { getRoomOccupancyProfile } from '../../../services/timetableParser';
import { resolvePlanRoom } from '../building/roomMappings';
import type { PlanRoom } from '../building/planTypes';
import type { ApplianceReading, ConnectedEnergyRecord, DemoEnergyInput, EnergyDataset, EnergyPeriod, EnergyReading, RoomEnergy } from './energyTypes';

export const nonNegative = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
export const minuteLabel = (minute: number) => `${Math.floor(minute/60).toString().padStart(2,'0')}:${Math.floor(minute%60).toString().padStart(2,'0')}`;
export function estimateCost(kwh: number | null, tariff: number | null) {
  return kwh === null || tariff === null ? null : nonNegative(kwh) === null || nonNegative(tariff) === null ? null : nonNegative(kwh * tariff);
}
export function emptyDataset(mode: EnergyDataset['mode'], period: EnergyPeriod, state: EnergyDataset['state'], message: string): EnergyDataset {
  return {mode,period,state,message,periodLabel:period==='hour'?'Past hour':'Today',historyBasis:'No historical readings available.',readings:[]};
}
/** Integrates existing deterministic power samples; never differences the approximate cumulative meter. */
export function createDemoDataset(records: RoomViewData[], period: EnergyPeriod, input: DemoEnergyInput): EnergyDataset {
  const end=Math.max(0,Math.min(1440,input.minutes));
  const start=period==='hour'?Math.max(0,end-60):Math.min(540,end);
  const cancelled=new Set(records.flatMap(record=>record.occupancyProfile.currentLecture?.isCancelled?[record.occupancyProfile.currentLecture.id]:[]));
  const readings=records.map(record=>{
    const powerAt=(minute:number)=>calculateSimulatedTelemetry(record.roomState,getRoomOccupancyProfile(record.metadata.id,input.day,minute,cancelled).expectedStatus,minute).simulatedPowerWatts/1000;
    const history:EnergyReading['history']=[];let energyKwh=0;
    for(let from=start;from<end;from+=5) {
      const to=Math.min(from+5,end),kwh=(powerAt(from)+powerAt(to))/2*(to-from)/60;
      energyKwh+=kwh;history.push({label:minuteLabel(to),kwh});
    }
    const names:Record<string,string>={LIGHT:'Lighting',FAN:'Fans',AC:'Air conditioning',COMPUTER:'Workstations',PROJECTOR:'Projector / AV'};
    const groups=new Map<string,number>();
    for(const appliance of record.roomState.appliances) {
      const name=names[appliance.type];if(!name)continue;
      groups.set(name,(groups.get(name)??0)+(appliance.isOn&&!record.roomState.isEcoOff?appliance.count*appliance.wattageEach/1000:0));
    }
    const appliances:ApplianceReading[]=Array.from(groups,([name,kw])=>({name,kw,basis:'demo-nameplate'}));
    const alert=record.activeAlert;
    return {metadata:record.metadata,powerKw:nonNegative(record.telemetry.simulatedPowerWatts/1000),energyKwh,
      history,appliances,tariffInrPerKwh:nonNegative(input.tariff),updatedLabel:`Demo ${input.day} ${minuteLabel(end)}`,
      status:alert?(alert.severity==='CRITICAL'?'Critical anomaly':'Warning anomaly'):record.roomState.isEcoOff?'Eco-Off':record.telemetry.severity==='STANDBY'?'Standby':'No active rule alert',
      anomaliesAssessed:true,anomaly:alert?{severity:alert.severity==='CRITICAL'?'critical' as const:'warning' as const,reason:alert.reason,recommendation:alert.recommendedAction,evidence:'Existing wastageEngine rule output (demo)'}:null,
      occupancy:record.occupancyProfile,occupants:record.telemetry.simulatedOccupantCount,recommendations:alert?[alert.recommendedAction]:[]};
  });
  return {mode:'demo',state:'ready',period,periodLabel:`${input.day} ${minuteLabel(start)}–${minuteLabel(end)}`,message:'Demo data · existing simulator and rule outputs',
    historyBasis:'Modeled history: current appliance settings and timetable applied across the period. Not measured history.',readings};
}
/** Connected records must explicitly declare their provenance; no demo fallback is used. */
export function createConnectedDataset(response:{period:EnergyPeriod;periodLabel:string;records:ConnectedEnergyRecord[]}, period:EnergyPeriod): EnergyDataset {
  if(response.period!==period)throw new Error('Connected source returned a different period.');
  if(response.records.some(record=>record.provenance!=='connected'))throw new Error('Source did not declare connected-data provenance.');
  const readings=response.records.map(record=>{
    const history=(record.history??[]).filter(point=>typeof point.label==='string'&&nonNegative(point.kwh)!==null);
    const anomaly=record.anomaly&&['warning','critical'].includes(record.anomaly.severity)&&record.anomaly.evidence?.trim()&&record.anomaly.reason?.trim()?record.anomaly:null;
    const updated=record.updatedAt&&Number.isFinite(Date.parse(record.updatedAt))?new Date(record.updatedAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}):null;
    return {metadata:record.metadata,powerKw:nonNegative(record.powerKw),energyKwh:nonNegative(record.energyKwh),history,
      appliances:(record.appliances??[]).map(appliance=>({name:appliance.name,kw:nonNegative(appliance.measuredKw),basis:'measured' as const})),
      tariffInrPerKwh:nonNegative(record.tariffInrPerKwh),updatedLabel:updated,status:anomaly?`${anomaly.severity} anomaly`:record.status??'Status unavailable',
      anomaly,anomaliesAssessed:record.anomaliesAssessed===true||anomaly!==null,occupancy:record.occupancy,occupants:nonNegative(record.occupants),recommendations:record.recommendations??(anomaly?.recommendation?[anomaly.recommendation]:[])};
  });
  return {mode:'connected',state:'ready',message:'Connected source readings',period,periodLabel:response.periodLabel,historyBasis:'Historical energy reported by the connected source.',readings};
}
export function roomEnergy(room: PlanRoom, dataset: EnergyDataset): RoomEnergy {
  const sourceLabel=dataset.mode==='demo'?'DEMO DATA':'CONNECTED DATA';
  if(dataset.state!=='ready')return {available:false,reason:dataset.message,reading:null,costInr:null,sourceLabel};
  const link=resolvePlanRoom(room,dataset.readings.map(reading=>reading.metadata));
  const reading=dataset.readings.find(reading=>reading.metadata.id===link.roomId)??null;
  return {available:reading!==null,reason:link.reason,reading,costInr:reading?estimateCost(reading.energyKwh,reading.tariffInrPerKwh):null,sourceLabel};
}
