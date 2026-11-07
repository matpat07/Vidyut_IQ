---
name: spatial-3d-interfaces
description: Build and refine interactive 3D rooms, classroom scenes, seating maps, and similar spatial web interfaces using Three.js, React Three Fiber, or an appropriate alternative. Covers reusable models, orthographic composition, purposeful animation, DOM interaction, static previews, and performance, based on the Synapse classroom workflow. Use for an implemented spatial interface; standalone illustration requests do not need this workflow.
---

# Spatial 3D Interfaces

Build a usable interface whose spatial arrangement explains something: people forming groups, objects belonging to a place, or a selection moving from overview to detail. Keep the product's existing design language. The classroom is a worked example, not a requirement to make every scene a classroom.

## Start from the actual project

Inspect the current scene, assets, interaction state, dependencies, and representative viewport before changing them. Identify the overview, focused state, transition, and equivalent non-3D workflow. Reuse existing geometry, asset loaders, animation helpers, and components before introducing another renderer or dependency.

Choose only the references needed for the task:

- Reproducing or extending our classroom: [classroom case study](references/classroom-case-study.md), including bundled models, visual references, source snapshots, dimensions, and provenance.
- Making, sourcing, replacing, or optimizing models: [model pipeline](references/model-pipeline.md).
- Implementing a scene, camera, labels, lifecycle, or choosing another technology: [rendering and interaction](references/rendering-and-interaction.md).
- Regrouping, camera focus, object movement, or authored model clips: [motion](references/motion.md).
- Before handing over an implemented scene: [verification](references/verification.md).
- When API details or external references are needed: [official references](references/official-references.md). Check the installed versions and current documentation; the classroom snapshot is not an API compatibility promise.

## Choose the smallest rendering approach

| Need | Starting point |
| --- | --- |
| Repeated room previews with no camera interaction | Shared-camera PNG/WebP renders plus DOM interaction |
| Interactive room inside an existing React app | Three.js through React Three Fiber; Drei only where useful |
| Interactive room outside React | Plain Three.js in the existing framework |
| One inspectable product/model with simple controls | Evaluate model-viewer before writing a scene engine |
| Existing Babylon.js, PlayCanvas, or other scene engine | Keep that stack; carry over the asset, camera, motion, and accessibility contracts |
| Flat diagram with no meaningful depth or occlusion | SVG/DOM or CSS transforms may be sufficient |

Blender is an authoring option, not a required runtime. Use procedural geometry for parametric furniture, Blender for sculpting/UVs/rigging, and licensed models when their silhouette and delivery cost fit. Do not add physics, WebGPU, a game engine, or postprocessing merely to make the work feel more advanced.

## Establish the visual contract

Before polishing, specify the scene's units, origin, object forward direction, camera projection, framing, materials, light direction, and selection treatment. Inspect an actual reference image rather than inferring its appearance from filenames.

For classroom-like dioramas, start with an elevated orthographic view, round readable silhouettes, restrained matte materials, subtle contact shadows, and generous space for DOM controls. Evaluate objects at their final screen size. Tiny props and barely visible surface detail should not dominate the model budget.

Separate three layers:

1. **Domain state:** object IDs, group membership, permissions, selected item, and approved final layout.
2. **Scene state:** model resources, placements, camera, instance matrices, and a single transition progress value.
3. **DOM interface:** buttons, labels, details, keyboard navigation, status messages, and the equivalent list view.

The rendered pose must not determine membership, permissions, or saved data. A failed or skipped animation must reach the same product state as a successful one.

## Build one complete slice first

Make one representative object or table work across model load, framing, selection, keyboard access, detail view, and failure fallback. Then expand to the real population. Repeated furniture should share buffers and materials; repeated previews should not each require a permanent WebGL context.

Motion should preserve identity and explain the change. Move related parts in a common local coordinate system. Define poses as a function of normalized progress so pause, skip, reduced motion, and interrupted input remain consistent. Animate the camera itself for focus and reproject labels with it. Read the motion reference before implementing an assembly transition.

Use explicit invalidation when an otherwise resting scene changes. Keep per-frame transforms outside React state, reuse scratch objects, stop requesting frames once settled, and clean up the resources this scene owns. These patterns follow the [R3F performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) and [performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls).

## Deliver the scene and its operating knowledge

For implementation work, provide the working scene, necessary assets and credits, any changed manifest, and focused verification of layout, motion endpoints, interaction, fallback, and lifecycle. Capture useful overview, focused, and intermediate animation states. Record the tested device/browser, payload, and measured performance; distinguish software rendering from actual GPU measurements.

For guidance-only requests, deliver the relevant plan or explanation without building an unsolicited app. Never claim a screenshot, visual review, hardware benchmark, or accessibility check that was not performed. Honor local review requirements; where AGENTS.md requires Rams after UI edits, run its quick_review with via set to rules and fix applicable findings.
