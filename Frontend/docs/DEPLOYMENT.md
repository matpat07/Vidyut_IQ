# Static hosting and route refresh

The app is configured for Netlify, but this work does not deploy it or create a production URL. Demo mode needs no energy backend, meter credentials or application environment variables.

## Import from GitHub

1. Review the local changes and commit/push them yourself when ready. No automated commit or push is performed.
2. In your Netlify account, import `matpat07/Vidyut_IQ` from GitHub and choose the intended `main` commit.
3. Keep the repository root as the location of `netlify.toml`. Its settings select **base directory `Frontend`**, **build command `npm run build`**, **publish directory `dist` relative to that base**, and **Node.js 24**. The actual output is `Frontend/dist/` in the repository.
4. Leave application secrets/environment variables unset for Demo Mode. Netlify installs the active package's committed dependencies before building.
5. Start the deployment in your account and inspect its real build log. Record the actual URL only after the provider reports success.
6. Run the checks below against that URL before submitting it.

Netlify's [build directory documentation](https://docs.netlify.com/build/configure-builds/overview/) and [dependency configuration](https://docs.netlify.com/build/configure-builds/manage-dependencies/) describe these settings. No Netlify CLI or new runtime dependency was added here.

## Routing strategy

Vite copies `public/_redirects` into `dist/_redirects`. It rewrites the eight known `/app/...` routes plus `/app` and `/dashboard` to `/index.html` with status 200. `/` and existing assets are served normally. The rules do not use a catch-all: unknown URLs such as `/assets/missing.js`, `/landing/missing.png` and `/app/radar/missing.js` remain 404s instead of receiving HTML disguised as an asset.

When adding an application route, update `src/routeConfig.ts`, `public/_redirects` and their coverage test together. The routing test verifies every current workspace destination. Unknown paths are deliberately not given server-side SPA rewrites.

Netlify documents [200 rewrites and static file shadowing](https://docs.netlify.com/manage/routing/redirects/redirect-options/). The submission audit tests the built files and these exact rewrite rules on a local static server. It does **not** verify a real Netlify edge deployment or substitute for the hosted checks below.

## Manual static upload alternative

```sh
# Repository root
npm ci
npm run build
```

Upload the **contents of `Frontend/dist/`** to Netlify's manual static deployment flow. Include `_redirects`, `assets/`, `landing/`, `licenses/`, `favicon.svg` and `index.html`. Uploading the legacy root app's output or omitting `_redirects` will produce the wrong application or broken route refreshes.

## Before submitting the hosted URL

- Open `/`; verify the landing page, local images and actual Building No. 6 hero/fallback.
- Launch Dashboard, then Campus Radar.
- Paste `/app/radar` in a new tab and refresh it. Select all five floors and Room 6206.
- Use Back/Forward between workspace views. Refresh `/app/faculty`, `/app/rooms` and `/app/settings`.
- Check the JS/CSS/image requests return the intended content types. Verify a deliberately missing JS URL returns 404, not `index.html`.
- Verify Demo Mode works without a backend and Live / Connected remains explicitly unavailable.
- Check Eco-Off, its audit entry, mobile navigation and the room-list WebGL fallback.
- Keep simulation/future-scope labels visible. Do not publish a claim of installed hardware or validated ML.

## Local verification

```sh
# Repository root
npm test
npm run typecheck
npm run build
npm run preview
```

Optional browser tooling already installed in the environment can run:

```sh
npm run verify:submission
npm run verify:radar
npm run verify:landing
```

Use `VIDYUTIQ_BROWSER_MODULE` and `VIDYUTIQ_CHROME_PATH` as documented in the Campus Radar developer guide. The submission audit requires a completed build, checks the local exact-route static host, and also starts/stops root dev/preview commands on ports 5231/5232 to verify delegation and CLI flag forwarding. It does not contact a live meter or deploy the site.
