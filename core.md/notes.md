You are a senior full-stack software engineer and UI/UX designer.

I want you to build a complete web application called:

SMART CLASSROOM & LAB AVAILABILITY SYSTEM

PROJECT IDEA:
Students and faculty often struggle to find an available classroom or laboratory because room availability depends on the college timetable.

I want to build a web application that tells users which classrooms/labs are available at a specific date and time.

The system must intelligently calculate real-time and future room availability using:

1. The complete college timetable
2. Cancelled lectures
3. Temporary/manual room bookings
4. Existing room occupancy
5. Booking start and end time
6. Room capacity
7. Room type
8. Building/block
9. Date and day

The main question the application must answer is:

"Which room is available, from what time, and until what time?"

==================================================
1. IMPORTANT DEVELOPMENT INSTRUCTION
==================================================

This is NOT just a UI design task.

Build the actual working full-stack application with:

- Frontend
- Backend
- Database
- Authentication
- APIs
- Availability calculation logic
- Booking system
- Cancellation system
- Timetable management
- Admin panel
- Testing

Do not create fake/static data as the final implementation.

If the project already contains code, first inspect the existing project and preserve useful existing functionality.

Before making major changes, explain the architecture briefly and then implement it.

==================================================
2. USER ROLES
==================================================

There are 3 user roles.

STUDENT:

Students can:

- Login
- Search available rooms
- Search classrooms/labs by date and time
- Filter by building
- Filter by room type
- Filter by capacity
- View room details
- View room availability timeline
- View today's timetable
- View cancelled lectures
- See when an occupied room becomes available
- See when an available room will become occupied

FACULTY:

Faculty can do everything students can do, plus:

- View their timetable
- Cancel/report a lecture
- Book an available room temporarily
- Specify booking start time
- Specify booking end time
- Specify booking purpose
- Release/cancel their booking

ADMIN:

Admin can:

- Manage students
- Manage faculty
- Manage rooms
- Manage buildings
- Manage room capacity
- Manage room types
- Add/edit/delete timetable entries
- Import timetable
- Manage cancelled lectures
- Manage manual room bookings
- View all room occupancy
- Resolve timetable conflicts
- View audit logs

==================================================
3. CORE FEATURE — ROOM AVAILABILITY ENGINE
==================================================

This is the MOST IMPORTANT part of the project.

Create a centralized availability calculation service.

Every page/API that needs room availability must use the same availability engine.

The system must consider:

A. Scheduled timetable classes
B. Cancelled timetable classes
C. Temporary room bookings
D. Date
E. Start time
F. End time

A room is OCCUPIED if a valid timetable event or confirmed booking overlaps the requested period.

A room is AVAILABLE if no valid event occupies it during the requested period.

A CANCELLED lecture must release its room.

A manual booking must occupy the room only between its start and end time.

==================================================
4. EXAMPLE OF AVAILABILITY LOGIC
==================================================

Suppose Room A-101 has this timetable:

09:00 - 10:00 Mathematics
10:00 - 11:00 Physics
11:00 - 12:00 Chemistry

Normally:

09:00 - 10:00 = OCCUPIED
10:00 - 11:00 = OCCUPIED
11:00 - 12:00 = OCCUPIED

Now Physics is cancelled.

The result must become:

09:00 - 10:00 = OCCUPIED
10:00 - 11:00 = AVAILABLE
11:00 - 12:00 = OCCUPIED

Now someone books the room from 10:20 to 10:40.

The result must become:

10:00 - 10:20 = AVAILABLE
10:20 - 10:40 = BOOKED
10:40 - 11:00 = AVAILABLE

The system must therefore understand gaps between events.

==================================================
5. AVAILABILITY SEARCH
==================================================

Create a main "Find a Room" search interface.

Inputs:

- Date
- Start Time
- End Time
- Room Type
- Building
- Minimum Capacity

Example:

Date:
Monday

Start:
2:00 PM

End:
4:00 PM

Room Type:
Computer Lab

Minimum Capacity:
50

The system should return only rooms that are available for the ENTIRE requested period.

Example result:

ROOM: Lab-03
TYPE: Computer Lab
CAPACITY: 60
BUILDING: Block A
STATUS: AVAILABLE
AVAILABLE FROM: 1:00 PM
AVAILABLE UNTIL: 4:30 PM
NEXT CLASS: 4:30 PM

Another result:

ROOM: Lab-05
TYPE: Computer Lab
CAPACITY: 80
BUILDING: Block B
STATUS: OCCUPIED
AVAILABLE FROM: 3:00 PM

Lab-05 should NOT be returned as available for the requested 2 PM - 4 PM period.

==================================================
6. "AVAILABLE NOW" FEATURE
==================================================

Create a prominent dashboard feature:

AVAILABLE ROOMS NOW

When the user opens the dashboard, calculate the current date/time and show rooms that are currently free.

Each room should display:

Room Number
Building
Room Type
Capacity
Available Until
Next Scheduled Event

Example:

🟢 A-201
Classroom
Capacity: 60

Available now
Available until: 11:00 AM

Next:
Data Structures
11:00 AM - 12:00 PM

==================================================
7. ROOM TIMELINE
==================================================

Every room must have a visual timeline.

Example:

ROOM A-201 — TODAY

09:00 ───── 10:00 ───── 11:00 ───── 12:00 ───── 13:00 ───── 14:00

████████
CLASS
09:00-10:00

          ┌─────────────────┐
          │    AVAILABLE    │
          │    10:00-11:00  │
          └─────────────────┘

                            █████████████
                            CLASS
                            11:00-12:00

                                          ┌──────────────────┐
                                          │    AVAILABLE     │
                                          │    12:00-01:30   │
                                          └──────────────────┘

The timeline must clearly distinguish:

- Timetable class
- Cancelled class
- Manual booking
- Available period

==================================================
8. ROOM DETAILS PAGE
==================================================

Create:

/rooms/:id

It should show:

- Room number
- Building
- Floor
- Room type
- Capacity
- Facilities
- Current status
- Current class/booking
- Available from
- Available until
- Next scheduled event
- Today's timetable
- Visual availability timeline

Example:

Room A-204

🟢 AVAILABLE

Available from:
10:00 AM

Available until:
11:00 AM

Next:
Operating Systems
11:00 AM - 12:00 PM

Capacity:
60

Type:
Classroom

Facilities:
Projector
Whiteboard
AC

==================================================
9. TIMETABLE SYSTEM
==================================================

Create a complete timetable management system.

Each timetable entry should contain:

- ID
- Date/day
- Start time
- End time
- Subject
- Faculty
- Class/section
- Room
- Building
- Room type
- Status

Possible status:

SCHEDULED
CANCELLED

Admin must be able to:

- Create timetable entry
- Edit timetable entry
- Delete timetable entry
- View timetable
- Filter timetable
- Import timetable

==================================================
10. TIMETABLE IMPORT
==================================================

Allow admin to import timetable data from CSV and preferably Excel.

Example CSV structure:

date,day,start_time,end_time,subject,faculty,class_section,room,building

Validate imported data.

Detect:

- Missing room
- Missing faculty
- Invalid time
- Invalid date
- Duplicate timetable entries
- Overlapping room assignments
- Invalid room
- Invalid building

Show useful validation errors instead of silently accepting bad data.

==================================================
11. LECTURE CANCELLATION
==================================================

Faculty/admin can cancel a scheduled lecture.

Cancellation should contain:

- Timetable entry
- Cancelled by
- Reason
- Cancellation time

When a lecture is cancelled:

1. Change its status to CANCELLED
2. Release the assigned room
3. Recalculate room availability
4. Update dashboard
5. Update room timeline
6. Show the cancellation in the cancellation list

Example:

Physics
10:00 AM - 11:00 AM
Room A-101

CANCELLED

Room A-101 should immediately become:

AVAILABLE
10:00 AM - 11:00 AM

==================================================
12. TEMPORARY ROOM BOOKING
==================================================

Faculty should be able to temporarily book a room.

Booking form:

Room
Date
Start Time
End Time
Purpose

Example:

Room:
A-204

Date:
6 September 2026

Start:
12:30 PM

End:
2:00 PM

Purpose:
Project Discussion

Before confirming the booking, the backend MUST check:

- Timetable
- Cancelled lectures
- Existing bookings
- Time overlap
- Room availability

If unavailable, reject the booking and clearly explain why.

Example:

❌ Room A-204 cannot be booked.

Reason:
Scheduled lecture from 1:00 PM - 2:00 PM.

==================================================
13. BOOKING CONFLICT RULE
==================================================

Prevent overlapping bookings.

Example existing booking:

2:00 PM - 3:00 PM

User attempts:

2:30 PM - 3:30 PM

Reject it.

Show:

ROOM UNAVAILABLE

Existing booking:
2:00 PM - 3:00 PM

Available from:
3:00 PM

Also handle edge cases correctly.

For example:

Existing:
2:00 - 3:00

New:
3:00 - 4:00

This SHOULD be allowed because the periods touch but do not overlap.

==================================================
14. DATABASE
==================================================

Use Supabase (PostgreSQL Database with Supabase Auth, Realtime, and Row Level Security).

Design a clean relational database.

Suggested tables:

users
buildings
rooms
timetable_entries
cancellations
room_bookings
audit_logs

Users:

id
name
email
password_hash
role
created_at

Buildings:

id
name
code
location

Rooms:

id
room_number
building_id
floor
capacity
room_type
facilities
status

Timetable:

id
date
day
start_time
end_time
subject
faculty_id
class_section
room_id
status
created_at

Cancellations:

id
timetable_entry_id
cancelled_by
reason
cancelled_at

Bookings:

id
room_id
booked_by
date
start_time
end_time
purpose
status
created_at

Audit logs:

id
user_id
action
entity_type
entity_id
details
created_at

Use proper foreign keys and indexes.

==================================================
15. AUTHENTICATION
==================================================

Implement secure authentication.

Roles:

STUDENT
FACULTY
ADMIN

Protect routes based on role.

Students should not be able to:

- Create timetable entries
- Delete rooms
- Modify users
- Create admin accounts

Faculty should not be able to:

- Delete rooms
- Modify other faculty accounts
- Change global system configuration

Admin has full management permissions.

Never store plain-text passwords.

==================================================
16. API DESIGN
==================================================

Create clean backend APIs.

Examples:

GET /api/rooms

GET /api/rooms/:id

GET /api/rooms/available

GET /api/rooms/:id/availability

GET /api/timetable

POST /api/timetable

PUT /api/timetable/:id

DELETE /api/timetable/:id

POST /api/timetable/:id/cancel

GET /api/cancellations

POST /api/bookings

GET /api/bookings

DELETE /api/bookings/:id

GET /api/dashboard

POST /api/timetable/import

Create proper validation and error handling.

Never trust availability calculated only on the frontend.

The backend must perform the final availability check before booking.

==================================================
17. DASHBOARD
==================================================

Create a modern dashboard.

Student dashboard:

--------------------------------
SMART ROOM FINDER
--------------------------------

Available Rooms Now: 12
Occupied Rooms: 34
Cancelled Classes Today: 5

[ Find a Room ]

Today's Timetable

Upcoming Classes

Recent Cancellations

Available Rooms
--------------------------------

Faculty dashboard:

Today's Classes
Available Rooms
Book a Room
Cancel Lecture
My Bookings

Admin dashboard:

Total Rooms
Available Now
Occupied Now
Today's Classes
Today's Cancellations
Today's Bookings

Quick actions:

Add Room
Add Timetable
Import Timetable
Manage Users
View Conflicts

==================================================
18. DESIGN / UI
==================================================

Create a professional university-style interface.

The design should be:

- Modern
- Clean
- Minimal
- Responsive
- Mobile friendly
- Easy to understand

Use cards, tables, filters, badges, calendars and timelines where appropriate.

Room status must be visually obvious:

🟢 AVAILABLE
🔴 OCCUPIED
🟡 BOOKED
⚪ UNAVAILABLE
❌ CANCELLED

Do not overload the interface with unnecessary animations.

Focus on usability.

==================================================
19. NATURAL LANGUAGE ROOM SEARCH
==================================================

If practical, add a natural-language search feature.

Examples:

"Find a classroom for 60 students from 2 PM to 4 PM."

"Which labs are free right now?"

"Which rooms are available after 3 PM?"

"Find an available classroom in Block A tomorrow from 10 to 12."

Convert the natural language request into structured filters:

date
startTime
endTime
building
roomType
capacity

Then use the SAME availability engine.

Do not allow an AI/NLP layer to bypass backend availability validation.

==================================================
20. NOTIFICATIONS
==================================================

Design the application so notifications can be added later.

Potential notifications:

- Lecture cancelled
- Room booking confirmed
- Room booking rejected
- Booking ending soon
- Room becomes available

For the initial version, in-app notifications are sufficient.

==================================================
21. TESTING
==================================================

Write automated tests for the availability engine.

At minimum test:

TEST 1:
Normal timetable → room occupied.

TEST 2:
Cancelled lecture → room becomes available.

TEST 3:
Manual booking → room becomes occupied.

TEST 4:
Overlapping booking → rejected.

TEST 5:
Back-to-back bookings → allowed.

TEST 6:
Future availability → correctly calculated.

TEST 7:
Current availability → correctly calculated.

TEST 8:
Next available time → correctly calculated.

TEST 9:
Next scheduled occupation → correctly calculated.

TEST 10:
Room capacity filtering.

TEST 11:
Room type filtering.

TEST 12:
Building filtering.

TEST 13:
Multiple cancelled lectures.

TEST 14:
Multiple bookings in one day.

TEST 15:
Timetable and booking conflict.

==================================================
22. IMPORTANT EDGE CASES
==================================================

Handle:

- Midnight/time boundaries
- Different dates
- Back-to-back classes
- Cancelled classes
- Cancelled bookings
- Inactive rooms
- Invalid rooms
- Duplicate timetable entries
- Overlapping timetable entries
- Overlapping bookings
- Empty search results
- Room becoming available between two classes
- Room being booked immediately after a class ends
- Day changes
- Missing timetable data

==================================================
23. EMPTY STATES
==================================================

Do not show blank pages.

Example:

"No classrooms are available for the selected period."

Then suggest:

"Try an earlier start time, later end time, another building, or a different room type."

==================================================
24. ERROR HANDLING
==================================================

Create user-friendly error messages.

Do not expose raw database errors to users.

Example:

Instead of:

Database constraint violation...

Show:

"Room A-201 is already booked from 2:00 PM to 3:00 PM."

==================================================
25. PROJECT STRUCTURE
==================================================

Use a clean scalable architecture.

Separate:

- UI components
- Pages
- API routes
- Database
- Authentication
- Availability service
- Booking service
- Timetable service
- Validation
- Utilities
- Tests

The availability logic must NOT be duplicated across multiple pages.

==================================================
26. MAIN USER FLOW
==================================================

The final system should support this complete flow:

COLLEGE TIMETABLE
        ↓
LECTURE CANCELLED?
        ↓
YES → RELEASE ROOM
        ↓
MANUAL BOOKING?
        ↓
YES → CHECK CONFLICT
        ↓
AVAILABILITY ENGINE
        ↓
CALCULATE ROOM STATUS
        ↓
STUDENT/FACULTY SEARCH
        ↓
SHOW AVAILABLE ROOMS
        ↓
SHOW AVAILABLE FROM / UNTIL
        ↓
OPTION TO BOOK
        ↓
FINAL SERVER-SIDE AVAILABILITY CHECK
        ↓
CONFIRM BOOKING

==================================================
27. EXAMPLE FINAL RESULT
==================================================

If the user searches:

Date:
Monday

Time:
10:00 AM - 12:00 PM

Room type:
Classroom

Capacity:
50

Show:

AVAILABLE ROOMS

A-101
Classroom • 60 seats
🟢 Available
10:00 AM - 11:00 AM
Next class: 11:00 AM

A-203
Classroom • 70 seats
🟢 Available
9:30 AM - 12:30 PM
Next class: 12:30 PM

B-102
Classroom • 60 seats
🔴 Occupied
Available from: 12:00 PM

Do NOT list B-102 as available for the requested 10 AM - 12 PM period.

==================================================
28. TECHNOLOGY
==================================================

If no existing technology stack is present, use:

Frontend:
Next.js + React + TypeScript

Styling:
Tailwind CSS

Backend:
Next.js server/API routes or a clean Node.js backend

Database:
Supabase (Managed PostgreSQL)

ORM / Client:
Prisma / Supabase JS Client

Authentication:
Supabase Auth (Secure JWT & Session-based authentication with RBAC)

Validation:
Zod or equivalent

Testing:
Vitest/Jest + Playwright or equivalent

Use TypeScript throughout the project.

==================================================
29. DEVELOPMENT ORDER
==================================================

Implement in this order:

PHASE 1:
Inspect existing project.

PHASE 2:
Create database schema.

PHASE 3:
Implement authentication and roles.

PHASE 4:
Create rooms/buildings management.

PHASE 5:
Create timetable management.

PHASE 6:
Create cancellation system.

PHASE 7:
Create centralized availability engine.

PHASE 8:
Create room search.

PHASE 9:
Create room timeline.

PHASE 10:
Create booking system.

PHASE 11:
Create dashboards.

PHASE 12:
Create timetable import.

PHASE 13:
Add validation and error handling.

PHASE 14:
Add tests.

PHASE 15:
Improve responsive UI and UX.

==================================================
30. FINAL REQUIREMENT
==================================================

The final application should make these questions extremely easy to answer:

1. Which room is available right now?

2. Which room is available at a specific time?

3. Until what time is the room available?

4. When will an occupied room become available?

5. Why is the room occupied?

6. Has the lecture occupying that room been cancelled?

7. Can I book the room?

8. If I cannot book it, what is causing the conflict?

9. What is the next lecture/booked event in that room?

10. Which rooms are available for my required duration?

Build the application around these questions.

IMPORTANT:
Do not stop at creating the frontend.

Implement the actual database, backend APIs, availability algorithm, authentication, booking logic, cancellation logic, and tests.

If something is ambiguous, choose a sensible production-ready implementation and clearly state the assumption before implementing it.

Start by inspecting the project and giving me:
1. Current project structure
2. Proposed architecture
3. Database schema
4. Availability algorithm
5. Implementation plan

Then begin implementation.