import { useEffect, useState } from 'react';
import type { ThemeMode } from '../App';
import { TRANSLATIONS, type Language } from '../utils/i18n';

interface SplashScreenProps {
  theme: ThemeMode;
  lang: Language;
  onFinish?: () => void;
}

const MIN_SPLASH_MS = 650;
const REDUCED_SPLASH_MS = 180;
const MAX_FONT_WAIT_MS = 850;
const FADE_OUT_MS = 280;

export function SplashScreen({ theme, lang, onFinish }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [progressReady, setProgressReady] = useState(false);

  const t = TRANSLATIONS[lang].splash;
  const badgeSrc =
    theme === 'dark' ? './assets/Icono_App_512.png' : './assets/Icono_Turquesa.png';

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let cancelled = false;
    let minDelayTimer: number | undefined;
    let fontWaitTimer: number | undefined;
    let unmountTimer: number | undefined;

    const rafProgress = window.requestAnimationFrame(() => {
      if (!cancelled) {
        setProgressReady(true);
      }
    });

    const minDelay = new Promise<void>((resolve) => {
      minDelayTimer = window.setTimeout(
        resolve,
        prefersReducedMotion ? REDUCED_SPLASH_MS : MIN_SPLASH_MS
      );
    });

    const fontReady =
      typeof document.fonts !== 'undefined' && document.fonts.ready
        ? Promise.race([
            document.fonts.ready.then(() => undefined),
            new Promise<void>((resolve) => {
              fontWaitTimer = window.setTimeout(resolve, MAX_FONT_WAIT_MS);
            }),
          ])
        : Promise.resolve();

    void Promise.all([minDelay, fontReady]).then(() => {
      if (cancelled) {
        return;
      }
      setExiting(true);
      const fadeDuration = prefersReducedMotion ? 100 : FADE_OUT_MS;
      unmountTimer = window.setTimeout(() => {
        if (!cancelled) {
          setMounted(false);
          onFinish?.();
        }
      }, fadeDuration);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafProgress);
      if (minDelayTimer !== undefined) {
        window.clearTimeout(minDelayTimer);
      }
      if (fontWaitTimer !== undefined) {
        window.clearTimeout(fontWaitTimer);
      }
      if (unmountTimer !== undefined) {
        window.clearTimeout(unmountTimer);
      }
    };
  }, [onFinish]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t.status}
      data-testid="splash-screen"
      data-state={exiting ? 'exiting' : 'visible'}
      data-theme={theme}
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#F0F6F6] dark:bg-[#041820] transition-all duration-300 ease-out ${
        exiting ? 'opacity-0 scale-[0.985] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle radial teal ambient backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,140,130,0.12)_0%,transparent_58%)] dark:bg-[radial-gradient(circle_at_center,rgba(0,140,130,0.22)_0%,rgba(194,254,6,0.03)_35%,transparent_65%)]"
      />

      <div className="relative neo-surface-elevated rounded-3xl px-8 py-9 sm:px-10 sm:py-10 w-full max-w-xs sm:max-w-sm flex flex-col items-center text-center">
        {/* Dual-theme orbital accent ring around official emblem */}
        <div className="relative w-20 h-20 flex items-center justify-center mb-5">
          <svg
            aria-hidden="true"
            viewBox="0 0 80 80"
            className="absolute inset-0 w-full h-full motion-safe:animate-[spin_1.6s_linear_infinite]"
          >
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              className="stroke-[#008C82]/18 dark:stroke-white/10"
              strokeWidth="3"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              className="stroke-[#008C82] dark:stroke-[#C2FE06]"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray="72 160"
            />
          </svg>

          <div className="w-14 h-14 rounded-2xl neo-surface-sm flex items-center justify-center p-2.5 shadow-[0_0_24px_rgba(0,140,130,0.18)] dark:shadow-[0_0_24px_rgba(0,140,130,0.35)]">
            <img
              src={badgeSrc}
              alt={t.badgeAlt}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <p className="text-xs font-semibold tracking-wide text-[#008C82] dark:text-[#2DD4BF]">
          {t.kicker}
        </p>
        <h2 className="font-display text-xl font-bold tracking-tight text-[#002733] dark:text-white mt-1">
          {t.title}
        </h2>
        <p className="text-xs sm:text-sm text-[#002733]/70 dark:text-[#CBE0E0] mt-2">
          {t.status}
        </p>

        {/* Smooth loading progress bar */}
        <div
          aria-hidden="true"
          className="mt-5 h-1.5 w-44 rounded-full overflow-hidden bg-[#002733]/10 dark:bg-white/10"
        >
          <div
            className={`h-full rounded-full bg-[#008C82] dark:bg-[#C2FE06] transition-all duration-600 ease-out motion-reduce:duration-100 ${
              progressReady ? 'w-full' : 'w-1/4'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
