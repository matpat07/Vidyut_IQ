# Phase 4 — fixed floor navigation and camera dive

Implemented inside Campus Radar with the existing React 18 / Fiber 8.18 / Three 0.170 stack. No dependencies added. The supplied spatial-3d-interfaces `SKILL.md` was consulted; its linked `references/` files are absent. The large borderless viewport and scoped explosion are preserved.

## Interaction

The fixed rail offers **F5 — Fifth Floor** through **F1 — First Floor**, with red active states and `aria-pressed`. Phones use a compact fixed row. Navigation/exit controls remain accessible during camera motion; only summary content scrolls independently on constrained screens.

Selecting a floor opens the stack, then eases the existing camera toward that level, fades the other floors/roof/site and frames an elevated, slightly tilted roofless plan. Its partitions, doorway openings and clickable room surfaces are Three geometry. Labels are projected DOM controls. All five assemblies stay mounted when switching floors.

Hover a room surface/label for supported energy status; click to highlight it and show data beside the map. The keyboard-accessible room selector exposes every traced room. Supported rooms open the existing room-detail modal, retaining its energy, timetable, sensor and action controls.

- **Back to Building:** clears selection and reassembles the exterior.
- **Back to Floor Stack:** clears selection and returns to the large exploded overview with scoped scrolling enabled.
- **Reset View:** both buttons clear selection and transition back to the fully exploded stack, resetting its angle/zoom. A pending floor dive is cancelled.
- Switching floors clears the old room, pulls back from the current camera pose, shows the full stack briefly, then dives into the requested floor without reconstructing the scene. The outgoing floor stays at its own elevation until the camera reaches the overview; no close-up sweep between floor elevations occurs. Rapid requests use the latest destination.
- Focused mode disables accidental stack scrubbing. Mouse/two-finger orbit, presets and zoom remain available. The Separation slider explicitly returns to stack mode.

## Architectural and data assumptions

All five supplied images were visually inspected and traced individually from `3D_view_reference_images/`:

1. `Updated PCCOE Building 6 Floor Plan.png`
2. `PCCOE Building 6 Second-Floor Plan.png`
3. `PCCOE Building 6 – Third Floor Plan.png`
4. `Building No. 6 – Fourth Floor Plan.png`
5. `PCCOE Building 6 Fifth-Floor Plan.png`

Drawing north maps to scene −X; west/entrances map to +Z. Drawing pixels are normalized onto the approved 72 × 18 narrow continuous envelope, retaining its rear setbacks. Room depths are clipped inward at those setbacks so they stay on their slabs. These are conceptual proportions, not surveyed metres. Low cutaway walls and doorway widths are presentation dimensions. Existing curved stair towers retain their positions. Rear stair/lift outlines are compressed inward to fit the stepped envelope; their exact positions require architectural verification.

Floor 1 retains its Data Centre, split north laboratories and three south labs. Floors 2–3 retain their extra west cabin and four south labs. Floors 4–5 have their larger north labs and south cabins. Unnumbered cabins/washrooms get local UI keys without invented room numbers. Unlabelled bays remain unassigned. The large unlabelled central region remains continuous unassigned floor surface; no courtyard opening or new wing was created.

Telemetry matching requires **block, floor, number and compatible room type**. Supported links: 6102, 6103, 6104, 6107, 6115, 6201, 6202, 6206, 6210 and 6518. Plan/dataset conflicts for 6204 and 6208 show verification messages. Room 6207 has no record and shows unavailable data. Dataset room 6216 is not assigned an invented position. Floors 3–4 have no telemetry. Floor “Known nodes” counts source records, rather than claiming they all have verified spatial mappings.

No backend/API behavior, simulation formulas, timetable parsing, context, services, datasets, data models or unrelated screens changed. No energy/anomaly values were fabricated. Survey validation and subsequent-phase energy/anomaly visualization modes remain outside this phase.

## Files

- New `src/components/radar/building/floorPlans.ts`: five layouts, footprint normalization, strict data links and synchronized floor/room reducer.
- New `floorFocus.ts`: shared focus/elevation pose, opening gate, interrupted/reversed transitions and reduced motion.
- New `FloorRooms.tsx`: persistent partition batches, room surfaces/picking and projected room/circulation labels. Small-screen labels appear when they fit; the room selector exposes the complete plan.
- New `PlanRoomDetails.tsx`: existing-source metrics, explicit missing/conflicting states and existing modal entry.
- Updated `BuildingViewer.tsx`, `BuildingScene.tsx`, `BuildingModel.tsx`: fixed navigation, camera dive, material fades, selection and demand-rendered lifecycle.
- Updated `ScenePrimitives.tsx`, `Entrances.tsx`, `useExplosionInput.ts`, `building.css`: material roles, focused-mode input isolation and responsive fixed controls.
- Updated `src/components/radar/CampusRadar.tsx`: forwards the existing inspection callback.
- New `tests/floor-navigation.test.mjs`: geometry/mapping/selection/focus checks.

Implementation follows [Fiber mesh events](https://r3f.docs.pmnd.rs/api/events) and [demand rendering/invalidation](https://r3f.docs.pmnd.rs/advanced/scaling-performance). Per-frame poses use refs/Three objects. The wake-up frame excludes long idle time from animation time. Labels reproject after camera motion; listeners, subscriptions and controls clean up on unmount.

## Verification

- `npm test` inside Frontend: **13 passed**, including six existing explosion tests and regression checks for the staged switch and cancellation.
- `npm run build` inside Frontend: **TypeScript and Vite passed**. Existing >500 kB bundle advisories remain.
- Isolated Chrome/SwiftShader verified automatic opening/dive, isolation, hover, label/mesh picking, room-selector synchronization, the existing modal, zoom/reset, rapid interrupted switches, both return paths, reduced motion, idle rendering and Dashboard navigation. Camera/floor UUIDs stayed unchanged across switches. Normal runs reported zero console errors/warnings.
- All five floors/four focused presets exercised. Navigation/exit controls were hit-tested and stayed fixed across selections at 1280 × 800, 768 × 1024, 390 × 844 and 1280 × 650. Desktop 1480 × 1100 and mobile room selection also passed without document overflow.
- Context, services, data, types and calculation configuration remain byte-identical to preserved originals.
- Observed software-renderer counts: assembled 224 calls / 44,444 triangles; focused Floor 2, 52 calls / 13,408 triangles. These are not hardware GPU/frame-rate benchmarks.

Previews: [Floor 2](building-phase-4-floor2.png), [mobile](building-phase-4-mobile.png), [shorter desktop](building-phase-4-desktop.png).

## Reset and floor-switch correction

The follow-up changes `floorFocus.ts`, `BuildingViewer.tsx`, `BuildingScene.tsx` and `tests/floor-navigation.test.mjs`. The focus controller owns the pull-back/overview/dive sequence and its short overview hold; no delayed React callbacks or browser timers are introduced. The rendered floor snapshot keeps room labels and the active floor synchronized while another floor is pending. The camera pulls out from its actual orbited/zoomed pose. Reset cancels the pending target and restores explosion progress 1.

Isolated Chrome/SwiftShader checks confirmed both Reset View buttons, a visible fully opaque stack before a new dive, rapid latest-target switching, cancellation during a switch, reset from an orbited/zoomed floor, reduced motion, stationary controls, mobile reset and idle rendering. There were zero browser errors/warnings. The production build passed with the existing bundle-size advisories.
