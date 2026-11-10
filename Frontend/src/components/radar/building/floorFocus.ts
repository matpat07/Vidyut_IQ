const damp = (value: number, target: number, delta: number, rate = 24) => {
  const next = value + (target - value) * (1 - Math.exp(-Math.min(Math.max(delta, 0), .1) * rate));
  return Math.abs(next - target) < .0005 ? target : next;
};
/** One shared focus pose drives the camera, cutaway and room interaction gate. */
export function createFloorFocus() {
  let floor: number | null = null, requested: number | null = null, amount = 0, level = 1;
  let phase: 'stack' | 'entering' | 'focused' | 'leaving' = 'stack';
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach(listener => listener());
  return {
    get amount() { return amount; }, get level() { return level; }, get floor() { return floor; },
    get returning() { return phase === 'leaving'; },
    get settled() { return phase === 'stack' || phase === 'focused'; },
    getSnapshot: () => floor,
    get interactive() { return floor !== null && floor === requested && level === floor && amount > .97 && (phase === 'entering' || phase === 'focused'); },
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    select(value: number | null) {
      if (value !== null && (!Number.isInteger(value) || value < 1 || value > 5)) return;
      if (value === requested) return;
      requested = value;
      if (value === null) phase = amount > 0 ? 'leaving' : 'stack';
      else {
        floor = value;
        if (amount === 0) level = value;
        phase = 'entering';
      }
      notify();
    },
    advance(delta: number, explosion: number, reduced: boolean) {
      const oldFloor = floor, oldAmount = amount, oldLevel = level, oldPhase = phase;
      if (reduced) {
        floor = requested; if (floor !== null) level = floor;
        amount = floor !== null && explosion >= .72 ? 1 : 0;
        phase = floor === null ? 'stack' : amount === 1 ? 'focused' : 'entering';
      } else if (phase === 'leaving') {
        // Only an explicit exit pulls back to the full stack.
        amount = damp(amount, 0, delta, 28);
        if (amount === 0) {
          floor = null; phase = 'stack';
        }
      } else if (phase === 'entering') {
        // Keep the close-up pose while moving directly to the requested floor.
        if (requested !== null) level = damp(level, requested, delta);
        amount = damp(amount, explosion >= .72 ? 1 : 0, delta);
        if (amount === 1 && level === requested) phase = 'focused';
      }
      if (floor !== oldFloor) notify();
      const changed = amount !== oldAmount || level !== oldLevel || phase !== oldPhase;
      return changed;
    },
  };
}
export type FloorFocus = ReturnType<typeof createFloorFocus>;
export function focusedFloorY(positions: number[], level: number) {
  const index = Math.max(0, Math.min(positions.length - 1, level - 1));
  const lower = Math.floor(index), upper = Math.ceil(index);
  return positions[lower] + (positions[upper] - positions[lower]) * (index - lower);
}
