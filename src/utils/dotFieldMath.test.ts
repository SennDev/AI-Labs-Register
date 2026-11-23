import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampDevicePixelRatio,
  computeSpotlightInfluence,
  createDotGrid,
  getDotPalette,
  lerpRgb,
  stepGlowStrength,
} from './dotFieldMath';

test('clampDevicePixelRatio clamps invalid, sub-1, and high DPR values cleanly', () => {
  assert.equal(clampDevicePixelRatio(undefined), 1);
  assert.equal(clampDevicePixelRatio(0), 1);
  assert.equal(clampDevicePixelRatio(0.75), 1);
  assert.equal(clampDevicePixelRatio(1.5), 1.5);
  assert.equal(clampDevicePixelRatio(3), 2);
});

test('createDotGrid builds centered points covering viewport and handles empty dimensions', () => {
  const empty = createDotGrid(0, 800, 32);
  assert.equal(empty.points.length, 0);

  const grid = createDotGrid(1440, 900, 32);
  assert.ok(grid.cols > 40);
  assert.ok(grid.rows > 25);
  assert.equal(grid.points.length, grid.cols * grid.rows);

  const first = grid.points[0];
  const last = grid.points[grid.points.length - 1];
  assert.ok(first.baseX <= 32);
  assert.ok(last.baseX >= 1408);
});

test('computeSpotlightInfluence returns 1 at cursor center, 0 outside radius, and smooth falloff inside', () => {
  assert.equal(computeSpotlightInfluence(0, 0, 200), 1);
  assert.equal(computeSpotlightInfluence(200, 0, 200), 0);
  assert.equal(computeSpotlightInfluence(180, 180, 200), 0);

  const mid = computeSpotlightInfluence(100, 0, 200);
  const near = computeSpotlightInfluence(40, 0, 200);
  assert.ok(mid > 0 && mid < 1);
  assert.ok(near > mid && near < 1);
});

test('stepGlowStrength smoothly approaches target 1 and decays to 0', () => {
  const rising = stepGlowStrength(0, 1, 16);
  assert.ok(rising > 0 && rising < 0.5);

  let level = 1;
  for (let i = 0; i < 60; i++) {
    level = stepGlowStrength(level, 0, 16);
  }
  assert.ok(level < 0.05);
});

test('lerpRgb interpolates between #008C82 and #C2FE06 cleanly', () => {
  assert.deepEqual(lerpRgb([0, 140, 130], [194, 254, 6], 0), [0, 140, 130]);
  assert.deepEqual(lerpRgb([0, 140, 130], [194, 254, 6], 1), [194, 254, 6]);
  assert.deepEqual(lerpRgb([0, 140, 130], [194, 254, 6], 0.5), [97, 197, 68]);
});

test('getDotPalette uses subtle #008C82/#C2FE06 tints in dark mode and soft #008C82 in light mode', () => {
  const dark = getDotPalette('dark');
  assert.deepEqual(dark.spotlightPrimaryRgb, [0, 140, 130]);
  assert.deepEqual(dark.spotlightAccentRgb, [194, 254, 6]);
  assert.ok(dark.baseDotAlpha <= 0.3);

  const light = getDotPalette('light');
  assert.deepEqual(light.spotlightPrimaryRgb, [0, 140, 130]);
  assert.deepEqual(light.spotlightAccentRgb, [0, 140, 130]);
  assert.ok(light.baseDotAlpha <= 0.2);
});
