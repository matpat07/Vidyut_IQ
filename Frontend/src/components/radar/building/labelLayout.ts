import {FLOOR_PLANS,ROOM_TYPES} from './floorPlans';
export interface LabelCandidate {id:string;x:number;y:number;width:number;height:number;priority:number}
export interface LabelArea {left:number;top:number;right:number;bottom:number}
/** Stable priority order: selected, hovered, numbered rooms, then facilities. */
export function layoutLabels(candidates:LabelCandidate[],area:LabelArea):Set<string> {
  const visible=new Set<string>(), boxes:LabelArea[]=[];
  for(const item of [...candidates].sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id))) {
    const box={left:item.x-item.width/2-2,right:item.x+item.width/2+2,top:item.y-item.height/2-2,bottom:item.y+item.height/2+2};
    if(box.left<area.left||box.right>area.right||box.top<area.top||box.bottom>area.bottom)continue;
    if(boxes.some(other=>box.left<other.right&&box.right>other.left&&box.top<other.bottom&&box.bottom>other.top))continue;
    boxes.push(box);visible.add(item.id);
  }
  return visible;
}
export function filterPlanSpaces(query:string,floor?:number) {
  const tokens=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return FLOOR_PLANS.flat().filter(room=>(!floor||room.floor===floor)&&tokens.every(token=>
    `${room.id} ${room.label} ${room.number??''} ${room.aliases.join(' ')} ${room.name} ${ROOM_TYPES[room.kind]} F${room.floor}`.toLowerCase().includes(token)));
}
