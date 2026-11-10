# Phosphor icon subset

The 28 regular-weight SVG path definitions in `paths.ts` come from the official [Phosphor core repository](https://github.com/phosphor-icons/core/tree/main/assets/regular), retrieved on 2026-11-09. Original icon names and path coordinates are preserved. The original [MIT license](LICENSE.txt) is included.

`LandingIcon.tsx` renders those static paths with `currentColor`, using only the landing page's approved palette. It adds no icon package, remote requests, HTML injection or font dependency. Every icon is decorative; its adjacent text or the control's accessible label conveys its meaning.

The license is also shipped in `public/licenses/phosphor-icons.txt` so the production distribution includes the original notice.
