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
const { FLOOR_PLANS, resolvePlanRoom, planRect, floorNavigation } = await moduleAt('../src/components/radar/building/floorPlans.ts');
const { createFloorFocus, focusedFloorY } = await moduleAt('../src/components/radar/building/floorFocus.ts');
const { CAMPUS_ROOMS } = await moduleAt('../src/data/campusRooms.ts');
const { FOOTPRINT_SPANS } = await moduleAt('../src/components/radar/building/architecture.ts');

test('all five traced plans have distinct valid rooms within the approved narrow envelope', () => {
  assert.equal(FLOOR_PLANS.length, 5);
  for (const [index, rooms] of FLOOR_PLANS.entries()) {
    assert(rooms.length >= 18);
    assert.equal(new Set(rooms.map(room => room.id)).size, rooms.length);
    for (const room of rooms) {
      assert.equal(room.floor, index + 1);
      const rect = planRect(room.rect);
      assert(rect.width > 0 && rect.depth > 0);
      assert(Math.abs(rect.x) + rect.width / 2 <= 36.1);
      assert(Math.abs(rect.z) + rect.depth / 2 <= 9.1);
      for (const span of FOOTPRINT_SPANS.filter(span => span.start < rect.x + rect.width / 2 && span.end > rect.x - rect.width / 2)) {
        assert(rect.z - rect.depth / 2 >= span.back, 'room stays on its stepped slab');
      }
    }
  }
  assert(FLOOR_PLANS[0].some(room => room.kind === 'DATA'));
  assert(!FLOOR_PLANS[3].some(room => room.number === '6405'));
  assert.equal(FLOOR_PLANS[3].find(room => room.number === '6419').kind, 'CABIN');
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
  focus.advance(1 / 60, 1, false); assert.equal(focus.level, 2); assert(focus.amount < 1);
  focus.select(1);
  for (let i = 0; i < 200; i++) focus.advance(1 / 60, 1, false);
  assert.equal(focus.level, 1); assert(focus.interactive);
  focus.select(null);
  for (let i = 0; i < 180; i++) focus.advance(1 / 60, 1, false);
  assert.equal(focus.amount, 0); assert(!focus.interactive);
  assert.equal(focus.advance(1 / 60, 1, false), false);
  assert.equal(focusedFloorY([2.2,11.6,21,30.4,39.8], 2.5), 16.3);
});
test('switching floors shows the complete stack before changing elevation and diving again', () => {
  const focus = createFloorFocus(); focus.select(2); focus.advance(0, 1, true);
  focus.select(5);
  let sawStack = false, stackFrames = 0, enteredNext = false;
  for (let frame = 0; frame < 240; frame++) {
    const oldLevel = focus.level;
    focus.advance(1 / 60, 1, false);
    if (focus.amount === 0) { sawStack = true; stackFrames++; }
    if (focus.level !== oldLevel) {
      assert.equal(focus.amount, 0, 'never move between floors while zoomed in');
      assert(sawStack); assert(stackFrames >= 6, 'overview is visible before the next dive');
      enteredNext = true;
    }
    if (!enteredNext) assert.equal(focus.level, 2);
  }
  assert(enteredNext); assert.equal(focus.floor, 5); assert(focus.interactive);
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
test('reduced motion reaches the same selection and invalid floor requests are ignored', () => {
  const focus = createFloorFocus(); let calls = 0; const off = focus.subscribe(() => calls++);
  focus.select(3); focus.advance(0, 1, true); assert(focus.interactive); assert.equal(focus.level, 3);
  const beforeInvalid = calls; focus.select(7); assert.equal(focus.floor, 3); assert.equal(calls, beforeInvalid);
  focus.select(null); focus.advance(0, 1, true); assert.equal(focus.amount, 0);
  const beforeOff = calls; off(); focus.select(2); assert.equal(calls, beforeOff);
});
