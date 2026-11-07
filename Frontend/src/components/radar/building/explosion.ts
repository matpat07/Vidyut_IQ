export const clampProgress = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
const ease = (start: number, end: number, value: number) => {
  const t = clampProgress((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

/** Every architectural pose is a pure function of this ONE normalized progress. */
export function explosionPose(value: number, floorHeight = 3.4) {
  const progress = clampProgress(value);
  const lift = 2.2 * ease(.2, .5, progress);
  const floorY = Array.from({ length: 5 }, (_, level) => {
    let offset = lift;
    for (let gap = 0; gap < level; gap++) offset += 6 * ease(.25 + gap * .045, .58 + gap * .04, progress);
    return level * floorHeight + offset;
  });
  const roofY = floorY[4] + floorHeight + 3.5 * ease(0, .25, progress) + 2 * ease(.25, .75, progress);
  return {
    floorY, roofY,
    shellOpacity: 1 - .78 * ease(.035, .6, progress),
    baseOpacity: 1 - .12 * ease(.25, .65, progress),
    accessoryOpacity: 1 - ease(.015, .25, progress),
    roofOpacity: 1 - .65 * ease(.3, .75, progress),
    labelOpacity: ease(.22, .5, progress),
    cameraLift: ease(0, .25, progress),
    cameraSpread: ease(.2, .75, progress),
  };
}

export function normalizeWheel(deltaY: number, deltaX: number, mode: number, height: number) {
  if (Math.abs(deltaX) > Math.abs(deltaY)) return 0;
  return deltaY * (mode === 1 ? 16 : mode === 2 ? height : 1);
}

export function createExplosionController() {
  let target = 0;
  let current = 0;
  const listeners = new Set<() => void>();
  return {
    get current() { return current; },
    getSnapshot: () => target,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    set(value: number) {
      const next = clampProgress(value);
      if (next === target) return;
      target = next; listeners.forEach(listener => listener());
    },
    advance(delta: number, reducedMotion: boolean) {
      if (current === target) return false;
      current = reducedMotion ? target : current + (target - current) * (1 - Math.exp(-Math.min(delta, .1) * 14));
      if (Math.abs(current - target) < .00002) current = target;
      return true;
    },
  };
}
export type ExplosionController = ReturnType<typeof createExplosionController>;
