# VidyutIQ frontend

Run independently from this directory:

```sh
npm install
npm run dev
npm run build
npm test
```

The frontend uses React, TypeScript, Vite, Tailwind, Recharts, and Framer Motion. Campus Radar adds the React-18-compatible Three.js 0.170.0 and React Three Fiber 8.18.0 runtime, with matching Three.js development types.

The dashboard links open Analytics (Campus Insights), Campus Radar (Room Monitoring), and Waste Alerts (Active Alerts). The sidebar also provides Audit Trail, Faculty Portal, Student Room Finder, and Settings. Room details retain all five tabs and appliance controls. Hardware and assumptions dialogs are available in the header.

Light/dark mode is stored locally. UI color tokens use only `#FFFCFC`, `#E6D1E5`, `#9B829A`, `#CA2127`, and `#161126`, including transparent variants. Tailwind's default palette and preflight colors are excluded. The 3D building uses user-approved architectural reference colors confined to its materials.

`src/context`, `src/services`, `src/data`, `src/types`, and `src/config` preserve the original state, schedule, simulator, anomaly evaluation, models, and calculation formulas. The hourly chart retains its original illustrative profile; the donut groups current simulated readings by department.

Validation includes the production build and isolated Chrome checks at desktop and mobile widths, navigation, theme persistence, room tabs, dialogs, filters, settings reset, faculty cancellation/restoration, single and bulk shutdowns, audit records, and simulation controls. The final browser run reported no console warnings or errors and no horizontal overflow. Vite reports bundle-size advisories for the chart/animation and lazy-loaded 3D bundles.

Campus Radar opens the Building 06 exterior model. Drag to orbit, use Front/Aerial/Isometric and zoom/reset controls, or switch to Room list for the existing energy monitoring workflow. See [Phase 1 architecture and validation](docs/campus-radar-phase-1.md) for model assumptions, module structure, supported fallbacks, and the remaining digital-twin phases.

Phase 3: scroll over the Building 06 viewport (or swipe vertically) to separate the five floors. Use the Separation slider or Assembled/Exploded buttons for keyboard/touch alternatives, and the fixed floor rail to select a level. The surrounding interface stays stationary. See [Phase 3 interaction and verification](docs/campus-radar-phase-3.md).
