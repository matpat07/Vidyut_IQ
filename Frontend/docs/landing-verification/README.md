# Landing verification

Run `npm run verify:landing` with an existing Puppeteer-compatible module and Chrome, as described in [the implementation guide](../landing-page.md). The script records actual check results in [report.json](report.json) and captures the screenshots beside this file.

The landing audit includes eleven browser groups, including manual process-step selection and its handoff back to scrolling. The current regular test suite passed all 39 tests, the standalone TypeScript check passed, and `npm run build` succeeded. Vite retains its advisory for the existing large workspace/Three.js chunks. The earlier [production smoke checks](production-smoke.json) covered direct Radar loading, refresh and home navigation; the final [submission audit](../submission-verification/README.md) extends this to built routes, demo claims and Eco-Off calculations.

The audit covers the real hero model and idle rendering, page scrolling over the canvas, carousel autoplay/pause/drag/manual controls, touch swiping, staged twin navigation, the supplied campus image and modal keyboard focus, all eight direct application routes, history and refresh, shared simulator state, theme persistence, responsive layouts, reduced motion and a separate Chrome process with WebGL disabled.

Normal application errors and warnings fail the audit. Framer Motion's explicit development notice when the test enables reduced motion is recorded separately under `expectedDevelopmentNotices`. The deliberately disabled WebGL process is expected to fail context initialization and display the verified static fallback.

Desktop captures use 1440 × 1000. Responsive captures use 768 × 1024, 390 × 844 and 320 × 740. Touch input is emulated through Chrome. These checks do not establish physical-device performance, hardware FPS, screen-reader compatibility or cross-browser coverage.

- [Desktop hero](desktop-hero.png)
- [Problem carousel](desktop-problem.png)
- [Feature gallery](desktop-features.png)
- [Twin preview](desktop-twin.png)
- [Campus future scope](desktop-campus.png)
- [Full supplied image](campus-full-image.png)
- [Tablet](responsive-768.png)
- [Mobile](responsive-390.png)
- [Narrow mobile](responsive-320.png)
- [Touch feature gallery](mobile-features.png)
- [Reduced motion](reduced-motion.png)
- [WebGL fallback](webgl-fallback.png)
- [Refined process sequence](desktop-process.png)
- [Refined final call to action](desktop-final.png)

Campus Radar's separate seven-group regression audit is recorded in [the existing verification directory](../verification/README.md).
