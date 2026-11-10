# VidyutIQ landing page

The public page lives under `src/components/landing/`. It uses the existing Inter typography, five approved UI colors, Framer Motion, simulation context and Building No. 6 geometry. No dependencies were added. The supplied campus image and the real building materials retain their original architectural colors.

## Visual refinement

The refinement applies the supplied `skills/redesign-existing-projects/SKILL.md` and `skills/refined-web-ui/SKILL.md`: improve the existing structure, use restrained surfaces, clarify hierarchy and preserve working interactions. The approved Inter typography and exact project palette take precedence over generic font or color recommendations in those skills.

The landing interface now has a floating navigation bar with an observed current-section indicator, consistent arrow/button treatments, architectural corner guides around the hero, distinct qualitative challenge diagrams, an editorial feature panel, icon-led process steps, and coordinated impact and Future Scope treatments. Challenge diagrams are explanatory artwork, not telemetry.

Icons use a small local subset of official Phosphor regular SVG paths under `src/components/landing/icons/`, with the original MIT license and source attribution. The icon component inherits the approved UI colors and hides decorative shapes from accessibility APIs; visible text and accessible control names remain present. The existing dashboard icon system is unchanged.

## Navigation and state

`App.tsx` keeps one `SimulationProvider` above mutually exclusive, lazy-loaded public and workspace surfaces. `AppWorkspace.tsx` contains the previous application layout, modals and views. Its navigation now writes URLs through `navigation.ts`; `routeConfig.ts` holds the path mapping. Browser history updates the active view without a routing dependency.

| URL | View |
| --- | --- |
| `/` | Public landing |
| `/app/dashboard` | Dashboard |
| `/app/radar` | Campus Radar |
| `/app/analytics` | Analytics |
| `/app/alerts` | Waste Alerts |
| `/app/audit` | Audit Trail |
| `/app/faculty` | Faculty Portal |
| `/app/rooms` | Student Room Finder |
| `/app/settings` | Settings |

`/app` and `/dashboard` also open Dashboard. Unrecognized paths display the landing page. Workspace role changes still open the corresponding portal; mounting a direct URL does not override that URL. The sidebar wordmark returns home. Ordinary navigation preserves the running simulation; a full document reload retains the application's existing initialization behavior. The workspace theme preference remains persisted as before. The landing surface always uses midnight violet without changing that preference.

Vite dev and preview support direct requests to these paths. A production static host needs an SPA fallback to `index.html`, including `/app/*`.

## Page composition

- Sticky navigation and a staggered hero introduce the actual interactive building.
- A continuous problem carousel supports drag, arrows, pause, hover/focus suspension and reduced motion. Duplicate groups contain no focusable controls.
- The solution uses a verified Dashboard capture. Seven editorial feature panels use actual project captures, native horizontal touch scrolling, desktop drag, slow autoplay, explicit pause and functional application links. User interaction pauses autoplay.
- A five-step process follows page scroll and remains manually selectable.
- The Digital Twin section crossfades five verified model renders as normal page scroll advances. Small screens and reduced-motion users receive manual stage controls. This avoids a second WebGL canvas while the hero is mounted.
- Impact figures read the existing `SimulationContext` calculations, with seeded state, tariff, emissions factor and simulation assumptions disclosed.
- Future Scope displays the supplied campus aerial in full, with a keyboard-accessible full-image dialog. Unverified building positions are not labeled. Three conceptual callouts and five roadmap cards explicitly describe proposed capabilities.
- Final calls to action open the working application. The footer links the repository supplied in the landing brief.

## Building reuse and rendering

`LandingScene.tsx` reuses `BuildingModel`, `CameraRig`, `TransitionClock` and the existing centralized controller. Two optional presentation parameters leave Campus Radar defaults intact: `BuildingModel.presentation="exterior"` skips interior analytical geometry in the hero, and `CameraRig.layout="presentation"` removes the reserved floor rail and constrains horizontal orbit. The original facade, entrances, landscaping and architectural dimensions are reused.

The hero loads lazily, uses demand rendering, bounds DPR to 1–1.5 and uses 1024px shadows. It retains a verified static fallback until ready, after a WebGL failure, and by default below 900px or under reduced motion. Visitors may explicitly enable 3D from the static preview. The page and workspace never mount their canvases together. The carousel animation loop pauses offscreen; ambient contours also pause outside their section. Small screens use static contours and no pointer glow. Background layers sit beneath an explicit hero stacking layer to avoid compositing artifacts.

## Asset provenance

All assets are served locally from `public/landing/`.

| Asset | Source |
| --- | --- |
| `pccoe-campus.jpeg` | User-supplied `WhatsApp Image 2026-11-07 at 1.18.00 PM.jpeg`, copied unchanged, 996 × 866 |
| `building-{exterior,half,exploded,floor,room}.png` | Actual existing Three.js model rendered at 1200 × 800 through the development-only capture fixture |
| `dashboard.png`, `radar.png`, `alerts.png`, `analytics.png`, `operations.png`, `audit.png` | Actual application screens captured at 1440 × 1000 |
| `ecooff.png` | Actual Dashboard → Room 6103 → Actions modal |
| `captures.json` | Capture time and source-route manifest |

The original and copied campus JPEG have identical SHA-256 hashes:

`1321e54989ecd49b7f5c888079496b55c8fc10e24f038c5528374bc62a56ac02`

The images contain no generated replacement architecture or external stock visuals. Dashboard captures show simulation state at capture time and are labeled accordingly. The staged twin is a preview; the Campus Radar CTA opens the real interactive experience. The full-campus visual is an architectural reference image, not an implemented multi-building 3D model.

## Running and verification

```sh
cd Frontend
npm install
npm run dev
```

```sh
npm test
npm exec tsc -- --noEmit
npm run build
npm run preview
```

Optional browser commands use an already installed Puppeteer-compatible module and Chrome. Set `VIDYUTIQ_BROWSER_MODULE` to its module URL and, if needed, `VIDYUTIQ_CHROME_PATH` to the browser executable. No browser package is downloaded by these scripts.

```sh
npm run verify:landing
npm run verify:radar
npm run capture:landing
```

The landing audit uses port 5224 (`LANDING_TEST_PORT` can override it); capture uses 5222. The scene fixture under `scripts/` is a development capture entry, not a public production route. Verification output is under `docs/landing-verification/` and `docs/verification/`.

## Limits

The application still uses its existing simulator and optional connected-data adapter. This landing change adds no energy endpoint, physical device control, predictive model or measured savings. The campus image does not establish geographic labels, so its callouts remain conceptual. Browser verification uses Chrome software WebGL and emulated responsive/touch settings, not a physical-device or hardware FPS benchmark. The existing large Three.js and workspace chunks still trigger Vite's size advisory; they remain lazy-loaded. Deployment has not been performed.
