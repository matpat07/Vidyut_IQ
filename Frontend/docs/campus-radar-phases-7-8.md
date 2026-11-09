# Campus Radar: electricity analytics and map modes

Implemented inside `Frontend/`, using React 18.3.1, the existing Fiber/Three scene and Recharts 2.15.4. No dependency, backend, simulation formula, timetable parser, or application-wide state changes.

## Source audit

The running frontend obtains `RoomViewData` from `SimulationContext`. Its existing `iotSimulator`, `wastageEngine`, timetable parser, room inventory and configurable tariff supply the demo. There is no implemented energy HTTP/WebSocket client, energy endpoint, or persisted meter history in the current application. Root backend/architecture Markdown files describe planned services; those descriptions are not running API contracts. No planned endpoint has been called or invented.

`CampusRadar.energyProvider` is an optional typed frontend injection point, defined in `energy/energyTypes.ts`. Its owner supplies the existing transport through `read(query, signal)`. The query identifies `hour` or `day`, an ISO as-of time and `Asia/Kolkata`. The response identifies the same period, its display window and explicitly connected records. Power is kW; interval and period energy are kWh; tariff is INR/kWh. Appliance values must be measured kW. Anomalies require severity, reason and evidence; `anomaliesAssessed` explicitly distinguishes no active alert from unavailable assessment. This boundary adds no HTTP endpoint or new backend model.

No provider is configured by the current app. Live / Connected mode therefore shows **Not connected**, with unavailable readings and no demo fallback. Hook behavior is verified with a local test fixture, not a real energy service. A real provider remains to be supplied when that service exists.

## Behavior and assumptions

- Demo mode visibly labels readings, summary, tooltip and selected-room panel. Power, occupancy, timetable and alerts reuse existing source outputs.
- Past hour ends at the simulation clock. Today starts at 09:00 and ends at that clock. Demo consumption integrates the existing deterministic power function over five-minute intervals using trapezoidal integration. The current appliance configuration is held across this modeled period. This is representative history, not a record of previous appliance changes or measured historical consumption.
- The simulator's approximate cumulative meter includes an offset and is not treated as selected-period consumption. Existing simulator formulas remain unchanged.
- Estimated cost requires finite nonnegative consumption and tariff. Demo uses the existing configurable assumed tariff; connected records must provide their own valid tariff. Zero tariff is valid. Missing or invalid metrics remain unavailable.
- Demo appliance demand aggregates supported inventory categories: lighting, fans, AC, workstations and projector/AV. These are labeled nameplate estimates, excluding the simulator's standby/noise. No actual appliance readings or invented inventories are claimed.
- Strict plan/source matching retains the existing block, floor, room number/alias and compatible type checks. Only ten existing source records have verified geometry mappings. Floors 3 and 4 and other unlinked facilities remain unavailable; conflicting room types still require verification. Merged spaces remain one selectable geometry.
- Room View retains the architectural material language. Energy View uses a fixed four-bin scale: `<1`, `1–<5`, `5–<20`, `>=20` kWh; optional capacity normalization uses `<0.05`, `0.05–<0.2`, `0.2–<0.5`, `>=0.5` kWh per capacity seat. The period and units are visible. Capacity is not actual attendance or surveyed floor area. Unavailable rooms are faded and identified in the accessible label/legend.
- Anomaly View uses existing evaluated demo alerts or connected source evidence. Existing MEDIUM/HIGH alerts map to Warning; CRITICAL maps to Critical. High consumption alone never creates an anomaly. Normal and unavailable assessment remain distinct.
- The strict UI palette is retained. Warning uses muted purple rather than introducing amber; Critical uses the approved red. Selected critical labels pulse slowly in CSS, respecting reduced motion. Idle WebGL rendering does not run continuously.
- Hover reports room identity/type, demand, period consumption, cost, status and update time. Details add the historical graph, supported appliances, timetable/occupancy, anomaly evidence and available operational recommendations. Missing metrics have explicit unavailable states.
- The DOM details panel scrolls independently beside the vertical floor selector in a fixed desktop rail. Camera clearance accounts for that rail and the toolbar outside the canvas, keeping the focused floor large on shorter screens. Floor selection, camera controls, source/period/view controls and application navigation remain fixed. Mode/source changes recolor existing meshes without rebuilding geometry. Mobile Radar compacts the existing simulation controls using scoped CSS; other screens retain their layouts.

## Files

- `src/components/radar/energy/`: typed adapter, provider hook, map color classification, controls, shared readings and room-history graph.
- `src/components/radar/building/BuildingViewer.tsx`, `BuildingScene.tsx`, `FloorRooms.tsx`, `PlanRoomDetails.tsx`, `building.css`: wiring, camera clearance, materials, details and responsive presentation.
- `src/components/radar/CampusRadar.tsx`: optional provider pass-through.
- `tests/room-energy.test.mjs`: deterministic integration, cost validity, source provenance, missing data, anomaly evidence and normalization checks.

## Verification

- `cd Frontend && npm.cmd test`: 24 passing tests, including prior floor geometry, navigation and explosion regressions.
- `cd Frontend && npm.cmd run build`: TypeScript and Vite production build pass. Existing large-chunk advisory remains; no dependency or bundler workaround added.
- Isolated Chrome on Windows, using software WebGL: actual hover/card selection, details, historical-chart mounting, period changes, all three modes, normalization, honest unmapped/conflicting rooms, disconnected mode without fallback, existing simulation modal, reset and idle rendering. Console is clean.
- Responsive checks at 320×844, 390×844, 768×1024, 1024×900 and 1440×900, plus a 1480×1100 desktop preview. Canvas/camera/separation controls fit; mode changes preserve stationary layout and geometry identity. Light/dark and reduced-motion behavior checked. These are software-rendering checks, not real-GPU performance measurements.
- A local provider fixture verifies loading, switching source/period, stale-response rejection, missing tariff, provider failures and mismatched-period rejection. It is not wired into the application or production build.
- The existing browser transition suite also passes: switching through the complete floor stack, both reset controls, interrupted/latest floor requests, reduced motion, mobile reset and idle rendering. Existing context, services, data, types and calculation configuration remain byte-identical to their original counterparts.

Previews: `building-phase-7-details.png`, `building-phase-7-mobile.png`, `building-phase-8-energy.png`, `building-phase-8-anomalies.png`, `building-phase-8-light.png`.
