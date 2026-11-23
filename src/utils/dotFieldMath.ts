export type DotThemeMode = 'light' | 'dark';

export interface DotPoint {
  baseX: number;
  baseY: number;
  phaseX: number;
  phaseY: number;
  speedScale: number;
  radiusOffset: number;
}

export interface DotGridMetrics {
  cols: number;
  rows: number;
  spacing: number;
  points: DotPoint[];
}

export interface DotPalette {
  baseDotColor: string;
  baseDotAlpha: number;
  spotlightPrimaryRgb: readonly [number, number, number];
  spotlightAccentRgb: readonly [number, number, number];
  spotlightMaxAlpha: number;
  haloInnerColor: string;
  haloMidColor: string;
  haloOuterColor: string;
  spotlightRadius: number;
  baseDotRadius: number;
}

/**
 * Clamp devicePixelRatio to keep canvas memory & rasterization lightweight.
 */
export function clampDevicePixelRatio(dpr: number | undefined): number {
  if (!Number.isFinite(dpr) || (dpr ?? 0) <= 0) {
    return 1;
  }
  return Math.min(Math.max(dpr as number, 1), 2);
}

/**
 * Deterministic pseudo-random float in [0, 1) from integer grid coordinates.
 */
function seededUnit(col: number, row: number, salt: number): number {
  const n = Math.sin((col + 1) * 127.1 + (row + 1) * 311.7 + salt * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

/**
 * Build a centered dot-grid covering the viewport with subtle phase offsets
 * for smooth organic drift.
 */
export function createDotGrid(
  width: number,
  height: number,
  spacing = 32
): DotGridMetrics {
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);
  const safeSpacing = Math.max(12, spacing);

  if (safeWidth === 0 || safeHeight === 0) {
    return { cols: 0, rows: 0, spacing: safeSpacing, points: [] };
  }

  const cols = Math.floor(safeWidth / safeSpacing) + 2;
  const rows = Math.floor(safeHeight / safeSpacing) + 2;

  const gridWidth = (cols - 1) * safeSpacing;
  const gridHeight = (rows - 1) * safeSpacing;
  const offsetX = (safeWidth - gridWidth) * 0.5;
  const offsetY = (safeHeight - gridHeight) * 0.5;

  const points: DotPoint[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      points.push({
        baseX: offsetX + c * safeSpacing,
        baseY: offsetY + r * safeSpacing,
        phaseX: seededUnit(c, r, 1) * Math.PI * 2,
        phaseY: seededUnit(c, r, 2) * Math.PI * 2,
        speedScale: 0.75 + seededUnit(c, r, 3) * 0.5,
        radiusOffset: (seededUnit(c, r, 4) - 0.5) * 0.35,
      });
    }
  }

  return { cols, rows, spacing: safeSpacing, points };
}

/**
 * Compute smooth radial influence in [0, 1] for a dot relative to cursor.
 */
export function computeSpotlightInfluence(
  dx: number,
  dy: number,
  radius: number
): number {
  if (radius <= 0) {
    return 0;
  }
  const distSq = dx * dx + dy * dy;
  const radiusSq = radius * radius;
  if (distSq >= radiusSq) {
    return 0;
  }
  const t = 1 - Math.sqrt(distSq) / radius;
  // Smooth cubic ease for soft halo edge
  return t * t * (3 - 2 * t);
}

/**
 * Smoothly advance current glow strength (0..1) toward target (0 or 1).
 */
export function stepGlowStrength(
  current: number,
  target: number,
  dtMs: number
): number {
  const clampedTarget = Math.min(1, Math.max(0, target));
  const clampedCurrent = Math.min(1, Math.max(0, current));
  const safeDt = Math.max(0, Math.min(dtMs, 100));

  // Faster ramp-in on hover, gentle decay on leave
  const rate = clampedTarget > clampedCurrent ? 0.011 : 0.0055;
  const alpha = 1 - Math.exp(-safeDt * rate);
  const next = clampedCurrent + (clampedTarget - clampedCurrent) * alpha;

  if (Math.abs(clampedTarget - next) < 0.001) {
    return clampedTarget;
  }
  return next;
}

/**
 * Linearly interpolate RGB channel triples by factor t in [0, 1].
 */
export function lerpRgb(
  from: readonly [number, number, number],
  to: readonly [number, number, number],
  t: number
): readonly [number, number, number] {
  const clamped = Math.min(1, Math.max(0, t));
  return [
    Math.round(from[0] + (to[0] - from[0]) * clamped),
    Math.round(from[1] + (to[1] - from[1]) * clamped),
    Math.round(from[2] + (to[2] - from[2]) * clamped),
  ];
}

/**
 * Palette tuned to Procurement Academy's official #008C82 & #C2FE06 colors
 * with restrained opacity so typography & inputs remain high-contrast.
 */
export function getDotPalette(theme: DotThemeMode): DotPalette {
  if (theme === 'dark') {
    return {
      baseDotColor: 'rgba(0, 140, 130, 0.24)',
      baseDotAlpha: 0.24,
      spotlightPrimaryRgb: [0, 140, 130], // #008C82
      spotlightAccentRgb: [194, 254, 6], // #C2FE06
      spotlightMaxAlpha: 0.62,
      haloInnerColor: 'rgba(194, 254, 6, 0.055)',
      haloMidColor: 'rgba(0, 140, 130, 0.12)',
      haloOuterColor: 'rgba(0, 140, 130, 0)',
      spotlightRadius: 230,
      baseDotRadius: 1.35,
    };
  }

  return {
    baseDotColor: 'rgba(0, 140, 130, 0.16)',
    baseDotAlpha: 0.16,
    spotlightPrimaryRgb: [0, 140, 130], // #008C82
    spotlightAccentRgb: [0, 140, 130], // Soft #008C82 in Light Mode
    spotlightMaxAlpha: 0.48,
    haloInnerColor: 'rgba(0, 140, 130, 0.085)',
    haloMidColor: 'rgba(0, 140, 130, 0.04)',
    haloOuterColor: 'rgba(0, 140, 130, 0)',
    spotlightRadius: 210,
    baseDotRadius: 1.3,
  };
}
