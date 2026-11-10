import type {RoomViewData} from '../context/SimulationContext';
import type {DayOfWeek,TimeSlot} from '../types/timetable.types';

/** Presentation derived from current simulation records; never a latched preset. */
export function getDemoScenario(day:DayOfWeek,minutes:number,rooms:readonly RoomViewData[],slot?:Pick<TimeSlot,'breakType'>) {
  if(!rooms.length)return null;
  const powered=rooms.some(room=>room.roomState.appliances.some(appliance=>appliance.isOn));
  const suffix=powered?'Some configured appliances remain powered on.':'Configured appliances are switched off; modeled standby remains.';
  const has=(status:string)=>rooms.some(room=>room.occupancyProfile.expectedStatus===status);
  if(has('BREAK'))return {label:slot?.breakType==='LUNCH_BREAK'?'Lunch Break':'Scheduled Break',description:`${day}: the timetable marks a break with low expected occupancy. ${suffix}`};
  if(has('CANCELLED'))return {label:'Cancelled Lecture',description:`${day}: a timetable entry is cancelled in software. ${suffix}`};
  if(minutes>=1080)return {label:'After Hours',description:`${day}: the simulation is at or after 6 PM. ${suffix}`};
  if(has('SCHEDULED'))return {label:'Scheduled Classes',description:`${day}: the timetable includes scheduled classes and modeled occupancy. Rules continue to assess other rooms.`};
  if(rooms.some(room=>room.metadata.roomType==='LABORATORY'&&room.occupancyProfile.expectedStatus==='VACANT'&&room.roomState.appliances.some(appliance=>appliance.isOn)))return {label:'Idle Laboratory',description:`${day}: a laboratory has no scheduled class while configured appliances remain on.`};
  return null;
}
