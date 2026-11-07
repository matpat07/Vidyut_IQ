/** @type {import('tailwindcss').Config} */
const token = name => 'rgb(from var(--' + name + ') r g b / <alpha-value>)';
export default {
 content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
 corePlugins: { preflight: false },
 theme: { ringColor: { DEFAULT: '#9B829A' }, ringOffsetColor: { DEFAULT: '#FFFCFC' }, colors: { transparent: 'transparent', current: 'currentColor',
 canvas: token('canvas'), panel: token('panel'), soft: token('soft'), ink: token('ink'), muted: token('muted'), line: token('line'),
 accent: '#CA2127', danger: '#CA2127', 'on-accent': '#FFFCFC' },
 extend: {fontFamily: {sans: ['Inter','system-ui','sans-serif'], mono: ['Inter','system-ui','sans-serif']},
 boxShadow: {xs:'none',sm:'none',md:'none',xl:'none','2xl':'none'}} }, plugins: []
};