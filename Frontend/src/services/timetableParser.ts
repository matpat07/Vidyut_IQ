import { DayOfWeek, ScheduledLecture, TimeSlot, ExpectedOccupancyStatus, RoomOccupancyProfile } from '../types/timetable.types';

// Standard PCCOE College Time Slots defined across all 10 CSVs
export const STANDARD_TIME_SLOTS: TimeSlot[] = [
  { id: 'slot-1', label: '09:00 - 10:00 AM', startMinutes: 540, endMinutes: 600, isBreak: false },
  { id: 'slot-2', label: '10:00 - 11:00 AM', startMinutes: 600, endMinutes: 660, isBreak: false },
  { id: 'slot-break-1', label: '11:00 - 11:10 AM', startMinutes: 660, endMinutes: 670, isBreak: true, breakType: 'SHORT_BREAK' },
  { id: 'slot-3', label: '11:10 - 12:10 PM', startMinutes: 670, endMinutes: 730, isBreak: false },
  { id: 'slot-4', label: '12:10 - 01:10 PM', startMinutes: 730, endMinutes: 790, isBreak: false },
  { id: 'slot-break-2', label: '01:10 - 02:10 PM', startMinutes: 790, endMinutes: 850, isBreak: true, breakType: 'LUNCH_BREAK' },
  { id: 'slot-5', label: '02:10 - 03:10 PM', startMinutes: 850, endMinutes: 910, isBreak: false },
  { id: 'slot-6', label: '03:10 - 04:10 PM', startMinutes: 910, endMinutes: 970, isBreak: false },
  { id: 'slot-7', label: '04:10 - 05:10 PM', startMinutes: 970, endMinutes: 1030, isBreak: false },
  { id: 'slot-8', label: '05:10 - 06:10 PM', startMinutes: 1030, endMinutes: 1090, isBreak: false },
];

// Ingested & normalized schedule entries extracted from the 10 timetable CSVs
export const INSTITUTIONAL_SCHEDULE: ScheduledLecture[] = [
  // --- MONDAY (PCCOE Real Timetable Data) ---
  // SY Comp Div A
  { id: 'lec-m-1', day: 'MON', slotLabel: '09:00 - 10:00 AM', startMinutes: 540, endMinutes: 600, roomId: '6107LA', subject: 'DSAL (NK) Lab', faculty: 'Prof. N. Kulkarni', division: 'SY-COMP-A', batch: 'A1' },
  { id: 'lec-m-2', day: 'MON', slotLabel: '09:00 - 10:00 AM', startMinutes: 540, endMinutes: 600, roomId: '6115LA', subject: 'MAL (NG) Lab', faculty: 'Prof. N. Gaikwad', division: 'SY-COMP-A', batch: 'A2' },
  { id: 'lec-m-3', day: 'MON', slotLabel: '09:00 - 10:00 AM', startMinutes: 540, endMinutes: 600, roomId: '6216LA', subject: 'DE&VL Lab', faculty: 'Prof. Suvarna P.', division: 'SY-COMP-A', batch: 'A3' },
  { id: 'lec-m-4', day: 'MON', slotLabel: '11:10 - 12:10 PM', startMinutes: 670, endMinutes: 730, roomId: '6102CR', subject: 'Mathematics (MA)', faculty: 'Prof. N. Gaikwad', division: 'SY-COMP-A' },
  { id: 'lec-m-5', day: 'MON', slotLabel: '02:10 - 03:10 PM', startMinutes: 850, endMinutes: 910, roomId: '6102CR', subject: 'FoPS', faculty: 'Prof. Sonika G.', division: 'SY-COMP-A' },
  { id: 'lec-m-6', day: 'MON', slotLabel: '03:10 - 04:10 PM', startMinutes: 910, endMinutes: 970, roomId: '6115LA', subject: 'DSAL (NK) Lab', faculty: 'Prof. N. Kulkarni', division: 'SY-COMP-A', batch: 'A3' },
  { id: 'lec-m-7', day: 'MON', slotLabel: '03:10 - 04:10 PM', startMinutes: 910, endMinutes: 970, roomId: '6216LA', subject: 'DE&VL Lab', faculty: 'Prof. Suvarna P.', division: 'SY-COMP-A', batch: 'A4' },
  { id: 'lec-m-8', day: 'MON', slotLabel: '04:10 - 05:10 PM', startMinutes: 970, endMinutes: 1030, roomId: '6103CR', subject: 'Computer Networks', faculty: 'Prof. Akansha M.', division: 'SY-COMP-A' },
  { id: 'lec-m-9', day: 'MON', slotLabel: '05:10 - 06:10 PM', startMinutes: 1030, endMinutes: 1090, roomId: '6201CR', subject: 'Universal Human Values', faculty: 'Prof. S. Sharma', division: 'SY-COMP-A' },

  // TY Comp Div B (Electives & MDM)
  { id: 'lec-m-10', day: 'MON', slotLabel: '09:00 - 10:00 AM', startMinutes: 540, endMinutes: 600, roomId: '6206LA', subject: 'IoT Lab (SCK)', faculty: 'Prof. S. C. Karad', division: 'TY-COMP-B', batch: 'B1' },
  { id: 'lec-m-11', day: 'MON', slotLabel: '09:00 - 10:00 AM', startMinutes: 540, endMinutes: 600, roomId: '6208LA', subject: 'IoT Lab (DipaliP)', faculty: 'Prof. Dipali P.', division: 'TY-COMP-B', batch: 'B2' },
  { id: 'lec-m-12', day: 'MON', slotLabel: '09:00 - 10:00 AM', startMinutes: 540, endMinutes: 600, roomId: '6210LA', subject: 'CGG Lab (PG)', faculty: 'Prof. P. Gund', division: 'TY-COMP-B', batch: 'B1' },
  { id: 'lec-m-13', day: 'MON', slotLabel: '11:10 - 12:10 PM', startMinutes: 670, endMinutes: 730, roomId: '6204CR', subject: 'MDM-1 Data Science', faculty: 'Prof. S. Agarwal', division: 'TY-COMP-B' },
  { id: 'lec-m-14', day: 'MON', slotLabel: '12:10 - 01:10 PM', startMinutes: 730, endMinutes: 790, roomId: '6102CR', subject: 'PEC-1 CGG Elective Track', faculty: 'Prof. P. Gund', division: 'TY-COMP-A+B' },
  { id: 'lec-m-15', day: 'MON', slotLabel: '12:10 - 01:10 PM', startMinutes: 730, endMinutes: 790, roomId: '6103CR', subject: 'PEC-1 CGG-2 Track', faculty: 'Prof. H. Mahajan', division: 'TY-COMP-C+D' },
  { id: 'lec-m-16', day: 'MON', slotLabel: '12:10 - 01:10 PM', startMinutes: 730, endMinutes: 790, roomId: '6201CR', subject: 'PEC-1 IoT Track 1', faculty: 'Prof. S. C. Karad', division: 'TY-COMP-A+B' },
  { id: 'lec-m-17', day: 'MON', slotLabel: '12:10 - 01:10 PM', startMinutes: 730, endMinutes: 790, roomId: '6202CR', subject: 'PEC-1 IoT Track 2', faculty: 'Prof. Dipali P.', division: 'TY-COMP-B+C' },
  { id: 'lec-m-18', day: 'MON', slotLabel: '02:10 - 03:10 PM', startMinutes: 850, endMinutes: 910, roomId: '6204CR', subject: 'Theory of Computation', faculty: 'Prof. H. Thombare', division: 'TY-COMP-B' },
  
  // SY CSE AIML Div A
  { id: 'lec-m-19', day: 'MON', slotLabel: '09:00 - 10:00 AM', startMinutes: 540, endMinutes: 600, roomId: '6518LA', subject: 'DSL Lab (SP)', faculty: 'Prof. S. Patil', division: 'SY-AIML-A', batch: 'A1' },
  { id: 'lec-m-20', day: 'MON', slotLabel: '11:10 - 12:10 PM', startMinutes: 670, endMinutes: 730, roomId: '5209CR', subject: 'FM & AI Theory', faculty: 'Prof. R. Lonkar', division: 'SY-AIML-A' },
  { id: 'lec-m-21', day: 'MON', slotLabel: '03:10 - 04:10 PM', startMinutes: 910, endMinutes: 970, roomId: '5211CR', subject: 'Machine Learning', faculty: 'Prof. M. Patel', division: 'SY-AIML-A' },

  // --- TUESDAY ---
  { id: 'lec-t-1', day: 'TUE', slotLabel: '09:00 - 10:00 AM', startMinutes: 540, endMinutes: 600, roomId: '6201CR', subject: 'Data Structures & Algorithms', faculty: 'Prof. S. D. Patil', division: 'SY-COMP-A' },
  { id: 'lec-t-2', day: 'TUE', slotLabel: '10:00 - 11:00 AM', startMinutes: 600, endMinutes: 660, roomId: '6107LA', subject: 'DSAL (NK) Lab', faculty: 'Prof. N. Kulkarni', division: 'SY-COMP-A', batch: 'A2' },
  { id: 'lec-t-3', day: 'TUE', slotLabel: '11:10 - 12:10 PM', startMinutes: 670, endMinutes: 730, roomId: '6201CR', subject: 'Machine Learning Theory', faculty: 'Prof. P. Salunke', division: 'TY-COMP-B' },
  { id: 'lec-t-4', day: 'TUE', slotLabel: '12:10 - 01:10 PM', startMinutes: 730, endMinutes: 790, roomId: '6102CR', subject: 'MDM-1 Data Science', faculty: 'Prof. S. Agarwal', division: 'TY-COMP-B' },
  { id: 'lec-t-5', day: 'TUE', slotLabel: '02:10 - 03:10 PM', startMinutes: 850, endMinutes: 910, roomId: '6104LA', subject: 'PSDS Data Science Lab', faculty: 'Prof. Akansha M.', division: 'TY-COMP-B', batch: 'B2' },

  // --- WEDNESDAY ---
  { id: 'lec-w-1', day: 'WED', slotLabel: '09:00 - 10:00 AM', startMinutes: 540, endMinutes: 600, roomId: '6201CR', subject: 'Machine Learning', faculty: 'Prof. P. Salunke', division: 'TY-COMP-B' },
  { id: 'lec-w-2', day: 'WED', slotLabel: '10:00 - 11:00 AM', startMinutes: 600, endMinutes: 660, roomId: '6201CR', subject: 'Computer Networks', faculty: 'Prof. Akansha M.', division: 'TY-COMP-B' },
  { id: 'lec-w-3', day: 'WED', slotLabel: '11:10 - 12:10 PM', startMinutes: 670, endMinutes: 730, roomId: '6204CR', subject: 'Theory of Computation', faculty: 'Prof. H. Thombare', division: 'TY-COMP-B' },
  { id: 'lec-w-4', day: 'WED', slotLabel: '02:10 - 03:10 PM', startMinutes: 850, endMinutes: 910, roomId: '6208LA', subject: 'IoT Lab 2', faculty: 'Prof. Dipali P.', division: 'TY-COMP-B', batch: 'B3' },
  { id: 'lec-w-5', day: 'WED', slotLabel: '02:10 - 03:10 PM', startMinutes: 850, endMinutes: 910, roomId: '6210LA', subject: 'CGG Lab', faculty: 'Prof. P. Gund', division: 'TY-COMP-B', batch: 'B2' },

  // --- THURSDAY ---
  { id: 'lec-th-1', day: 'THU', slotLabel: '09:00 - 10:00 AM', startMinutes: 540, endMinutes: 600, roomId: '6201CR', subject: 'Data Structures & Algorithms', faculty: 'Prof. S. D. Patil', division: 'SY-COMP-A' },
  { id: 'lec-th-2', day: 'THU', slotLabel: '11:10 - 12:10 PM', startMinutes: 670, endMinutes: 730, roomId: '9510CR', subject: 'DSA Advanced Session', faculty: 'Prof. S. Patil', division: 'SY-AIML-A' },
  { id: 'lec-th-3', day: 'THU', slotLabel: '03:10 - 04:10 PM', startMinutes: 910, endMinutes: 970, roomId: '6204CR', subject: 'Artificial Intelligence', faculty: 'Prof. M. Patel', division: 'TY-COMP-B' },

  // --- FRIDAY ---
  { id: 'lec-f-1', day: 'FRI', slotLabel: '09:00 - 10:00 AM', startMinutes: 540, endMinutes: 600, roomId: '6107LA', subject: 'DSAL (NK) Lab', faculty: 'Prof. N. Kulkarni', division: 'SY-COMP-A', batch: 'A4' },
  { id: 'lec-f-2', day: 'FRI', slotLabel: '11:10 - 12:10 PM', startMinutes: 670, endMinutes: 730, roomId: '6204CR', subject: 'Computer Networks', faculty: 'Prof. Akansha M.', division: 'TY-COMP-B' },
  { id: 'lec-f-3', day: 'FRI', slotLabel: '12:10 - 01:10 PM', startMinutes: 730, endMinutes: 790, roomId: '6204CR', subject: 'Artificial Intelligence', faculty: 'Prof. M. Patel', division: 'TY-COMP-B' },
  { id: 'lec-f-4', day: 'FRI', slotLabel: '04:10 - 05:10 PM', startMinutes: 970, endMinutes: 1030, roomId: '6107LA', subject: 'HONOR CLC Cloud Lab', faculty: 'Prof. A. Mulik', division: 'HONORS-COMP' },
  { id: 'lec-f-5', day: 'FRI', slotLabel: '04:10 - 05:10 PM', startMinutes: 970, endMinutes: 1030, roomId: '6104LA', subject: 'MINOR PSDS Data Lab', faculty: 'Prof. Akansha M.', division: 'MINORS-COMP' },
];

export function getRoomOccupancyProfile(
  roomId: string,
  day: DayOfWeek,
  currentMinutes: number,
  cancelledLectureIds: Set<string> = new Set()
): RoomOccupancyProfile {
  // Check if current time falls in a campus-wide break
  const activeBreakSlot = STANDARD_TIME_SLOTS.find(
    s => s.isBreak && currentMinutes >= s.startMinutes && currentMinutes < s.endMinutes
  );

  if (activeBreakSlot) {
    return {
      roomId,
      day,
      currentMinutes,
      expectedStatus: 'BREAK',
    };
  }

  // Find lectures for this room on this day
  const roomLectures = INSTITUTIONAL_SCHEDULE.filter(
    lec => lec.roomId === roomId && lec.day === day
  );

  // Check if a lecture is currently ongoing
  const currentLecture = roomLectures.find(
    lec => currentMinutes >= lec.startMinutes && currentMinutes < lec.endMinutes
  );

  if (currentLecture) {
    const isCancelled = cancelledLectureIds.has(currentLecture.id) || currentLecture.isCancelled;
    return {
      roomId,
      day,
      currentMinutes,
      expectedStatus: isCancelled ? 'CANCELLED' : 'SCHEDULED',
      currentLecture: {
        ...currentLecture,
        isCancelled,
      },
    };
  }

  // Find next upcoming lecture
  const upcomingLectures = roomLectures
    .filter(lec => lec.startMinutes > currentMinutes)
    .sort((a, b) => a.startMinutes - b.startMinutes);

  const nextLecture = upcomingLectures[0];
  const minutesUntilNext = nextLecture ? nextLecture.startMinutes - currentMinutes : undefined;

  return {
    roomId,
    day,
    currentMinutes,
    expectedStatus: 'VACANT',
    nextLecture,
    minutesUntilNext,
  };
}
