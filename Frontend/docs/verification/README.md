# Campus Radar final milestone verification

Phases 12–14 consolidate and verify the completed implementation without restructuring its working modules. The repeatable browser audit is `scripts/verify-campus-radar.mjs`, exposed as `npm run verify:radar`. [Setup and maintenance instructions](../campus-radar-developer-guide.md) describe its optional existing browser-tool requirement.

The [machine-readable report](report.json) records the run time, browser, checks, projected exterior bounds, floor counts and screenshot names. Results refer to that run, not a guarantee about untested environments.

## Milestones checked in order

| Milestone | Evidence |
| --- | --- |
| A — Exterior | One viewport with five visible levels, a genuine extruded central entrance, two semicylindrical side entrances/canopies, two lawn instances, and uncropped building-side bounds beside the fixed rail. Isometric and front screenshots reviewed against the supplied references. |
| B — Explosion | Actual forward wheel input reaches half and full separation; reverse wheel input reassembles the original floor positions. Five layers remain aligned and finish with equal spacing. Sidebar, header, search, modes, floor controls and exits retain identical DOM bounds. |
| C — Floor exploration | All five buttons focus their corresponding model; visible floors, option counts, room-label collisions, first-floor Data Centre, fourth/fifth-floor classroom types, merged aliases, two lifts, two entrance stairs and WR labels are checked. Existing unit tests cover the detailed floor-specific numbering and types. |
| D — Room interactions | Room 6207 is actually hovered and selected, its tooltip fits the viewport, and its panel honestly reports no mapped telemetry. Room 6206 demonstrates supported readings and the historical graph. |
| E — Energy intelligence | Explicit Demo labels, period energy, estimated cost, mounted history UI, Energy View and evidence-backed Anomaly View work. Connected mode remains explicitly disconnected with no demo graph fallback. Floor switching clears the selected room. |

Additional browser checks cover five responsive sizes, reduced motion, the equivalent searchable list and aliases, removal of Canvas/Fiber roots when leaving 3D, re-entry with expected resource counts, geometry/camera reuse during exploration and idle rendering. The existing dashboard KPI contents remain unchanged; Campus Insights, Active Alerts and Room Monitoring shortcuts navigate correctly; the original room modal still opens/closes.

The current 39-test suite includes the pointer-hit regression and submission-hardening coverage. The explicit TypeScript check and production build pass with the existing large-chunk advisories. See the [submission verification](../submission-verification/README.md) for the final terminology, entry-point and hosting checks.

The final direct-polygon test found and fixed a click/orbit ordering issue: orbit ownership began before Fiber recorded pointer-down hits, so a canvas click could lose its initial room candidate. Raycasting now preserves candidates during an orbit gesture, while room selection remains locked until release and still rejects drags. Cinematic transitions continue to block raycasting and selection. The actual canvas hover/click is exercised by milestone D, separately from DOM-label selection.

## Reviewed captures

All nine requested states below were opened and visually reviewed after the successful browser run. The approved footprint, fixed interface, readable floor plans, contained hover card and distinct analytical overlays remain intact.

| State | Capture |
| --- | --- |
| Initial exterior | [Isometric exterior](01-exterior.png) |
| Half-exploded | [Half separation](02-half-exploded.png) |
| Fully exploded | [Five-floor stack](03-exploded.png) |
| Floor 1 | [First-floor map](04-floor-1.png) |
| Floor 4 | [Fourth-floor map](05-floor-4.png) |
| Room hover | [Room 6207 hover](06-room-hover.png) |
| Room details | [Room 6206 supported analytics](07-room-details.png) |
| Energy View | [Consumption overlay](08-energy-view.png) |
| Anomaly View | [Supported anomalies](09-anomaly-view.png) |

Extra captures record the [front facade](01b-front.png) and [unavailable 6207 details](07a-room-6207-unavailable.png).

## Assumptions and limits

- Architecture remains a conceptual reconstruction from the supplied images and later explicit user corrections, not surveyed CAD. The narrow footprint, absent front corridor, lifts/WR labels and merged rooms override earlier interpretations in historical phase notes.
- No implemented live energy API exists in this checkout. Real meters, measured room history and real appliance submetering remain unconnected; no endpoints or readings were fabricated.
- Chrome used software WebGL. These checks do not establish physical-device behavior, a real-GPU FPS target or formal assistive-technology certification.
- Touch input, disabled-WebGL fallback and both themes were exercised in the preceding [Phases 9–11 audit](../campus-radar-phases-9-11.md). This final runner adds the ordered exterior/explosion/full-room flow and dashboard regression; it does not claim to repeat every earlier interaction.

All changes are inside `Frontend/`: the click/raycast fix and regression test, optional browser runner, npm script, this report/gallery, screenshots, frontend README and developer guide. Backend behavior, business calculations and source architectural definitions remain unchanged in this phase. Nothing was pushed.
