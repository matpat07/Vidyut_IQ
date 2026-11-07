# Aerial-reference footprint correction

Correction to Phase 1, 7 November 2026. This supersedes the oversized courtyard/footprint interpretation in the original Phase 0 and Phase 1 notes.

The user identified `3D_view_reference_images/ChatGPT Image Nov 7, 2026, 07_29_50 PM.png` as the controlling reference for the roof and aerial silhouette. It shows a long, narrow, continuous roof with shallow stepped rear recesses. The former model's large open courtyard and separate deep rear wing were incorrect for that reference.

Implemented inside `src/components/radar/building/`:

- Reduced normalized front-to-back body depth from 40 to 18 while retaining the 72-unit entrance frontage and five levels. These are scene proportions, not surveyed metres.
- Replaced ring-shaped slabs/roof with adjoining, continuous footprint spans. There is no central hole. Rear setbacks are shallow edge recesses rather than a second building wing.
- Updated rear and end-wall geometry to follow the compact footprint, and removed the former courtyard columns, balconies, inner parapets and courtyard paving.
- Moved entrances and landscaping to the revised front plane. Tower radii and entrance projections retain their original shapes instead of being flattened by a nonuniform depth scale.
- Repositioned the internal core volumes inside the narrower shell, and shortened the surrounding site slab to avoid introducing another large empty area behind the building.
- Arranged the rooftop solar panels in compact groups along the continuous roof. Their exact count and setbacks remain approximate because the supplied aerial image is only 131 × 181 pixels.
- Reoriented Aerial to show the narrow roof and entrance facade in the same general direction as the reference. Added a direct Top view, and fitted both views using the revised scene bounds with space reserved for the toolbar.

Files changed: `architecture.ts`, `Facade.tsx`, `Entrances.tsx`, `Landscaping.tsx`, `BuildingScene.tsx`, `BuildingViewer.tsx`. No dependencies, energy records, formulas, simulation services or unrelated pages were changed.

The supplied conceptual room-plan images remain references for subsequent room reconstruction; their scale/topology conflicts must be reconciled with this user-corrected exterior before implementing rooms. The old open-courtyard assumption must not be restored by following the earlier notes.

Validation and screenshots are recorded below after the final check.
## Verified result

- `npm run build` passed, including TypeScript; existing bundle-size advisories remain.
- Isolated Chrome/SwiftShader: no normal-use console errors or warnings. Desktop (1480 × 1024) and mobile (390 × 844) had no page overflow.
- Roof bounds were approximately 72.8 × 18.6 design units in plan. Downward ray checks at three separated positions, including the centre, intersected the roof, confirming the former central opening is closed.
- The complete Top roof remained above the camera toolbar. Aerial/Top/front/isometric views, orbit, reduced motion, room search, remount and return to Dashboard worked; the surrounding header stayed stationary.
- The renderer stopped drawing when idle and its registered root was removed after leaving Radar. Reported normal-view geometry: 36,464 triangles, 85 draw calls. This is software-renderer verification, not a hardware-performance benchmark.
- Context, services, data, types and calculation configuration remain unchanged.

Current previews: [corrected aerial](building-aerial-corrected.png), [corrected top](building-top-corrected.png).
