import { useEffect, useRef } from 'react';
import type { ThemeMode } from '../App';
import {
  clampDevicePixelRatio,
  computeSpotlightInfluence,
  createDotGrid,
  getDotPalette,
  lerpRgb,
  stepGlowStrength,
  type DotGridMetrics,
} from '../utils/dotFieldMath';

interface DotGridBackgroundProps {
  theme: ThemeMode;
}

const GRID_SPACING = 32;
const DRIFT_SPEED = 0.00055;
const DRIFT_AMPLITUDE = 1.8;

export function DotGridBackground({ theme }: DotGridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef<ThemeMode>(theme);
  const redrawStaticRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    themeRef.current = theme;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.setAttribute('data-theme', theme);
    }
    redrawStaticRef.current?.();
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = mediaQuery.matches;
    canvas.setAttribute('data-motion', prefersReducedMotion ? 'reduced' : 'active');

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = clampDevicePixelRatio(window.devicePixelRatio);
    let grid: DotGridMetrics = createDotGrid(width, height, GRID_SPACING);

    let rafId: number | null = null;
    let lastTimestamp = 0;

    let hasPointer = false;
    let isPointerInside = false;
    let targetX = width * 0.5;
    let targetY = height * 0.5;
    let renderX = targetX;
    let renderY = targetY;
    let glowFactor = 0;

    const syncCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = clampDevicePixelRatio(window.devicePixelRatio);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      grid = createDotGrid(width, height, GRID_SPACING);
    };

    const drawFrame = (timestamp: number, animateDrift: boolean) => {
      const palette = getDotPalette(themeRef.current);
      ctx.clearRect(0, 0, width, height);

      const spotlightRadius = palette.spotlightRadius;
      const spotlightRadiusSq = spotlightRadius * spotlightRadius;
      const showGlow = animateDrift && hasPointer && glowFactor > 0.004;

      if (showGlow) {
        const gradient = ctx.createRadialGradient(
          renderX,
          renderY,
          0,
          renderX,
          renderY,
          spotlightRadius
        );
        gradient.addColorStop(0, palette.haloInnerColor);
        gradient.addColorStop(0.45, palette.haloMidColor);
        gradient.addColorStop(1, palette.haloOuterColor);

        ctx.save();
        ctx.globalAlpha = glowFactor;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(renderX, renderY, spotlightRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const highlightedDots: Array<{
        x: number;
        y: number;
        radius: number;
        influence: number;
      }> = [];

      // Batch all ambient base dots into a single path for minimal draw overhead
      ctx.beginPath();
      for (let i = 0; i < grid.points.length; i++) {
        const pt = grid.points[i];
        const x = animateDrift
          ? pt.baseX +
            Math.sin(timestamp * DRIFT_SPEED * pt.speedScale + pt.phaseX) *
              DRIFT_AMPLITUDE
          : pt.baseX;
        const y = animateDrift
          ? pt.baseY +
            Math.cos(timestamp * DRIFT_SPEED * pt.speedScale + pt.phaseY) *
              DRIFT_AMPLITUDE
          : pt.baseY;
        const r = Math.max(0.8, palette.baseDotRadius + pt.radiusOffset);

        if (showGlow) {
          const dx = x - renderX;
          const dy = y - renderY;
          if (dx * dx + dy * dy < spotlightRadiusSq) {
            const influence =
              computeSpotlightInfluence(dx, dy, spotlightRadius) * glowFactor;
            if (influence > 0.01) {
              highlightedDots.push({
                x,
                y,
                radius: r + influence * 1.2,
                influence,
              });
              continue;
            }
          }
        }

        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }
      ctx.fillStyle = palette.baseDotColor;
      ctx.fill();

      // Render only dots near the cursor with smooth green glow/accent interpolation
      for (let i = 0; i < highlightedDots.length; i++) {
        const dot = highlightedDots[i];
        const [cr, cg, cb] = lerpRgb(
          palette.spotlightPrimaryRgb,
          palette.spotlightAccentRgb,
          dot.influence * 0.85
        );
        const alpha =
          palette.baseDotAlpha +
          (palette.spotlightMaxAlpha - palette.baseDotAlpha) * dot.influence;
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const stopLoop = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const tick = (now: number) => {
      if (prefersReducedMotion || document.hidden) {
        rafId = null;
        return;
      }

      const dt = lastTimestamp === 0 ? 16 : now - lastTimestamp;
      lastTimestamp = now;

      const lerpAlpha = 1 - Math.exp(-Math.min(dt, 50) * 0.016);
      renderX += (targetX - renderX) * lerpAlpha;
      renderY += (targetY - renderY) * lerpAlpha;
      glowFactor = stepGlowStrength(glowFactor, isPointerInside ? 1 : 0, dt);

      drawFrame(now, true);
      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (prefersReducedMotion || document.hidden || rafId !== null) {
        return;
      }
      lastTimestamp = 0;
      rafId = window.requestAnimationFrame(tick);
    };

    redrawStaticRef.current = () => {
      if (prefersReducedMotion) {
        drawFrame(0, false);
      }
    };

    const handleResize = () => {
      syncCanvasSize();
      if (prefersReducedMotion) {
        drawFrame(0, false);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return;
      }
      if (!hasPointer) {
        renderX = event.clientX;
        renderY = event.clientY;
        hasPointer = true;
      }
      targetX = event.clientX;
      targetY = event.clientY;
      isPointerInside = true;
    };

    const handlePointerLeave = () => {
      isPointerInside = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else if (prefersReducedMotion) {
        drawFrame(0, false);
      } else {
        startLoop();
      }
    };

    const handleMotionPreferenceChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches;
      canvas.setAttribute(
        'data-motion',
        prefersReducedMotion ? 'reduced' : 'active'
      );
      if (prefersReducedMotion) {
        stopLoop();
        isPointerInside = false;
        glowFactor = 0;
        drawFrame(0, false);
      } else {
        startLoop();
      }
    };

    syncCanvasSize();
    if (prefersReducedMotion) {
      drawFrame(0, false);
    } else {
      startLoop();
    }

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('blur', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    mediaQuery.addEventListener('change', handleMotionPreferenceChange);

    return () => {
      stopLoop();
      redrawStaticRef.current = null;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      mediaQuery.removeEventListener('change', handleMotionPreferenceChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="dot-grid-canvas"
      data-theme={theme}
      className="fixed inset-0 z-0 w-full h-full pointer-events-none select-none"
    />
  );
}
