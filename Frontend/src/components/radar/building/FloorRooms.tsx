import React, { MutableRefObject, useMemo, useRef } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial, OrthographicCamera, Vector3 } from 'three';
import { FLOOR_PLANS, PLAN_MARKERS, PlanRoom, planRect } from './floorPlans';
import { FloorFocus } from './floorFocus';
import { box, BoxPart, MODEL_SCALE } from './architecture';
import { ExplosionController, explosionPose } from './explosion';
import { InstancedBoxes } from './ScenePrimitives';

export interface RoomInteraction {
  selectedRoom: string | null; hoveredRoom: string | null;
  onRoomSelect: (id: string) => void; onRoomHover: (id: string | null) => void;
}
function RoomSurface({ room, focus, selectedRoom, hoveredRoom, onRoomSelect, onRoomHover }: { room: PlanRoom; focus: FloorFocus } & RoomInteraction) {
  const mesh = useRef<Mesh>(null);
  const rect = planRect(room.rect);
  useFrame(() => {
    const material = mesh.current!.material as MeshStandardMaterial;
    material.opacity = .16 + .65 * focus.amount;
  });
  const hover = (event: ThreeEvent<PointerEvent>) => { if (focus.interactive && focus.floor === room.floor) { event.stopPropagation(); onRoomHover(room.id); } };
  return <mesh ref={mesh} name={`room-${room.id}`} position={[rect.x, .17, rect.z]}
    onPointerOver={hover} onPointerOut={() => onRoomHover(null)}
    onClick={event => { if (event.delta < 4 && focus.interactive && focus.floor === room.floor) { event.stopPropagation(); onRoomSelect(room.id); } }}>
    <boxGeometry args={[Math.max(.1, rect.width - .12), .08, Math.max(.1, rect.depth - .12)]} />
    <meshStandardMaterial color={selectedRoom === room.id || hoveredRoom === room.id ? '#CA2127' : room.kind === 'CR' ? '#FFFCFC' : '#E6D1E5'} transparent depthWrite={false} roughness={.9} />
  </mesh>;
}

/** Permanent per-floor geometry, traced from each supplied conceptual plan. */
export function FloorRooms({ floor, focus, ...interaction }: { floor: number; focus: FloorFocus } & RoomInteraction) {
  const rooms = FLOOR_PLANS[floor - 1];
  const walls = useMemo(() => {
    const parts = new Map<string, BoxPart>();
    const wall = (x: number, z: number, width: number, depth: number) => {
      const key = [x, z, width, depth].map(n => n.toFixed(3)).join(':');
      parts.set(key, box([x, .65, z], [width, 1, depth], 'wall'));
    };
    for (const room of rooms) {
      const { x, z, width, depth } = planRect(room.rect);
      // Short opening on the corridor-facing side; dimensions are normalized.
      const gap = Math.min(.85, depth * .3);
      if (room.rect[1] < 320 || room.rect[1] > 1100) {
        const doorX = x + (room.rect[1] < 320 ? 1 : -1) * width / 2;
        wall(x - (doorX - x), z, .09, depth);
        for (const side of [-1, 1]) wall(doorX, z + side * (depth + gap) / 4, .09, (depth - gap) / 2);
        for (const side of [-1, 1]) wall(x, z + side * depth / 2, width, .09);
      } else {
        const opening = Math.min(.85, width * .3);
        const doorZ = z + depth / 2;
        wall(x, z - depth / 2, width, .09);
        for (const side of [-1, 1]) wall(x + side * (width + opening) / 4, doorZ, (width - opening) / 2, .09);
        for (const side of [-1, 1]) wall(x + side * width / 2, z, .09, depth);
      }
    }
    // The plan's rear stair and lift are distinct from the curved entrance stairs.
    for (const x of [-24.5, 26.3]) {
      for (const side of [-1, 1]) {
        wall(x + side * 1.8, -5.8, .09, 1.4);
        wall(x, -5.8 + side * .7, 3.6, .09);
      }
    }
    for (let step = 0; step < 8; step++) wall(-26 + step * .4, -5.8, .08, 1.1);
    return Array.from(parts.values());
  }, [rooms]);
  return <group name={`floor-plan-${floor}`}>
    <InstancedBoxes parts={walls} role="partition" />
    {rooms.map(room => <RoomSurface key={room.id} room={room} focus={focus} {...interaction} />)}
  </group>;
}

export function RoomLabels({ floor, focus, controller, labels }: {
  floor: number | null; focus: FloorFocus; controller: ExplosionController; labels: MutableRefObject<(HTMLElement | null)[]>;
}) {
  const { camera, size } = useThree();
  const point = useMemo(() => new Vector3(), []);
  const railWidth = matchMedia('(min-width: 681px)').matches ? 170 : 0;
  useFrame(() => {
    const rooms = floor ? FLOOR_PLANS[floor - 1] : [];
    const y = floor ? explosionPose(controller.current).floorY[floor - 1] : 0;
    labels.current.forEach((label, index) => {
      const room = rooms[index], marker = PLAN_MARKERS[index - rooms.length];
      if (!label || (!room && !marker)) return;
      const rect = room ? planRect(room.rect) : { ...marker, width: 0, depth: 0 };
      point.set(rect.x * MODEL_SCALE[0], (y + 1.3) * MODEL_SCALE[1], rect.z * MODEL_SCALE[2]).project(camera);
      const x = (point.x + 1) * size.width / 2, py = (1 - point.y) * size.height / 2;
      const rail = size.width - railWidth;
      const zoom = (camera as OrthographicCamera).zoom;
      const labelFits = !room || size.width > 680 || label.getAttribute('aria-pressed') === 'true' ||
        (rect.width * zoom * MODEL_SCALE[0] > 24 && rect.depth * zoom * MODEL_SCALE[2] > 12);
      const visible = focus.interactive && labelFits && x > 15 && x < rail - 15 && py > 10 && py < size.height - 68;
      label.style.transform = `translate(${x}px, ${py}px) translate(-50%, -50%)`;
      label.style.opacity = visible ? '1' : '0'; label.style.pointerEvents = visible ? 'auto' : 'none';
      label.style.visibility = visible ? 'visible' : 'hidden';
    });
  });
  return null;
}
