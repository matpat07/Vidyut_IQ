import React, { useLayoutEffect, useMemo, useRef } from 'react';
import type {} from '@react-three/fiber';
import { InstancedMesh, Object3D } from 'three';
import { BoxPart, MATERIALS, MaterialName } from './architecture';

export type ExplosionRole = 'slab' | 'base' | 'shell' | 'core' | 'accessory' | 'roof' | 'highlight' | 'partition' | 'site' | 'service';
function BoxBatch({ parts, material, role }: { parts: BoxPart[]; material: MaterialName; role?: ExplosionRole }) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const object = new Object3D();
    parts.forEach((part, index) => {
      object.position.set(...part.position);
      object.scale.set(...part.size);
      object.rotation.set(...(part.rotation ?? [0, 0, 0]));
      object.updateMatrix();
      ref.current!.setMatrixAt(index, object.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    ref.current!.computeBoundingSphere();
  }, [parts]);
  return <instancedMesh ref={ref} args={[undefined, undefined, parts.length]} castShadow receiveShadow userData={{ explosionRole: role }}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial {...MATERIALS[material]} />
  </instancedMesh>;
}

/** Windows, mullions and tiles share one box geometry/draw call per material. */
export function InstancedBoxes({ parts, role }: { parts: BoxPart[]; role?: ExplosionRole }) {
  const groups = useMemo(() => {
    const result = new Map<MaterialName, BoxPart[]>();
    parts.forEach(part => {
      const group = result.get(part.material) ?? [];
      group.push(part);
      result.set(part.material, group);
    });
    return result;
  }, [parts]);
  return <>{Array.from(groups, ([material, items]) => <BoxBatch key={material} material={material} parts={items} role={role} />)}</>;
}
