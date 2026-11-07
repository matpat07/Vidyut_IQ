import type { RoomMetadata } from '../../../types/room.types';
import { FOOTPRINT_SPANS } from './architecture';

export type PlanKind = 'LAB' | 'CR' | 'CABIN' | 'WF' | 'DATA';
export interface PlanRoom {
  id: string; floor: number; number?: string; label: string; kind: PlanKind;
  // Conceptual drawing pixels, normalized onto the approved narrow envelope.
  rect: [number, number, number, number];
}
export const FLOOR_NAMES = ['First Floor', 'Second Floor', 'Third Floor', 'Fourth Floor', 'Fifth Floor'];
export const PLAN_REFERENCES = [
  'Updated PCCOE Building 6 Floor Plan.png', 'PCCOE Building 6 Second-Floor Plan.png',
  'PCCOE Building 6 – Third Floor Plan.png', 'Building No. 6 – Fourth Floor Plan.png',
  'PCCOE Building 6 Fifth-Floor Plan.png',
];

/** Drawing north maps to -X; drawing west (entrances) maps to +Z. Not CAD metres. */
export function planRect([left, top, right, bottom]: PlanRoom['rect']) {
  const x = ((top + bottom) / 2 - 700) * 72 / 1070, width = (bottom - top) * 72 / 1070;
  // Preserve the approved shallow rear setbacks: conceptual rectangular plans
  // cannot extend rooms beyond the narrower exterior footprint.
  const back = Math.max(...FOOTPRINT_SPANS.filter(span => span.start < x + width / 2 && span.end > x - width / 2).map(span => span.back)) + .2;
  const z0 = Math.max(back, 9 - (right - 210) * 18 / 870);
  const z1 = Math.min(8.7, 9 - (left - 210) * 18 / 870);
  return { x, z: (z0 + z1) / 2, width, depth: z1 - z0 };
}
function createPlan(floor: number): PlanRoom[] {
  const rooms: PlanRoom[] = [];
  const add = (suffix: string | null, kind: PlanKind, rect: PlanRoom['rect'], key?: string) => {
    const number = suffix ? `6${floor}${suffix}` : undefined;
    rooms.push({ id: number ?? `f${floor}-${key}`, number, floor, kind, rect,
      label: number ?? (kind === 'WF' ? `Washroom (${key?.endsWith('north') ? 'north' : 'south'})` : kind === 'DATA' ? 'Data Centre' : `Cabin (${key?.startsWith('north') ? 'north' : 'west'})`) });
  };
  if (floor <= 3) {
    add('05', 'LAB', [215,165,500,245]); add('06', 'LAB', [215,245,390,310]);
    add(null, 'CABIN', [390,245,500,310], 'north-cabin');
    add('07', 'LAB', [500,165,805,305]); add('08', 'CABIN', [805,165,1070,305]);
  } else {
    add('06', 'LAB', [215,165,500,305]); add('07', 'LAB', [500,165,805,305]); add('08', 'LAB', [805,165,1070,305]);
  }
  add('04', 'LAB', [320,478,500,590]); add('03', 'CR', [320,590,500,680]);
  if (floor === 1) {
    add('02', 'CR', [320,815,500,900]); add(null, 'DATA', [320,900,500,990], 'data-centre');
  } else {
    add(null, 'CABIN', [320,688,500,748], 'west-cabin');
    add('02', floor >= 4 ? 'LAB' : 'CR', [320,748,500,845]);
    // The unlabelled white bay above 6x01 has no invented room ID or purpose.
    add('01', 'CR', [320,905,500,995]);
  }
  add('09', 'CR', [860,370,1070,460]); add('10', floor >= 4 ? 'CR' : 'LAB', [860,460,1070,565]);
  add('11', 'CABIN', [860,595,1070,670]);
  add(null, 'WF', [890,670,1070,720], 'washroom-north'); add(null, 'WF', [890,720,1070,765], 'washroom-south');
  add('14', floor >= 4 ? 'CR' : 'CABIN', [860,765,1070,845]);
  add('15', floor >= 4 ? 'CR' : 'LAB', [860,875,1070,960]); add('17', 'CABIN', [860,960,1070,1040]);
  if (floor === 1) {
    add('20', 'LAB', [215,1125,480,1230]); add('19', 'LAB', [480,1125,785,1230]); add('18', 'LAB', [785,1125,1070,1230]);
  } else {
    add('21', 'LAB', [215,1125,400,1230]); add('20', floor >= 4 ? 'CABIN' : 'LAB', [400,1125,590,1230]);
    add('19', floor >= 4 ? 'CABIN' : 'LAB', [590,1125,785,1230]); add('18', 'LAB', [785,1125,1070,1230]);
  }
  return rooms;
}
export const FLOOR_PLANS = [1, 2, 3, 4, 5].map(createPlan);
export const PLAN_MARKERS = [
  { label: 'Stair', x: -22.5, z: 10.2 }, { label: 'Stair', x: 22.5, z: 10.2 },
  { label: 'Rear stair', x: -24.5, z: -5.8 }, { label: 'Lift', x: 26.3, z: -5.8 },
  { label: 'Corridor', x: 0, z: 8 }, { label: 'Corridor', x: 0, z: -3.7 },
];
export interface FloorNavigation { floor: number | null; room: string | null }
export type FloorAction = { type: 'floor'; floor: number } | { type: 'room'; room: string } | { type: 'exit' };
export function floorNavigation(state: FloorNavigation, action: FloorAction): FloorNavigation {
  if (action.type === 'exit') return { floor: null, room: null };
  if (action.type === 'floor') return Number.isInteger(action.floor) && action.floor >= 1 && action.floor <= 5 ? { floor: action.floor, room: null } : state;
  return state.floor !== null && FLOOR_PLANS[state.floor - 1].some(room => room.id === action.room) ? { ...state, room: action.room } : state;
}

/** Match number AND floor/block. A contradictory type is not a supported link. */
export function resolvePlanRoom(room: PlanRoom, records: RoomMetadata[]) {
  const candidate = room.number && records.find(record => record.block === 'Block 6' && record.floor === room.floor && record.id.match(/^\d+/)?.[0] === room.number);
  if (!candidate) return { roomId: null, reason: 'No telemetry mapped to this room.' };
  const type = room.kind === 'LAB' ? 'LABORATORY' : room.kind === 'CR' ? 'CLASSROOM' : null;
  if (candidate.roomType !== type) return { roomId: null, reason: `Plan: ${room.kind}. Dataset: ${candidate.roomType.toLowerCase()}. Mapping needs verification.` };
  return { roomId: candidate.id, reason: null };
}
