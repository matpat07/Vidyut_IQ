import type { RoomMetadata } from '../../../types/room.types';
import type { PlanRoom } from './planTypes';

/** Geometry has no fabricated telemetry. Resolve against the existing live records. */
export function resolvePlanRoom(room:PlanRoom, records:RoomMetadata[]) {
  const numbers=[room.number,...room.aliases].filter(Boolean);
  const candidates=records.filter(record=>record.block==='Block 6'&&record.floor===room.floor&&numbers.includes(record.id.match(/^\d+/)?.[0]));
  const type=room.kind==='LAB'?'LABORATORY':room.kind==='CR'?'CLASSROOM':null;
  if(candidates.length>1)return {roomId:null,energyId:null,scheduleId:null,reason:'Multiple source records refer to this physical space. Mapping needs verification.'};
  const candidate=candidates[0];
  if(!candidate)return {roomId:null,energyId:null,scheduleId:null,reason:'No telemetry mapped to this space.'};
  if(candidate.roomType!==type)return {roomId:null,energyId:null,scheduleId:null,reason:`Plan: ${room.kind}. Dataset: ${candidate.roomType.toLowerCase()}. Mapping needs verification.`};
  return {roomId:candidate.id,energyId:candidate.id,scheduleId:candidate.id,reason:null};
}
