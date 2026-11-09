# Campus Radar: camera, native layout, performance and accessibility

All source, tests and previews for these phases are inside `Frontend/`. No new dependencies, backend changes, room geometry changes, simulation formula changes, or unrelated screen redesigns.

## Camera contract

The existing orthographic camera is retained for both the architecture and analytical plans. This preserves the approved proportions and avoids a projection swap during a dive. Its near/far planes are 0.1/500; the camera stays outside the building envelope on a 120-unit viewing offset. Orbit stays above the horizontal plane. Top view retains a small forward component to avoid a singular up direction.

`building/transitionController.ts` owns the explosion controller, floor focus, requested room, preset/zoom command and interaction ownership. It exposes five explicit states:

| State | Meaning |
| --- | --- |
| `EXTERIOR_OVERVIEW` | Fully assembled building. |
| `EXPLODING` | Intermediate normalized separation, including a paused partial explosion. |
| `EXPLODED_OVERVIEW` | Five separated layers, with no active floor dive. |
| `FLOOR_FOCUS` | Entering or inspecting the requested floor. |
| `ROOM_FOCUS` | Focusing a verified room geometry on that floor. |

The separate `busy` signal identifies cinematic motion or an active orbit gesture. State names are not used to infer whether an animation has finished. Frame poses mutate existing Three objects; React receives stable snapshots only when discrete state/ownership changes. Tests verify that subscriptions do not notify on every animation frame.

- Latest floor/search/preset intent wins. Floor switches still pull out to the full stack, hold that overview briefly, then enter the requested floor. Reset View returns to the full exploded stack; Back to Building assembles it.
- Orbit cannot begin during a transition. A new explicit floor/preset action cancels orbit ownership. Scrolling cannot scrub while an orbit gesture owns the camera. Room meshes skip raycasting during cinematic transitions, and DOM room controls are disabled during disruptive motion. The final Phase 13 audit corrected pointer-down ordering: room hit candidates remain available during an orbit gesture so a completed canvas click can select them; selection stays locked during the gesture and rejects drags.
- Room focus gently adjusts the viewing target while retaining floor context. At manual zoom the target is constrained to keep the selected room inside the clear viewport. Room changes preserve the mounted meshes and camera.
- Camera movement eases toward the shared pose using frame delta. There are no competing GSAP timelines or per-floor camera animations. Reduced motion reaches equivalent final views without cinematic easing.
- Camera calculations reserve the existing fixed rail and camera toolbar. Resizing recomputes the fit while preserving the intended selection and view.

## Labels and native interface

`labelLayout.ts` packs projected DOM label rectangles deterministically. Selection has first priority, then hover, numbered rooms and facilities. Labels outside the clear viewport or overlapping a higher-priority label are hidden. A `ResizeObserver` invalidates the demand scene when responsive typography, fonts or selection borders change label dimensions. Hidden labels are not keyboard targets; the complete room picker and searchable list remain available.

The Campus Radar header, navigation, five-floor controls, camera buttons and source/period controls stay outside the 3D transform hierarchy. The existing right rail retains its width as contextual details appear. Its contents use a short opacity/position transition, disabled for reduced motion. Surrounding typography, border treatments, spacing and both themes retain the existing five-color tokens. Only the physical architecture retains the separately approved reference materials.

Header search accepts actual room numbers, facility names, floor-qualified terms and historical aliases. A merged alias such as 6405 navigates to the single physical 6406 geometry; skipped numbers are not invented. Invalid or ambiguous queries have a status message.

The Room list tab now includes every traced room, corridor and facility, not only existing telemetry nodes. It provides floor/search filters, the same source and period controls, comparison/anomaly modes, readings and the same DOM room-detail panel. Missing data stays unavailable. The original simulation node cards and their filters remain accessible in a disclosure below the plan list. Source and period preferences survive switching between 3D and list views.

## Performance and lifecycle

- One lazy-loaded Fiber canvas, constrained DPR of 1–1.5, existing instanced facade/window/wall batches and memoized polygon geometry remain in use.
- Interior groups are retained but culled while the assembled exterior is displayed; this does not rebuild floor geometry when the building opens.
- Shadows update when the architectural pose changes rather than on every orbit or stationary frame. The fixed light does not need a new shadow map for camera-only movement.
- Rendering remains on demand. Settled camera and scene stop invalidating frames; optional critical-label pulsing is CSS only.
- Temporary camera vectors are reused. Orbit listeners, controller subscriptions and label observers are cleaned up. Fiber owns and disposes its declarative geometry/materials; explicitly owned outline buffers retain their disposal cleanup.
- Browser tests verify geometry/camera identity across selection, no canvas while the list is active, removal of Fiber roots after unmount and one canvas on re-entry.

In the isolated Chrome/software-WebGL test, the assembled view renders **115 draw calls / 36,464 triangles**, compared with roughly 283 draw calls in the earlier implementation. This is a draw-call reduction, not a hardware FPS claim. After the first interior visit the renderer may upload additional retained room buffers; that one-time cache population is expected.

## Accessibility and failure handling

Floors, presets, zoom, search, rooms, source/period controls and the separation slider use keyboard-accessible DOM controls. The focused viewport also supports Home/End and arrow/PageUp/PageDown separation. A live status describes view readiness. Close-room actions restore focus to the room picker or list row without stealing focus after the user has moved to another control.

Mobile supports scoped one-finger separation and two-finger orbit, with the always-available slider and explicit Assembled/Exploded buttons as alternatives. Compact Radar-only controls preserve the fixed mobile canvas.

Canvas initialization failures are caught by the local boundary, which offers Open room list. Context loss retains the existing explicit reload/list fallback. With WebGL disabled in Chrome the list still searches and opens actual room details. Development React reports the expected context-creation error during that deliberate failure; it does not prevent use of the list.

## Verification and limits

- `npm.cmd test`: **30 tests pass**, including the existing floor, geometry, energy and reset regressions plus six new controller, ownership, search and collision tests.
- A mutation removing the busy interaction gate is rejected by the camera tests; the original source was restored before the final build.
- `npm.cmd run build`: TypeScript and Vite production build pass. Existing large-chunk advisories remain.
- Isolated Chrome on Windows with software WebGL: all camera states, actual room hover/click, pending-floor interruption, merged-alias search, all four presets, maximum-zoom selection visibility, orbit/scroll arbitration, fixed DOM bounds, independent details scrolling, idle frame counts, reduced motion, both themes and native touch events.
- Responsive checks at 320×844, 390×844, 768×1024, 1024×900 and 1440×900: canvas/control bounds fit; visible label rectangles do not overlap.
- Accessibility-tree inspection finds named search/viewport controls; keyboard separation, focus restoration and tabbed list access work. This is not a full assistive-technology certification.
- Disabled-WebGL browser verifies the visible failure action and searchable list details. The normal-WebGL suite has no browser errors.

Real student-laptop GPU frame rates and physical mobile-device behavior remain to be measured. No live energy provider was added: the source audit and explicit Demo/Connected behavior from phases 7–8 remain unchanged.

## Files and references

New: `building/transitionController.ts`, `CameraRig.tsx`, `labelLayout.ts`, `RoomSearch.tsx`, `radar/PlanRoomList.tsx`, and `tests/camera-transition.test.mjs`.

Updated: `CampusRadar.tsx`, `BuildingViewer.tsx`, `BuildingScene.tsx`, `FloorRooms.tsx`, `floorFocus.ts`, `useExplosionInput.ts`, `building.css`, and the UI preference type in `energy/energyTypes.ts`.

Previews: `building-phase-9-room-focus.png`, `building-phase-10-light.png`, `building-phase-11-mobile.png`, `building-phase-11-list.png`, `building-phase-11-fallback.png`.

The supplied root spatial skill remains the principal reference; its linked `references/` files are absent. Existing installed Fiber 8.18.0 / Three 0.170.0 behavior was inspected before changing controls. Relevant official guidance: [Fiber demand rendering](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [Fiber performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls), [Three.js controls](https://threejs.org/docs/).
