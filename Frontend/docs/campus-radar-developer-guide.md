# Campus Radar developer guide

The implementation lives entirely inside `Frontend/`. It uses the existing React 18 / TypeScript / Vite application, Fiber 8.18.0, Three 0.170.0 and Recharts. The default dashboard, simulation state, timetable parser, anomaly rules and calculations retain their existing ownership.

## Where changes belong

Paths below are relative to `src/components/radar/`.

| Responsibility | Existing module |
| --- | --- |
| Application integration, building/list tabs and shared source/period preferences | `CampusRadar.tsx` |
| Fixed controls, floor navigator, hover card and contextual details | `building/BuildingViewer.tsx` |
| Canvas, lights, frame clock, floor labels and WebGL lifecycle | `building/BuildingScene.tsx` |
| Exterior/floor stack assembly and cutaway visibility | `building/BuildingModel.tsx` |
| Facade, roof, entrances and landscaping | `building/Facade.tsx`, `Entrances.tsx`, `Landscaping.tsx` |
| Architectural dimensions, footprint, physical materials and instanced parts | `building/architecture.ts`, `ScenePrimitives.tsx` |
| Five independent room traces | `building/plans/floor1.ts` through `floor5.ts` |
| Normalized room records, facilities, corridors and source-image manifest | `building/floorDefinitions.ts`, `planTypes.ts` |
| Polygon conversion, labels, boundaries and door apertures | `building/planGeometry.ts`, `FloorRooms.tsx`, `labelLayout.ts` |
| Camera ownership, floor transition, explosion and input | `building/transitionController.ts`, `CameraRig.tsx`, `floorFocus.ts`, `explosion.ts`, `useExplosionInput.ts` |
| Header search and equivalent non-3D workflow | `building/RoomSearch.tsx`, `PlanRoomList.tsx` |
| Room/source reconciliation | `building/roomMappings.ts` |
| Energy provider contract, adapter, fetching and color classification | `energy/energyTypes.ts`, `energyAdapter.ts`, `useRoomAnalytics.ts`, `energyVisuals.ts` |
| DOM readings, details, graph and legends | `energy/EnergyReadings.tsx`, `RoomHistory.tsx`, `EnergyControls.tsx`, `building/PlanRoomDetails.tsx` |

These modules already cover the requested component responsibilities. Renaming them to match a suggested component list is unnecessary. Keep source records separate from geometry, camera state and DOM presentation.

## Floor-plan provenance and approved corrections

`floorDefinitions.ts` stores the source filenames in `PLAN_REFERENCES`. Source images are repository reference material under `3D_view_reference_images/`; they are not runtime floor-map textures or a requirement for independently running `Frontend/`.

| Floor | Source image | Important distinctions |
| --- | --- | --- |
| 1 | `Updated PCCOE Building 6 Floor Plan.png` | Separate 6105/6106 labs and north cabin; Data Centre in the lower west bay; three southern laboratories; no invented 6101 or 6121. |
| 2 | `PCCOE Building 6 Second-Floor Plan.png` | Cabin between 6203/6202; lower west classroom; its own four southern divisions. |
| 3 | `PCCOE Building 6 – Third Floor Plan.png` | Independent 6300-series layout, added left cabin and lower-left classroom. |
| 4 | `Building No. 6 – Fourth Floor Plan.png` | 6409/10/14/15 classrooms; 6402/04/08 labs; 6419/20 cabins; one combined 6406 lab with alias 6405. |
| 5 | `PCCOE Building 6 Fifth-Floor Plan.png` | Independent 6500-series definitions with the user-confirmed fourth-floor types and merged 6506/6505 lab. |

The following later user corrections override early interpretations in historical phase notes and conflicting raster details:

- Preserve the continuous narrow footprint and shallow rear setbacks from the approved aerial reference. Do not reintroduce an open courtyard, extra wing or wider building.
- There is no front corridor below the central row of rooms on any floor. Those room polygons extend to the approved front facade. The two stair landings remain. The former corridor-access associations are explicitly unverified.
- The northern rear core is a lift, not a staircase. Every floor has two lifts and the two curved entrance staircases.
- Both central washrooms display `WR`. Their internal kind remains `WF`, and their semantic type is Washroom.
- A combined laboratory is one geometry, with historical aliases; a skipped or unlabelled room number is not permission to add a room.

The drawings are conceptual rather than surveyed CAD. The normalized building width/depth are 72/18 design units, with floor height 3.4. These values are not measured metres or verified floor area. Rear core compression, ambiguous access and unlabelled spaces are recorded in room/floor notes. Keep these uncertainties visible when editing.

## Updating room names and types

Edit the appropriate `plans/floorN.ts` entry. `trace(key, kind, rect, doors, options)` is the authoring helper; for example, this existing merged-room definition uses:

```ts
trace('6406', 'LAB', [215, 165, 500, 305],
  [['south', .84, .97, 'north']], {
    aliases: ['6405'],
    name: 'Combined laboratory 6406',
    note: 'Single physical space; historical alias 6405.',
  });
```

Change `name` for a display-name edit. Keep the stable `key`, generated `id` and `uid` unchanged when identity has not changed. Numbered keys become IDs such as `6406`; unnumbered keys become IDs such as `f4-west-cabin`. The globally namespaced UID is `b6:f4:6406` or `b6:f4:west-cabin`.

Use the documented kind (`CR`, `LAB`, `CABIN`, `WF`, `DATA`, `STAIR`, `LIFT`, `CORRIDOR`, `OTHER`). Only change a type when supported by the reference or an explicit correction. A type change can deliberately invalidate the telemetry mapping; do not reclassify backend appliances to make that mismatch disappear.

## Updating boundaries and layouts

`rect` is `[left, top, right, bottom]` in the authored drawing coordinate system. `planRect()` in `planGeometry.ts` rotates and normalizes it: drawing north maps toward scene `-X`, and the west/entrance side maps toward `+Z`. Scene polygon points are `[X, Z]` on the horizontal floor plane. The conversion also respects shallow rear setbacks.

1. Inspect the floor's actual source drawing before editing its rectangle or divisions. Edit only that floor's trace array; do not generate a generic numbered sequence for all floors.
2. Keep shared wall boundaries consistent between adjacent spaces. `roomWallSegments()` merges shared walls before subtracting actual door openings.
3. For a verified nonrectangular room, add a documented polygon override in `floorDefinitions.ts`, keyed by the stable source identity. Set `labelPosition` inside that polygon and update door edge indices. Rendering, picking and outlines already consume `PlanRoom.polygon`; do not put invisible rectangles over a PNG.
4. Shared lift, stair and landing geometry is authored in `facilities()`; documented corridors/passages are in `circulation()`. Numbered rooms and central washrooms remain in their independent floor trace arrays.
5. The front-row correction in `buildSpace()` currently applies to source rectangles starting at `left === 320` with `top >= 478`. If re-tracing or rescaling those source coordinates, update that architectural rule intentionally; changing coordinates alone must not restore the removed corridor.
6. Keep every polygon finite, positive in area, inside the approved envelope and uniquely identified. Preserve curved stair footprints. Keep labels inside rooms and preserve documented passage openings.

Door traces are `[sourceSide, startFraction, endFraction, corridorName]`. Fractions lie in `[0,1]`; the side names refer to the drawing. `buildSpace()` maps them to polygon edges and reverses spans on south/west edges as needed. An explicit normalized door uses `{edge, span, corridor?, certainty:'diagram'}`. Do not assign a corridor route if it is not known. Geometry/door tests cover openings and the approved front-row correction.

Changing the building's overall envelope belongs in `architecture.ts` and requires rechecking camera fit, rear clamping, all five plans and entrances together. Do not compensate for a room-edit mistake by widening the building.

## Updating energy mappings

`resolvePlanRoom()` reconciles geometry with available `RoomMetadata`: the source must match Block 6, floor, room number or alias, and compatible classroom/laboratory type. Multiple source records for one merged geometry are rejected for verification, rather than summed twice. The current resolver supports verified classroom/laboratory records; facilities need a real compatible source contract before their mappings can be expanded.

The plan's `energyKey` and `occupancyKey` are stable namespaced identifiers, not fabricated meter IDs. They do not automatically create an API binding. Extend the adapter/resolver using a verified backend identifier if a future source uses a different ID scheme.

Current reconciliations include ten verified room records. Room 6207 has no existing source record; 6204 and 6208 have plan/source type conflicts; 6216 has an unplaced source record. Floors 3/4 and most other rooms have no telemetry. Preserve these unavailable/conflict states until supported by actual records.

The running frontend has no implemented live energy API. Demo mode reuses `SimulationContext`, `iotSimulator`, `wastageEngine`, existing inventory and timetable. Its period history integrates the deterministic power model in five-minute intervals with current appliance settings held over the period; it is visibly labeled modeled history, not measured history. Never use the approximate cumulative simulator counter as a selected-period difference.

To connect an existing real transport, supply `CampusRadar.energyProvider`, implementing `ConnectedEnergyProvider` from `energyTypes.ts`. Keep transport code outside Three components. Pass through the `AbortSignal` and return the requested period/window with explicitly connected records. No new endpoint name is prescribed or called by the adapter.

| Field | Contract |
| --- | --- |
| `powerKw` | Current demand in kW, finite/nonnegative or unavailable. |
| `energyKwh` | Consumption for the response period, not a lifetime cumulative reading. |
| `history[].kwh` | Consumption per labeled historical interval, in kWh. |
| `appliances[].measuredKw` | Actual supported submeter demand. Do not insert nameplate estimates as connected readings. |
| `tariffInrPerKwh` | Valid source tariff; missing tariff means unavailable cost, with no demo-tariff fallback. Zero is valid. |
| `updatedAt` | Valid source timestamp; missing/invalid timestamps stay unavailable. |
| `anomaly` | Warning/critical severity, reason and supporting evidence. Consumption alone is not an anomaly. |
| `anomaliesAssessed` | Explicitly distinguishes no active anomaly from unavailable assessment. |

Provider failures, aborted/stale requests and mismatched periods never become demo readings labeled as live. UI and overlay classification consume the adapter, not raw service calls. Energy comparisons use total kWh or kWh per capacity seat; conceptual scene dimensions are not a surveyed-area denominator.

## Maintaining interactions and style

Send camera/selection intent through `transitionController.ts`; do not mutate the camera from event handlers or introduce independent floor timelines. `explosionPose()` remains the single normalized pose function. Reset goes to the exploded stack; switching floors pulls out through that stack; reduced motion uses the same final states. New camera work must preserve the fixed DOM controls and demand-frame cleanup.

Use existing theme tokens or the exact five UI colors: `#FFFCFC`, `#E6D1E5`, `#9B829A`, `#CA2127`, `#161126`. Transparency is permitted. Only the physical architecture retains separately approved reference colors. Preserve the native typography and restrained analytical overlays.

## Checks and browser audit

From `Frontend/`:

```sh
npm test
npm exec tsc -- --noEmit
npm run build
```

The unit suite checks five-floor geometry/types, skipped numbers and aliases, door openings, data mappings, deterministic energy/cost calculations, anomaly evidence, camera ownership, resets, reduced motion and label collisions.

`npm run verify:radar` is an optional real-browser audit. It reuses an already installed Puppeteer-compatible module and Chrome; it never downloads browser tools or installs a dependency. Set an ESM module URL exporting Puppeteer as `default` or `puppeteer`, for example in PowerShell:

```powershell
$env:VIDYUTIQ_BROWSER_MODULE = 'file:///absolute/path/to/existing/puppeteer-compatible-module.js'
$env:VIDYUTIQ_CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
npm.cmd run verify:radar
```

If Puppeteer is already resolvable from the project, the module variable is unnecessary. `RADAR_TEST_PORT` optionally changes local port 5219. The audit uses an isolated temporary browser profile, starts Vite with `Frontend/` as its working directory, captures screenshots and writes `docs/verification/report.json`. Missing browser tooling fails with a clear setup message. Regular test/build commands do not require it.

Review the screenshots, not just a passing assertion. In particular check the exterior silhouette, all three entrances, forward/reverse separation, every floor's labels, tooltip clipping and mode legends. When changing touch or failure handling, repeat one-finger separation, two-finger orbit, slider controls and a browser launch with WebGL disabled; the preceding phase 9–11 results are documented separately. Software-rendered verification does not establish physical-device or student-laptop GPU frame rates.
