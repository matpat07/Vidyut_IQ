export type PlanKind = 'LAB' | 'CR' | 'CABIN' | 'WF' | 'DATA' | 'STAIR' | 'LIFT' | 'CORRIDOR' | 'OTHER';
export type PlanPoint = [number, number]; // scene X/Z
export type DrawingRect = [number, number, number, number];
export type DoorTrace = ['north' | 'east' | 'south' | 'west', number, number, string];
export interface RoomTrace {
  key: string; kind: PlanKind; rect: DrawingRect; doors: DoorTrace[];
  name?: string; aliases?: string[]; note?: string;
}
export interface PlanDoor { edge: number; span: [number, number]; corridor?: string; certainty: 'diagram'; }
export interface PlanRoom {
  id: string; uid: string; namespace: 'pccoe-building-6'; floor: number;
  number?: string; label: string; name: string; kind: PlanKind; aliases: string[];
  rect: DrawingRect; polygon: PlanPoint[]; labelPosition: PlanPoint; doors: PlanDoor[];
  energyKey: string; occupancyKey: string; note?: string;
}
export interface FloorDefinition {
  floor: number; source: string; rooms: PlanRoom[]; facilities: PlanRoom[];
  circulation: PlanRoom[]; spaces: PlanRoom[]; boundary: PlanPoint[]; notes: string[];
}
export function trace(key: string, kind: PlanKind, rect: DrawingRect, doors: DoorTrace[] = [], options: Partial<Pick<RoomTrace, 'name' | 'aliases' | 'note'>> = {}): RoomTrace {
  return { key, kind, rect, doors, ...options };
}
export const ROOM_TYPES: Record<PlanKind, string> = {
  LAB: 'Laboratory', CR: 'Classroom', CABIN: 'Faculty cabin', WF: 'Washroom', DATA: 'Data Centre',
  STAIR: 'Staircase', LIFT: 'Lift', CORRIDOR: 'Corridor', OTHER: 'Unlabelled facility',
};
