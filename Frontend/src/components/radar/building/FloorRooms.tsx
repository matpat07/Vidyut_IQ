import React, { MutableRefObject, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { BufferGeometry, Group, LineLoop, Mesh, MeshStandardMaterial, Shape, Vector3 } from 'three';
import { FLOOR_DEFINITIONS, FLOOR_PLANS, PlanRoom, PlanPoint } from './floorPlans';
import { polygonBounds, roomWallSegments } from './planGeometry';
import { FloorFocus } from './floorFocus';
import { box, BoxPart, MODEL_SCALE } from './architecture';
import { ExplosionController, explosionPose } from './explosion';
import { InstancedBoxes } from './ScenePrimitives';
import type { MapMode, RoomVisual } from '../energy/energyTypes';
import type {TransitionController} from './transitionController';
import {layoutLabels,LabelCandidate} from './labelLayout';

export interface RoomInteraction {
  selectedRoom: string | null; hoveredRoom: string | null;
  onRoomSelect: (id: string) => void; onRoomHover: (id: string | null) => void;
  mapMode: MapMode; visuals: Record<string, RoomVisual>;
  transitions:TransitionController;
}
export const TYPE_COLORS = { CR:'#FFFCFC', LAB:'#E6D1E5', CABIN:'#9B829A', WF:'#9B829A', DATA:'#E6D1E5', STAIR:'#E6D1E5', LIFT:'#9B829A', CORRIDOR:'#E6D1E5', OTHER:'#FFFCFC' } as const;
function shapeOf(polygon:PlanPoint[], cx=0, cz=0) {
  const shape=new Shape();polygon.forEach(([x,z],index)=>{if(index===0)shape.moveTo(x-cx,cz-z);else shape.lineTo(x-cx,cz-z);});shape.closePath();return shape;
}
function PolygonOutline({polygon,focus,floor,active=false,boundary=false}:{polygon:PlanPoint[];focus:FloorFocus;floor:number;active?:boolean;boundary?:boolean}) {
  const line=useRef<LineLoop>(null);
  const geometry=useMemo(()=>new BufferGeometry().setFromPoints(polygon.map(([x,z])=>new Vector3(x,.32,z))),[polygon]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  useFrame(()=>{line.current!.visible=focus.amount>.1&&(boundary||active)&&focus.floor===floor;});
  return <lineLoop ref={line} geometry={geometry}><lineBasicMaterial color={boundary?'#9B829A':'#CA2127'} depthTest={false} transparent opacity={boundary ? .8 : 1} /></lineLoop>;
}
function RoomSurface({room,focus,selectedRoom,hoveredRoom,onRoomSelect,onRoomHover,mapMode,visuals,transitions}:{room:PlanRoom;focus:FloorFocus}&RoomInteraction) {
  const mesh=useRef<Mesh>(null),group=useRef<Group>(null);
  const {invalidate}=useThree();
  const bounds=useMemo(()=>polygonBounds(room.polygon),[room]);
  const shape=useMemo(()=>shapeOf(room.polygon,bounds.x,bounds.z),[room,bounds]);
  const active=selectedRoom===room.id||hoveredRoom===room.id;
  const visual=visuals[room.id];
  const analytical=mapMode!=='room';
  const isPath=room.kind==='CORRIDOR';
  const extrusion=useMemo(()=>({depth:isPath ? .012 : .09,bevelEnabled:false}),[isPath]);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  useFrame((_,delta)=>{
    if(transitions.explosion.current<=.035&&focus.amount===0)return;
    const weight=Math.max(0,1-Math.abs(focus.level-room.floor));
    const material=mesh.current!.material as MeshStandardMaterial;
    material.opacity=(isPath ? .12 : .25+.65*focus.amount)*(1-focus.amount*(1-weight)*.99)*(analytical&&visual?.unavailable ? .2 : 1);
    const target=active&&focus.interactive&&!isPath ? .1 : 0;
    const next=reduced?target:group.current!.position.y+(target-group.current!.position.y)*(1-Math.exp(-Math.min(delta,.1)*14));
    group.current!.position.y=Math.abs(next-target)<.0005?target:next;
    if(group.current!.position.y!==target)invalidate();
  });
  const hover=(event:ThreeEvent<PointerEvent>)=>{if(transitions.canPick&&focus.floor===room.floor){event.stopPropagation();onRoomHover(room.id);}};
  return <group ref={group}>
    <mesh ref={mesh} name={`room-${room.id}`} position={[bounds.x,isPath ? .14 : .2,bounds.z]} rotation={[-Math.PI/2,0,0]} receiveShadow
      raycast={(raycaster,hits)=>{if(transitions.canRaycast&&focus.floor===room.floor)Mesh.prototype.raycast.call(mesh.current!,raycaster,hits);}}
      onPointerOver={hover} onPointerOut={()=>onRoomHover(null)}
      onClick={event=>{if(event.delta<4&&transitions.canPick&&focus.floor===room.floor){event.stopPropagation();onRoomSelect(room.id);}}}>
      <extrudeGeometry args={[shape,extrusion]} />
      <meshStandardMaterial color={analytical ? visual?.color ?? '#E6D1E5' : active ? '#CA2127' : TYPE_COLORS[room.kind]} transparent depthWrite={false} roughness={.95} />
    </mesh>
    <PolygonOutline polygon={room.polygon} focus={focus} floor={room.floor} active={active} />
  </group>;
}
export function FloorRooms({floor,focus,...interaction}:{floor:number;focus:FloorFocus}&RoomInteraction) {
  const root=useRef<Group>(null);
  useFrame(()=>{root.current!.visible=interaction.transitions.explosion.current>.035||focus.amount>0;},-.5);
  const definition=FLOOR_DEFINITIONS[floor-1];
  const walls=useMemo(()=>{
    const boundaryRoom={...definition.rooms[0],polygon:definition.boundary,doors:[
      {edge:0,span:[.458,.542] as [number,number],corridor:'west',certainty:'diagram' as const},
      {edge:0,span:[.168,.207] as [number,number],corridor:'west',certainty:'diagram' as const},
      {edge:0,span:[.793,.832] as [number,number],corridor:'west',certainty:'diagram' as const},
    ]};
    const segments=roomWallSegments([...definition.rooms,...definition.facilities,boundaryRoom]);
    const result:BoxPart[]=segments.map(({from:a,to:b})=>{
      const dx=b[0]-a[0],dz=b[1]-a[1];
      return box([(a[0]+b[0])/2,.66,(a[1]+b[1])/2],[Math.hypot(dx,dz),1,.09],'planWall',[0,-Math.atan2(dz,dx),0]);
    });
    return result;
  },[definition]);
  const shape=useMemo(()=>shapeOf(definition.boundary),[definition]);
  return <group ref={root} name={`floor-plan-${floor}`}>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,.13,0]} receiveShadow userData={{explosionRole:'analytical'}}>
      <shapeGeometry args={[shape]} /><meshStandardMaterial color="#FFFCFC" transparent roughness={.98} />
    </mesh>
    <InstancedBoxes parts={walls} role="partition" />
    <PolygonOutline polygon={definition.boundary} focus={focus} floor={floor} boundary />
    {definition.spaces.map(room=><RoomSurface key={room.id} room={room} focus={focus} {...interaction} />)}
  </group>;
}
export function RoomLabels({floor,focus,controller,labels,hoveredRoom,hoverCard,transitions}:{
  floor:number|null;focus:FloorFocus;controller:ExplosionController;labels:MutableRefObject<(HTMLElement|null)[]>;
  hoveredRoom:string|null;hoverCard:MutableRefObject<HTMLDivElement|null>;
  transitions:TransitionController;
}) {
  const {camera,size,invalidate}=useThree();const point=useMemo(()=>new Vector3(),[]);
  useLayoutEffect(()=>{
    // Fonts, responsive rules and selection borders can resize labels after a
    // demand frame has settled. Repack once their actual dimensions change.
    const observer=new ResizeObserver(()=>invalidate());
    labels.current.forEach(label=>{if(label)observer.observe(label);});
    return ()=>observer.disconnect();
  },[floor,labels,invalidate]);
  const candidates=useMemo<LabelCandidate[]>(()=> (floor?FLOOR_PLANS[floor-1]:[]).map(room=>({id:room.id,x:0,y:0,width:0,height:0,priority:0})),[floor]);
  const railWidth=matchMedia('(min-width: 681px)').matches?258:0;
  useFrame(()=>{
    const rooms=floor?FLOOR_PLANS[floor-1]:[],y=floor?explosionPose(controller.current).floorY[floor-1]:0;
    const project=(room:PlanRoom)=>{point.set(room.labelPosition[0]*MODEL_SCALE[0],(y+1.25)*MODEL_SCALE[1],room.labelPosition[1]*MODEL_SCALE[2]).project(camera);point.x=(point.x+1)*size.width/2;point.y=(1-point.y)*size.height/2;};
    labels.current.forEach((label,index)=>{
      const room=rooms[index];if(!label||!room)return;
      project(room);const item=candidates[index];
      item.x=point.x;item.y=point.y;item.width=label.offsetWidth;item.height=label.offsetHeight;
      item.priority=label.getAttribute('aria-pressed')==='true'?4:hoveredRoom===room.id?3:room.number?2:room.kind==='CORRIDOR'?0:1;
      label.style.transform=`translate(${item.x}px, ${item.y}px) translate(-50%, -50%)`;
    });
    const visibleIds=transitions.canPick?layoutLabels(candidates.filter(item=>item.width>0&&item.height>0),{left:10,top:8,right:size.width-railWidth-10,bottom:size.height-76}):new Set<string>();
    labels.current.forEach((label,index)=>{
      if(!label||!rooms[index])return;const visible=visibleIds.has(rooms[index].id);
      label.style.opacity=visible?'1':'0';label.style.pointerEvents=visible?'auto':'none';label.style.visibility=visible?'visible':'hidden';
    });
    const card=hoverCard.current,room=rooms.find(room=>room.id===hoveredRoom);
    if(card&&room) {
      project(room);const x=point.x,py=point.y,w=card.offsetWidth,h=card.offsetHeight,right=size.width-railWidth-8;
      const left=x+16+w<right?x+16:x-w-16;
      card.style.left=`${Math.max(8,Math.min(right-w,left))}px`;
      card.style.top=`${Math.max(8,Math.min(size.height-76-h,py-h-12))}px`;
      card.style.visibility=transitions.canPick?'visible':'hidden';
    }
  });return null;
}
