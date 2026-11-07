import React, { useMemo } from 'react';
import { Shape, Path } from 'three';
import { BUILDING as B, box, BoxPart, MATERIALS } from './architecture';
import { InstancedBoxes } from './ScenePrimitives';
import { windowBand } from './Facade';

function entranceDoors(width: number, z: number): BoxPart[] {
  const result = [box([0, 1.4, z], [width, 2.8, 0.12], 'glass')];
  for (const x of [-width / 2, 0, width / 2]) result.push(box([x, 1.4, z + 0.12], [0.09, 2.85, 0.12], 'frame'));
  for (const y of [0.12, 0.65, 2.35, 2.8]) result.push(box([0, y, z + 0.12], [width, 0.07, 0.12], 'frame'));
  for (const x of [-0.18, 0.18]) result.push(box([x, 1.35, z + 0.22], [0.05, 0.5, 0.08], 'frame'));
  return result;
}

export function CentralEntrance() {
  const shape = useMemo(() => {
    const outer = new Shape();
    outer.moveTo(-7.4, 3.2); outer.lineTo(7.4, 3.2);
    outer.lineTo(7.4, 8.15); outer.lineTo(6.3, 9.25);
    outer.lineTo(-6.3, 9.25); outer.lineTo(-7.4, 8.15); outer.closePath();
    const glassOpening = new Path();
    glassOpening.moveTo(-5.8, 4.1); glassOpening.lineTo(-5.8, 7.65);
    glassOpening.lineTo(5.8, 7.65); glassOpening.lineTo(5.8, 4.1); glassOpening.closePath();
    outer.holes.push(glassOpening);
    return outer;
  }, []);
  const parts = useMemo(() => {
    const result = [
      box([-6.8, 1.6, 22.8], [1.2, 3.2, 2.2], 'blue'),
      box([6.8, 1.6, 22.8], [1.2, 3.2, 2.2], 'blue'),
      box([0, 3.45, 23.6], [14.9, 0.5, 4.4], 'frame'),
      box([0, 3.17, 23.6], [14.5, 0.08, 4.1], 'tile'),
      box([0, 0.13, 23.1], [15, 0.26, 6.4], 'paving'),
      box([0, 0.05, 24.7], [16.1, 0.1, 4.6], 'paving'),
      ...entranceDoors(9.8, 22.5),
      ...windowBand(0, 5.87, 23.33, 11.55, 3.5),
    ];
    // Two double-door bays beneath the wider canopy, rather than a painted texture.
    for (const x of [-2.45, 2.45]) result.push(box([x, 1.4, 22.68], [0.09, 2.8, 0.09], 'frame'));
    return result;
  }, []);
  return <group name="central-entrance" position={[0, 0, B.frontZ - 20]}>
    <mesh position={[0, 0, 21.8]} castShadow receiveShadow>
      <extrudeGeometry args={[shape, { depth: 1.8, bevelEnabled: false }]} />
      <meshStandardMaterial {...MATERIALS.blue} />
    </mesh>
    <InstancedBoxes parts={parts} />
  </group>;
}

/** A complete tower slice belongs to the same parent as its corresponding floor. */
export function SideEntranceLevel({ x, level }: { x: number; level: number }) {
  const parts = useMemo(() => {
    const result: BoxPart[] = level === 0 ? entranceDoors(2.5, B.towerRadius + 0.08) : [];
    for (let i = -5; i <= 5; i++) {
      const theta = i * Math.PI / 12;
      result.push(box([Math.sin(theta) * (B.towerRadius + .03), 1.78, Math.cos(theta) * (B.towerRadius + .03)], [.055, 1.7, .08], 'frame', [0, theta, 0]));
    }
    return result;
  }, [level]);
  const stairs = useMemo(() => {
    const result: BoxPart[] = [];
    for (const flight of [-1, 1]) for (let step = 0; step < 9; step++) result.push(box([flight * .8, step * B.floorHeight / 18 + (flight > 0 ? B.floorHeight / 2 : 0), 1.4 - step * .29], [1.15, .14, .36], 'roof'));
    result.push(box([0, B.floorHeight / 2, -.95], [3, .15, .8], 'roof'));
    if (!level) result.push(box([0, .1, 2.2], [5.2, .2, 3.5], 'paving'));
    return result;
  }, [level]);
  return <group name={`${x < 0 ? 'north' : 'south'}-tower-floor-${level + 1}`} position={[x, 0, B.towerZ]}>
    <mesh position={[0, .42, 0]} castShadow userData={{ explosionRole: 'base' }}><cylinderGeometry args={[B.towerRadius, B.towerRadius, .84, 32, 1, false, -Math.PI / 2, Math.PI]} /><meshStandardMaterial {...MATERIALS.blue} /></mesh>
    <mesh position={[0, 1.78, 0]} castShadow userData={{ explosionRole: 'shell' }}><cylinderGeometry args={[B.towerRadius - .035, B.towerRadius - .035, 1.88, 32, 1, true, -Math.PI / 2, Math.PI]} /><meshStandardMaterial {...MATERIALS.glass} /></mesh>
    <mesh position={[0, 3.02, 0]} castShadow userData={{ explosionRole: 'shell' }}><cylinderGeometry args={[B.towerRadius, B.towerRadius, .76, 32, 1, false, -Math.PI / 2, Math.PI]} /><meshStandardMaterial {...MATERIALS.blue} /></mesh>
    {level === 0 && <mesh name="curved-entrance-canopy" position={[0, 2.98, .3]} castShadow userData={{ explosionRole: 'shell' }}><cylinderGeometry args={[2.65, 2.65, .32, 32, 1, false, -Math.PI / 2, Math.PI]} /><meshStandardMaterial {...MATERIALS.blue} /></mesh>}
    {level === 4 && <mesh name="tower-parapet" position={[0, 3.85, 0]} castShadow userData={{ explosionRole: 'shell' }}><cylinderGeometry args={[2.35, 2.35, .9, 32, 1, false, -Math.PI / 2, Math.PI]} /><meshStandardMaterial {...MATERIALS.blue} /></mesh>}
    <InstancedBoxes parts={parts} role="shell" />
    <InstancedBoxes parts={stairs} role="core" />
  </group>;
}

export function ServiceCores() {
  const parts = useMemo(() => [
    box([28, 1.7, B.backZ + 2.2], [3.5, 3.4, 3.5], 'wall'),
    box([-28, 1.7, B.backZ + 2.2], [3, 3.4, 3.5], 'wall'),
  ], []);
  return <group name="internal-service-cores"><InstancedBoxes parts={parts} role="service" /></group>;
}
