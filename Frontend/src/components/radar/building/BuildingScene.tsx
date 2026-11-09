import React, { MutableRefObject, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3, PCFSoftShadowMap } from 'three';
import { BuildingModel } from './BuildingModel';
import { MODEL_SCALE } from './architecture';
import { ExplosionController, explosionPose } from './explosion';
import { FloorFocus } from './floorFocus';
import { RoomInteraction, RoomLabels } from './FloorRooms';
import {CameraRig} from './CameraRig';
import type {ViewCommand,TransitionController} from './transitionController';

interface SceneProps extends RoomInteraction {
  command: ViewCommand; controller: ExplosionController; selectedFloor: number | null;
  labels: MutableRefObject<(HTMLDivElement | null)[]>;
  focus: FloorFocus; roomLabels: MutableRefObject<(HTMLElement | null)[]>;
  hoverCard: MutableRefObject<HTMLDivElement | null>;
  onReady: () => void; onContextLost: () => void;
  onFallback: () => void;
}

export function TransitionClock({ transitions, reduced }: { transitions:TransitionController; reduced: MutableRefObject<boolean> }) {
  const { invalidate,gl } = useThree();
  const resting = useRef(true), waking = useRef(true);
  useEffect(() => {
    const wake = () => { if (resting.current) waking.current = true; invalidate(); };
    return transitions.subscribe(wake);
  }, [transitions, invalidate]);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reduced.current = media.matches; invalidate(); };
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [invalidate, reduced]);
  useFrame((_, delta) => {
    // A demand-rendered scene can sleep for minutes. Its first delta must not
    // count that idle time as animation time and jump through the camera dive.
    const elapsed = waking.current ? 1 / 60 : delta; waking.current = false;
    const moving = transitions.advance(elapsed, reduced.current);
    resting.current = !moving;
    if (moving) { gl.shadowMap.needsUpdate=true; invalidate(); }
  }, -2);
  return null;
}

function FloorLabels({ controller, labels, focus }: Pick<SceneProps, 'controller' | 'labels' | 'focus'>) {
  const { camera, size } = useThree();
  const point = useMemo(() => new Vector3(), []);
  const rail = useRef(false);
  useLayoutEffect(() => { rail.current = matchMedia('(min-width: 681px)').matches; }, [size.width, size.height]);
  useFrame(() => {
    const pose = explosionPose(controller.current);
    labels.current.forEach((label, index) => {
      if (!label) return;
      point.set(38 * MODEL_SCALE[0], (pose.floorY[index] + .3) * MODEL_SCALE[1], 9 * MODEL_SCALE[2]).project(camera);
      label.style.transform = `translate(${Math.max(8, Math.min(size.width - (rail.current ? 278 : 64), (point.x + 1) * size.width / 2))}px, ${(1 - point.y) * size.height / 2}px)`;
      label.style.opacity = String(pose.labelOpacity * (1 - focus.amount));
    });
  });
  return null;
}

function SceneLifecycle({ onReady, onContextLost }: Pick<SceneProps, 'onReady' | 'onContextLost'>) {
  const { gl, invalidate } = useThree();
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onContextLost(); };
    gl.domElement.addEventListener('webglcontextlost', lost); onReady(); invalidate();
    return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl, invalidate, onReady, onContextLost]);
  return null;
}

export default function BuildingScene({ command, controller, selectedFloor, labels, focus, roomLabels, hoverCard, onReady, onContextLost,onFallback, ...interaction }: SceneProps) {
  const reduced = useRef(false);
  return <Canvas orthographic frameloop="demand" dpr={[1, 1.5]} shadows
    camera={{ position: [90, 65, 110], zoom: 6, near: .1, far: 500 }}
    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    onCreated={({ gl }) => { gl.shadowMap.type = PCFSoftShadowMap; gl.shadowMap.autoUpdate=false; gl.shadowMap.needsUpdate=true; }}
    fallback={<div className="building-fallback"><p>3D rendering is unavailable.</p><button onClick={onFallback}>Open room list</button></div>}>
    <ambientLight intensity={1.3} /><hemisphereLight args={['#FFFCFC', '#9B829A', 1.2]} />
    <directionalLight position={[-30, 95, 45]} intensity={2.6} castShadow shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-70} shadow-camera-right={70} shadow-camera-top={90} shadow-camera-bottom={-80}
      shadow-camera-near={1} shadow-camera-far={220} shadow-bias={-.0008} shadow-normalBias={.08} />
    <TransitionClock transitions={interaction.transitions} reduced={reduced} />
    <BuildingModel controller={controller} focus={focus} selectedFloor={selectedFloor} {...interaction} />
    <CameraRig command={command} controller={controller} focus={focus} reduced={reduced} transitions={interaction.transitions} selectedRoom={interaction.selectedRoom} />
    <FloorLabels controller={controller} labels={labels} focus={focus} />
    <RoomLabels floor={selectedFloor} focus={focus} controller={controller} labels={roomLabels} hoveredRoom={interaction.hoveredRoom} hoverCard={hoverCard} transitions={interaction.transitions} />
    <SceneLifecycle onReady={onReady} onContextLost={onContextLost} />
  </Canvas>;
}
