export type RoomType = 'CLASSROOM' | 'LABORATORY' | 'SEMINAR_HALL';

export interface ApplianceState {
  id: string;
  name: string;
  type: 'FAN' | 'LIGHT' | 'AC' | 'PROJECTOR' | 'COMPUTER';
  count: number;
  wattageEach: number;
  isOn: boolean;
}

export interface RoomMetadata {
  id: string;
  name: string;
  block: string;
  floor: number;
  roomType: RoomType;
  capacity: number;
  department: string;
  hasAc: boolean;
  hasProjector: boolean;
  smartBoard?: boolean;
}

export interface RoomState {
  metadata: RoomMetadata;
  appliances: ApplianceState[];
  isEcoOff: boolean;
}
