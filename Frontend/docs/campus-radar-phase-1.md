# Campus Radar — Phase 1 architectural reconstruction

> **Footprint corrected after Phase 1:** the user-designated aerial reference supersedes the large-courtyard interpretation below. See [aerial footprint correction](aerial-footprint-correction.md) for the current continuous narrow roof, dimensions, camera views and screenshots.


Implemented 7 November 2026 inside `Frontend/`. Phase 0 findings and the master interaction contract remain applicable. This phase delivers an inspectable exterior model; later phases will add the scroll-driven explosion, floor-specific room geometry, camera dive and energy-map interactions.

## Implemented

Campus Radar now opens a real local WebGL model, not a facade-image texture on a box. An explicit **Room list** tab retains the existing all-campus room grid, category filters, search, inspection modal and Eco-Off controls. Filters/search survive switching between the building and the list. Other dashboard pages retain their existing layouts and behavior.

Model components:

- Five separately named/aligned floor groups (`floor-1` through `floor-5`) with ring-shaped slabs and an open central courtyard. These establish a shared coordinate basis for subsequent floor separation.
- Four orange projecting rectangular facade frames around recessed glazing, cream spandrels, repeated metal-framed horizontal window bands and visible end-wall depth.
- A larger middle entrance with an extruded blue chamfered surround, an actual opening for recessed tinted glazing, silver-grey projecting canopy, framed double-door bays and approach steps.
- Exactly two matching blue semicylindrical side stair towers, each with five curved glazing bands, repeated mullions, internal representative dogleg stair flights, a curved canopy, narrower doors and a roof parapet. There is no sixth glazed level.
- Internal east-side lift and north-east stair-core volumes placed from the floor-plan topology.
- Courtyard corridor edges/columns, roof parapets and lightweight rooftop solar-panel geometry supported by the small supplied aerial reference.
- Two front lawns between three entrance approaches, a wider individually tiled middle approach, smaller side approaches, hedges/shrubs and instanced red pots with low-poly planting.

Viewer controls: drag orbit, Isometric/Front/Aerial camera presets, zoom in/out and reset. Camera presets transition without per-frame React state changes; reduced-motion preference reaches the same endpoints immediately. Zoom preserves an already orbited viewing angle. The orthographic fit accounts for the whole building and forecourt at desktop/mobile aspect ratios.

The Radar-only shell keeps the sidebar, header and simulation controls stationary. Room-list scrolling is contained inside Radar. Wheel input does not unexpectedly zoom the model. Model loading is lazy: Three/Fiber are not requested until the building view is opened. One shared canvas renders on demand and stops requesting frames once the camera settles. Context-loss reload, no-WebGL fallback, and an error boundary retain access to room monitoring.

## Source and geometry contract

All eight root `3D_view_reference_images/` images were inspected in Phase 0. The front facade, real oblique side image and second-floor plan were re-opened for Phase 1. `architecture.ts` records the exact source filenames for the facade, side, aerial and each of the five plans. No photograph is used as a facade texture. No remote model, environment map, stock architecture or proprietary asset is loaded.

The supplied `SKILL.md` (`spatial-3d-interfaces`) was reread and applied. Its linked reference documents are still absent. No separate central/side entrance close-up files or interactive-floor-map UI reference were found among the eight available images; entrance details are reconstructed from the supplied full facade and oblique image.

Coordinates are normalized **design units**, not verified metres:

| Parameter | Default |
| --- | --- |
| Frontage | 72 |
| Body depth | 40 |
| Floor count | 5 |
| Floor height | 3.4 |
| Courtyard opening | approximately 52 × 24 |
| Stair-tower centres along frontage | −22.5 and +22.5 |
| Stair-tower radius | 2.35 |
| Orange bay centres | −30.5, −12.7, +12.7, +30.5 |

`MODEL_DIMENSIONS` in `architecture.ts` configures width, depth and floor height. `MODEL_SCALE` applies them uniformly to all architectural/site components, and the camera fit uses the same scale. Internal `BUILDING` values describe the common normalized base layout. This avoids inconsistent local rescaling of entrances, windows or stairs.

Origin: centre of the building footprint at the ground slab; Y up; +Z is the entrance facade. The west/left edge of the supplied north-up plans faces the camera in Front view. Plan north maps toward −X; plan east maps toward −Z. This is a source-image mapping, not verified geospatial registration. The two left-plan stair projections become the two front towers; the lower-right lift and upper-right small stair become east-side internal cores.

Important uncertainties and limits:

1. The plans label 60 m × 200 m, but the drawn proportions and facade reference do not establish that surveyed aspect ratio. The model follows relative topology and visible exterior proportions rather than treating those annotations as CAD dimensions.
2. Floor heights, wall thicknesses, canopy depth, tower radii, detailed roof geometry and exact window dimensions are provisional normalized parameters.
3. Rear elevation windows are a restrained regularization of the existing window-band language; no rear elevation is supplied. Full internal room walls, door positions and floor-specific room tracing are not implemented in Phase 1. Current floor plates intentionally share the supplied common courtyard/wing topology, not invented room layouts.
4. Stair flights are representative dogleg geometry; exact riser counts and landings are not surveyed. Service cores are volumes, not modeled lift equipment or a verified fire-egress design.
5. Solar-array quantity/positions and landscaping density are illustrative interpretations of the supplied images. They create no energy-production records or new monitored rooms.
6. Five supplied levels are rendered, with the lowest at the model ground. No additional ground/storey is inferred.
7. Room 6207 still has no telemetry record; 6204/6208 type conflicts and unplaced 6216 remain as documented in Phase 0. No mappings or readings were fabricated to fill those gaps.

Per the user's Phase 1 clarification, cream/orange/blue/landscaping colors are permitted **only in the 3D model materials**. Surrounding UI CSS retains the existing five-color design system. Physically shaded material output is naturally affected by lighting; no new application theme colors were added.

## Files and dependencies

- `src/components/radar/building/architecture.ts`: dimensions, material palette and reference manifest.
- `ScenePrimitives.tsx`: instanced box batches grouped by material.
- `Facade.tsx`: floor slabs, facade segments, recessed window bands, courtyard edges and roof.
- `Entrances.tsx`: central entrance, paired curved stair entrances and service cores.
- `Landscaping.tsx`: approach tiles, lawns, hedges and instanced pots/planting.
- `BuildingModel.tsx`: composition of the shared architectural coordinate system.
- `BuildingScene.tsx`: one Canvas, lighting, adaptive camera/OrbitControls, demand rendering and context-loss lifecycle.
- `BuildingViewer.tsx` / `building.css`: matching DOM controls, load/error/fallback states and Radar-scoped layout.
- `CampusRadar.tsx`: building/list integration, persistent list filters and keyboard-operable view tabs.
- `RoomCard.tsx`: Diagnostics is now a native keyboard-operable button, retaining the existing inspection action.
- `App.tsx`: applies the scoped `is-radar` shell class only while Radar is active.

Pinned runtime additions: `three@0.170.0`, `@react-three/fiber@8.18.0`. Type-only development addition: `@types/three@0.170.0`. Fiber's React >=18 <19 peer requirement was checked before installation. React remains 18.3.1. OrbitControls is reused from Three's bundled add-ons; no Drei, GSAP, postprocessing, physics engine or model-hosting dependency is necessary for Phase 1.

`src/context`, `src/services`, `src/data`, `src/types`, and `src/config` remain byte-identical to the preserved original copies. Energy simulation, anomaly rules, calculations, timetable behavior and API behavior were not changed. No new remote API was introduced.

## Verification

Build and final browser results are recorded below after validation. Browser checks use an isolated Chrome profile and SwiftShader software WebGL, not the user's browsing profile or a hardware GPU benchmark.

Not implemented in this phase: scroll explosion, selectable floor interiors, camera dive to room plans, room hover/picking on the model, beside-map energy inspector, Energy/Anomaly map modes, or historical room charts. These remain subsequent-phase work; the original room analytics/control workflow continues through Room list.
### Final validation results

- `cd Frontend && npm run build`: passed, including TypeScript. Vite transformed 2,975 modules. Main bundle 825.71 kB (233.70 kB gzip); lazy BuildingScene bundle 856.45 kB (230.20 kB gzip); lazy viewer 3.56 kB (1.47 kB gzip). Vite's >500 kB advisories remain; the 3D scene is not loaded by the initial Dashboard.
- Isolated Chrome on Windows, SwiftShader software WebGL: normal-use run completed with **zero console warnings/errors**. Screenshots were inspected for isometric, front, aerial, light-theme and mobile views.
- Viewports: 1480 × 1024 desktop and 390 × 844 mobile had no horizontal or document vertical overflow. An 800 × 600 compact viewport kept camera controls within the visible viewport. This is not a claim about every device/viewport or hardware GPU speed.
- Camera tests: native pointer orbit changes the camera, zoom increases magnification without changing the orbited direction, reset returns to the original pose, and Front reaches the horizontal facade view without falsely showing an extra rear-wing level. Reduced-motion view switching and remounting work.
- Semantic scene checks confirmed exactly five primary floor groups, two side-entrance groups and one central entrance.
- Renderer inspection: 85 reported draw calls, 41,408 triangles, 85 geometry resources and one shadow-map texture in the tested view. No remote texture/model assets. The render frame counter did not advance during an 800 ms idle sample.
- Scoped wheel input left the surrounding header in the same position. Room search and the existing diagnostic modal remained functional; Escape closed the modal.
- Forced WebGL context loss displayed a recovery state; Reload model recreated the scene. A separate Chrome run with WebGL disabled displayed the fallback and could open the room list.
- View tabs support arrow keys, Home/End and normal keyboard focus. The monitoring list remains the non-3D workflow; no full screen-reader usability audit is claimed.
- Returning to Dashboard removes the canvas. After allowing deferred Fiber disposal to complete (1.5 s), the registered renderer-root count returned to zero. No continuous frame loop is left behind.
- Source comparison confirmed context, services, data, types and calculation configuration remain byte-identical to the preserved originals. No backend changes or remote pushes were made.

Screenshots: [isometric exterior](building-phase-1-isometric.png), [front elevation](building-phase-1-front.png).
