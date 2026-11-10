# VidyutIQ frontend

```sh
cd Frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. In PowerShell, use `npm.cmd` if the execution policy blocks `npm.ps1`.

The public landing page opens at `/`. Launch Dashboard opens `/app/dashboard`; Campus Radar opens `/app/radar`. All eight existing workspace views support direct URLs and browser history. The checked-in Netlify configuration rewrites known app routes to `index.html` and leaves unknown asset requests as 404s; see the deployment guide below.

```sh
npm test
npm exec tsc -- --noEmit
npm run build
npm run preview
```

Campus Radar uses the existing simulator in explicitly labeled Demo mode. Connected mode remains unavailable until a real energy provider is supplied; the repository does not contain a running energy API.

Root `npm ci` / `npm install` also install this active frontend through the root postinstall hook. Root dev/build/preview/test commands now delegate here; the earlier root `src/` remains available through explicit legacy scripts.

- [Final 3–5 minute judge demo guide](docs/FINAL_DEMO_GUIDE.md)
- [Netlify configuration and manual deployment steps](docs/DEPLOYMENT.md)
- [Submission verification and limitations](docs/submission-verification/README.md)

- [Developer guide: geometry, rooms, layouts and energy mappings](docs/campus-radar-developer-guide.md)
- [Final milestone verification and screenshots](docs/verification/README.md)
- [Camera, accessibility and performance notes](docs/campus-radar-phases-9-11.md)
- [Landing page: implementation, routes and asset provenance](docs/landing-page.md)
- [Landing browser verification and screenshots](docs/landing-verification/README.md)

The optional `npm run verify:radar` browser audit reuses an existing Puppeteer-compatible tool and installed Chrome. See the developer guide for its environment variables. It does not install dependencies and is separate from the regular test/build commands.

`npm run verify:landing` runs the corresponding landing audit with the same browser environment variables. `npm run capture:landing` regenerates previews from the actual project UI and building model. Neither command installs browser tooling.
