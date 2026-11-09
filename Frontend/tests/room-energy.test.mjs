import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const cache = new Map();
async function sourceURL(url) {
  if (cache.has(url.href)) return cache.get(url.href);
  let compiled = ts.transpileModule(readFileSync(url, 'utf8'), {compilerOptions:{module:ts.ModuleKind.ES2020,target:ts.ScriptTarget.ES2020}}).outputText;
  for (const match of [...compiled.matchAll(/from\s+(['"])(\.[^'"]+)\1/g)]) compiled = compiled.replace(match[0], `from '${await sourceURL(new URL(match[2]+'.ts',url))}'`);
  const result = 'data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'); cache.set(url.href,result); return result;
}
const moduleAt = async path => import(await sourceURL(new URL(path,import.meta.url)));
const { createDemoDataset, createConnectedDataset, emptyDataset, roomEnergy, estimateCost } = await moduleAt('../src/components/radar/energy/energyAdapter.ts');
const { visualForRoom, energyValue, ENERGY_COLORS } = await moduleAt('../src/components/radar/energy/energyVisuals.ts');
const { FLOOR_PLANS } = await moduleAt('../src/components/radar/building/floorPlans.ts');
const { CAMPUS_ROOMS, getDefaultAppliances } = await moduleAt('../src/data/campusRooms.ts');
const { calculateSimulatedTelemetry } = await moduleAt('../src/services/iotSimulator.ts');
const { getRoomOccupancyProfile } = await moduleAt('../src/services/timetableParser.ts');
const { evaluateWastage } = await moduleAt('../src/services/wastageEngine.ts');
const { DEFAULT_ASSUMPTIONS } = await moduleAt('../src/config/assumptions.ts');
const plan = FLOOR_PLANS[1].find(room => room.number==='6201');
const metadata = CAMPUS_ROOMS.find(room=>room.id==='6201CR');
function records(minutes=795,ecoOff=false) {
  return CAMPUS_ROOMS.map(metadata=>{
    const roomState={metadata,appliances:getDefaultAppliances(metadata.roomType),isEcoOff:ecoOff};
    const occupancyProfile=getRoomOccupancyProfile(metadata.id,'MON',minutes,new Set());
    const result=evaluateWastage(metadata,calculateSimulatedTelemetry(roomState,occupancyProfile.expectedStatus,minutes),occupancyProfile.expectedStatus,minutes,DEFAULT_ASSUMPTIONS);
    return {metadata,roomState,occupancyProfile,telemetry:result.telemetry,activeAlert:result.alert};
  });
}
const input={day:'MON',minutes:795,tariff:9};
const response=record=>({period:'hour',periodLabel:'Verified source window',records:[{provenance:'connected',metadata,...record}]});

test('demo energy is deterministic integrated period demand, not the approximate cumulative meter',()=>{
  const source=records(), first=createDemoDataset(source,'hour',input), again=createDemoDataset(source,'hour',input);
  assert.deepEqual(first,again); assert.equal(first.mode,'demo');
  const reading=first.readings.find(r=>r.metadata.id===metadata.id);
  assert.equal(reading.history.length,12);
  assert.equal(reading.energyKwh,reading.history.reduce((sum,p)=>sum+p.kwh,0));
  const state=source.find(r=>r.metadata.id===metadata.id).roomState;
  let expected=0;
  for(let t=735;t<795;t+=5) expected+=(calculateSimulatedTelemetry(state,'BREAK',t).simulatedPowerWatts+calculateSimulatedTelemetry(state,'BREAK',t+5).simulatedPowerWatts)/2000*5/60;
  assert(Math.abs(reading.energyKwh-expected)<1e-9);
  assert.notEqual(reading.energyKwh,source.find(r=>r.metadata.id===metadata.id).telemetry.cumulativeKWh);
  assert.match(first.historyBasis,/Not measured/);
  assert.equal(roomEnergy(plan,first).costInr,reading.energyKwh*9);
  const day=createDemoDataset(source,'day',input); assert.equal(day.readings[0].history.length,51);
  assert(day.readings[0].energyKwh>first.readings[0].energyKwh);
});

test('eco-off and supported appliance estimates follow existing state; unknown rooms remain unmapped',()=>{
  const off=createDemoDataset(records(795,true),'hour',input), active=createDemoDataset(records(),'hour',input);
  assert(off.readings[0].powerKw<active.readings[0].powerKw);
  assert(off.readings.every(r=>r.appliances.every(a=>a.kw===0)));
  assert(off.readings.every(r=>r.appliances.every(a=>a.basis==='demo-nameplate')));
  assert(!roomEnergy(FLOOR_PLANS[1].find(r=>r.number==='6207'),active).available);
  assert.match(roomEnergy(FLOOR_PLANS[1].find(r=>r.number==='6204'),active).reason,/verification/);
});

test('cost rejects invalid or missing tariffs, including overflow; zero tariff is valid',()=>{
  for(const tariff of [null,-1,NaN,Infinity]) assert.equal(estimateCost(5,tariff),null);
  assert.equal(estimateCost(5,0),0);assert.equal(estimateCost(null,9),null);
  assert.equal(estimateCost(Number.MAX_VALUE,Number.MAX_VALUE),null);
});

test('connected mode has no demo fallback, validates provenance and period, and does not assume a tariff',()=>{
  const disconnected=emptyDataset('connected','hour','disconnected','No provider');
  assert.equal(roomEnergy(plan,disconnected).reading,null);
  assert.throws(()=>createConnectedDataset({...response({}),period:'day'},'hour'),/different period/);
  assert.throws(()=>createConnectedDataset(response({provenance:'demo'}),'hour'),/provenance/);
  const live=createConnectedDataset(response({powerKw:2,energyKwh:3}),'hour');
  const data=roomEnergy(plan,live);assert.equal(data.sourceLabel,'CONNECTED DATA');assert.equal(data.reading.powerKw,2);
  assert.equal(data.costInr,null);assert.deepEqual(data.reading.appliances,[]);assert.deepEqual(data.reading.history,[]);assert.equal(data.reading.updatedLabel,null);
  const invalid=createConnectedDataset(response({powerKw:NaN,energyKwh:-1,tariffInrPerKwh:Infinity,history:[{label:'x',kwh:-2}]}),'hour');
  assert.equal(invalid.readings[0].powerKw,null);assert.equal(invalid.readings[0].energyKwh,null);assert.equal(invalid.readings[0].history.length,0);
});

test('high consumption alone never creates an anomaly; source evidence is required',()=>{
  const high=createConnectedDataset(response({energyKwh:1000,status:'Normal',anomaliesAssessed:true}),'hour');
  assert.equal(visualForRoom(plan,high,'anomaly','total').severity,'normal');
  const unknown=createConnectedDataset(response({energyKwh:1000,status:'Online'}),'hour');
  assert.equal(visualForRoom(plan,unknown,'anomaly','total').severity,'unavailable');
  const unsupported=createConnectedDataset(response({anomaly:{severity:'critical',reason:'Claim',evidence:''}}),'hour');
  assert.equal(unsupported.readings[0].anomaly,null);
  const supported=createConnectedDataset(response({anomaly:{severity:'warning',reason:'Load outside occupancy',evidence:'Rule R1'}}),'hour');
  assert.equal(visualForRoom(plan,supported,'anomaly','total').severity,'warning');
  const demo=createDemoDataset(records(),'hour',input);
  for(const record of records()) assert.equal(demo.readings.find(r=>r.metadata.id===record.metadata.id).anomaly!==null,Boolean(record.activeAlert));
});

test('energy scale uses explicit normalization and only approved palette colors',()=>{
  const data=createConnectedDataset(response({energyKwh:10,status:'Normal'}),'hour');
  assert.equal(energyValue(roomEnergy(plan,data),'total'),10);
  assert.equal(energyValue(roomEnergy(plan,data),'perSeat'),10/metadata.capacity);
  assert.equal(visualForRoom(plan,data,'energy','total').color,ENERGY_COLORS[2]);
  const zeroCapacity=createConnectedDataset({...response({energyKwh:10}),records:[{provenance:'connected',metadata:{...metadata,capacity:0},energyKwh:10}]},'hour');
  assert.equal(energyValue(roomEnergy(plan,zeroCapacity),'perSeat'),null);
  const allowed=new Set(['#FFFCFC','#E6D1E5','#9B829A','#CA2127','#161126']);
  for(const view of ['energy','anomaly']) for(const room of FLOOR_PLANS.flat()) assert(allowed.has(visualForRoom(room,data,view,'total').color));
});
