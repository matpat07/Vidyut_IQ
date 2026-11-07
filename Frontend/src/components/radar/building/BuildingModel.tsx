import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Material, Mesh, Object3D } from 'three';
import { BUILDING, FLOOR_IDS, FOOTPRINT_SPANS, MODEL_SCALE, box } from './architecture';
import { FloorPlate, Roof } from './Facade';
import { CentralEntrance, SideEntranceLevel, ServiceCores } from './Entrances';
import { Landscaping } from './Landscaping';
import { InstancedBoxes, ExplosionRole } from './ScenePrimitives';
import { ExplosionController, explosionPose } from './explosion';
import { FloorFocus } from './floorFocus';
import { FloorRooms, RoomInteraction } from './FloorRooms';

function FloorOutline() {
  const parts = useMemo(() => {
    const result = [box([0, .17, BUILDING.frontZ], [72, .06, .1], 'selection')];
    for (const span of FOOTPRINT_SPANS) result.push(box([(span.start + span.end) / 2, .17, span.back], [span.end - span.start, .06, .1], 'selection'));
    for (const x of [-36, 36]) result.push(box([x, .17, 0], [.1, .06, BUILDING.depth], 'selection'));
    return result;
  }, []);
  return <InstancedBoxes parts={parts} role="highlight" />;
}

export function BuildingModel({ controller, selectedFloor, focus, ...interaction }: { controller: ExplosionController; selectedFloor: number | null; focus: FloorFocus } & RoomInteraction) {
  const root = useRef<Group>(null);
  const floors = useRef<(Group | null)[]>([]);
  const outlines = useRef<(Group | null)[]>([]);
  const roof = useRef<Group>(null);
  const accessories = useRef<Group>(null);
  const surfaces = useRef<{ mesh: Mesh; material: Material; role: ExplosionRole; floor: number | null }[]>([]);
  useLayoutEffect(() => {
    const result: typeof surfaces.current = [];
    root.current!.traverse(object => {
      if (!(object as Mesh).isMesh) return;
      let node: Object3D | null = object;
      let role: ExplosionRole | undefined;
      let floor: number | null = null;
      while (node) {
        role ??= node.userData.explosionRole;
        if (/^floor-[1-5]$/.test(node.name)) floor = Number(node.name.slice(-1));
        node = node.parent;
      }
      if (!role || role === 'highlight') return;
      const mesh = object as Mesh;
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) result.push({ mesh, material, role, floor });
    });
    surfaces.current = result;
    return () => { surfaces.current = []; };
  }, []);
  useFrame(() => {
    const pose = explosionPose(controller.current, BUILDING.floorHeight);
    floors.current.forEach((floor, index) => { if (floor) {
      floor.position.y = pose.floorY[index];
      floor.visible = !focus.interactive || focus.floor === index + 1;
    } });
    outlines.current.forEach((outline, index) => { if (outline) outline.visible = selectedFloor === index + 1; });
    if (roof.current) roof.current.position.y = pose.roofY;
    if (accessories.current) accessories.current.visible = pose.accessoryOpacity > .001;
    for (const { mesh, material, role, floor } of surfaces.current) {
      const weight = floor === null ? 0 : Math.max(0, 1 - Math.abs(focus.level - floor));
      let opacity = role === 'shell' ? pose.shellOpacity * (1 - focus.amount) : role === 'base' ? pose.baseOpacity : role === 'accessory' ? pose.accessoryOpacity : role === 'roof' ? pose.roofOpacity : role === 'partition' ? .8 * pose.cameraSpread + .2 * focus.amount : 1;
      if (role === 'roof' || role === 'site' || role === 'accessory' || role === 'service') opacity *= 1 - focus.amount;
      if (floor !== null) opacity *= 1 - focus.amount * (1 - weight) * .99;
      material.opacity = opacity;
      const transparent = opacity < .999;
      if (material.transparent !== transparent) {
        material.transparent = transparent;
        material.needsUpdate = true;
      }
      material.depthWrite = opacity > .95;
      mesh.castShadow = opacity > .95;
    }
  }, -1);
  return <group ref={root} name="pccoe-building-6" scale={MODEL_SCALE}>
    {FLOOR_IDS.map((id, index) => <group key={id} name={id} ref={node => { floors.current[index] = node; }} position={[0, index * BUILDING.floorHeight, 0]}>
      <FloorPlate level={index} />
      {BUILDING.towerX.map(x => <SideEntranceLevel key={x} x={x} level={index} />)}
      <ServiceCores />
      <FloorRooms floor={index + 1} focus={focus} {...interaction} />
      <group name="floor-selection-outline" visible={false} ref={node => { outlines.current[index] = node; }}><FloorOutline /></group>
    </group>)}
    <group name="roof" ref={roof} position={[0, BUILDING.floors * BUILDING.floorHeight, 0]}><Roof /></group>
    <group name="entrance-cutaway" ref={accessories} userData={{ explosionRole: 'accessory' }}><CentralEntrance /></group>
    <group userData={{ explosionRole: 'site' }}><Landscaping /></group>
  </group>;
}
