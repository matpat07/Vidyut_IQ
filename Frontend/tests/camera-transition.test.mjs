import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const cache=new Map();
async function sourceURL(url) {
  if(cache.has(url.href))return cache.get(url.href);
  let source=ts.transpileModule(readFileSync(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2020,target:ts.ScriptTarget.ES2020}}).outputText;
  for(const match of [...source.matchAll(/from\s+(['"])(\.[^'"]+)\1/g)])source=source.replace(match[0],`from '${await sourceURL(new URL(match[2]+'.ts',url))}'`);
  const result='data:text/javascript;base64,'+Buffer.from(source).toString('base64');cache.set(url.href,result);return result;
}
const at=async path=>import(await sourceURL(new URL(path,import.meta.url)));
const {createTransitionController}=await at('../src/components/radar/building/transitionController.ts');
const {layoutLabels,filterPlanSpaces}=await at('../src/components/radar/building/labelLayout.ts');
const {FLOOR_PLANS}=await at('../src/components/radar/building/floorPlans.ts');
const settle=(control,reduced=false)=>{for(let i=0;i<1600;i++){const moving=control.advance(1/60,reduced);if(!moving){control.cameraSettled();if(!control.getSnapshot().busy)return;}}throw Error('Did not settle');};

test('central camera states have deterministic endpoints and reduced-motion equivalents',()=>{
  for(const reduced of [false,true]){
    const c=createTransitionController();c.cameraSettled();assert.equal(c.getSnapshot().state,'EXTERIOR_OVERVIEW');
    c.setProgress(.5);assert.equal(c.getSnapshot().state,'EXPLODING');assert(!c.canPick);settle(c,reduced);
    c.stack();settle(c,reduced);assert.equal(c.getSnapshot().state,'EXPLODED_OVERVIEW');
    c.selectFloor(2);assert(c.getSnapshot().busy);assert(!c.beginOrbit());settle(c,reduced);assert.equal(c.getSnapshot().state,'FLOOR_FOCUS');assert(c.canPick);
    c.selectRoom('6207');settle(c,reduced);assert.equal(c.getSnapshot().state,'ROOM_FOCUS');assert.equal(c.getSnapshot().roomId,'6207');
    c.selectRoom(null);settle(c,reduced);assert.equal(c.getSnapshot().state,'FLOOR_FOCUS');
    c.overview();settle(c,reduced);assert.equal(c.getSnapshot().state,'EXTERIOR_OVERVIEW');assert.equal(c.getSnapshot().roomId,null);
  }
});
test('orbit, scroll and cinematic transitions cannot own the camera simultaneously',()=>{
  const c=createTransitionController();c.cameraSettled();assert(c.beginOrbit());
  c.setProgress(.6);assert.equal(c.explosion.getSnapshot(),0);assert(!c.canPick);
  c.selectFloor(2);assert(!c.orbiting);assert(!c.beginOrbit());settle(c);assert(c.canPick);
  c.selectRoom('6506');assert.equal(c.getSnapshot().roomId,null);
  assert(c.beginOrbit());c.endOrbit();assert(c.canPick);
  c.setView('top');assert(!c.canPick);c.cameraSettled();assert(c.canPick);
});
test('latest floor/search intent wins, reset clears pending rooms, and switching visits the full stack',()=>{
  const c=createTransitionController();c.selectFloor(2);settle(c);c.selectRoom('6207');settle(c);
  c.selectFloor(5);let stack=false;
  for(let i=0;i<1500;i++){c.advance(1/60,false);if(c.focus.floor===null)stack=true;}c.cameraSettled();
  assert(stack);assert.equal(c.focus.floor,5);assert.equal(c.getSnapshot().roomId,null);
  c.inspectSpace('6406');c.inspectSpace('6506');settle(c);assert.equal(c.focus.floor,5);assert.equal(c.getSnapshot().roomId,'6506');
  c.inspectSpace('6207');c.stack();settle(c);assert.equal(c.getSnapshot().roomId,null);assert.equal(c.getSnapshot().requestedFloor,null);
  assert.equal(c.getSnapshot().state,'EXPLODED_OVERVIEW');
});
test('resting controller snapshots stay stable and do not notify every animation frame',()=>{
  const c=createTransitionController();c.cameraSettled();let calls=0;const unsubscribe=c.subscribe(()=>calls++);
  c.selectFloor(2);settle(c);assert(calls<12);const snapshot=c.getSnapshot();
  for(let i=0;i<60;i++)c.advance(1/60,false);assert.equal(c.getSnapshot(),snapshot);
  unsubscribe();const old=calls;c.stack();settle(c);assert.equal(calls,old);
});
test('orbit pointer-down preserves room hit candidates while selection stays locked until release',()=>{
  const c=createTransitionController();c.selectFloor(2);settle(c);
  assert(c.canRaycast);assert(c.beginOrbit());assert(c.canRaycast);assert(!c.canPick);
  c.selectRoom('6207');assert.equal(c.getSnapshot().roomId,null);
  c.endOrbit();c.selectRoom('6207');assert.equal(c.getSnapshot().roomId,'6207');
  assert(!c.canRaycast);settle(c);assert(c.canRaycast);
  c.stack();assert(!c.canRaycast);assert(!c.canPick);
});
test('label placement prioritizes selection and excludes overlaps, clipping and reserved UI',()=>{
  const candidates=[{id:'room',x:30,y:30,width:30,height:20,priority:2},{id:'facility',x:35,y:30,width:40,height:18,priority:0},{id:'selected',x:36,y:32,width:30,height:20,priority:4},{id:'edge',x:98,y:30,width:20,height:20,priority:1}];
  const placed=layoutLabels(candidates,{left:0,top:0,right:100,bottom:100});
  assert.deepEqual([...placed],['selected']);
  assert.deepEqual([...layoutLabels(candidates,{left:0,top:0,right:100,bottom:100})],[...placed]);
});
test('search covers every actual room/facility and merged historical aliases without inventing skipped numbers',()=>{
  assert.equal(filterPlanSpaces('6405')[0].number,'6406');assert.equal(filterPlanSpaces('6207')[0].number,'6207');
  assert.equal(filterPlanSpaces('6101').length,0);
  assert(filterPlanSpaces('lift',3).every(room=>room.kind==='LIFT'&&room.floor===3));
  assert.equal(filterPlanSpaces('').length,FLOOR_PLANS.flat().length);
});
