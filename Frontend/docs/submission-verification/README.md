# Pre-submission verification

The active application is `Frontend/`. The working tree was clean on `main` when hardening began. This work does not commit, push or deploy the project.

## Corrections

- Rule-based diagnostics replace unsupported AI/model-confidence wording and fixed percentages. Explanations quote simulated power, occupancy and rule evidence, without fabricated sensor histories, appliance identification, scheduled restarts or annual per-room savings.
- Power graphs use Simulated Baseline / Modeled Optimized labels; instantaneous kW/W, period kWh, estimated INR and modeled CO₂ remain distinct. Proposed hardware is visibly future scope.
- The demo-context disclosure derives from the actual room profiles, current clock and active break slot. Short breaks are not called lunch. A cleared/applied preset cannot leave a stale scenario label.
- The existing 1.24 kWh initial savings and example audit record remain intact and are explicitly labeled demonstration seeds. New single-room and bulk Eco-Off calculations retain their formulas.
- Root commands delegate to the current frontend; installation uses the existing lockfiles. The legacy source remains preserved and is accessible with explicit legacy scripts.
- Netlify build configuration and exact-route rewrites are included. Unknown asset paths remain 404s. No production URL is claimed.
- The existing room modal header and footer wrap on narrow screens, with controls checked at 390px and 320px. Models, transitions, floor layouts, room mappings, source datasets, timetable and IoT calculations were preserved.

## Actual checks

| Check | Evidence |
| --- | --- |
| Clean root installation | An isolated copy of both manifest/lockfile pairs completed `npm ci --offline --no-audit --no-fund`; root postinstall installed the active frontend successfully. The main working dependencies were not removed for this check. |
| Root commands | Root test/typecheck/build passed. The production browser audit starts root dev and preview on explicit ports and checks they serve the active frontend. |
| Unit tests | 39 tests: the existing 36 plus diagnostics, current-state scenario classification and root/deployment contract coverage. |
| TypeScript / production build | Explicit `tsc --noEmit` and Vite production builds passed. Existing large-chunk advisories remain; thresholds were not weakened. |
| Campus Radar | Seven [existing milestone/regression groups](../verification/report.json), including all five floors, wheel reverse, room 6206 support, 6207 unavailability, fixed controls, analytical modes, reduced motion and resource cleanup. |
| Landing | Eleven [browser groups](../landing-verification/report.json), including navigation/history, carousel interactions, responsive/touch, shared simulator state, reduced motion and WebGL fallback. |
| Production submission audit | Nine groups in [report.json](report.json): static asset/route responses, context/seed disclosures, diagnostics, single-room and bulk Eco-Off estimates, all built URLs/history/refresh, mobile modal bounds, WebGL-disabled Radar and root launch commands. |

Use the JSON reports for the exact timestamps and completion status of each recorded run. The landing development audit separately records Framer Motion's expected notice when reduced motion is deliberately enabled. Normal browser page errors/warnings fail the audits; deliberately disabled WebGL initialization is tested in a separate browser process.

The production audit serves the built files with the checked-in exact rewrites locally. It is not a test of Netlify's actual edge/CDN service. Software WebGL and emulated mobile/touch checks do not establish physical-device performance, a real-GPU FPS rate or formal screen-reader certification.

## Repeat the checks

```sh
# Repository root: installs both packages
npm ci
npm test
npm run typecheck
npm run build
```

The direct frontend equivalents are:

```sh
cd Frontend
npm test
npm exec tsc -- --noEmit
npm run build
```

With an existing Puppeteer-compatible module and Chrome configured through `VIDYUTIQ_BROWSER_MODULE` / `VIDYUTIQ_CHROME_PATH`:

```sh
npm run verify:radar
npm run verify:landing
npm run verify:submission
```

These scripts install no browser tooling. Run `verify:submission` after building; ports 5231/5232 must be free for its root command checks. `npm run capture:landing` inside Frontend refreshes preview assets from the actual model and UI; run a new build afterward to include them in `dist/`.

## Reviewed evidence

- [Dashboard demo context and corrected power labels](dashboard-demo-context.png)
- [Rule-based diagnostic](rule-diagnostic.png)
- [New simulated Eco-Off audit record and labeled seed](eco-off-audit.png)
- [Mobile room controls](mobile-room-controls.png)
- [Narrow 320px room controls](mobile-room-controls-320.png)
- [WebGL-disabled Radar room list](radar-webgl-fallback.png)
- [Full Radar screenshots](../verification/README.md)
- [Landing screenshots](../landing-verification/README.md)

## Limits and team actions

No physical meters, live telemetry backend, hardware switching, calibrated sensors or validated ML optimization were added. Many architectural rooms still have no mapped telemetry. The campus-wide aerial remains a supplied image. The opening savings baseline and seeded audit example are demonstration examples, not a reconciled measurement ledger. The existing Recharts version emits an installation deprecation notice; upgrading it is outside this targeted compatibility pass.

The project is configured for static hosting but has not been deployed by this work. Review the local diff, commit/push manually when approved, follow [DEPLOYMENT.md](../DEPLOYMENT.md), and test the actual hosted URL (especially `/app/radar` refresh and missing assets). Rehearse [FINAL_DEMO_GUIDE.md](../FINAL_DEMO_GUIDE.md) with the clock paused and Demo Mode selected. Retain source/assumption disclosures in the submission.
