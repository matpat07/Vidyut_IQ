import React, { useMemo } from 'react';
import { BUILDING as B, FOOTPRINT_SPANS, box, BoxPart } from './architecture';
import { InstancedBoxes } from './ScenePrimitives';

/** Local XY band: glass is recessed behind the external trim on +Z. */
export function windowBand(x: number, y: number, z: number, width: number, height = 1.45): BoxPart[] {
  const parts = [box([x, y, z], [width, height, 0.09], 'glass')];
  const columns = Math.max(2, Math.round(width / 0.8));
  for (let i = 0; i <= columns; i++) parts.push(box([x - width / 2 + i * width / columns, y, z + 0.1], [0.045, height + 0.08, 0.07], 'frame'));
  for (const offset of [-height / 2, 0, height / 2]) parts.push(box([x, y + offset, z + 0.1], [width + 0.07, 0.045, 0.07], 'frame'));
  parts.push(box([x, y - height / 2 - 0.1, z + 0.14], [width + 0.3, 0.13, 0.36], 'wall'));
  return parts;
}

/** Shared continuous footprint; no inferred open courtyard or separate rear wing. */
export function FloorPlate({ level }: { level: number }) {
  const parts = useMemo(() => {
    const h = B.floorHeight;
    const result: BoxPart[] = [];
    for (const span of FOOTPRINT_SPANS) {
      const width = span.end - span.start;
      const x = (span.start + span.end) / 2;
      result.push(box([x, 0, (B.frontZ + span.back) / 2], [width, B.slab, B.frontZ - span.back], 'roof'));
      // The rear facade follows the shallow stepped silhouette, not a courtyard.
      const band = windowBand(x, 1.78, 0, width - 1.3);
      band.forEach(part => { part.position[2] = span.back - 0.04 - part.position[2]; });
      result.push(...band);
      result.push(box([x, 0.48, span.back], [width, 0.85, 0.55], 'wall'));
      result.push(box([x, h - 0.48, span.back], [width, 0.95, 0.55], 'wall'));
      for (const edge of [span.start + 0.3, span.end - 0.3]) result.push(box([edge, h / 2, span.back], [0.65, h, 0.6], 'wall'));
    }
    // Close the short return walls at each setback.
    FOOTPRINT_SPANS.slice(1).forEach((span, index) => {
      const previous = FOOTPRINT_SPANS[index];
      result.push(box([span.start, h / 2, (span.back + previous.back) / 2], [0.35, h, Math.abs(span.back - previous.back) + 0.25], 'wall'));
    });
    result.push(box([0, 0.48, B.frontZ], [B.width, 0.85, 0.55], 'wall'));
    result.push(box([0, h - 0.48, B.frontZ], [B.width, 0.95, 0.55], 'wall'));
    for (const x of B.facadeBays) {
      result.push(...windowBand(x, 1.78, B.frontZ + 0.08, B.bayWidth - 1.5));
      for (const side of [-1, 1]) result.push(box([x + side * (B.bayWidth / 2 - 0.48), h / 2, B.frontZ + 0.45], [0.96, h, 1.3], 'orange'));
      const crown = level === B.floors - 1;
      result.push(box([x, h - (crown ? 0.5 : 0.22), B.frontZ + 0.45], [B.bayWidth, crown ? 1 : 0.44, 1.3], crown ? 'orange' : 'wall'));
    }
    for (const x of [-22.5, 0, 22.5]) {
      if (x === 0 && level < 3) continue;
      result.push(...windowBand(x, 1.78, B.frontZ - 0.24, x === 0 ? 13 : 4.4));
    }
    for (const x of [-19.2, 19.2]) result.push(box([x, h / 2, B.frontZ - 0.05], [2.05, h, 0.65], 'wall'));
    for (const x of [-6.85, 6.85]) result.push(box([x, h / 2, B.frontZ - 0.05], [0.7, h, 0.65], 'wall'));
    // Narrow end elevations remain genuine geometry, with recessed window bands.
    for (const side of [-1, 1]) {
      for (let index = 0; index < 3; index++) {
        const z = B.backZ + 3 + index * 6;
        const band = windowBand(0, 1.78, 0, 4.6);
        band.forEach(part => {
          const [px, py, pz] = part.position;
          part.position = [side * (36.03 + pz), py, z + px];
          part.rotation = [0, side * Math.PI / 2, 0];
        });
        result.push(...band);
        for (const edge of [-2.7, 2.7]) result.push(box([side * 36, h / 2, z + edge], [0.6, h, 0.85], 'wall'));
      }
      result.push(box([side * 36, 0.48, 0], [0.55, 0.85, B.depth], 'wall'));
      result.push(box([side * 36, h - 0.48, 0], [0.55, 0.95, B.depth], 'wall'));
    }
    return result;
  }, [level]);
  const sections = useMemo(() => ({
    slab: parts.filter(part => part.material === 'roof'),
    base: parts.filter(part => part.material !== 'roof' && part.position[1] + part.size[1] / 2 < 1.1),
    shell: parts.filter(part => part.material !== 'roof' && part.position[1] + part.size[1] / 2 >= 1.1),
  }), [parts]);
  return <group name={`floor-envelope-${level + 1}`}>
    <InstancedBoxes parts={sections.slab} role="slab" />
    <InstancedBoxes parts={sections.base} role="base" />
    <InstancedBoxes parts={sections.shell} role="shell" />
  </group>;
}

export function Roof() {
  const parts = useMemo(() => {
    const result: BoxPart[] = [];
    for (const span of FOOTPRINT_SPANS) {
      const width = span.end - span.start;
      const x = (span.start + span.end) / 2;
      result.push(box([x, 0, (B.frontZ + span.back) / 2], [width + 0.08, 0.3, B.frontZ - span.back + 0.4], 'roof'));
      result.push(box([x, 0.42, span.back - 0.15], [width + 0.2, 0.7, 0.3], 'wall'));
    }
    FOOTPRINT_SPANS.slice(1).forEach((span, index) => {
      const previous = FOOTPRINT_SPANS[index];
      result.push(box([span.start, 0.42, (span.back + previous.back) / 2], [0.3, 0.7, Math.abs(span.back - previous.back) + 0.3], 'wall'));
    });
    result.push(box([0, 0.42, B.frontZ + 0.15], [72.8, 0.7, 0.3], 'wall'));
    for (const x of [-36.2, 36.2]) result.push(box([x, 0.42, 0], [0.3, 0.7, B.depth + 0.6], 'wall'));
    // Compact grouped arrays across the continuous roof, as in the supplied aerial.
    for (const cluster of [-29.5, -11.5, 11.5, 29.5]) for (const z of [-3.8, 3.2]) for (const offset of [-2.4, 0, 2.4]) {
      const x = cluster + offset;
      result.push(box([x, 0.45, z], [2.25, 0.12, 3.1], 'glass', [-0.12, 0, 0]));
      for (const edge of [-1.1, 0, 1.1]) result.push(box([x + edge, 0.53, z], [0.035, 0.035, 3.1], 'frame', [-0.12, 0, 0]));
      result.push(box([x, 0.54, z], [2.25, 0.035, 0.035], 'frame'));
    }
    return result;
  }, []);
  return <group name="roof-envelope"><InstancedBoxes parts={parts} role="roof" /></group>;
}
