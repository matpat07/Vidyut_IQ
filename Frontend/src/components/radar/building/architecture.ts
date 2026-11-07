/** Normalized design units, not surveyed metres. Front is the plan's west side. */
export const BUILDING = {
  width: 72, depth: 18, floorHeight: 3.4, floors: 5,
  frontZ: 9, backZ: -9, slab: 0.22,
  towerX: [-22.5, 22.5], towerRadius: 2.35, towerZ: 9.35,
  facadeBays: [-30.5, -12.7, 12.7, 30.5], bayWidth: 11,
  siteWidth: 88, siteDepth: 38, siteCenterZ: 7,
} as const;

/** Tune proportions here; every component scales in the same coordinate system. */
export const MODEL_DIMENSIONS = { width: 72, depth: 18, floorHeight: 3.4 };
export const MODEL_SCALE: Point3 = [
  MODEL_DIMENSIONS.width / BUILDING.width,
  MODEL_DIMENSIONS.floorHeight / BUILDING.floorHeight,
  MODEL_DIMENSIONS.depth / BUILDING.depth,
];

// Reference colors are confined to physical model materials (Phase 1 approval).
export const MATERIALS = {
  selection: { color: '#CA2127', roughness: 0.7 },
  wall: { color: '#EEE5D3', roughness: 0.88 },
  orange: { color: '#E79A29', roughness: 0.72 },
  blue: { color: '#176081', roughness: 0.62 },
  glass: { color: '#263F4C', roughness: 0.22, metalness: 0.35 },
  frame: { color: '#B7BFC0', roughness: 0.45, metalness: 0.65 },
  roof: { color: '#D3CEBF', roughness: 0.95 },
  paving: { color: '#C7BEAF', roughness: 1 },
  tile: { color: '#A79E91', roughness: 1 },
  grass: { color: '#66784A', roughness: 1 },
  hedge: { color: '#3D5739', roughness: 1 },
  leaf: { color: '#68814C', roughness: 1 },
  pot: { color: '#A84C37', roughness: 0.95 },
  soil: { color: '#494537', roughness: 1 },
} as const;
export type MaterialName = keyof typeof MATERIALS;
export type Point3 = [number, number, number];
/** Continuous narrow footprint with shallow rear setbacks visible in the aerial. */
export const FOOTPRINT_SPANS = [
  { start: -36, end: -25, back: -9 },
  { start: -25, end: -20, back: -6.8 },
  { start: -20, end: -7, back: -9 },
  { start: -7, end: 7, back: -7.2 },
  { start: 7, end: 20, back: -9 },
  { start: 20, end: 25, back: -6.8 },
  { start: 25, end: 36, back: -9 },
] as const;
export const SCENE_BOUNDS = { min: [-44, -1, -12] as Point3, max: [44, 18.2, 26] as Point3 };
export interface BoxPart {
  position: Point3;
  size: Point3;
  material: MaterialName;
  rotation?: Point3;
}
export function box(position: Point3, size: Point3, material: MaterialName, rotation?: Point3): BoxPart {
  return { position, size, material, rotation };
}
export const FLOOR_IDS = ['floor-1', 'floor-2', 'floor-3', 'floor-4', 'floor-5'] as const;
export const ARCHITECTURAL_REFERENCES = {
  facade: 'PCCOE Building No. 6_ Symmetrical Campus Facade.png',
  side: 'ChatGPT Image Nov 7, 2026, 07_29_57 PM.png',
  aerial: 'ChatGPT Image Nov 7, 2026, 07_29_50 PM.png',
  plans: [
    'Updated PCCOE Building 6 Floor Plan.png',
    'PCCOE Building 6 Second-Floor Plan.png',
    'PCCOE Building 6 – Third Floor Plan.png',
    'Building No. 6 – Fourth Floor Plan.png',
    'PCCOE Building 6 Fifth-Floor Plan.png',
  ],
} as const;
