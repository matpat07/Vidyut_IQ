import {createExplosionController} from './explosion';
import {createFloorFocus} from './floorFocus';
import {FLOOR_PLANS} from './floorPlans';

export type CameraState = 'EXTERIOR_OVERVIEW' | 'EXPLODING' | 'EXPLODED_OVERVIEW' | 'FLOOR_FOCUS' | 'ROOM_FOCUS';
export type CameraView = 'perspective' | 'front' | 'aerial' | 'top';
export interface ViewCommand {view: CameraView; zoom: number; revision: number}
interface Snapshot {
  state: CameraState; busy: boolean; requestedFloor: number | null; presentedFloor: number | null;
  roomId: string | null; command: ViewCommand;
}

/** One owner arbitrates camera intent. Frame poses remain outside React state. */
export function createTransitionController() {
  const explosion=createExplosionController(), focus=createFloorFocus();
  let requestedFloor:number|null=null, roomId:string|null=null, cameraMoving=true, orbiting=false;
  let command:ViewCommand={view:'perspective',zoom:1,revision:0};
  const listeners=new Set<()=>void>();
  const poseMoving=()=>explosion.current!==explosion.getSnapshot()||!focus.settled;
  const state=():CameraState=>{
    if(focus.amount>0&&!focus.returning)return roomId&&focus.floor===requestedFloor?'ROOM_FOCUS':'FLOOR_FOCUS';
    if(explosion.current===0&&explosion.getSnapshot()===0)return 'EXTERIOR_OVERVIEW';
    if(explosion.current>=.75&&explosion.getSnapshot()>=.75)return 'EXPLODED_OVERVIEW';
    return 'EXPLODING';
  };
  const snapshot=():Snapshot=>({state:state(),busy:cameraMoving||poseMoving()||orbiting,requestedFloor,presentedFloor:focus.floor,roomId,command});
  let current=snapshot();
  const publish=()=>{
    const next=snapshot();
    if((Object.keys(next) as (keyof Snapshot)[]).some(key=>next[key]!==current[key])){
      current=next;listeners.forEach(listener=>listener());
    }
  };
  const retarget=()=>{orbiting=false;cameraMoving=true;};
  const preset=(view:CameraView='perspective')=>{command={view,zoom:1,revision:command.revision+1};retarget();};
  const selectFloor=(floor:number)=>{
    if(!Number.isInteger(floor)||floor<1||floor>5)return;
    if(floor===requestedFloor&&roomId===null)return;
    requestedFloor=floor;roomId=null;focus.select(floor);explosion.set(1);preset();publish();
  };
  const setProgress=(value:number)=>{
    if(orbiting)return;
    requestedFloor=null;roomId=null;focus.select(null);explosion.set(value);
    if(command.view!=='perspective'||command.zoom!==1)preset();else retarget();
    publish();
  };
  return {
    explosion,focus,
    getSnapshot:()=>current,
    subscribe(listener:()=>void){listeners.add(listener);return ()=>{listeners.delete(listener);};},
    get orbiting(){return orbiting;},
    get canPick(){return !current.busy&&focus.interactive;},
    // Fiber records initial click hits on pointer-down, after OrbitControls has
    // begun its gesture. Keep those candidates; only pointer-up may select them.
    get canRaycast(){return focus.interactive&&(!current.busy||orbiting);},
    get canOrbit(){return !current.busy;},
    scrub:{getSnapshot:explosion.getSnapshot,set:setProgress},
    setProgress,selectFloor,
    stack(){orbiting=false;setProgress(1);preset();publish();},
    overview(){orbiting=false;setProgress(0);preset();publish();},
    selectRoom(id:string|null){
      if(id!==null&&(!this.canPick||!FLOOR_PLANS[(requestedFloor??0)-1]?.some(room=>room.id===id)))return;
      if(roomId===id)return;
      roomId=id;preset();publish();
    },
    inspectSpace(id:string){
      const room=FLOOR_PLANS.flat().find(space=>space.id===id);
      if(!room)return;
      if(requestedFloor!==room.floor)selectFloor(room.floor);
      roomId=id;preset();publish();
    },
    setView(view:CameraView){preset(view);publish();},
    zoomBy(delta:number){
      if(!Number.isFinite(delta))return;
      command={...command,zoom:Math.max(.7,Math.min(1.6,command.zoom+delta))};retarget();publish();
    },
    beginOrbit(){if(!this.canOrbit)return false;orbiting=true;publish();return true;},
    endOrbit(){if(!orbiting)return;orbiting=false;publish();},
    cameraStarted(){if(cameraMoving)return;cameraMoving=true;publish();},
    cameraSettled(){if(!cameraMoving)return;cameraMoving=false;publish();},
    advance(delta:number,reduced:boolean){
      const opening=explosion.advance(delta,reduced);
      const diving=focus.advance(delta,explosion.current,reduced);
      publish();return opening||diving;
    },
  };
}
export type TransitionController=ReturnType<typeof createTransitionController>;
