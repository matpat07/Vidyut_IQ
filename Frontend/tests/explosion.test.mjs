import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/components/radar/building/explosion.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 } }).outputText;
const { explosionPose, createExplosionController, normalizeWheel } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

test('assembled and exploded endpoints have five aligned, evenly spaced levels', () => {
  assert.deepEqual(explosionPose(0).floorY, [0, 3.4, 6.8, 10.2, 13.6]);
  const pose = explosionPose(1);
  assert.equal(pose.floorY.length, 5);
  for (let i = 1; i < 5; i++) assert(Math.abs(pose.floorY[i] - pose.floorY[i - 1] - 9.4) < 1e-10);
  assert(pose.floorY[0] > 0);
  assert(pose.roofY > pose.floorY[4] + 3.4);
  assert(pose.roofY < 52, 'compact exploded stack should leave more viewport space for each floor');
  assert.deepEqual(explosionPose(.75), pose);
});
test('poses are deterministic and reversible without floor crossings', () => {
  let previous = explosionPose(0);
  const samples = [];
  for (let i = 0; i <= 100; i++) {
    const pose = explosionPose(i / 100);
    for (let floor = 0; floor < 5; floor++) {
      assert(pose.floorY[floor] >= previous.floorY[floor] - 1e-10);
      if (floor) assert(pose.floorY[floor] - pose.floorY[floor - 1] >= 3.4 - 1e-10);
    }
    samples.push(pose); previous = pose;
  }
  for (let i = 100; i >= 0; i--) assert.deepEqual(explosionPose(i / 100), samples[i]);
  assert.deepEqual(explosionPose(-1), explosionPose(0));
  assert.deepEqual(explosionPose(2), explosionPose(1));
});
test('the roof leads separation and cutaway/labels reach stable final states', () => {
  const assembled = explosionPose(0), early = explosionPose(.2), full = explosionPose(1);
  assert(early.roofY > assembled.roofY);
  assert.deepEqual(early.floorY, assembled.floorY);
  assert.equal(assembled.shellOpacity, 1);
  assert(full.shellOpacity > 0 && full.shellOpacity < .4);
  assert.equal(full.accessoryOpacity, 0);
  assert.equal(assembled.labelOpacity, 0);
  assert.equal(full.labelOpacity, 1);
});
test('rapid input clamps, reverses, settles and stops notifying after unsubscribe', () => {
  const control = createExplosionController(); let events = 0;
  const unsubscribe = control.subscribe(() => events++);
  control.set(2); assert.equal(control.getSnapshot(), 1);
  control.advance(1, true); assert.equal(control.current, 1);
  control.set(-1); control.advance(1, true); assert.equal(control.current, 0);
  control.set(.62); for (let i = 0; i < 300; i++) control.advance(1 / 60, false);
  assert.equal(control.current, .62); assert.equal(control.advance(1 / 60, false), false);
  unsubscribe(); const before = events; control.set(.4); assert.equal(events, before);
});
test('wheel normalization supports pixels, lines and pages without horizontal conflicts', () => {
  assert.equal(normalizeWheel(100, 0, 0, 500), 100);
  assert.equal(normalizeWheel(3, 0, 1, 500), 48);
  assert.equal(normalizeWheel(1, 0, 2, 500), 500);
  assert.equal(normalizeWheel(2, 100, 0, 500), 0);
});
test('shared progress easing is time based rather than tied to frame rate', () => {
  const slow = createExplosionController(), fast = createExplosionController();
  slow.set(.8); fast.set(.8);
  for (let i = 0; i < 15; i++) slow.advance(1 / 30, false);
  for (let i = 0; i < 30; i++) fast.advance(1 / 60, false);
  assert(Math.abs(slow.current - fast.current) < 1e-12);
});
