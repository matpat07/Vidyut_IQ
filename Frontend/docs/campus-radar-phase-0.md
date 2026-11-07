# Campus Radar digital twin — Phase 0 inspection

Status: Phase 0 complete, 7 November 2026. No runtime code or dependency changes in this phase. Implementation is reserved for the user's subsequent phase prompts. The master interaction contract remains authoritative across phases.

## Scope and existing application

- Active application: `Frontend/`, independently runnable Vite SPA. Root `src/` is the preserved original frontend; do not implement the twin there.
- No AGENTS.md was found in the repository or checked parent project directories.
- Root `SKILL.md` identifies itself as `spatial-3d-interfaces` and was read completely. The expected named directory is absent. Its linked `references/model-pipeline.md`, `rendering-and-interaction.md`, `motion.md`, `verification.md`, `official-references.md`, and `classroom-case-study.md` are absent. No unavailable reference was treated as read.
- Root `toggle_scrolling_skill.md` was read completely. It documents GSAP ScrollTrigger, including custom scrollers, scrub, refresh, and cleanup.
- Existing changes/untracked files were present before this phase: root package-lock.json, Frontend/, skills/, SKILL.md, toggle_scrolling_skill.md, and 3D_view_reference_images/. Preserve them.
- `core.md/architecture.md` describes an aspirational Next.js/Supabase system. The running code is Vite/React and has no such integration; implementation decisions must follow the code.

## Installed versions and compatibility

| Package | Installed version |
| --- | --- |
| React / ReactDOM | 18.3.1 |
| Vite | 6.4.3 |
| TypeScript | 5.9.3 |
| Framer Motion | 13.4.0 |
| Recharts | 2.15.4 |
| Tailwind CSS | 3.4.19 |

Three.js, React Three Fiber, Drei, and GSAP are not installed. There are no reusable GLB, glTF, OBJ, FBX, Blender, HDR, or KTX2 scene assets outside dependencies.

Use React Three Fiber **8.x** with the existing React 18 app; Fiber 9.x requires React 19. Do not upgrade React to install the latest renderer. Before installation in an implementation phase, inspect and pin exact Fiber/Three/types peer-compatible versions; if Drei is justified, resolve a React-18/Fiber-8 compatible release rather than latest. Drei and GSAP are optional, not assumed dependencies. No package was installed during Phase 0.

Official sources consulted:
- https://r3f.docs.pmnd.rs/getting-started/installation
- https://r3f.docs.pmnd.rs/advanced/scaling-performance
- https://r3f.docs.pmnd.rs/advanced/pitfalls
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/

## Navigation, state, and reusable functionality

- `src/App.tsx`: `MainLayout` owns `currentView: NavView`; Campus Radar mounts for `RADAR`. This is state-based navigation, not React Router or URL routing. The application owns the room-detail modal through `onInspectRoom`.
- `src/components/layout/Sidebar.tsx`: eight existing navigation destinations. Sidebar is fixed. Header and SimulationBar are in normal document flow; they are not currently stationary during document scrolling.
- `src/components/radar/CampusRadar.tsx`: searchable all-campus room grid with classroom/lab/active-alert filters. Keep this as the equivalent list workflow/fallback, including rooms outside Building 6.
- `src/components/radar/RoomCard.tsx`: animated room summary, inspection callback, and Eco-Off action.
- `src/components/radar/RoomDetailModal.tsx`: current status, energy usage, timetable, sensors/simulation, and actions tabs; reuses context controls and anomaly explanations. A beside-map inspector will need to reuse these data/actions without forcing a global modal on every map click.
- `src/context/SimulationContext.tsx`: React Context, useState/useMemo/useCallback; authoritative room state, telemetry, occupancy, alerts, assumptions, role, clock, presets, appliance switching, cancellation/restoration, Eco-Off, and audit records. No external store is needed for scene-only selection/progress.
- `src/hooks/useDialog.ts`: keyboard trapping, Escape close, focus restoration, and body scroll locking for modals.
- `src/components/analytics/HourlyEnergyChart.tsx`: Recharts and a fixed illustrative daily profile, NOT per-room measured time-series data. Do not relabel that curve as actual room history.
- Framer Motion and reduced-motion CSS are reusable UI utilities. There is no existing camera, model loader, scroll-driven timeline, or 3D resource lifecycle utility.

## Energy data and API audit

No fetch, Axios, WebSocket, MQTT, or Supabase calls were found in `Frontend/src`. No executable backend exists in this checkout. Do not manufacture a remote API or claim live meters.

Existing data flow:

`campusRooms -> roomStates + timetable occupancy -> iotSimulator -> wastageEngine -> roomDataList / activeAlerts / impactSummary`

- `timetableParser.ts`: in-code normalized institutional schedule and occupancy evaluation; does not fetch the root CSV files at runtime.
- `iotSimulator.ts`: simulated watts, voltage, current, power factor, cumulative kWh, presence, occupants, temperature, standby draw.
- `wastageEngine.ts`: supported anomaly classification, excess watts, hourly waste cost, and recommended action.
- `aiAnomalyPreview.ts`: local explanatory simulation, not a remote AI connection.
- Appliance inventory supports the existing configured-load breakdown; label it as modeled, not a measured circuit breakdown. Preserve formulas and distinction between instantaneous W, accumulated kWh, estimated savings, and illustrative projections.
- Existing records: 16 campus rooms; 13 in Block 6, two in Block 5, one in Block 9. Only Block 6 records may supply Building 6 totals.
- Unavailable room telemetry/history/anomaly data must remain explicitly unavailable. Absence is not zero consumption or proof of normal status.

## Reference assets visually inspected

All eight supplied images were opened and inspected, not inferred from filenames.

| Root asset in `3D_view_reference_images/` | Role and observed evidence |
| --- | --- |
| `Updated PCCOE Building 6 Floor Plan.png` | First-floor plan: courtyard/perimeter corridor, two left stair towers, lower-right lift, data centre, labs, classrooms, cabins, washrooms |
| `PCCOE Building 6 Second-Floor Plan.png` | Second-floor topology; 6207 lab at top centre; distinct 6201/6202/6203 classrooms and 6204 lab |
| `PCCOE Building 6 – Third Floor Plan.png` | Third-floor plan; independently labeled 63xx rooms |
| `Building No. 6 – Fourth Floor Plan.png` | Fourth-floor plan; changed top wing and room uses; cannot clone all second-floor room types |
| `PCCOE Building 6 Fifth-Floor Plan.png` | Fifth-floor plan; 65xx rooms, including 6518 lab at bottom right |
| `PCCOE Building No. 6_ Symmetrical Campus Facade.png` | Frontal facade reference: repeated window bays, paired curved towers, central entrance mass and canopy; treat as supplied visual reference, not surveyed elevations |
| `ChatGPT Image Nov 7, 2026, 07_29_57 PM.png` | Oblique facade photograph/reference: tower/bay depth, lawns and approach |
| `ChatGPT Image Nov 7, 2026, 07_29_50 PM.png` | Small 131x181 oblique rooftop/isometric reference with solar panels; silhouette evidence only, not a precise roof survey or dimensioned top plan |

No separate interactive floor-map UI reference image was found. The small rooftop reference is not a dimensioned top-view drawing.

The five plans show: an open central courtyard, circulation around it, interior-left rooms, east-side rooms/washrooms, northern/southern room wings, two west/left projecting curved stair towers, a lower-right lift, and an additional small stair symbol at upper right. Do not omit the latter or invent its full 3D form without recording the assumption. North arrows point up.

Plans label breadth **60 m**, length **200 m**, and **5 m** beside left stair projections. Their drawn proportions are not consistent with a 60:200 footprint. These annotations and raster proportions cannot both define a surveyed scale. Preserve traceable plan topology; record any provisional normalized dimensions and do not claim engineering/survey accuracy. Floor heights, wall thickness, rear elevations, and detailed roof dimensions are not supplied.

### Architectural/telemetry reconciliation required

| Plan label | Existing record | Finding / handling |
| --- | --- | --- |
| 6207 LAB | none | Geometry and selection supported by plan; energy tooltip/inspector must say data unavailable until a real mapping is supplied |
| 6204 LAB | 6204CR, CLASSROOM | Room-type conflict; preserve original energy model and flag the mismatch; do not silently reclassify appliances |
| 6208 CABIN | 6208LA, LABORATORY | Room-type conflict; do not silently present laboratory telemetry as verified cabin telemetry |
| no 6216 label on supplied second-floor plan | 6216LA | Unplaced energy record; keep in list, exclude from mapped-room assertions until supported |
| 6518 LAB | 6518LA | Number/type match on fifth floor |
| 6102, 6103, 6104, 6107, 6115 | matching suffixed records | Number/type matches on first floor |
| 6201, 6202, 6206, 6210 | matching suffixed records | Number/type matches on second floor |

There are 12 numerical label matches to existing Block 6 records, two of them type-conflicted, plus one unplaced record. Most plan rooms have no existing energy record. Architectural labels should remain separate from suffixed telemetry IDs (`6102CR`, `6107LA`); retain an explicit provenance-aware mapping. Unnumbered cabins, washrooms, and the data centre must use stable internal spatial IDs rather than invented official room numbers.

## Internal implementation sequence for subsequent phases

1. Establish a source-backed building/floor/room geometry schema and reference manifest. Trace each floor separately, document uncertain dimensions and every telemetry mapping. Preserve the original business data.
2. Prove a thin vertical slice inside `RADAR`: one shared Canvas, one representative floor/room, selection, keyboard/list equivalent, energy lookup, and WebGL/error fallback. Lazy-load the 3D route to protect dashboard startup.
3. Build reusable exterior and floor groups from the inspected references; use procedural geometry first because no reusable model is provided. Keep floor local coordinates aligned. Keep existing five-color tokens; supplied photos guide shape, not a new application palette.
4. Contain all scrolling inside a bounded Radar viewport. Its internal scroll progress drives explosion, with the canvas/stage pinned inside that viewport. Do not pin/scroll the body or animate the sidebar/header. Scope any shell adjustment to RADAR. Use one normalized progress value, deterministic poses, interruption-safe camera targets, and a reduced-motion alternative.
5. Complete assembled -> exploded -> floor focus -> room inspection -> other floor -> back-to-building flow without route reload. Keep discrete view/floor/room IDs in React; keep frame-by-frame transforms and camera interpolation in refs/frame updates.
6. Add beside-map analytics, Energy View and Anomaly View from existing supported readings. Show clear unavailable/conflicted/unplaced states, source labels, units, and legends. Reuse room controls without changing simulator or anomaly formulas.
7. Verify camera and floor-motion endpoints, reversals/interruption, floor switching, room raycast/hover/click, scroll containment, stationary surrounding UI, selection/list parity, reduced motion, keyboard/touch operation, themes, missing data, WebGL/context loss, teardown/remount, and unchanged navigation/modals.
8. Measure payload, draw calls, idle rendering and frame timings in a real browser. Use on-demand rendering, invalidate on transitions/data changes, share/instance repeated geometry, bound DPR, avoid React state updates in the frame loop, and dispose owned resources/listeners. Report software-renderer results separately from hardware GPU performance.

## Baseline verification

`npm run build` passed in `Frontend/`: TypeScript passed and Vite built successfully (2,939 modules; 822.90 kB main JS, 232.54 kB gzip). The existing >500 kB chunk-size advisory remains. No browser/3D rendering, architectural geometry accuracy, hardware performance, or digital-twin interactions were tested in Phase 0 because no scene exists yet.

