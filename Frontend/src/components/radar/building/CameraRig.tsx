import {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import type {MutableRefObject} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {OrthographicCamera,Vector3,TOUCH} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {MODEL_SCALE} from './architecture';
import {explosionPose,ExplosionController} from './explosion';
import {focusedFloorY,FloorFocus} from './floorFocus';
import type {CameraView,ViewCommand,TransitionController} from './transitionController';
import {FLOOR_PLANS} from './floorPlans';
const DIRECTIONS: Record<CameraView,[number,number,number]>={perspective:[.78,.48,1],front:[0,0,1],aerial:[-.45,1.25,1.25],top:[0,1,.001]};
const EXPLODED_DIRECTIONS={perspective:[-.12,.42,1],aerial:[-.15,.6,1]} as const;
const FLOOR_DIRECTIONS:Record<CameraView,[number,number,number]>={perspective:[.025,1,.3],front:[0,1,.36],aerial:[-.025,1,.28],top:[0,1,.001]};
const RAIL_INSET=266;
export function CameraRig({ command, controller, focus, reduced, transitions,selectedRoom,layout='radar' }: { command: ViewCommand; controller: ExplosionController; focus: FloorFocus; reduced: MutableRefObject<boolean>;transitions:TransitionController;selectedRoom:string|null;layout?:'radar'|'presentation' }) {
  const { camera: baseCamera, gl, size, invalidate } = useThree();
  const camera = baseCamera as OrthographicCamera;
  const controls = useRef<OrbitControls | null>(null);
  const target = useMemo(() => new Vector3(0, 6.2, 5), []);
  const floorTarget = useMemo(() => new Vector3(), []);
  const lookTarget = useMemo(() => new Vector3(0, 6.2, 5), []);
  const retreat = useMemo(() => ({ active: false, amount: 1, position: new Vector3(), target: new Vector3(), zoom: 1 }), []);
  const destination = useMemo(() => new Vector3(), []);
  const direction = useMemo(() => new Vector3(), []);
  const right = useMemo(() => new Vector3(), []);
  const up = useMemo(() => new Vector3(), []);
  const corner = useMemo(() => new Vector3(), []);
  const roomPoint = useMemo(() => new Vector3(), []);
  const worldUp = useMemo(() => new Vector3(0, 1, 0), []);
  const intent = useRef({ direction: new Vector3(...DIRECTIONS.perspective).normalize(), lift: 0, preset: true, zoomOverride: null as number | null });
  const state = useRef({ dirty: true, active: true, progress: -1, zoom: 1, rail: false, amount: -1, level: -1 });
  const previousCommand = useRef<ViewCommand | null>(null);
  useEffect(() => {
    const orbit = new OrbitControls(camera, gl.domElement); controls.current = orbit;
    orbit.enablePan = false; orbit.enableZoom = false; orbit.enableDamping = false;
    orbit.minPolarAngle = .001; orbit.maxPolarAngle = Math.PI / 2;
    if(layout==='presentation'){orbit.minAzimuthAngle=-.2;orbit.maxAzimuthAngle=1.1;gl.domElement.style.touchAction='pan-y';}
    // One finger separates floors; two fingers orbit. Mouse drag still orbits.
    orbit.touches.ONE = undefined; orbit.touches.TWO = TOUCH.DOLLY_ROTATE;
    orbit.target.copy(target);
    const interrupt = () => { if(transitions.beginOrbit())state.current.active=false; };
    const capture = () => {
      if(!transitions.orbiting)return;
      intent.current.direction.copy(camera.position).sub(target).normalize();
      intent.current.lift = explosionPose(controller.current).cameraLift;
      intent.current.preset = false;
      transitions.endOrbit();
    };
    const redraw = () => invalidate();
    const guard = () => { orbit.enabled=(transitions.orbiting||transitions.canOrbit)&&!document.querySelector('[aria-modal="true"]'); };
    guard();const unsubscribe=transitions.subscribe(()=>{guard();invalidate();});
    gl.domElement.addEventListener('pointerdown',guard,true);
    orbit.addEventListener('change', redraw); orbit.addEventListener('start', interrupt); orbit.addEventListener('end', capture);
    return () => {
      orbit.removeEventListener('change', redraw); orbit.removeEventListener('start', interrupt); orbit.removeEventListener('end', capture);
      unsubscribe();gl.domElement.removeEventListener('pointerdown',guard,true);
      orbit.dispose(); controls.current = null;
    };
  }, [camera, controller, gl, invalidate, target,transitions,layout]);
  useLayoutEffect(() => {
    // The borderless canvas fills the workbench; leave the fixed floor rail clear.
    state.current.rail = layout==='radar'&&matchMedia('(min-width: 681px)').matches;
    const rightInset = state.current.rail ? RAIL_INSET : 48;
    camera.setViewOffset(size.width, size.height, (rightInset - 12) / 2, 24, size.width, size.height);
    const previous = previousCommand.current;
    const preserve = previous?.view === command.view && previous.revision === command.revision;
    if (preserve) {
      intent.current.direction.copy(camera.position).sub(target).normalize();
      intent.current.lift = explosionPose(controller.current).cameraLift;
    } else {
      intent.current.direction.set(...DIRECTIONS[command.view]).normalize(); intent.current.lift = 0; intent.current.preset = true;
    }
    intent.current.zoomOverride = preserve && previous.zoom !== command.zoom ? (state.current.active ? state.current.zoom : camera.zoom) * command.zoom / previous.zoom : null;
    previousCommand.current = command;
    state.current.dirty = true;transitions.cameraStarted(); invalidate();
  }, [command, size.width, size.height, camera, controller, invalidate, target,selectedRoom,transitions,layout]);
  useFrame((_, delta) => {
    const motion = state.current;
    if(transitions.orbiting)return;
    if (focus.returning && !retreat.active) {
      retreat.active = true; retreat.amount = Math.max(.0005, focus.amount);
      retreat.position.copy(camera.position); retreat.target.copy(lookTarget); retreat.zoom = camera.zoom;
    } else if (!focus.returning) retreat.active = false;
    const progressChanged = motion.progress !== controller.current;
    const focusChanged = motion.amount !== focus.amount || motion.level !== focus.level;
    if (progressChanged || focusChanged || motion.dirty) {
      const pose = explosionPose(controller.current);
      const focusAmount = focus.returning ? 0 : focus.amount;
      camera.setViewOffset(size.width, size.height, ((motion.rail ? RAIL_INSET : 48) - 12) / 2, 24 * (1 - (motion.rail ? focus.amount : 0)), size.width, size.height);
      if (progressChanged) intent.current.zoomOverride = null;
      target.set(0, (6.2 + (pose.roofY / 2 - 6.2) * pose.cameraSpread) * MODEL_SCALE[1], (5 - pose.cameraSpread * 4) * MODEL_SCALE[2]);
      if (intent.current.preset) {
        direction.set(...DIRECTIONS[command.view]).normalize();
        direction.y += .28 * pose.cameraLift; direction.normalize();
        // Face the long facade as the stack opens, avoiding an excessively tall
        // diagonal silhouette that forces every floor to shrink on screen.
        if (command.view === 'perspective' || command.view === 'aerial') {
          const [x, y, z] = EXPLODED_DIRECTIONS[command.view];
          corner.set(x, y, z).normalize();
          direction.lerp(corner, pose.cameraSpread).normalize();
        }
      } else {
        direction.copy(intent.current.direction); direction.y += .28 * (pose.cameraLift - intent.current.lift); direction.normalize();
      }
      if (intent.current.preset) {
        corner.set(...FLOOR_DIRECTIONS[command.view]).normalize();
        direction.lerp(corner, focusAmount).normalize();
      }
      right.crossVectors(worldUp, direction).normalize(); up.crossVectors(direction, right).normalize();
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      // Fit actual architectural pieces, not one giant box containing empty air
      // above the forecourt and beside the floating floors. Landscaping may extend
      // to the edges; building geometry and label clearance define the default fit.
      const projectBox = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, origin = target) => {
        for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) {
          corner.set(x * MODEL_SCALE[0], y * MODEL_SCALE[1], z * MODEL_SCALE[2]).sub(origin);
          const px = corner.dot(right), py = corner.dot(up);
          minX = Math.min(minX, px); maxX = Math.max(maxX, px);
          minY = Math.min(minY, py); maxY = Math.max(maxY, py);
        }
      };
      pose.floorY.forEach((y, index) => projectBox(-36.5, 36.5, y - .15, y + (index === 4 ? 4.35 : 3.45), -9.4, index === 0 ? 13.4 : 12.1));
      projectBox(-36.5, 36.5, pose.roofY - .2, pose.roofY + 1, -9.4, 9.4);
      if (pose.accessoryOpacity > .01) projectBox(-8.1, 8.1, 0, 9.3, 10.5, 16.1);
      // Center the real projected silhouette, including asymmetrical entrance depth.
      target.addScaledVector(right, (minX + maxX) / 2).addScaledVector(up, (minY + maxY) / 2);
      const usableWidth = Math.max(1, size.width - (motion.rail ? RAIL_INSET + 12 : 60));
      const usableHeight = Math.max(1, size.height - 96);
      const stackZoom = Math.min(usableWidth / (maxX - minX), usableHeight / (maxY - minY));
      const floorY = focusedFloorY(pose.floorY, focus.level);
      floorTarget.set(0, (floorY + .7) * MODEL_SCALE[1], 1.5 * MODEL_SCALE[2]);
      minX = minY = Infinity; maxX = maxY = -Infinity;
      projectBox(-36.5, 36.5, floorY - .15, floorY + 1.5, -9.4, 13.4, floorTarget);
      floorTarget.addScaledVector(right, (minX + maxX) / 2).addScaledVector(up, (minY + maxY) / 2);
      // The heading and analytics toolbar now live outside the canvas.
      const floorHeight = Math.max(1, size.height - (motion.rail ? 90 : 80));
      const floorZoom = .96*Math.min(usableWidth / (maxX - minX), floorHeight / (maxY - minY));
      target.lerp(floorTarget, focusAmount);
      destination.copy(direction).multiplyScalar(120).add(target);
      motion.zoom = intent.current.zoomOverride ?? (stackZoom + (floorZoom - stackZoom) * focusAmount) * command.zoom;
      const room=selectedRoom&&focus.floor ? FLOOR_PLANS[focus.floor-1].find(space=>space.id===selectedRoom) : null;
      if(room&&!focus.returning) {
        roomPoint.set(room.labelPosition[0]*MODEL_SCALE[0],(floorY+.7)*MODEL_SCALE[1],room.labelPosition[1]*MODEL_SCALE[2]).sub(target);
        // Gentle room focus retains the full-floor context at the default zoom.
        // At manual zoom, keep the selected room inside the clear viewport.
        const roomX=roomPoint.dot(right),roomY=roomPoint.dot(up);
        const allowedX=usableWidth*.43/motion.zoom,allowedY=floorHeight*.43/motion.zoom;
        const offset=(value:number,limit:number,extent:number)=>Math.sign(value)*Math.max(Math.min(Math.abs(value)*.08,extent*.015),Math.abs(value)-limit,0)*focusAmount;
        target.addScaledVector(right,offset(roomX,allowedX,maxX-minX)).addScaledVector(up,offset(roomY,allowedY,maxY-minY));
        destination.copy(direction).multiplyScalar(120).add(target);
      }
      if (retreat.active) {
        // Pull out from the actual pose, including a user-orbited/zoomed view.
        const remaining = Math.min(1, focus.amount / retreat.amount);
        destination.lerp(retreat.position, remaining); target.lerp(retreat.target, remaining);
        motion.zoom += (retreat.zoom - motion.zoom) * remaining;
      }
      motion.progress = controller.current; motion.amount = focus.amount; motion.level = focus.level; motion.dirty = false; motion.active = true;transitions.cameraStarted();
    }
    if (!motion.active) return;
    // Ease toward the shared pose without introducing another independent timeline.
    const blend = reduced.current ? 1 : 1 - Math.exp(-Math.min(delta, .1) * 28);
    camera.position.lerp(destination, blend); camera.zoom += (motion.zoom - camera.zoom) * blend;
    lookTarget.lerp(target, blend);
    camera.lookAt(lookTarget); camera.updateProjectionMatrix(); controls.current?.target.copy(lookTarget); controls.current?.update();
    if (camera.position.distanceToSquared(destination) < .0001 && Math.abs(camera.zoom - motion.zoom) < .0001) {
      camera.position.copy(destination); camera.zoom = motion.zoom;lookTarget.copy(target);camera.lookAt(lookTarget); camera.updateProjectionMatrix(); motion.active = false;transitions.cameraSettled();
    } else invalidate();
  });
  return null;
}

