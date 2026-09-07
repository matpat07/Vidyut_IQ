# Smart Classroom & Lab Availability System
## Backend Architecture, API Specification & Engine Implementation Blueprint

---

## 1. Backend Architecture & Project Structure

The backend is built as a robust, type-safe, and modular service layer utilizing Next.js App Router Server Endpoints / Node.js runtime, **Supabase (Managed PostgreSQL Database, Supabase Auth & Realtime)**, Prisma ORM, and Zod validation.

### 1.1. Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts                 # Environment variables validation (SUPABASE_URL, SUPABASE_ANON_KEY, etc.)
│   │   ├── constants.ts           # Operating hours (08:00 - 18:00), limits
│   │   ├── prisma.ts              # Singleton Prisma client instance (connected to Supabase)
│   │   └── supabase.ts            # Supabase Admin and Client SDK instances
│   ├── controllers/
│   │   ├── auth.controller.ts     # Supabase Auth integration, session verification
│   │   ├── room.controller.ts     # Room metadata & live inventory
│   │   ├── availability.controller.ts # Live & future availability engine endpoints
│   │   ├── booking.controller.ts  # Booking creation, cancellation, listing
│   │   ├── cancellation.controller.ts # Lecture cancellation & room release
│   │   ├── timetable.controller.ts# Master timetable CRUD & bulk ingestion
│   │   ├── admin.controller.ts    # User/Infrastructure management & audit logs
│   │   └── nlp.controller.ts      # Natural language query parser
│   ├── services/
│   │   ├── availability.service.ts# Core mathematical interval overlap & gap engine
│   │   ├── booking.service.ts     # Two-phase transaction & concurrency lock manager
│   │   ├── realtime.service.ts    # Supabase Realtime channel broadcast manager
│   │   ├── timetable-parser.service.ts # Flexible Matrix & CSV grid parser
│   │   ├── conflict.service.ts    # Pre-ingestion timetable conflict validator
│   │   ├── nlp-parser.service.ts  # Intent & entity extraction engine
│   │   └── audit.service.ts       # Centralized activity logging
│   ├── middleware/
│   │   ├── auth.middleware.ts     # Supabase Auth JWT / Session verification
│   │   ├── rbac.middleware.ts     # STUDENT | FACULTY | ADMIN role guard
│   │   ├── error.middleware.ts    # Centralized error handler & status mapper
│   │   └── rate-limiter.ts        # In-memory / Redis API rate limiter
│   ├── validations/
│   │   ├── auth.schema.ts         # Zod schemas for credentials
│   │   ├── availability.schema.ts # Zod schemas for query params
│   │   ├── booking.schema.ts      # Zod schemas for room reservation
│   │   ├── cancellation.schema.ts # Zod schemas for lecture cancellation
│   │   └── timetable.schema.ts    # Zod schemas for timetable imports
│   ├── types/
│   │   ├── availability.types.ts  # Engine intervals, statuses, gap types
│   │   ├── timetable.types.ts     # Matrix cell tokens, batch definitions
│   │   └── index.ts               # Global TypeScript definitions
│   └── utils/
│       ├── time.util.ts           # Time math (e.g., "09:30" <-> 570 mins)
│       ├── response.util.ts       # Standardized API response formatters
│       └── password.util.ts       # Supabase Auth helper utilities
├── prisma/
│   ├── schema.prisma              # Relational database schema for Supabase
│   ├── migrations/                # Version-controlled DB migrations
│   └── seed.ts                    # Institutional seed data (Rooms, PCCOE Timetable)
└── tests/
    ├── unit/
    │   ├── availability.test.ts   # Unit tests for interval overlap & gaps
    │   ├── timetable-parser.test.ts # Matrix cell de-multiplexer tests
    │   └── time.util.test.ts      # Time arithmetic & boundary tests
    └── integration/
        ├── booking-concurrency.test.ts # Advisory lock & race condition tests
        ├── cancellation.test.ts   # Dynamic room release tests
        └── timetable-import.test.ts # Bulk ingestion & conflict check tests
```

---

## 2. Complete Relational Database Schema (Prisma / Supabase PostgreSQL)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Supabase Transaction Connection Pooler (PgBouncer/Supavisor)
  directUrl = env("DIRECT_URL")        // Supabase Direct Connection for Migrations
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  STUDENT
  FACULTY
  ADMIN
}

enum RoomType {
  CLASSROOM
  LABORATORY
  SEMINAR_HALL
  AUDITORIUM
  TUTORIAL_ROOM
  MEETING_ROOM
}

enum RoomStatus {
  ACTIVE
  MAINTENANCE
  INACTIVE
}

enum DayOfWeek {
  MON
  TUE
  WED
  THU
  FRI
  SAT
  SUN
}

enum SessionType {
  THEORY
  PRACTICAL
  TUTORIAL
  SEMINAR
  EMPOWERMENT
  HONORS_MINORS
}

enum EntryStatus {
  SCHEDULED
  CANCELLED
}

enum BookingStatus {
  CONFIRMED
  CANCELLED
  COMPLETED
}

model User {
  id            String         @id @default(uuid())
  name          String
  email         String         @unique
  passwordHash  String
  role          Role           @default(STUDENT)
  departmentId  String?
  facultyCode   String?        @unique // e.g. "PS", "SCK", "AM", "PG"
  phoneNumber   String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  department    Department?    @relation(fields: [departmentId], references: [id])
  cancellations Cancellation[] @relation("CancelledByUser")
  bookings      RoomBooking[]  @relation("BookedByUser")
  auditLogs     AuditLog[]
  facultyEntries TimetableEntry[] @relation("FacultyEntries")

  @@index([email])
  @@index([role])
  @@index([facultyCode])
}

model Department {
  id          String            @id @default(uuid())
  name        String            @unique // e.g. "Computer Engineering"
  code        String            @unique // e.g. "COMP"
  users       User[]
  classes     ClassDivision[]
  subjects    Subject[]
  timetables  TimetableMaster[]
}

model Building {
  id          String            @id @default(uuid())
  name        String            // e.g. "Building 6 / IT Building"
  code        String            @unique // e.g. "B6", "B9"
  floors      Int               @default(6)
  rooms       Room[]
  createdAt   DateTime          @default(now())
}

model Room {
  id          String            @id @default(uuid())
  roomNumber  String            // e.g. "6201CR", "6206LA", "9412CR"
  buildingId  String
  floor       Int
  capacity    Int
  roomType    RoomType          @default(CLASSROOM)
  status      RoomStatus        @default(ACTIVE)
  facilities  String[]          // ["Projector", "AC", "Smart Board", "Computers:40", "WiFi"]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  building    Building          @relation(fields: [buildingId], references: [id], onDelete: Cascade)
  entries     TimetableEntry[]
  bookings    RoomBooking[]

  @@unique([buildingId, roomNumber])
  @@index([roomNumber])
  @@index([roomType])
  @@index([capacity])
  @@index([buildingId, floor])
}

model ClassDivision {
  id               String           @id @default(uuid())
  departmentId     String
  academicYear     String           // e.g. "2026-2027"
  yearLevel        String           // e.g. "TY", "SE", "BE", "FE"
  division         String           // e.g. "B", "A", "C"
  classTeacher     String?          // e.g. "Mrs. Akanksha Magare"
  department       Department       @relation(fields: [departmentId], references: [id])
  timetableEntries TimetableEntry[]

  @@unique([departmentId, academicYear, yearLevel, division])
}

model Subject {
  id               String           @id @default(uuid())
  departmentId     String
  code             String           // e.g. "TOC", "ML", "IOT", "CGG"
  name             String           // e.g. "Theory of Computation"
  isLab            Boolean          @default(false)
  department       Department       @relation(fields: [departmentId], references: [id])
  timetableEntries TimetableEntry[]

  @@unique([departmentId, code])
}

model TimetableMaster {
  id             String           @id @default(uuid())
  departmentId   String
  academicYear   String           // e.g. "2026-2027"
  wefDate        DateTime         // With Effect From (e.g. 2026-07-06)
  isActive       Boolean          @default(true)
  createdAt      DateTime         @default(now())

  department     Department       @relation(fields: [departmentId], references: [id])
  entries        TimetableEntry[]
}

model TimetableEntry {
  id             String           @id @default(uuid())
  timetableId    String
  classDivId     String
  dayOfWeek      DayOfWeek
  startTime      String           // Format: "HH:mm" (24-hr e.g. "09:00")
  endTime        String           // Format: "HH:mm" (24-hr e.g. "11:00")
  startMinutes   Int              // Pre-calculated minutes from midnight (e.g. 540)
  endMinutes     Int              // Pre-calculated minutes from midnight (e.g. 660)
  subjectId      String
  facultyId      String?
  facultyCode    String?          // e.g. "PS", "SCK", "DipaliP", "PG"
  roomId         String
  batch          String?          // e.g. "B1", "B2", "ALL", "A+B", "C+D"
  sessionType    SessionType      @default(THEORY)
  isElective     Boolean          @default(false)
  electiveGroup  String?          // e.g. "PEC-I", "MDM-1", "HONORS", "MINORS"
  status         EntryStatus      @default(SCHEDULED)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  timetable      TimetableMaster  @relation(fields: [timetableId], references: [id], onDelete: Cascade)
  classDiv       ClassDivision    @relation(fields: [classDivId], references: [id], onDelete: Cascade)
  subject        Subject          @relation(fields: [subjectId], references: [id])
  faculty        User?            @relation("FacultyEntries", fields: [facultyId], references: [id])
  room           Room             @relation(fields: [roomId], references: [id], onDelete: Cascade)
  cancellations  Cancellation[]

  @@index([dayOfWeek, startMinutes, endMinutes])
  @@index([roomId])
  @@index([facultyId])
  @@index([timetableId])
}

model Cancellation {
  id               String          @id @default(uuid())
  timetableEntryId String
  cancelledById    String
  date             DateTime        @db.Date // Canonical Date without time (YYYY-MM-DD)
  reason           String
  cancelledAt      DateTime        @default(now())

  timetableEntry   TimetableEntry  @relation(fields: [timetableEntryId], references: [id], onDelete: Cascade)
  cancelledBy      User            @relation("CancelledByUser", fields: [cancelledById], references: [id])

  @@unique([timetableEntryId, date])
  @@index([date])
}

model RoomBooking {
  id          String         @id @default(uuid())
  roomId      String
  bookedById  String
  date        DateTime       @db.Date // Canonical Date (YYYY-MM-DD)
  startTime   String         // "HH:mm"
  endTime     String         // "HH:mm"
  startMinutes Int           // e.g. 840 (14:00)
  endMinutes   Int           // e.g. 960 (16:00)
  purpose     String
  status      BookingStatus  @default(CONFIRMED)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  room        Room           @relation(fields: [roomId], references: [id], onDelete: Cascade)
  bookedBy    User           @relation("BookedByUser", fields: [bookedById], references: [id])

  @@index([roomId, date, startMinutes, endMinutes])
  @@index([bookedById])
}

model AuditLog {
  id          String         @id @default(uuid())
  userId      String?
  action      String         // "BOOKING_CREATED", "BOOKING_CANCELLED", "LECTURE_CANCELLED", "TIMETABLE_IMPORTED"
  entityType  String         // "ROOM_BOOKING", "TIMETABLE_ENTRY", "ROOM", "TIMETABLE_MASTER"
  entityId    String
  details     Json
  ipAddress   String?
  createdAt   DateTime       @default(now())

  user        User?          @relation(fields: [userId], references: [id])

  @@index([action])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

---

## 3. Centralized Availability Engine Implementation

The `AvailabilityService` is the mathematical core that evaluates interval intersections and calculates continuous availability windows.

### 3.1. Mathematical Time Utilities

```typescript
// backend/src/utils/time.util.ts

/**
 * Converts "HH:mm" string to minutes from midnight (0 to 1439)
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time format: ${timeStr}. Expected HH:mm in 24hr format.`);
  }
  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight back to "HH:mm"
 */
export function minutesToTime(mins: number): string {
  const normalized = Math.max(0, Math.min(1439, Math.floor(mins)));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Formats "HH:mm" to 12-hour display e.g. "02:00 PM"
 */
export function formatTo12Hour(timeStr: string): string {
  const mins = timeToMinutes(timeStr);
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Evaluates whether two intervals [s1, e1] and [s2, e2] strictly overlap.
 * Touching boundaries (e1 === s2 or e2 === s1) evaluate to FALSE.
 */
export function intervalsOverlap(s1: number, e1: number, s2: number, e2: number): boolean {
  return s1 < e2 && e1 > s2;
}

/**
 * Maps JS Date to DayOfWeek Enum
 */
export function dateToDayOfWeek(date: Date): 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN' {
  const days: ('SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT')[] = [
    'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'
  ];
  return days[date.getDay()];
}
```

### 3.2. Core Availability Service Implementation

```typescript
// backend/src/services/availability.service.ts
import { prisma } from '../config/prisma';
import { 
  timeToMinutes, 
  minutesToTime, 
  intervalsOverlap, 
  dateToDayOfWeek, 
  formatTo12Hour 
} from '../utils/time.util';
import { RoomType, RoomStatus } from '@prisma/client';

export interface AvailabilityQuery {
  date: Date;                     // Target Date
  startTime?: string;             // "HH:mm" (Optional: if omitted, checks whole day or current time)
  endTime?: string;               // "HH:mm"
  roomType?: RoomType;
  buildingId?: string;
  floor?: number;
  minCapacity?: number;
  facilities?: string[];
}

export interface OccupancyInterval {
  id: string;
  source: 'TIMETABLE' | 'BOOKING';
  title: string;
  startMinutes: number;
  endMinutes: number;
  startTime: string;
  endTime: string;
  facultyName?: string;
  classDivision?: string;
  batch?: string;
  purpose?: string;
  isCancelled?: boolean;
}

export interface RoomAvailabilityResult {
  room: {
    id: string;
    roomNumber: string;
    buildingName: string;
    buildingCode: string;
    floor: number;
    capacity: number;
    roomType: RoomType;
    facilities: string[];
  };
  status: 'AVAILABLE' | 'OCCUPIED' | 'BOOKED';
  isAvailableForRequestedSlot: boolean;
  currentEvent?: OccupancyInterval;
  nextEvent?: OccupancyInterval;
  availableFrom?: string;
  availableUntil?: string;
  occupancyTimeline: OccupancyInterval[];
}

export class AvailabilityService {
  private static readonly DAY_START_MINUTES = 480; // 08:00 AM
  private static readonly DAY_END_MINUTES = 1080;  // 06:00 PM

  /**
   * Evaluates availability of all rooms matching criteria for a specific slot or time.
   */
  public static async calculateAvailability(query: AvailabilityQuery): Promise<RoomAvailabilityResult[]> {
    const dayOfWeek = dateToDayOfWeek(query.date);
    const targetDateStr = query.date.toISOString().split('T')[0];

    const reqStartMins = query.startTime 
      ? timeToMinutes(query.startTime) 
      : this.DAY_START_MINUTES;
    const reqEndMins = query.endTime 
      ? timeToMinutes(query.endTime) 
      : this.DAY_END_MINUTES;

    if (reqStartMins >= reqEndMins) {
      throw new Error(`Start time (${query.startTime}) must be strictly earlier than end time (${query.endTime})`);
    }

    // 1. Fetch all matching candidate rooms
    const rooms = await prisma.room.findMany({
      where: {
        status: RoomStatus.ACTIVE,
        ...(query.roomType && { roomType: query.roomType }),
        ...(query.buildingId && { buildingId: query.buildingId }),
        ...(query.floor !== undefined && { floor: query.floor }),
        ...(query.minCapacity && { capacity: { gte: query.minCapacity } }),
        ...(query.facilities && query.facilities.length > 0 && {
          facilities: { hasEvery: query.facilities }
        })
      },
      include: {
        building: true
      },
      orderBy: [
        { building: { name: 'asc' } },
        { roomNumber: 'asc' }
      ]
    });

    const roomIds = rooms.map(r => r.id);

    // 2. Fetch all scheduled timetable entries for these rooms on this DayOfWeek
    const timetableEntries = await prisma.timetableEntry.findMany({
      where: {
        roomId: { in: roomIds },
        dayOfWeek: dayOfWeek,
        timetable: { isActive: true }
      },
      include: {
        subject: true,
        classDiv: true,
        faculty: true,
        cancellations: {
          where: {
            date: new Date(targetDateStr)
          }
        }
      }
    });

    // 3. Fetch all confirmed manual bookings for these rooms on target date
    const bookings = await prisma.roomBooking.findMany({
      where: {
        roomId: { in: roomIds },
        date: new Date(targetDateStr),
        status: 'CONFIRMED'
      },
      include: {
        bookedBy: true
      }
    });

    // 4. Group data by Room ID
    const timetableByRoom = new Map<string, typeof timetableEntries>();
    const bookingsByRoom = new Map<string, typeof bookings>();

    for (const entry of timetableEntries) {
      const list = timetableByRoom.get(entry.roomId) || [];
      list.push(entry);
      timetableByRoom.set(entry.roomId, list);
    }

    for (const booking of bookings) {
      const list = bookingsByRoom.get(booking.roomId) || [];
      list.push(booking);
      bookingsByRoom.set(booking.roomId, list);
    }

    // 5. Evaluate availability room-by-room
    const results: RoomAvailabilityResult[] = [];

    for (const room of rooms) {
      const roomEntries = timetableByRoom.get(room.id) || [];
      const roomBookings = bookingsByRoom.get(room.id) || [];

      const activeIntervals: OccupancyInterval[] = [];

      // Process timetable entries
      for (const entry of roomEntries) {
        const isCancelled = entry.cancellations.length > 0;
        if (!isCancelled) {
          activeIntervals.push({
            id: entry.id,
            source: 'TIMETABLE',
            title: entry.subject.name,
            startMinutes: entry.startMinutes,
            endMinutes: entry.endMinutes,
            startTime: entry.startTime,
            endTime: entry.endTime,
            facultyName: entry.faculty?.name || entry.facultyCode || undefined,
            classDivision: `${entry.classDiv.yearLevel}-${entry.classDiv.division}`,
            batch: entry.batch || undefined,
            isCancelled: false
          });
        }
      }

      // Process manual bookings
      for (const booking of roomBookings) {
        activeIntervals.push({
          id: booking.id,
          source: 'BOOKING',
          title: `Booking: ${booking.purpose}`,
          startMinutes: booking.startMinutes,
          endMinutes: booking.endMinutes,
          startTime: booking.startTime,
          endTime: booking.endTime,
          facultyName: booking.bookedBy.name,
          purpose: booking.purpose,
          isCancelled: false
        });
      }

      // Sort intervals chronologically
      activeIntervals.sort((a, b) => a.startMinutes - b.startMinutes);

      // Check collision with requested time window [reqStartMins, reqEndMins]
      const collidingEvents = activeIntervals.filter(interval => 
        intervalsOverlap(reqStartMins, reqEndMins, interval.startMinutes, interval.endMinutes)
      );

      const isAvailableForRequestedSlot = collidingEvents.length === 0;

      // Determine current status & active event at reqStartMins
      let currentEvent: OccupancyInterval | undefined;
      let status: 'AVAILABLE' | 'OCCUPIED' | 'BOOKED' = 'AVAILABLE';

      const activeNow = activeIntervals.find(interval => 
        reqStartMins >= interval.startMinutes && reqStartMins < interval.endMinutes
      );

      if (activeNow) {
        currentEvent = activeNow;
        status = activeNow.source === 'BOOKING' ? 'BOOKED' : 'OCCUPIED';
      }

      // Calculate Next Scheduled Event starting at or after reqStartMins
      const nextEvent = activeIntervals.find(interval => interval.startMinutes >= reqStartMins);

      // Calculate availableUntil: start of the first event that begins at or after reqStartMins
      let availableUntil: string | undefined;
      if (status === 'AVAILABLE') {
        availableUntil = nextEvent 
          ? nextEvent.startTime 
          : minutesToTime(this.DAY_END_MINUTES);
      }

      // Calculate availableFrom: if occupied, when does the ongoing block finish?
      let availableFrom: string | undefined;
      if (status !== 'AVAILABLE' && currentEvent) {
        // Find consecutive chained events
        let chainEnd = currentEvent.endMinutes;
        for (const evt of activeIntervals) {
          if (evt.startMinutes === chainEnd) {
            chainEnd = evt.endMinutes;
          }
        }
        availableFrom = minutesToTime(chainEnd);
      } else {
        availableFrom = minutesToTime(reqStartMins);
      }

      results.push({
        room: {
          id: room.id,
          roomNumber: room.roomNumber,
          buildingName: room.building.name,
          buildingCode: room.building.code,
          floor: room.floor,
          capacity: room.capacity,
          roomType: room.roomType,
          facilities: room.facilities
        },
        status,
        isAvailableForRequestedSlot,
        currentEvent,
        nextEvent,
        availableFrom: availableFrom ? formatTo12Hour(availableFrom) : undefined,
        availableUntil: availableUntil ? formatTo12Hour(availableUntil) : undefined,
        occupancyTimeline: activeIntervals
      });
    }

    return results;
  }
}
```

---

## 4. Timetable Management & Flexible Ingestion Engine

### 4.1. Flexible Matrix & Multi-Batch Parsing Service

```typescript
// backend/src/services/timetable-parser.service.ts
import { SessionType, DayOfWeek } from '@prisma/client';
import { timeToMinutes } from '../utils/time.util';

export interface ParsedTimetableEntry {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  subjectCode: string;
  subjectName?: string;
  facultyCode?: string;
  facultyName?: string;
  roomNumber: string;
  roomType: 'CLASSROOM' | 'LABORATORY';
  batch?: string;
  sessionType: SessionType;
  isElective: boolean;
  electiveGroup?: string;
}

export class TimetableParserService {
  /**
   * De-multiplexes complex cell content into discrete room occupancy records.
   * Example Input Cell: "IOT B1 - (SCK) 6206LA, IOT B2 - (DipaliP) 6208LA, CGG B1 - (PG) 6210LA"
   */
  public static parseCell(
    cellText: string, 
    day: DayOfWeek, 
    startTime: string, 
    endTime: string
  ): ParsedTimetableEntry[] {
    const trimmed = cellText.trim();
    if (!trimmed || trimmed === '-' || trimmed.toUpperCase() === 'NIL') {
      return [];
    }

    const entries: ParsedTimetableEntry[] = [];
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);

    // Split sub-blocks separated by comma, semicolon or newline
    const tokens = trimmed.split(/[\n,;]+(?![^(]*\))/).map(t => t.trim()).filter(Boolean);

    for (const token of tokens) {
      // Regex pattern matching:
      // (1) Subject [Elective/Minor Group]
      // (2) Optional Batch (B1, B2, B3, B4, A+B, etc.)
      // (3) Optional Faculty in parenthesis e.g. (PS), (SCK), (DipaliP)
      // (4) Room Code e.g. 6201CR, 6206LA, 9412CR, 6221LA & 6222LA
      
      const parsed = this.parseToken(token, day, startTime, endTime, startMins, endMins);
      if (parsed) {
        entries.push(...parsed);
      }
    }

    return entries;
  }

  private static parseToken(
    token: string, 
    day: DayOfWeek, 
    startTime: string, 
    endTime: string,
    startMins: number,
    endMins: number
  ): ParsedTimetableEntry[] | null {
    // Check for multi-room allocation e.g. "6221LA & 6222LA"
    const multiRoomMatch = token.match(/(\d{4}[A-Z]{2})\s*&\s*(\d{4}[A-Z]{2})/i);
    if (multiRoomMatch) {
      const room1 = multiRoomMatch[1];
      const room2 = multiRoomMatch[2];
      const baseToken = token.replace(/(\d{4}[A-Z]{2})\s*&\s*(\d{4}[A-Z]{2})/i, room1);
      
      const res1 = this.parseSingleToken(baseToken, room1, day, startTime, endTime, startMins, endMins);
      const res2 = this.parseSingleToken(baseToken, room2, day, startTime, endTime, startMins, endMins);
      return [...(res1 ? [res1] : []), ...(res2 ? [res2] : [])];
    }

    // Extract single room code e.g. 6201CR or 6206LA
    const roomMatch = token.match(/(\d{4}[A-Z]{2})/i);
    if (!roomMatch) return null;

    const roomNumber = roomMatch[1].toUpperCase();
    return this.parseSingleToken(token, roomNumber, day, startTime, endTime, startMins, endMins) 
      ? [this.parseSingleToken(token, roomNumber, day, startTime, endTime, startMins, endMins)!] 
      : null;
  }

  private static parseSingleToken(
    token: string,
    roomNumber: string,
    day: DayOfWeek,
    startTime: string,
    endTime: string,
    startMins: number,
    endMins: number
  ): ParsedTimetableEntry | null {
    const isLab = roomNumber.endsWith('LA');
    const roomType = isLab ? 'LABORATORY' : 'CLASSROOM';

    // Extract Faculty code in parenthesis (e.g. "(PS)", "(SCK)", "(DipaliP)")
    const facultyMatch = token.match(/\(([^)]+)\)/);
    const facultyCode = facultyMatch ? facultyMatch[1].trim() : undefined;

    // Extract Batch (e.g., "B1", "B2", "B3", "B4", "A+B", "C+D")
    const batchMatch = token.match(/\b(B[1-4]|[A-D]\+[A-D])\b/i);
    const batch = batchMatch ? batchMatch[1].toUpperCase() : undefined;

    // Extract Subject Name / Code (Strip room, faculty, and batch)
    let cleanSubject = token
      .replace(/\d{4}[A-Z]{2}/gi, '')
      .replace(/\([^)]+\)/g, '')
      .replace(/\b(B[1-4]|[A-D]\+[A-D])\b/gi, '')
      .replace(/[:\-–]/g, ' ')
      .trim();

    // Check Elective / Minor groups
    const isElective = /\b(PEC|MDM|HONOR|MINOR)\b/i.test(token);
    let electiveGroup: string | undefined;
    if (/PEC-I/i.test(token)) electiveGroup = 'PEC-I';
    else if (/MDM-1/i.test(token)) electiveGroup = 'MDM-1';
    else if (/HONOR/i.test(token)) electiveGroup = 'HONORS';
    else if (/MINOR/i.test(token)) electiveGroup = 'MINORS';

    let sessionType: SessionType = SessionType.THEORY;
    if (isLab || /Lab|L\b/i.test(token)) sessionType = SessionType.PRACTICAL;
    else if (/Tut\b/i.test(token)) sessionType = SessionType.TUTORIAL;
    else if (/SEMINAR/i.test(token)) sessionType = SessionType.SEMINAR;

    return {
      dayOfWeek: day,
      startTime,
      endTime,
      startMinutes: startMins,
      endMinutes: endMins,
      subjectCode: cleanSubject.split(/\s+/)[0] || 'CLASS',
      subjectName: cleanSubject,
      facultyCode,
      roomNumber,
      roomType,
      batch,
      sessionType,
      isElective,
      electiveGroup
    };
  }
}
```

---

## 5. Room Booking Engine & Two-Phase Advisory Locking

To completely prevent race conditions and double-bookings, `BookingService` wraps the verification and reservation in a PostgreSQL transaction utilizing advisory locks.

```typescript
// backend/src/services/booking.service.ts
import { prisma } from '../config/prisma';
import { timeToMinutes, intervalsOverlap, dateToDayOfWeek } from '../utils/time.util';
import { BookingStatus } from '@prisma/client';

export interface CreateBookingDTO {
  roomId: string;
  bookedById: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
  purpose: string;
}

export class BookingConflictError extends Error {
  public conflictDetails: Record<string, unknown>;
  constructor(message: string, details: Record<string, unknown>) {
    super(message);
    this.name = 'BookingConflictError';
    this.conflictDetails = details;
  }
}

export class BookingService {
  public static async createBooking(dto: CreateBookingDTO) {
    const bookingDate = new Date(dto.date);
    const dayOfWeek = dateToDayOfWeek(bookingDate);
    const startMins = timeToMinutes(dto.startTime);
    const endMins = timeToMinutes(dto.endTime);

    if (startMins >= endMins) {
      throw new Error('Start time must be strictly before end time.');
    }

    // Execute within an interactive transaction with serializable isolation & advisory lock
    return await prisma.$transaction(async (tx) => {
      // 1. Acquire Room-Date Advisory Lock via PostgreSQL hash
      // Generates a deterministic 32-bit integer key for (roomId + date)
      const lockKey = this.generateAdvisoryLockKey(dto.roomId, dto.date);
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`;

      // 2. Query Room existence & Active status
      const room = await tx.room.findUnique({
        where: { id: dto.roomId },
        include: { building: true }
      });
      if (!room || room.status !== 'ACTIVE') {
        throw new Error('Room is not active or does not exist.');
      }

      // 3. Query active timetable classes for this room & day
      const timetableEntries = await tx.timetableEntry.findMany({
        where: {
          roomId: dto.roomId,
          dayOfWeek: dayOfWeek,
          timetable: { isActive: true }
        },
        include: {
          subject: true,
          faculty: true,
          cancellations: {
            where: { date: bookingDate }
          }
        }
      });

      // Filter out cancelled classes
      const activeClasses = timetableEntries.filter(e => e.cancellations.length === 0);

      for (const entry of activeClasses) {
        if (intervalsOverlap(startMins, endMins, entry.startMinutes, entry.endMinutes)) {
          throw new BookingConflictError(
            `Room ${room.roomNumber} is occupied by scheduled lecture "${entry.subject.name}" (${entry.startTime} - ${entry.endTime}).`,
            {
              conflictType: 'TIMETABLE_CLASS',
              subject: entry.subject.name,
              faculty: entry.faculty?.name || entry.facultyCode,
              timeSlot: `${entry.startTime} - ${entry.endTime}`
            }
          );
        }
      }

      // 4. Query existing confirmed bookings on this date
      const existingBookings = await tx.roomBooking.findMany({
        where: {
          roomId: dto.roomId,
          date: bookingDate,
          status: BookingStatus.CONFIRMED
        },
        include: {
          bookedBy: true
        }
      });

      for (const booking of existingBookings) {
        if (intervalsOverlap(startMins, endMins, booking.startMinutes, booking.endMinutes)) {
          throw new BookingConflictError(
            `Room ${room.roomNumber} is already booked for "${booking.purpose}" (${booking.startTime} - ${booking.endTime}) by ${booking.bookedBy.name}.`,
            {
              conflictType: 'EXISTING_BOOKING',
              purpose: booking.purpose,
              bookedBy: booking.bookedBy.name,
              timeSlot: `${booking.startTime} - ${booking.endTime}`
            }
          );
        }
      }

      // 5. Insert confirmed booking record
      const createdBooking = await tx.roomBooking.create({
        data: {
          roomId: dto.roomId,
          bookedById: dto.bookedById,
          date: bookingDate,
          startTime: dto.startTime,
          endTime: dto.endTime,
          startMinutes: startMins,
          endMinutes: endMins,
          purpose: dto.purpose,
          status: BookingStatus.CONFIRMED
        },
        include: {
          room: { include: { building: true } },
          bookedBy: true
        }
      });

      // 6. Write to Audit Log
      await tx.auditLog.create({
        data: {
          userId: dto.bookedById,
          action: 'BOOKING_CREATED',
          entityType: 'ROOM_BOOKING',
          entityId: createdBooking.id,
          details: {
            roomNumber: room.roomNumber,
            date: dto.date,
            startTime: dto.startTime,
            endTime: dto.endTime,
            purpose: dto.purpose
          }
        }
      });

      return createdBooking;
    });
  }

  private static generateAdvisoryLockKey(roomId: string, dateStr: string): number {
    let hash = 0;
    const str = `${roomId}_${dateStr}`;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
```

---

## 6. Lecture Cancellation System Implementation

```typescript
// backend/src/services/cancellation.service.ts
import { prisma } from '../config/prisma';

export interface CancelLectureDTO {
  timetableEntryId: string;
  cancelledById: string;
  date: string; // "YYYY-MM-DD"
  reason: string;
}

export class CancellationService {
  public static async cancelLecture(dto: CancelLectureDTO) {
    const cancelDate = new Date(dto.date);

    return await prisma.$transaction(async (tx) => {
      // 1. Verify timetable entry exists
      const entry = await tx.timetableEntry.findUnique({
        where: { id: dto.timetableEntryId },
        include: {
          room: true,
          subject: true,
          faculty: true
        }
      });

      if (!entry) {
        throw new Error('Timetable entry not found.');
      }

      // 2. Check if already cancelled for this date
      const existingCancel = await tx.cancellation.findUnique({
        where: {
          timetableEntryId_date: {
            timetableEntryId: dto.timetableEntryId,
            date: cancelDate
          }
        }
      });

      if (existingCancel) {
        throw new Error('This lecture has already been cancelled for the selected date.');
      }

      // 3. Create cancellation record
      const cancellation = await tx.cancellation.create({
        data: {
          timetableEntryId: dto.timetableEntryId,
          cancelledById: dto.cancelledById,
          date: cancelDate,
          reason: dto.reason
        },
        include: {
          timetableEntry: {
            include: { room: true, subject: true }
          },
          cancelledBy: true
        }
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          userId: dto.cancelledById,
          action: 'LECTURE_CANCELLED',
          entityType: 'TIMETABLE_ENTRY',
          entityId: dto.timetableEntryId,
          details: {
            subject: entry.subject.name,
            roomNumber: entry.room.roomNumber,
            date: dto.date,
            timeSlot: `${entry.startTime} - ${entry.endTime}`,
            reason: dto.reason
          }
        }
      });

      return cancellation;
    });
  }
}
```

---

## 7. Natural Language Search (NLP) Backend Pipeline

```typescript
// backend/src/services/nlp-parser.service.ts
import { RoomType } from '@prisma/client';
import { AvailabilityQuery } from './availability.service';

export class NLPParserService {
  /**
   * Converts natural text queries into structured availability filters.
   * e.g., "Find a computer lab for 60 students in Building 6 tomorrow from 2 PM to 4 PM"
   */
  public static parseQuery(userText: string, referenceDate: Date = new Date()): AvailabilityQuery {
    const text = userText.toLowerCase();

    // 1. Resolve Target Date
    let targetDate = new Date(referenceDate);
    if (text.includes('tomorrow')) {
      targetDate.setDate(targetDate.getDate() + 1);
    } else if (text.includes('day after tomorrow')) {
      targetDate.setDate(targetDate.getDate() + 2);
    } else {
      const dayMatch = text.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
      if (dayMatch) {
        targetDate = this.getNextDayOfWeek(referenceDate, dayMatch[1]);
      }
    }

    // 2. Resolve Time Window
    let startTime: string | undefined;
    let endTime: string | undefined;

    // Pattern: "from 2 pm to 4 pm" or "2 to 4 pm" or "10 am to 12 pm"
    const timeRangeMatch = text.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|-|until)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
    if (timeRangeMatch) {
      startTime = this.normalizeTime(timeRangeMatch[1]);
      endTime = this.normalizeTime(timeRangeMatch[2]);
    } else if (text.includes('now') || text.includes('right now')) {
      const currentHours = referenceDate.getHours().toString().padStart(2, '0');
      const currentMins = referenceDate.getMinutes().toString().padStart(2, '0');
      startTime = `${currentHours}:${currentMins}`;
      // Default to 1 hour window
      const endHours = ((referenceDate.getHours() + 1) % 24).toString().padStart(2, '0');
      endTime = `${endHours}:${currentMins}`;
    }

    // 3. Resolve Room Type
    let roomType: RoomType | undefined;
    if (text.includes('lab') || text.includes('laboratory') || text.includes('computer lab')) {
      roomType = RoomType.LABORATORY;
    } else if (text.includes('classroom') || text.includes('class')) {
      roomType = RoomType.CLASSROOM;
    } else if (text.includes('seminar') || text.includes('auditorium')) {
      roomType = RoomType.SEMINAR_HALL;
    }

    // 4. Resolve Minimum Capacity
    let minCapacity: number | undefined;
    const capacityMatch = text.match(/(\d{2,3})\s*(?:students|seats|capacity|people|persons)/i);
    if (capacityMatch) {
      minCapacity = parseInt(capacityMatch[1], 10);
    }

    return {
      date: targetDate,
      startTime,
      endTime,
      roomType,
      minCapacity
    };
  }

  private static normalizeTime(timeStr: string): string {
    const isPM = /pm/i.test(timeStr);
    const isAM = /am/i.test(timeStr);
    const clean = timeStr.replace(/[^\d:]/g, '');
    let [hoursStr, minutesStr] = clean.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr ? parseInt(minutesStr, 10) : 0;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private static getNextDayOfWeek(baseDate: Date, dayName: string): Date {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDayIndex = days.indexOf(dayName.toLowerCase());
    const result = new Date(baseDate);
    const currentDayIndex = baseDate.getDay();
    let diff = targetDayIndex - currentDayIndex;
    if (diff <= 0) diff += 7;
    result.setDate(baseDate.getDate() + diff);
    return result;
  }
}
```

---

## 8. Complete REST API Endpoints Specification

### 8.1. Summary Table of Endpoints

| Method | Endpoint | Role Guard | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates credentials and issues HTTP-only session cookie |
| `POST` | `/api/auth/logout` | Public | Clears authenticated session cookie |
| `GET` | `/api/auth/me` | Authenticated | Returns logged-in user profile and permissions |
| `GET` | `/api/rooms` | Public | Lists all rooms with filter parameters |
| `GET` | `/api/rooms/:id` | Public | Returns detailed room metadata, facilities & day schedule |
| `GET` | `/api/rooms/availability` | Public | Core room availability query engine |
| `GET` | `/api/rooms/:id/timeline` | Public | 24-hour interval timeline for specific room |
| `GET` | `/api/dashboard/stats` | Public | Real-time counts: available now, occupied now, cancellations |
| `POST` | `/api/search/nlp` | Public | Natural language room finder |
| `GET` | `/api/faculty/my-schedule` | Faculty / Admin | Returns personal timetable for logged-in faculty |
| `POST` | `/api/timetable/cancel` | Faculty / Admin | 1-Click lecture cancellation (releases room immediately) |
| `POST` | `/api/bookings` | Faculty / Admin | Atomic temporary room reservation |
| `DELETE` | `/api/bookings/:id` | Faculty / Admin | Cancels / releases an active room booking |
| `POST` | `/api/admin/timetable/import` | Admin | Ingests bulk CSV / Excel timetable matrix |
| `GET` | `/api/admin/conflicts` | Admin | Scans system-wide timetable collisions |
| `GET` | `/api/admin/audit-logs` | Admin | Fetches system activity log trail |

---

### 8.2. Detailed Request & Response Payloads

#### `GET /api/rooms/availability`
- **Query Parameters**:
  - `date`: `2026-09-08` (Required)
  - `startTime`: `14:00` (Optional, defaults to 08:00)
  - `endTime`: `16:00` (Optional, defaults to 18:00)
  - `roomType`: `CLASSROOM` | `LABORATORY` | `SEMINAR_HALL` (Optional)
  - `buildingId`: `uuid` (Optional)
  - `minCapacity`: `60` (Optional)

- **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "query": {
      "date": "2026-09-08",
      "dayOfWeek": "TUE",
      "startTime": "14:00",
      "endTime": "16:00",
      "roomType": "CLASSROOM",
      "minCapacity": 60
    },
    "totalCount": 18,
    "availableCount": 11,
    "occupiedCount": 7,
    "rooms": [
      {
        "id": "rm-6204",
        "roomNumber": "6204CR",
        "buildingName": "Building 6",
        "floor": 2,
        "capacity": 60,
        "roomType": "CLASSROOM",
        "status": "AVAILABLE",
        "isAvailableForRequestedSlot": true,
        "availableFrom": "01:10 PM",
        "availableUntil": "04:10 PM",
        "nextEvent": {
          "title": "Theory of Computation (TOC*)",
          "startTime": "16:10",
          "endTime": "17:10",
          "facultyName": "Ms. Harsha Talele"
        },
        "facilities": ["Projector", "Air Conditioning", "Smart Board"]
      },
      {
        "id": "rm-6201",
        "roomNumber": "6201CR",
        "buildingName": "Building 6",
        "floor": 2,
        "capacity": 70,
        "roomType": "CLASSROOM",
        "status": "OCCUPIED",
        "isAvailableForRequestedSlot": false,
        "currentEvent": {
          "title": "Machine Learning",
          "classDivision": "TY-B",
          "facultyName": "Dr. Priya Surana",
          "startTime": "14:10",
          "endTime": "15:10"
        },
        "availableFrom": "03:10 PM",
        "availableUntil": null,
        "facilities": ["Projector", "Whiteboard"]
      }
    ]
  }
}
```

---

#### `POST /api/bookings`
- **Request Body**:
```json
{
  "roomId": "rm-6204",
  "date": "2026-09-08",
  "startTime": "14:00",
  "endTime": "15:30",
  "purpose": "Final Year Capstone Project Review"
}
```

- **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Room booked successfully.",
  "data": {
    "bookingId": "bk-9941",
    "roomNumber": "6204CR",
    "date": "2026-09-08",
    "startTime": "14:00",
    "endTime": "15:30",
    "purpose": "Final Year Capstone Project Review",
    "status": "CONFIRMED"
  }
}
```

- **Conflict Error Response (`409 Conflict`)**:
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "Room 6204CR is occupied by scheduled lecture 'Theory of Computation' (14:10 - 15:10).",
    "details": {
      "conflictType": "TIMETABLE_CLASS",
      "subject": "Theory of Computation",
      "faculty": "Ms. Harsha Talele",
      "timeSlot": "14:10 - 15:10"
    }
  }
}
```

---

#### `POST /api/timetable/cancel`
- **Request Body**:
```json
{
  "timetableEntryId": "tt-entry-401",
  "date": "2026-09-08",
  "reason": "Faculty attending University Research Symposium"
}
```

- **Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Lecture cancelled successfully. Room 6201CR is now released and marked AVAILABLE for that slot.",
  "data": {
    "cancellationId": "cn-8812",
    "subject": "Machine Learning",
    "roomNumber": "6201CR",
    "date": "2026-09-08",
    "timeSlot": "10:00 - 11:00",
    "cancelledBy": "Dr. Priya Surana"
  }
}
```

---

## 9. Comprehensive Automated Test Matrix (Vitest)

```typescript
// backend/tests/unit/availability.test.ts
import { describe, it, expect } from 'vitest';
import { intervalsOverlap, timeToMinutes } from '../../src/utils/time.util';

describe('Availability Engine Mathematical Overlap Rules', () => {
  it('TEST 1: Standard overlapping class marks slot as occupied', () => {
    const qStart = timeToMinutes('09:00');
    const qEnd = timeToMinutes('11:00');
    const classStart = timeToMinutes('10:00');
    const classEnd = timeToMinutes('11:00');
    expect(intervalsOverlap(qStart, qEnd, classStart, classEnd)).toBe(true);
  });

  it('TEST 2: Touching back-to-back classes do not collide', () => {
    const class1Start = timeToMinutes('09:00');
    const class1End = timeToMinutes('10:00');
    const class2Start = timeToMinutes('10:00');
    const class2End = timeToMinutes('11:00');
    expect(intervalsOverlap(class1Start, class1End, class2Start, class2End)).toBe(false);
  });

  it('TEST 3: Partial time overlap booking is correctly rejected', () => {
    const existingBookingStart = timeToMinutes('14:00');
    const existingBookingEnd = timeToMinutes('15:00');
    const newBookingStart = timeToMinutes('14:30');
    const newBookingEnd = timeToMinutes('15:30');
    expect(intervalsOverlap(newBookingStart, newBookingEnd, existingBookingStart, existingBookingEnd)).toBe(true);
  });

  it('TEST 4: Disjoint slot is correctly recognized as free', () => {
    const reqStart = timeToMinutes('11:10');
    const reqEnd = timeToMinutes('12:10');
    const occupiedStart = timeToMinutes('14:10');
    const occupiedEnd = timeToMinutes('15:10');
    expect(intervalsOverlap(reqStart, reqEnd, occupiedStart, occupiedEnd)).toBe(false);
  });
});
```

---
*Backend Architecture & Engine Implementation Blueprint for the Smart Classroom & Lab Availability System.*
