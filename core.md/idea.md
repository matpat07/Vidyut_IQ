# Smart Classroom & Lab Availability System
## Project Vision, Core Concept & Functional Blueprint

---

## 1. Project Overview & Core Vision

In modern colleges and universities, students, faculty, and administrators face a persistent daily challenge: **locating an available classroom or laboratory in real time.**

Room occupancy is governed by dense, interconnected college timetables spanning multiple departments, academic years, divisions, split lab batches, elective tracks, and ad-hoc room reservations. Furthermore, faculty frequently cancel lectures due to meetings, sick leave, or academic events, leaving rooms unexpectedly vacant while students struggle to find quiet study spaces or empty labs for project work.

### The Core Objective
The **Smart Classroom & Lab Availability System** is a unified digital platform that accurately answers one central question:

> **"Which room or lab is available right now, or at a specific future date and time, until what time is it free, and what facilities does it offer?"**

---

## 2. Problem Statement & Real-World Challenges

1. **Wasted Transit & Search Time**: Students wander between floors and buildings searching for an empty room to study, practice coding, or conduct group projects.
2. **Hidden Room Vacancies**: When a lecture is cancelled, the assigned room becomes vacant. However, because cancellations are traditionally communicated via isolated chat groups or verbal notices, this vacancy remains unknown to other students and faculty.
3. **Complex Multi-Track Timetables**: A single class slot might have 4 batches distributed across 3 different labs, or 5 parallel elective tracks occurring across separate classrooms. Tracking this manually is error-prone.
4. **Ad-hoc Booking Collisions**: Faculty needing a room for an extra lecture, remedial session, project evaluation, or seminar often clash with scheduled classes or other faculty bookings.
5. **Lack of Facility Visibility**: Users do not know in advance whether a vacant room has a working projector, AC, smart board, or sufficient seating capacity.

---

## 3. Core Functional Pillars

```
+----------------------------------------------------------------------------------------------------+
|                                    FOUR CORE FUNCTIONAL PILLARS                                    |
+------------------------------------+---------------------------------------------------------------+
|  1. REAL-TIME AVAILABILITY RADAR   |  - Live "Available Rooms Now" dashboard                       |
|                                    |  - Instant count of free vs occupied classrooms and labs      |
|                                    |  - Exact countdown of remaining free minutes until next class |
+------------------------------------+---------------------------------------------------------------+
|  2. PARAMETRIC & FUTURE SEARCH     |  - Search by Date, Time Window, Building, Room Type, Capacity |
|                                    |  - Natural language room queries ("Find a lab for 60 at 2 PM")|
|                                    |  - Temporal gap analysis ("Free from 10:00 AM until 1:10 PM") |
+------------------------------------+---------------------------------------------------------------+
|  3. DYNAMIC CANCELLATION RELEASE   |  - 1-Click lecture cancellation by faculty                    |
|                                    |  - Instant release of the room to the public availability pool|
|                                    |  - Dedicated cancellation feed for student awareness          |
+------------------------------------+---------------------------------------------------------------+
|  4. CONFLICT-FREE TEMPORARY BOOKING|  - Faculty ad-hoc room reservation for meetings and seminars  |
|                                    |  - Instant collision prevention against timetable and bookings|
|                                    |  - Clear explanation of conflicts with alternative suggestions|
+----------------------------------------------------------------------------------------------------+
```

---

## 4. Key Questions Answered by the System

| # | User Question | How the System Resolves It |
|---|---|---|
| **1** | *Which room is available right now?* | Displays a live list of currently unoccupied rooms based on the active time slot. |
| **2** | *Which room is available at a future date and time?* | Evaluates the requested time window against the master timetable, cancellations, and approved bookings. |
| **3** | *Until what time is an available room free?* | Calculates the exact start time of the next scheduled event in that room. |
| **4** | *When will an occupied room become free?* | Identifies the end time of the current ongoing session or consecutive sessions. |
| **5** | *Why is a room occupied?* | Shows event details: Subject, Class/Division (e.g., `TY-B`), Faculty Name, Batch, or Booking Purpose. |
| **6** | *Has the lecture in that room been cancelled?* | Marks cancelled slots clearly on the timeline and immediately returns the room to `AVAILABLE` status. |
| **7** | *Can I book a specific room for a seminar?* | Validates the slot in real time and confirms booking if no overlapping class or reservation exists. |
| **8** | *If I cannot book it, what is causing the conflict?* | Clearly identifies the conflicting lecture or existing booking and suggests alternative free rooms. |
| **9** | *What does the entire day's schedule look like for a room?* | Provides a visual, color-coded interactive daily timeline from morning to evening. |
| **10** | *Which rooms match my specific capacity and equipment needs?* | Filters rooms by capacity ($\ge N$), room type (`Classroom`, `Lab`, `Seminar Hall`), building, and amenities (`Projector`, `AC`, `Smart Board`, `Computers`). |

---

## 5. Universal Timetable Flexibility & Complex Real-World Formats

Institutions utilize varied timetable layouts across departments, years, and divisions. The system is designed to natively understand and accommodate any institutional timetable format.

### 5.1. Real-World Timetable Complexity (Institutional Case Study)
Based on standard institutional timetable patterns (such as the *PCCOE Class Time Table*):

1. **Standard Theory Lectures**: Single subject taught to an entire division in a dedicated classroom (e.g., `ML (PS) 6201CR`).
2. **Parallel Split-Batch Practical Labs**: A 2-hour practical block where batches `B1`, `B2`, `B3`, `B4` split across different specialized laboratories:
   - `B1`: Internet of Things Lab in `6206LA`
   - `B2`: Internet of Things Lab in `6208LA`
   - `B3`: Computer Graphics Lab in `6210LA`
   - *Result*: The system tracks all 3 individual laboratories as occupied simultaneously by the same division.
3. **Cross-Division Parallel Electives (PEC)**: Combined divisions (e.g., Divisions A, B, C, D) splitting into 5 elective tracks running concurrently:
   - Track 1: `CGG-1 (A+B)` in `6102CR`
   - Track 2: `CGG-2 (C+D)` in `6103CR`
   - Track 3: `IOT-1 (A+B)` in `6201CR`
   - Track 4: `IOT-2 (B+C)` in `6202CR`
   - Track 5: `IOT-3 (B+D)` in `6204CR`
   - *Result*: All 5 classrooms are accurately tracked as occupied.
4. **Multidisciplinary Minors (MDM)**: Students splitting between theory in a classroom (`6204CR`) and practicals in a lab (`6206LA`) in the same time slot.
5. **Honors & Minor Programs**: Early morning (8:00 AM) or evening (4:10 PM - 6:10 PM) advanced tracks running across dedicated labs and classrooms.
6. **Multi-Room Practical Allocations**: Sessions spanning multiple adjacent labs (e.g., `6221LA & 6222LA`).
7. **Tutorials, Seminars & Empowerment Hours**: Small-batch tutorial sessions, student seminars, and self-study hours (`*`).
8. **Room Nomenclature & Legend Mapping**:
   - `...CR` $\to$ Classroom
   - `...LA` $\to$ Laboratory
   - Faculty abbreviations (e.g., `PS`, `SCK`, `AM`) and subject codes (e.g., `TOC`, `AI`, `CN`) resolved via the master legend.

---

## 6. User Roles & Capabilities

```
+----------------------------------------------------------------------------------------------------+
|                                       USER ROLES & PERMISSIONS                                     |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [STUDENT]                                                                                         |
|  - View "Available Now" dashboard and live stats.                                                  |
|  - Search for classrooms/labs by date, time, building, room type, and capacity.                    |
|  - Use conversational Natural Language Search ("Find an open lab for 50 students at 2 PM").        |
|  - Inspect room profiles, available facilities (Projector, AC, WiFi), and daily visual timelines.  |
|  - Browse today's master timetable and real-time cancellation alerts.                              |
|                                                                                                    |
|  [FACULTY]                                                                                         |
|  - All Student features.                                                                           |
|  - View personalized teaching schedule for the day and week.                                       |
|  - 1-Click Lecture Cancellation with reason submission (instantly releases room for student use).  |
|  - Temporary Room Booking for meetings, extra classes, and project evaluations.                    |
|  - Manage and cancel existing personal bookings.                                                   |
|                                                                                                    |
|  [ADMINISTRATOR]                                                                                   |
|  - Master management of campus infrastructure (Buildings, Floors, Rooms, Facilities).              |
|  - Ingest and manage multi-department, multi-year master timetables.                               |
|  - System-wide collision detection and timetable conflict resolution.                              |
|  - Manage user accounts, faculty directory, and role assignments.                                 |
|  - View full audit history of all bookings, cancellations, and timetable modifications.            |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

## 7. Core Business Rules & Availability Logic

### 7.1. Interval Overlap & Occupancy Rules
- **Occupied Condition**: A room is marked **`OCCUPIED`** if a scheduled timetable lecture is active and has not been cancelled.
- **Booked Condition**: A room is marked **`BOOKED`** if a confirmed temporary faculty reservation covers the queried time.
- **Available Condition**: A room is marked **`AVAILABLE`** if no active timetable lecture or booking overlaps the requested window.
- **Cancellation Release Rule**: When a faculty member cancels a lecture, the room is **immediately released** and marked **`AVAILABLE`** for that duration with a distinct cancellation indicator.
- **Touching Boundary Rule**: Back-to-back sessions touching at the boundary (e.g., Session A ends at 10:00 AM, Session B starts at 10:00 AM) are completely valid and do not cause conflict errors.

### 7.2. Visual Status Indicators

| Status | Color Indicator | Meaning to User |
|---|:---:|---|
| **AVAILABLE** | 🟢 Green | Room is free to use or book for the indicated period. |
| **OCCUPIED** | 🔴 Red | Regular scheduled timetable lecture/lab is actively in session. |
| **BOOKED** | 🟡 Amber | Reserved by faculty for a temporary meeting, exam, or seminar. |
| **CANCELLED** | ❌ Purple / Dashed | Scheduled class was cancelled by faculty; room is free for walk-in use. |
| **MAINTENANCE**| ⚪ Gray | Room is offline for maintenance or examination setup. |

---

## 8. Key User Scenarios & Experience Walkthroughs

### Scenario A: Student Finding a Study Room Right Now
1. Student opens the web application on their phone.
2. Dashboard instantly shows: *"14 Classrooms & 6 Labs Available Right Now"*.
3. Student clicks on **Room 6204CR**, seeing:
   - Status: 🟢 **Available Now**
   - Free until: **1:10 PM** (Next: *MDM-1 Theory at 1:10 PM*)
   - Seating Capacity: 60 Seats
   - Facilities: Air Conditioning, Whiteboard, Projector.

### Scenario B: Faculty Cancelling a Lecture
1. Faculty logs in and views their schedule: *10:00 AM - 11:00 AM Machine Learning in 6201CR*.
2. Faculty clicks **"Cancel Lecture"** and enters reason: *"Attending Academic Council Meeting"*.
3. System immediately updates:
   - Room `6201CR` status flips from `OCCUPIED` to `AVAILABLE (CANCELLED CLASS)`.
   - Students searching for rooms at 10:00 AM now see `6201CR` available for study.

### Scenario C: Faculty Booking a Seminar Hall
1. Faculty selects: *Date: Tomorrow, Time: 2:00 PM - 4:00 PM, Room: Seminar Hall 6416*.
2. System verifies that no class or prior booking exists for that slot.
3. Booking is confirmed, and the room is blocked for that 2-hour window.

---

## 9. Quality & Acceptance Criteria

- **Single Source of Truth**: Availability calculations must always yield identical, consistent results across all search filters, dashboards, and timelines.
- **Zero False Positives**: No room should ever be reported as available if a live class or booking is occupying it.
- **Clear Conflict Explanation**: When a booking cannot be placed, the system must clearly tell the user *why* (e.g., *"Room 6201CR is occupied by TY-B Machine Learning until 3:10 PM"*).
- **Graceful Empty States**: If no rooms match a search query, the system provides helpful adjustment suggestions (e.g., *"Try adjusting your time window or selecting an adjacent building"*).
- **Responsive University UI**: Clean, modern, accessible design optimized for mobile smartphones, tablets, and desktop displays.

---
*Idea and functional blueprint specification for the Smart Classroom & Lab Availability System.*
