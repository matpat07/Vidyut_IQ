import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
async function sourceURL(url) {
  const source = readFileSync(url, 'utf8');
  let compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 } }).outputText;
  for (const match of [...compiled.matchAll(/from\s+(['"])(\.[^'"]+)\1/g)]) {
    compiled = compiled.replace(match[0], `from '${await sourceURL(new URL(match[2] + '.ts', url))}'`);
  }
  return 'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64');
}
const moduleAt = async path => import(await sourceURL(new URL(path, import.meta.url)));
const { FLOOR_PLANS, FLOOR_DEFINITIONS, resolvePlanRoom, floorNavigation } = await moduleAt('../src/components/radar/building/floorPlans.ts');
const { polygonBounds, pointInPolygon, roomWallSegments } = await moduleAt('../src/components/radar/building/planGeometry.ts');
const { createFloorFocus, focusedFloorY } = await moduleAt('../src/components/radar/building/floorFocus.ts');
const { CAMPUS_ROOMS } = await moduleAt('../src/data/campusRooms.ts');
const { FOOTPRINT_SPANS, BUILDING } = await moduleAt('../src/components/radar/building/architecture.ts');

test('all five traced plans have distinct valid rooms within the approved narrow envelope', () => {
  assert.equal(FLOOR_PLANS.length, 5);
  const globalIds = new Set();
  for (const [index, rooms] of FLOOR_PLANS.entries()) {
    assert(rooms.length >= 18);
    assert.equal(new Set(rooms.map(room => room.id)).size, rooms.length);
    for (const room of rooms) {
      assert.equal(room.floor, index + 1);
      assert(!globalIds.has(room.uid)); globalIds.add(room.uid);
      assert.equal(room.namespace, 'pccoe-building-6');
      const rect = polygonBounds(room.polygon);
      assert(rect.width > 0 && rect.depth > 0);
      assert(room.polygon.every(point => point.every(Number.isFinite)));
      assert(pointInPolygon(room.labelPosition, room.polygon), `${room.id}: label stays inside its polygon`);
      if (room.id.endsWith('stair-north') || room.id.endsWith('stair-south')) {
        const centerX = room.id.endsWith('north') ? BUILDING.towerX[0] : BUILDING.towerX[1];
        assert(room.polygon.length > 12);
        for (const [x,z] of room.polygon) assert(Math.abs(Math.hypot(x-centerX,z-BUILDING.towerZ)-BUILDING.towerRadius)<.001);
      } else {
        assert(Math.abs(rect.x) + rect.width / 2 <= 36.1);
        assert(Math.abs(rect.z) + rect.depth / 2 <= 9.1);
        for (const span of FOOTPRINT_SPANS.filter(span => span.start < rect.x + rect.width / 2 && span.end > rect.x - rect.width / 2)) {
          assert(rect.z - rect.depth / 2 >= span.back - .001, `${room.id}: stays on its stepped slab`);
        }
      }
    }
  }
  assert(FLOOR_PLANS[0].some(room => room.kind === 'DATA'));
  assert(!FLOOR_PLANS[3].some(room => room.number === '6405'));
  assert.equal(FLOOR_PLANS[3].find(room => room.number === '6419').kind, 'CABIN');
});
test('floor-specific rooms, merged aliases and skipped numbering follow the five references', () => {
  const get = (floor,number) => FLOOR_DEFINITIONS[floor-1].rooms.find(room=>room.number===number);
  assert(!get(1,'6101')); assert(!get(1,'6121'));
  assert(FLOOR_DEFINITIONS[0].rooms.some(room=>room.kind==='DATA'));
  for(const floor of [2,3,4,5]) {
    const rooms=FLOOR_DEFINITIONS[floor-1].rooms;
    const cabin=rooms.find(room=>room.id===`f${floor}-west-cabin`);
    assert.equal(cabin.kind,'CABIN');
    assert(cabin.rect[1]>=get(floor,`6${floor}03`).rect[3]);
    assert(cabin.rect[3]<=get(floor,`6${floor}02`).rect[1]);
    assert.equal(get(floor,`6${floor}01`).kind,'CR');
    assert(!rooms.some(room=>room.kind==='DATA'));
    assert(rooms.some(room=>room.kind==='OTHER'&&room.number===undefined));
  }
  for(const floor of [4,5]) {
    for(const suffix of ['09','10','14','15'])assert.equal(get(floor,`6${floor}${suffix}`).kind,'CR');
    for(const suffix of ['02','04','06','08'])assert.equal(get(floor,`6${floor}${suffix}`).kind,'LAB');
    for(const suffix of ['19','20'])assert.equal(get(floor,`6${floor}${suffix}`).kind,'CABIN');
    const merged=get(floor,`6${floor}06`);assert.deepEqual(merged.aliases,[`6${floor}05`]);assert(!get(floor,`6${floor}05`));
    const selected=floorNavigation({floor,room:null},{type:'room',room:`6${floor}05`});assert.equal(selected.room,merged.id);
  }
});
test('the corrected northern core is a lift on all five floors and washrooms retain their facility types', () => {
  for(const floor of FLOOR_DEFINITIONS) {
    assert.equal(floor.facilities.find(space=>space.id===`f${floor.floor}-lift-north`).kind,'LIFT');
    assert(!floor.facilities.some(space=>space.id===`f${floor.floor}-stair-rear`));
    assert.equal(floor.facilities.filter(space=>space.kind==='LIFT').length,2);
    assert.equal(floor.facilities.filter(space=>space.kind==='STAIR').length,2);
    assert.equal(floor.rooms.filter(space=>space.kind==='WF').length,2);
  }
});
test('traced door apertures remain open after shared walls are merged', () => {
  const distance=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);};
  for(const floor of FLOOR_DEFINITIONS) {
    const walls=roomWallSegments([...floor.rooms,...floor.facilities]);
    assert.equal(floor.circulation.length,5);
    for(const room of [...floor.rooms,...floor.facilities])for(const door of room.doors) {
      if(door.corridor) assert(floor.spaces.some(space=>space.id===door.corridor));
      assert(door.span[0]>=0&&door.span[1]<=1&&door.span[0]<door.span[1]);
      const a=room.polygon[door.edge],b=room.polygon[(door.edge+1)%room.polygon.length],t=(door.span[0]+door.span[1])/2;
      const point=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
      assert(walls.every(wall=>distance(point,wall.from,wall.to)>.003), `${room.id}: doorway midpoint is not blocked`);
    }
  }
});
test('the nonexistent front corridor is removed and the adjacent rooms reach the facade on every floor', () => {
  for(const floor of FLOOR_DEFINITIONS) {
    assert(!floor.spaces.some(space=>space.id===`f${floor.floor}-corridor-west`));
    const frontage=floor.rooms.filter(room=>room.rect[0]===320&&room.rect[1]>=478);
    assert(frontage.length>=4);
    for(const room of frontage) {
      const bounds=polygonBounds(room.polygon);
      assert(Math.abs(bounds.z+bounds.depth/2-BUILDING.frontZ)<.001);
      assert(room.doors.every(door=>door.corridor===undefined));
      assert(!floor.circulation.some(path=>pointInPolygon([bounds.x,BUILDING.frontZ-.3],path.polygon)));
    }
    assert(floor.facilities.some(space=>space.id===`f${floor.floor}-landing-north`));
    assert(floor.facilities.some(space=>space.id===`f${floor.floor}-landing-south`));
  }
});
test('aliases resolve one source record but never double-count merged-room telemetry', () => {
  const room=FLOOR_DEFINITIONS[3].rooms.find(room=>room.number==='6406');
  const source={...CAMPUS_ROOMS.find(room=>room.id==='6206LA'),id:'6405LA',floor:4};
  assert.equal(resolvePlanRoom(room,[source]).energyId,'6405LA');
  assert.equal(resolvePlanRoom(room,[source]).scheduleId,'6405LA');
  assert.equal(resolvePlanRoom(room,[source,{...source,id:'6406LA'}]).roomId,null);
  assert.equal(floorNavigation({floor:4,room:'6406'},{type:'room',room:null}).room,null);
});
test('room telemetry links require the actual block, floor, number and compatible type', () => {
  const room = number => FLOOR_PLANS.flat().find(room => room.number === number);
  assert.equal(resolvePlanRoom(room('6102'), CAMPUS_ROOMS).roomId, '6102CR');
  assert.equal(resolvePlanRoom(room('6206'), CAMPUS_ROOMS).roomId, '6206LA');
  assert.equal(resolvePlanRoom(room('6518'), CAMPUS_ROOMS).roomId, '6518LA');
  assert.equal(resolvePlanRoom(room('6204'), CAMPUS_ROOMS).roomId, null);
  assert.match(resolvePlanRoom(room('6208'), CAMPUS_ROOMS).reason, /verification/);
  assert.equal(resolvePlanRoom(room('6207'), CAMPUS_ROOMS).roomId, null);
  assert.equal(resolvePlanRoom(room('6206'), CAMPUS_ROOMS.map(r => ({ ...r, floor: 1 }))).roomId, null);
  assert.equal(resolvePlanRoom(room('6206'), CAMPUS_ROOMS.map(r => ({ ...r, block: 'Other' }))).roomId, null);
});
test('navigation cannot retain a room from a previous floor or select a room on another floor', () => {
  let state = floorNavigation({ floor: null, room: null }, { type: 'floor', floor: 2 });
  state = floorNavigation(state, { type: 'room', room: '6207' });
  assert.equal(state.room, '6207');
  assert.equal(floorNavigation(state, { type: 'room', room: '6102' }), state);
  state = floorNavigation(state, { type: 'floor', floor: 5 });
  assert.deepEqual(state, { floor: 5, room: null });
  assert.equal(floorNavigation(state, { type: 'floor', floor: 6 }), state);
  assert.deepEqual(floorNavigation(state, { type: 'exit' }), { floor: null, room: null });
});
test('camera focus waits for the stack to open, settles, switches floors and reverses cleanly', () => {
  const focus = createFloorFocus(); focus.select(2);
  for (let i = 0; i < 120; i++) focus.advance(1 / 60, .5, false);
  assert.equal(focus.amount, 0); assert(!focus.interactive);
  for (let i = 0; i < 160; i++) focus.advance(1 / 60, 1, false);
  assert.equal(focus.amount, 1); assert(focus.interactive);
  focus.select(5); assert(!focus.interactive);
  focus.advance(1 / 60, 1, false); assert(focus.level > 2 && focus.level < 5); assert.equal(focus.amount, 1);
  focus.select(1);
  for (let i = 0; i < 200; i++) focus.advance(1 / 60, 1, false);
  assert.equal(focus.level, 1); assert(focus.interactive);
  focus.select(null);
  for (let i = 0; i < 180; i++) focus.advance(1 / 60, 1, false);
  assert.equal(focus.amount, 0); assert(!focus.interactive);
  assert.equal(focus.advance(1 / 60, 1, false), false);
  assert.equal(focusedFloorY([2.2,11.6,21,30.4,39.8], 2.5), 16.3);
});
test('switching floors stays focused and moves directly to the next elevation', () => {
  const focus = createFloorFocus(); focus.select(2); focus.advance(0, 1, true);
  focus.select(5);
  let previousLevel = 2;
  assert(!focus.interactive);
  for (let frame = 0; frame < 240; frame++) {
    focus.advance(1 / 60, 1, false);
    assert.equal(focus.amount, 1, 'never pull back to the exploded overview');
    assert.equal(focus.floor, 5);
    assert(!focus.returning);
    assert(focus.level >= previousLevel && focus.level <= 5);
    previousLevel = focus.level;
  }
  assert.equal(focus.level, 5); assert(focus.interactive);
});
test('reset during a floor switch cancels the pending dive and settles on the full stack', () => {
  const focus = createFloorFocus(); focus.select(1); focus.advance(0, 1, true);
  focus.select(4);
  for (let i = 0; i < 10; i++) focus.advance(1 / 60, 1, false);
  focus.select(null);
  for (let i = 0; i < 240; i++) focus.advance(1 / 60, 1, false);
  assert.equal(focus.floor, null); assert.equal(focus.amount, 0); assert(!focus.interactive);
  assert.equal(focus.advance(1 / 60, 1, false), false);
});
test('floor focus is quick at different frame rates with direct floor switches', () => {
  for (const fps of [30,60,120]) {
    const focus=createFloorFocus(),delta=1/fps;
    const finish=()=>{let elapsed=0;while(!focus.settled&&elapsed<2){focus.advance(delta,1,false);elapsed+=delta;}assert(focus.settled);return elapsed;};
    focus.select(2);assert(finish()<=.4,'enter an already exploded floor in at most 400ms');
    focus.select(5);assert(finish()<=.4,'switch directly between floors within 400ms');
    assert.equal(focus.floor,5);assert(focus.interactive);
  }
});
test('reduced motion reaches the same selection and invalid floor requests are ignored', () => {
  const focus = createFloorFocus(); let calls = 0; const off = focus.subscribe(() => calls++);
  focus.select(3); focus.advance(0, 1, true); assert(focus.interactive); assert.equal(focus.level, 3);
  const beforeInvalid = calls; focus.select(7); assert.equal(focus.floor, 3); assert.equal(calls, beforeInvalid);
  focus.select(null); focus.advance(0, 1, true); assert.equal(focus.amount, 0);
  const beforeOff = calls; off(); focus.select(2); assert.equal(calls, beforeOff);
});
