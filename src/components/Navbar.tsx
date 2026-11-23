import { useState, type MouseEvent } from 'react';
import { ArrowUpRight, Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../App';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onNavigateToForm: () => void;
}

export function triggerRipple(event: MouseEvent<HTMLElement>) {
  const button = event.currentTarget;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const span = document.createElement('span');
  span.className = 'btn-ripple-wave';
  span.style.width = `${size}px`;
  span.style.height = `${size}px`;
  span.style.left = `${x}px`;
  span.style.top = `${y}px`;
  button.appendChild(span);

  window.setTimeout(() => {
    span.remove();
  }, 540);
}

export function Navbar({
  theme,
  onToggleTheme,
  onNavigateToForm,
}: NavbarProps) {
  const [logoError, setLogoError] = useState(false);

  const logoSrc =
    theme === 'dark'
      ? './assets/VW_Procurement_Academy_Blanco.png'
      : './assets/VW_Procurement_Academy_Turquesa.png';

  return (
    <header className="sticky top-0 z-40 bg-[#F0F6F6]/90 dark:bg-[#041820]/90 backdrop-blur-md border-b border-[#002733]/8 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand mark */}
        <a
          href="#inicio"
          className="flex items-center shrink-0 focus-visible:rounded-lg"
          aria-label="Procurement Academy IA Labs home"
        >
          {!logoError ? (
            <img
              src={logoSrc}
              alt="Volkswagen Procurement Academy"
              className="h-9 sm:h-10 w-auto object-contain"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="font-display text-lg font-bold tracking-tight text-[#008C82] dark:text-[#2DD4BF] whitespace-nowrap">
              Procurement Academy
            </span>
          )}
        </a>

        {/* Zone 2: Navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#002733]/80 dark:text-[#D5E6E6]"
        >
          <a
            href="#inicio"
            className="hover:text-[#008C82] dark:hover:text-[#C2FE06] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#008C82] dark:hover:border-[#C2FE06]"
          >
            Overview
          </a>
          <a
            href="#guia"
            className="hover:text-[#008C82] dark:hover:text-[#C2FE06] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#008C82] dark:hover:border-[#C2FE06]"
          >
            Problem Guide
          </a>
          <a
            href="#registro"
            className="hover:text-[#008C82] dark:hover:text-[#C2FE06] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#008C82] dark:hover:border-[#C2FE06]"
          >
            Registration
          </a>
        </nav>

        {/* Zone 3: Theme toggle + Primary CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              triggerRipple(e);
              onToggleTheme();
            }}
            aria-label={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
            aria-pressed={theme === 'dark'}
            title={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
            data-testid="theme-toggle"
            className="btn-neo inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] min-w-[40px]"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-[#C2FE06] shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#008C82] shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              triggerRipple(e);
              onNavigateToForm();
            }}
            className="btn-lime inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            Submit challenge
            <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
