import { RefObject, useEffect } from 'react';
import { ExplosionController, normalizeWheel } from './explosion';

/** No window/body scroll listener, document pinning, or global preventDefault. */
export function useExplosionInput(surface: RefObject<HTMLDivElement>, controller: ExplosionController, enabled = true) {
  useEffect(() => {
    const element = surface.current;
    if (!element || !enabled) return;
    const blocked = (target: EventTarget | null) => document.querySelector('[aria-modal="true"]') ||
      (target instanceof Element && target.closest('button,input,select,textarea,[data-scene-ui]'));
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || blocked(event.target) || !element.querySelector('canvas')) return;
      const delta = normalizeWheel(event.deltaY, event.deltaX, event.deltaMode, element.clientHeight);
      if (!delta) return;
      event.preventDefault();
      controller.set(controller.getSnapshot() + delta / 1500);
    };
    let touch: { id: number; y: number } | null = null;
    const down = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || blocked(event.target) || !element.querySelector('canvas')) return;
      // A second finger hands control to OrbitControls; no simultaneous scrub.
      if (!event.isPrimary) { touch = null; return; }
      touch = { id: event.pointerId, y: event.clientY };
    };
    const move = (event: PointerEvent) => {
      if (!touch || event.pointerId !== touch.id || blocked(event.target)) return;
      const delta = touch.y - event.clientY;
      touch.y = event.clientY;
      controller.set(controller.getSnapshot() + delta / 700);
    };
    const up = () => { touch = null; };
    const key = (event: KeyboardEvent) => {
      if (event.target !== element || blocked(event.target)) return;
      const increments: Record<string, number> = { ArrowDown: .04, ArrowUp: -.04, PageDown: .15, PageUp: -.15 };
      if (!(event.key in increments) && !['Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      controller.set(event.key === 'Home' ? 0 : event.key === 'End' ? 1 : controller.getSnapshot() + increments[event.key]);
    };
    element.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('pointerdown', down);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', up);
    element.addEventListener('pointercancel', up);
    element.addEventListener('lostpointercapture', up);
    element.addEventListener('keydown', key);
    return () => {
      element.removeEventListener('wheel', wheel);
      element.removeEventListener('pointerdown', down);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up);
      element.removeEventListener('pointercancel', up);
      element.removeEventListener('lostpointercapture', up);
      element.removeEventListener('keydown', key);
    };
  }, [surface, controller, enabled]);
}
