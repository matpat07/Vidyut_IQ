# Phase 3 — scoped scroll-driven building explosion

Phase 4 adds reference-derived room partitions, fixed floor focus and room interactions. See [Phase 4 implementation and architectural assumptions](campus-radar-phase-4.md); the notes below describe the earlier Phase 3 state.

Implemented 7 November 2026. The master interaction contract and the user's corrected narrow aerial footprint remain authoritative. No new dependencies were installed. The supplied `SKILL.md` and `toggle_scrolling_skill.md` were read; native viewport-scoped input plus the existing Three/Fiber renderer provide this interaction without adding GSAP or pinning the page.

## How to use it

Open Campus Radar → Building 06. Scroll over the model, swipe vertically with one finger, or use the Separation slider. Scroll/swipe back to reassemble. Mouse drag or a two-finger touch gesture orbits the camera. The focused viewport also accepts Arrow Up/Down, Page Up/Down, Home and End. Assembled/Exploded buttons provide direct endpoints. Reduced-motion mode reaches the requested pose immediately without automatic easing.

The fixed floor rail selects Floors 1–5, expands the building if needed and outlines the selected floor. Its energy summary uses existing Block 6 records and labels them as simulated. Floors with no records show unavailable data; absence is not presented as zero consumption. Back to building and Reset clear floor selection and return to the assembled exterior. Camera presets and zoom controls remain available.

## Motion contract

`explosion.ts` contains the single pure `explosionPose(progress)` function, clamped to [0, 1]. All five floors, roof, material opacity, floor labels and camera framing read the same rendered progress. There are no independent floor tweens or accumulated transform offsets.

The controller stores an input destination and one shared rendered progress; the latter uses time-based easing toward the destination. Only that rendered progress drives geometry. Reversing/interruption simply changes the destination. In reduced-motion mode the rendered progress immediately matches input. Per-frame transforms use refs and Three objects, not React state updates.

| Stage | Behavior |
| --- | --- |
| 0–0.25 | Five levels remain assembled; camera gains elevation, roof lifts, exterior opacity softens |
| 0.25–0.75 | Adjacent gaps open progressively with overlapping smoothstep windows; floors remain aligned in X/Z; roof follows the top level; the camera refits the full stack |
| 0.75–1 | All geometric/opacity poses settle to the same fully exploded endpoint; five thin projected labels remain beside their floors |

Default normalized endpoints:

- Assembled floor bases: 0, 3.4, 6.8, 10.2, 13.6; roof base 17.
- Exploded floor bases: 2.2, 11.6, 21, 30.4, 39.8; roof base 48.7.
- Each adjacent floor-base interval ends at 9.4 units, comprising the original 3.4-unit floor height and 6-unit clear gap. The tighter spacing increases visible floor size while keeping five clearly separated layers.
- Every floor moves only vertically. Its own slab, facade walls/glazing, stair slices, landings and service cores travel together. No floors cross during intermediate poses.
- Floor slabs and cores remain opaque; upper exterior portions progressively ghost to a cutaway. Low perimeter walls remain readable. The continuous multi-storey central entrance surround fades before floor separation so it does not bridge the gaps. Nothing is abruptly swapped into a different model.
- The corrected continuous narrow roof and shallow rear setbacks are preserved. The superseded courtyard is not restored.

Camera fitting projects the individual floor, roof and entrance bounds at the current pose rather than fitting a large box containing empty air. All four presets use the available viewport more fully; Top places the long building axis across the viewport, and Aerial shows the broad facade. Landscaping may reach the viewport edges while the building remains framed above the fixed toolbar, including on mobile. Scroll-driven camera poses directly follow the shared rendered progress so a separate camera tween cannot lag behind rapidly moving floors. Explicit camera-preset changes may ease separately. Labels are reprojected from world coordinates after camera updates.

## Scroll isolation and lifecycle

Only `.building-scene-surface` listens for wheel, pointer and viewport keyboard events. There are no window/body scroll listeners, document pin spacers or global preventDefault handlers. Pixel, line and page wheel deltas normalize to progress. Horizontal gestures and Ctrl+wheel are not used to separate the model. The viewport consumes its own vertical wheel input even at the endpoints to avoid scroll chaining.

Camera buttons, slider, floor rail, energy summary, application header and sidebar live outside the input surface. Button/input/select targets and modal states are excluded. One-finger touch scrubs; a second finger cancels that scrub and hands off to OrbitControls. Pointer up, pointer cancel and lost capture end the gesture. Keyboard and slider equivalents avoid requiring precision gestures.

The existing Radar-only stationary shell is preserved. Room list keeps its independent scroll area, and other application screens retain their normal page scrolling. List search/filter state remains owned by CampusRadar and persists across the building/list tabs.

Demand rendering is retained: progress input invalidates the scene, the shared clock requests frames only until settled, and idle scenes stop drawing. Pointer/wheel/media-query listeners, subscriptions, controls and renderer resources clean up on unmount. WebGL recovery remounts the scene against the same controller so the explosion pose is retained.

## Source files

- `src/components/radar/building/explosion.ts`: deterministic staged pose, progress controller, wheel normalization.
- `useExplosionInput.ts`: native viewport-only gesture/keyboard lifecycle.
- `BuildingModel.tsx`: five aligned floor assemblies, material roles, projected-selection outlines and roof/accessory motion.
- `Facade.tsx`, `Entrances.tsx`, `ScenePrimitives.tsx`, `architecture.ts`: per-floor geometry ownership, core/stair slices and cutaway material roles.
- `BuildingScene.tsx`: shared frame clock, camera fit, orbit/touch separation, projected labels and WebGL lifecycle.
- `BuildingViewer.tsx`, `building.css`: fixed floor rail, original-data summaries, native slider, endpoint buttons and responsive scene/controls layout.
- `tests/explosion.test.mjs`: Node test runner with the installed TypeScript compiler; no test framework dependency added.
- `package.json`: adds `npm test` for the deterministic pose/controller tests.

## Architectural and data limits

No validated internal room partition geometry exists in the current repository implementation. This phase preserves each floor's existing envelope, stair and service-core arrangement; it does not invent rooms to fill the floor plates. Room-specific floor tracing, room hover/picking, camera dives and beside-map room analytics remain subsequent-phase work. The fixed floor selection in this phase highlights a floor within the exploded overview rather than pretending to open a completed room plan.

All context, simulation services, room data, types, timetable logic, anomaly rules and calculation configuration remain unchanged. No API behavior or backend integration was replaced. Floor summary counts are known records by source block/floor metadata, not a claim that all rooms have been geometrically mapped; the previously documented room-type conflicts remain unresolved.

## Verification

Final automated and browser results are recorded below after checks complete. Browser measurements use isolated Chrome with SwiftShader software WebGL, not a hardware GPU benchmark.
### Final results

- `cd Frontend && npm test`: **6 tests passed**. They cover both endpoints, equal final spacing, monotonic no-crossing poses across 101 progress samples, reverse determinism, roof-first staging, cutaway/label endpoints, clamping/interruption, listener unsubscribe, wheel delta units and frame-rate-independent progress easing.
- `cd Frontend && npm run build`: **passed**, including TypeScript. Vite transformed 2,977 modules. Main JS 825.74 kB (233.72 kB gzip), lazy viewer 8.94 kB (3.47 kB gzip), lazy scene 860.78 kB (231.76 kB gzip). Existing >500 kB chunk-size advisories remain; they were not silenced.
- Isolated Chrome/SwiftShader: assembled, roof-lift, intermediate, fully exploded and reverse endpoints were inspected. Forward wheel input produced the expected poses; reversing returned exactly to the original floor/roof positions. After the sizing correction, fully exploded floor intervals are all 9.4 units and all X/Z offsets stay zero.
- Exact DOM bounding-box comparison confirmed the sidebar, header, view tabs, floor rail, energy summary and scrub-control container remained stationary during scrolling.
- Wheel over the application header, scenario dropdown or assumptions modal did not change scene progress. The room list continued scrolling inside its own container, and Dashboard page scrolling worked after leaving Radar.
- Rapid alternating wheel input settled to the deterministic pose. Native one-finger touch swipes separated/reassembled floors; native two-finger gestures orbited without modifying progress. Touch cancellation, keyboard Home/End, slider endpoints and reduced-motion operation passed.
- Desktop 1480 × 1100 and mobile 390 × 844 had no document overflow. All five projected mobile floor labels were above the fixed camera toolbar. Resizing preserved floor poses; camera presets, zoom and reset controls retained their surrounding layout.
- Floor selection expanded and outlined the requested level. Selecting a floor without source telemetry displayed unavailable data. Back to building reset progress and selection.
- Normal-use browser runs reported **zero console errors or warnings**. The deliberate WebGL-context-loss test recovered the same exploded floor positions; Three.js emitted its expected `WEBGL_lose_context extension not supported` cleanup warning during that forced-loss test, recorded separately from unexpected errors.
- Idle frame counters stopped advancing. Leaving Radar removed the canvas and, after deferred renderer cleanup, left zero registered Fiber roots. Source services/context/data/types/calculation configuration remain byte-identical to the preserved originals.
- Reported assembled geometry: 115 draw calls / 36,464 triangles; exploded geometry without selection: 108 draw calls / 35,968 triangles. These are software-renderer inspection values, not real-device frame-rate or hardware GPU measurements.

Previews: [assembled](building-phase-3-assembled.png), [intermediate](building-phase-3-middle.png), [exploded](building-phase-3-exploded.png), [mobile](building-phase-3-mobile.png).

### View sizing correction

The subsequent sizing correction changes only camera framing/preset orientation and presentation gaps, preserving the approved building footprint and actual floor geometry. No dependencies, UI colors, data services or unrelated screens changed.

- All 16 combinations of four presets, two endpoints and desktop/mobile viewports passed projected building-bound checks (1480 × 1100 and 390 × 844). Building bounds remain above the camera toolbar without clipping; no console errors or warnings were reported.
- Native wheel stages/reversal, fixed surrounding UI, outside-viewport wheel isolation, floor selection, keyboard endpoints and reduced-motion checks passed again.
- `npm test`: 6 passed. `npm run build`: passed TypeScript and Vite; existing bundle-size advisories remain.
- Current previews: [larger exploded Isometric](building-size-exploded.png), [larger assembled Aerial](building-size-aerial.png). The earlier previews above document the original Phase 3 sizing.

### Borderless scene and larger exploded framing

The follow-up removes the rounded outer viewport border and expands the desktop canvas across the workbench, behind the fixed title and beside the floor rail. The camera toolbar remains fixed. Preset directions smoothly face the long facade as the floors separate, reducing the diagonal height that previously forced the entire model to shrink. Manual orbit remains independent of that preset adjustment. The building footprint, floor spacing, geometry, data and dependencies are unchanged in this follow-up.

- At 1480 × 1100, the exploded Isometric silhouette increases from approximately 510 to 880 pixels wide (73%). Exploded Front is 921 pixels wide, so Isometric reaches 96% of its width; Aerial reaches 93%. All five floors and the roof remain visible above the toolbar.
- All 32 combinations of four presets, two endpoints and four viewport sizes pass projected building-bound checks: 1480 × 1100, 1280 × 800, 768 × 1024 and 390 × 844. Endpoint controls are checked for actual progress changes. Labels are kept outside the floor rail; shorter screens use more compact rail controls and contained overflow.
- Native scoped scrolling/reversal, stationary surrounding controls, floor selection, keyboard endpoints, reduced motion, mouse orbit and zoom passed browser checks in isolated Chrome/SwiftShader, with zero unexpected console errors or warnings. This is not a hardware GPU benchmark.
- `npm test`: 6 passed. Final `npm run build`: TypeScript and Vite passed; existing bundle-size advisories remain.
- Modified implementation files: `src/components/radar/building/BuildingScene.tsx` and `building.css`. No unrelated screen or backend files changed.
- Current borderless preview: [exploded Isometric](building-size-borderless-exploded.png).
