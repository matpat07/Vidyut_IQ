import React,{useEffect,useMemo,useRef,useSyncExternalStore} from 'react';
import {Canvas,useThree} from '@react-three/fiber';
import {PCFSoftShadowMap} from 'three';
import {BuildingModel} from '../radar/building/BuildingModel';
import {CameraRig} from '../radar/building/CameraRig';
import {TransitionClock} from '../radar/building/BuildingScene';
import {createTransitionController} from '../radar/building/transitionController';
export type PreviewPose='exterior'|'half'|'exploded'|'floor'|'room';
const noop=()=>{};const visuals={};
function Lifecycle({onReady,onFailure}:{onReady:()=>void;onFailure:()=>void}){
 const {gl}=useThree();useEffect(()=>{onReady();const lost=(event:Event)=>{event.preventDefault();onFailure();};gl.domElement.addEventListener('webglcontextlost',lost);return()=>gl.domElement.removeEventListener('webglcontextlost',lost);},[gl,onReady,onFailure]);return null;
}
export default function LandingScene({pose='exterior',onReady=noop,onFailure=noop}:{pose?:PreviewPose;onReady?:()=>void;onFailure?:()=>void}){
 const transitions=useMemo(createTransitionController,[]),reduced=useRef(false);
 const snapshot=useSyncExternalStore(transitions.subscribe,transitions.getSnapshot,transitions.getSnapshot);
 useEffect(()=>{if(pose==='exterior')transitions.overview();else if(pose==='half')transitions.setProgress(.5);else if(pose==='exploded')transitions.stack();else transitions.selectFloor(2);},[pose,transitions]);
 useEffect(()=>{if(pose==='room'&&!snapshot.busy&&snapshot.roomId===null)transitions.selectRoom('6206');},[snapshot,pose,transitions]);
 return <div className="landing-canvas" data-scene-ready={!snapshot.busy&&(pose!=='room'||snapshot.roomId==='6206')}>
  <Canvas orthographic frameloop="demand" dpr={[1,1.5]} camera={{position:[90,65,110],zoom:6,near:.1,far:500}} shadows gl={{antialias:true,alpha:true}}
   onCreated={({gl})=>{gl.shadowMap.type=PCFSoftShadowMap;gl.shadowMap.autoUpdate=false;gl.shadowMap.needsUpdate=true;}}
   fallback={<span>Architectural preview unavailable</span>}>
   <ambientLight intensity={1.3}/><hemisphereLight args={['#FFFCFC','#9B829A',1.2]}/>
   <directionalLight position={[-30,95,45]} intensity={2.6} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-70} shadow-camera-right={70} shadow-camera-top={90} shadow-camera-bottom={-80} shadow-camera-near={1} shadow-camera-far={220} shadow-bias={-.0008} shadow-normalBias={.08}/>
   <TransitionClock transitions={transitions} reduced={reduced}/>
   <BuildingModel presentation={pose==='exterior'?'exterior':'full'} controller={transitions.explosion} focus={transitions.focus} selectedFloor={snapshot.presentedFloor} transitions={transitions} selectedRoom={snapshot.roomId} hoveredRoom={null} mapMode="room" visuals={visuals} onRoomSelect={noop} onRoomHover={noop}/>
   <CameraRig layout="presentation" command={snapshot.command} controller={transitions.explosion} focus={transitions.focus} reduced={reduced} transitions={transitions} selectedRoom={snapshot.roomId}/>
   <Lifecycle onReady={onReady} onFailure={onFailure}/>
  </Canvas>
 </div>;
}
