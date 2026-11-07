import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { InstancedMesh, Object3D } from 'three';
import { BUILDING as B, box, BoxPart, MATERIALS, Point3 } from './architecture';
import { InstancedBoxes } from './ScenePrimitives';

function Plants({ positions }: { positions: Point3[] }) {
  const pots = useRef<InstancedMesh>(null);
  const leaves = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const object = new Object3D();
    positions.forEach(([x, y, z], index) => {
      object.position.set(x, y + 0.3, z); object.scale.set(1, 1, 1); object.updateMatrix();
      pots.current!.setMatrixAt(index, object.matrix);
      object.position.y = y + 1.05;
      object.scale.set(0.64, 0.8 + (index % 3) * 0.12, 0.64); object.updateMatrix();
      leaves.current!.setMatrixAt(index, object.matrix);
    });
    for (const mesh of [pots.current!, leaves.current!]) {
      mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere();
    }
  }, [positions]);
  return <>
    <instancedMesh ref={pots} args={[undefined, undefined, positions.length]} castShadow receiveShadow><cylinderGeometry args={[0.44, 0.29, 0.6, 10]} /><meshStandardMaterial {...MATERIALS.pot} /></instancedMesh>
    <instancedMesh ref={leaves} args={[undefined, undefined, positions.length]} castShadow><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial {...MATERIALS.leaf} /></instancedMesh>
  </>;
}

export function Landscaping() {
  const { parts, plants } = useMemo(() => {
    const parts: BoxPart[] = [
      box([0, -0.45, B.siteCenterZ + 20 - B.frontZ], [B.siteWidth, 0.7, B.siteDepth], 'paving'),
      box([0, -0.05, 31], [12.5, 0.18, 16], 'paving'),
    ];
    const plants: Point3[] = [];
    // Two lawns between the three approaches, not a generic park around the model.
    for (const side of [-1, 1]) {
      const x = side * 14.3;
      parts.push(box([x, 0.03, 30.5], [13, 0.18, 12.5], 'grass'));
      for (const z of [24.6, 36.4]) parts.push(box([x, 0.36, z], [12.7, 0.5, 0.5], 'hedge'));
      for (const edge of [-6.2, 6.2]) parts.push(box([x + edge, 0.36, 30.5], [0.5, 0.5, 11.8], 'hedge'));
      parts.push(box([side * 22.5, 0, 30.7], [4.3, 0.15, 16.5], 'tile'));
      for (let z = 25.2; z <= 37; z += 1.8) plants.push([side * 6.7, 0, z]);
      for (const offset of [-2.6, 2.6]) plants.push([side * 22.5 + offset, 0, 25]);
      for (let x = 8; x < 36; x += 3.1) parts.push(box([side * x, 0.55, 22.15], [1.8, 0.9, 0.9], 'hedge'));
    }
    // Model tiled approach as instanced boxes: no texture/image download.
    for (let row = 0; row < 13; row++) for (let col = 0; col < 10; col++) {
      parts.push(box([-5.4 + col * 1.2, 0.065, 24.1 + row * 1.1], [1.13, 0.05, 1.03], (row + col) % 3 === 0 ? 'tile' : 'paving'));
    }
    return { parts, plants };
  }, []);
  return <group name="entrance-landscaping" position={[0, 0, B.frontZ - 20]}><InstancedBoxes parts={parts} /><Plants positions={plants} /></group>;
}
