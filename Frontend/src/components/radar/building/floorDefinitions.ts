import { BUILDING, FOOTPRINT_SPANS } from './architecture';
import { floor1 } from './plans/floor1';
import { floor2 } from './plans/floor2';
import { floor3 } from './plans/floor3';
import { floor4 } from './plans/floor4';
import { floor5 } from './plans/floor5';
import { ROOM_TYPES, trace } from './planTypes';
import type { FloorDefinition, PlanRoom, RoomTrace, PlanPoint } from './planTypes';
import { planRect, rectangle } from './planGeometry';

export const FLOOR_NAMES=['First Floor','Second Floor','Third Floor','Fourth Floor','Fifth Floor'];
export const PLAN_REFERENCES=['Updated PCCOE Building 6 Floor Plan.png','PCCOE Building 6 Second-Floor Plan.png','PCCOE Building 6 – Third Floor Plan.png','Building No. 6 – Fourth Floor Plan.png','PCCOE Building 6 Fifth-Floor Plan.png'];
function buildSpace(floor:number, source:RoomTrace):PlanRoom {
  const number=/^6\d{3}$/.test(source.key)?source.key:undefined, id=number??`f${floor}-${source.key}`;
  const uid=`b6:f${floor}:${source.key}`,rect=planRect(source.rect);
  const doors=source.doors.map(([side,start,end,corridor])=>({edge:({north:0,east:1,south:2,west:3})[side],
    span:(side==='south'||side==='west'?[1-end,1-start]:[start,end]) as [number,number],corridor:`f${floor}-corridor-${corridor}`,certainty:'diagram' as const}));
  const room:PlanRoom = {id,uid,namespace:'pccoe-building-6',floor,number,label:number??source.name??ROOM_TYPES[source.kind],
    name:source.name??`${ROOM_TYPES[source.kind]}${number?` ${number}`:''}`,kind:source.kind,aliases:source.aliases??[],
    rect:source.rect,polygon:rectangle(rect.x,rect.z,rect.width,rect.depth),labelPosition:[rect.x,rect.z],doors,
    energyKey:uid,occupancyKey:uid,note:source.note};
  // User correction: there is no passage along the front of this room row.
  // Extend its rooms to the existing facade without widening the building.
  if(source.rect[0]===320 && source.rect[1]>=478) {
    room.polygon=room.polygon.map(([x,z])=>[x,z>rect.z ? BUILDING.frontZ : z]);
    room.labelPosition=[rect.x,(rect.z-rect.depth/2+BUILDING.frontZ)/2];
    room.doors=room.doors.map(door=>({...door,corridor:undefined}));
    room.note=[source.note,'Front corridor removed by architectural correction. Door opening locations follow the diagram; their access routes need verification.'].filter(Boolean).join(' ');
  }
  return room;
}
function facilities(floor:number) {
  const stairs=BUILDING.towerX.map((x,index)=>{
    const room=buildSpace(floor,trace(`stair-${index===0?'north':'south'}`,'STAIR',[215,355,270,515],[],{name:`${index===0?'North':'South'} entrance staircase`,note:'Curved geometry follows the approved entrance tower; drawing dimensions are conceptual.'}));
    room.polygon=Array.from({length:17},(_,i)=>{const theta=-Math.PI/2+i*Math.PI/16;return [x+Math.sin(theta)*BUILDING.towerRadius,BUILDING.towerZ+Math.cos(theta)*BUILDING.towerRadius] as PlanPoint;});
    room.labelPosition=[x,BUILDING.towerZ+1];room.doors=[{edge:16,span:[.3,.7],corridor:`f${floor}-landing-${index===0?'north':'south'}`,certainty:'diagram'}];return room;
  });
  const rear=buildSpace(floor,trace('lift-north','LIFT',[1020,310,1070,365],[],{name:'North lift',note:'User correction identifies this core as a lift. Its footprint is compressed inward to fit the approved rear setback.'}));
  rear.polygon=rectangle(-24.5,-5.8,3.6,1.4);rear.labelPosition=[-24.5,-5.8];rear.doors=[{edge:0,span:[.2,.8],corridor:`f${floor}-corridor-north`,certainty:'diagram'}];
  const lift=buildSpace(floor,trace('lift','LIFT',[985,1040,1070,1120],[],{name:'Lift',note:'Diagram core is compressed inward at the approved rear setback; exact dimensions are unverified.'}));
  lift.polygon=rectangle(26.3,-5.8,3.6,1.4);lift.labelPosition=[26.3,-5.8];lift.doors=[{edge:0,span:[.2,.8],corridor:`f${floor}-corridor-south`,certainty:'diagram'}];
  const landings=[
    trace('landing-north','OTHER',[215,370,320,478],[],{name:'North stair landing'}),
    trace('landing-south','OTHER',[215,995,320,1050],[],{name:'South stair landing'}),
  ].map(space=>buildSpace(floor,space));
  return [...stairs,rear,lift,...landings];
}
function circulation(floor:number) {
  return [
    trace('corridor-north','CORRIDOR',[215,310,1018,370],[],{name:'North corridor'}),
    trace('corridor-east','CORRIDOR',[795,370,855,1050],[],{name:'East corridor'}),
    trace('corridor-south','CORRIDOR',[270,1050,985,1125],[],{name:'South corridor'}),
    trace('passage-east-north','CORRIDOR',[855,565,1070,595],[],{name:'Passage between rooms 10 and 11'}),
    trace('passage-east-south','CORRIDOR',[855,845,1070,875],[],{name:'Passage between rooms 14 and 15'}),
  ].map(space=>buildSpace(floor,space));
}
function boundary():PlanPoint[] {
  const points:PlanPoint[]=[[-36,9],[36,9],[36,FOOTPRINT_SPANS[6].back]];
  for(let i=FOOTPRINT_SPANS.length-1;i>=0;i--) {
    const span=FOOTPRINT_SPANS[i];points.push([span.start,span.back]);
    if(i>0)points.push([span.start,FOOTPRINT_SPANS[i-1].back]);
  }
  return points;
}
const sources=[floor1,floor2,floor3,floor4,floor5];
export const FLOOR_DEFINITIONS:FloorDefinition[]=sources.map((source,index)=>{
  const floor=index+1,rooms=source.map(room=>buildSpace(floor,room)),core=facilities(floor),paths=circulation(floor);
  return {floor,source:PLAN_REFERENCES[index],rooms,facilities:core,circulation:paths,spaces:[...rooms,...core,...paths],boundary:boundary(),
    notes:['Conceptual drawing normalized to the approved narrow footprint, not surveyed CAD.','Unlabelled central region remains unassigned floor surface; no extra rooms or courtyard were invented.','Door locations follow legible diagram arcs; doorway widths are normalized for presentation.']};
});
export const FLOOR_PLANS=FLOOR_DEFINITIONS.map(floor=>floor.spaces);
