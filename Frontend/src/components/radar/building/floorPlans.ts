import { FLOOR_PLANS } from './floorDefinitions';
export { FLOOR_PLANS, FLOOR_DEFINITIONS, FLOOR_NAMES, PLAN_REFERENCES } from './floorDefinitions';
export { ROOM_TYPES } from './planTypes';
export type { PlanRoom, PlanKind, PlanPoint, FloorDefinition } from './planTypes';
export { planRect } from './planGeometry';
export { resolvePlanRoom } from './roomMappings';
export interface FloorNavigation { floor: number | null; room: string | null }
export type FloorAction = { type: 'floor'; floor: number } | { type: 'room'; room: string | null } | { type: 'exit' };
export function floorNavigation(state: FloorNavigation, action: FloorAction): FloorNavigation {
  if(action.type==='exit')return {floor:null,room:null};
  if(action.type==='floor')return Number.isInteger(action.floor)&&action.floor>=1&&action.floor<=5?{floor:action.floor,room:null}:state;
  if(action.room===null)return {...state,room:null};
  const room=state.floor===null?undefined:FLOOR_PLANS[state.floor-1].find(room=>room.id===action.room||room.uid===action.room||room.aliases.includes(action.room));
  return room?{...state,room:room.id}:state;
}
