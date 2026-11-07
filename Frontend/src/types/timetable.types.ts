export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';

export type ExpectedOccupancyStatus = 'SCHEDULED' | 'VACANT' | 'BREAK' | 'CANCELLED';

export interface TimeSlot {
  id: string;
  label: string;
  startMinutes: number;
  endMinutes: number;
  isBreak: boolean;
  breakType?: 'SHORT_BREAK' | 'LUNCH_BREAK';
}

export interface ScheduledLecture {
  id: string;
  day: DayOfWeek;
  slotLabel: string;
  startMinutes: number;
  endMinutes: number;
  roomId: string;
  subject: string;
  faculty: string;
  division: string;
  batch?: string;
  isCancelled?: boolean;
}

export interface RoomOccupancyProfile {
  roomId: string;
  day: DayOfWeek;
  currentMinutes: number;
  expectedStatus: ExpectedOccupancyStatus;
  currentLecture?: ScheduledLecture;
  nextLecture?: ScheduledLecture;
  minutesUntilNext?: number;
}
