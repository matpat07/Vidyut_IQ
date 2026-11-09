# VidyutIQ frontend

```sh
cd Frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. In PowerShell, use `npm.cmd` if the execution policy blocks `npm.ps1`.

```sh
npm test
npm exec tsc -- --noEmit
npm run build
npm run preview
```

Campus Radar uses the existing simulator in explicitly labeled Demo mode. Connected mode remains unavailable until a real energy provider is supplied; the repository does not contain a running energy API.

- [Developer guide: geometry, rooms, layouts and energy mappings](docs/campus-radar-developer-guide.md)
- [Final milestone verification and screenshots](docs/verification/README.md)
- [Camera, accessibility and performance notes](docs/campus-radar-phases-9-11.md)

The optional `npm run verify:radar` browser audit reuses an existing Puppeteer-compatible tool and installed Chrome. See the developer guide for its environment variables. It does not install dependencies and is separate from the regular test/build commands.
