# Phases 5 and 6 — floor reconstruction and interactive miniature map

Completed 9 November 2026 inside `Frontend/`, using the installed React 18, React Three Fiber 8.18 and Three 0.170 stack. No dependencies were added. The supplied spatial-3d-interfaces skill was used; its linked reference files and a separate workspace-map UI reference image are absent from this checkout. The five supplied floor-plan images were inspected individually. The written miniature-map criteria and existing palette guide the analytical presentation.

## Floor definitions

Each floor now has an independent, explicitly numbered source file under `src/components/radar/building/plans/`. Shared building boundary and circulation helpers do not generate room numbers or copy one floor's room list to the others.

| Floor | Preserved distinctions |
| --- | --- |
| 1 | Split north laboratories and cabin, 6102/6103 classrooms, Data Centre, east cabins/washrooms, three south labs; no invented 6101 or 6121 |
| 2 | Cabin between 6203 and 6202, lower-left 6201 classroom, four south labs, its own 6200 numbers and visible unlabelled bay |
| 3 | Separate 6300 identifiers, left cabin, lower-left classroom and its own recorded spaces |
| 4 | 6409/6410/6414/6415 classrooms; 6402/6404/6408 labs; 6419/6420 cabins; one 6406 lab with legacy alias 6405 |
| 5 | Corresponding 6500 identifiers and room types; one 6506 lab with legacy alias 6505 |

Merged laboratories have one selectable polygon and one canonical ID; an alias resolves to that same ID. The image's visible 6406/6506 remains the primary displayed number. The historical 6405/6505 aliases come from the user's explicit instructions. They do not create extra rooms, surfaces or duplicate telemetry.

Every space includes a stable local ID, globally unique building/floor UID, namespace, floor, optional displayed number, full name/type, aliases, source drawing bounds, scene polygon, label position, known door-edge apertures and corridor references, and energy/occupancy mapping keys. The latter are spatial lookup keys, not fabricated meter IDs. Supported source energy/schedule identifiers are returned separately by `roomMappings.ts` against existing records.

Staircases, lift, corridors and the two documented east passages are selectable facilities. Unnumbered cabins and washrooms have descriptive names/local keys. Visible unlabelled bays are recorded as unknown-purpose facilities without invented architectural numbers.

## Geometry and uncertainty

The five principal references remain the files named by `PLAN_REFERENCES` in `floorDefinitions.ts`, all under the repository's `3D_view_reference_images/` directory. Their conceptual drawing coordinates are normalized onto the previously approved narrow, continuous building and its shallow rear setbacks. Room depths are fitted inward at those setbacks. This preserves the user's approved exterior rather than adding a courtyard, wing or extra building width.

Rooms are actual extruded polygon geometry. Partition walls follow polygon edges; shared axis-aligned walls are merged and documented doorway apertures are subtracted before batching. The two entrance stairs use curved polygon footprints aligned with the existing approved towers. The rear stair and lift remain compressed inward to fit the approved envelope. Four corridor surfaces, two east passages, front entrance openings, low perimeter walls and a floor boundary outline provide a readable circulation structure.

These are conceptual plans, not surveyed CAD. Exact doorway widths, wall heights and rear-core dimensions remain presentation approximations. Where an image does not show an unambiguous access opening, the room metadata says so and no centered doorway is invented. The unlabelled central region remains unassigned floor surface. No unknown room numbers or purposes are filled in.

## Interaction and presentation

- The analytical interior uses the exact application palette, matte fills by room type, low roofless walls, dimensional shadows and readable projected labels. The exterior's previously approved reference materials are retained.
- Hovering a room brightens/lifts its surface and highlights its polygon outline. Its DOM information card is anchored to the room's projected position, follows camera updates and is clamped inside the viewport above the toolbar.
- A short, cleaned-up hover grace period lets the pointer move from the room/label to the card without flicker. The card shows full room type, available kW/kWh and alert status, plus an accessible View details button. Unknown readings are explicitly unavailable.
- Clicking a surface, label, card action or room-selector option updates one shared selected-space ID. The outline persists after hover ends. Selecting another room updates the panel while the rest of the floor remains visible.
- The normal React detail panel includes type/name, aliases, source power/energy/occupancy, electrical readings, current/next schedule information, appliance states, plan-access notes and known ambiguity. Supported rooms retain the existing full room-detail modal.
- Close room clears room selection/highlight and restores the whole-floor state without leaving the floor. On phones, primary metrics appear first; remaining detail content scrolls independently.
- The keyboard room selector exposes all spaces even when small-screen labels cannot fit legibly. No optional furniture was added at the expense of geometry or interaction.
- Reset View continues returning to the fully exploded stack. Switching floors continues pulling out to that stack before diving into the latest requested floor. Header/sidebar/floor controls stay stationary.

No camera or floor assemblies are reconstructed during room selection or floor changes. Extrusion arguments and outline buffers are memoized; owned outline buffers are disposed on unmount. Hover lift uses refs and demand invalidation, settles when idle, and respects reduced motion. The 160 ms hover grace timer is unrelated to the pose-driven floor-transition controller and is cleared on unmount or floor exit.

## Data integrity

Geometry and energy records are separate. Matches require building block, floor, room number/alias and compatible type. Multiple source records for one merged space produce a verification message rather than being added together. Existing 6204/6208 plan/type conflicts and 6207's missing record remain explicit. No zero consumption is invented for missing data. No simulation, timetable, anomaly, state, service, source dataset, API or calculation formula changed.

## Files

New data/geometry modules: `planTypes.ts`, `planGeometry.ts`, `floorDefinitions.ts`, `plans/floor1.ts` through `floor5.ts`, and `roomMappings.ts` in `src/components/radar/building/`.

Updated implementation: `floorPlans.ts` compatibility/navigation exports, `FloorRooms.tsx`, `BuildingViewer.tsx`, `BuildingScene.tsx`, `BuildingModel.tsx`, `PlanRoomDetails.tsx`, `ScenePrimitives.tsx`, `architecture.ts`, and `building.css`. Added geometry/mapping/access assertions in `tests/floor-navigation.test.mjs` while retaining explosion/focus regression coverage.

## Verification

- `npm test` inside Frontend: **16 passed**. Coverage includes per-floor types, skipped numbers, merged aliases, unique IDs, valid polygons/labels, curved stair bounds, slab constraints, actual open door midpoints after wall merging, strict telemetry mapping, selection/closing, explosion and staged floor-switch cancellation/reduced motion.
- `npm run build` inside Frontend: **TypeScript and Vite passed**. Existing large-bundle advisories remain visible.
- Isolated Chrome/SwiftShader exercised all five floors, actual polygon picking, hover lift/outline, persistent selection, geometry reuse across hover/selection, moving into the hover card, corner-card bounds, room closing, missing/conflicting data, facilities, the original room modal and mobile layout. Camera/floor UUIDs remained stable. Normal runs reported zero console errors/warnings.
- The prior Reset View and pull-back/stack/dive browser regression also passed, including cancellation, rapid requests, orbited/zoomed reset, reduced motion and mobile reset.
- Observed assembled software-renderer count: 283 draw calls / 47,158 triangles. This is an inspection count, not a hardware GPU or real-device frame-rate benchmark.
- No tracked files outside Frontend changed. Preserved context, services, data, types and calculation configuration remain byte-identical to the originals. No push was performed.

Previews: [Floor 1](building-phase-5-floor1.png), [Floor 4](building-phase-5-floor4.png), [hover card](building-phase-6-hover.png), [selected room](building-phase-6-selected.png), [mobile](building-phase-6-mobile.png).

## Front-corridor correction

The user clarified that the strip between the front room row and the outer edge is not a corridor on any floor. All five definitions now remove that selectable circulation space and extend the adjacent room polygons to the existing front facade. The building footprint and other corridors remain unchanged. The two ends retain their stair landings. Room opening locations are retained from the drawings, but the former front-corridor access references are cleared and explicitly marked unverified rather than assigning an invented route.

Validation: 17 tests passed; TypeScript/Vite build passed with the existing bundle advisories. Chrome checked all five floors for removal of the corridor option and actual room geometry reaching the front boundary, with zero browser errors/warnings. Updated preview: [front corridor removed](building-front-corridor-removed.png). Earlier previews above record the pre-correction state.

## Lift and washroom corrections

The marked northern rear core is a lift on every floor, superseding the earlier staircase interpretation. Its metadata and label now identify a lift, and its stair treads have been removed. The existing opposite lift and two curved entrance staircases remain in place. Both central washrooms now display **WR**, while their full washroom names/types remain available in the selector and details.

All five floors were checked in Chrome with no console errors/warnings. All 18 tests and the production build passed; existing bundle-size advisories remain. Current preview: [corrected lifts and WR labels](building-facilities-corrected.png).
