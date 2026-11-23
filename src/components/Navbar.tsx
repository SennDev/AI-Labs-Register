import { useState, type MouseEvent } from 'react';
import { ArrowUpRight, Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../App';
import { TRANSLATIONS, type Language } from '../utils/i18n';

interface NavbarProps {
  theme: ThemeMode;
  lang: Language;
  onToggleTheme: () => void;
  onChangeLang: (lang: Language) => void;
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
  lang,
  onToggleTheme,
  onChangeLang,
  onNavigateToForm,
}: NavbarProps) {
  const [logoError, setLogoError] = useState(false);
  const t = TRANSLATIONS[lang].nav;

  const logoSrc =
    theme === 'dark'
      ? './assets/VW_Procurement_Academy_Blanco.png'
      : './assets/VW_Procurement_Academy_Turquesa.png';

  return (
    <header className="sticky top-0 z-40 bg-[#F0F6F6]/90 dark:bg-[#041820]/90 backdrop-blur-md border-b border-[#002733]/8 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Brand mark */}
        <a
          href="#inicio"
          className="flex items-center shrink-0 focus-visible:rounded-lg"
          aria-label={t.homeAria}
        >
          {!logoError ? (
            <img
              src={logoSrc}
              alt="Volkswagen Procurement Academy"
              className="h-7 sm:h-10 w-auto object-contain"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="font-display text-base sm:text-lg font-bold tracking-tight text-[#008C82] dark:text-[#2DD4BF] whitespace-nowrap">
              Procurement Academy
            </span>
          )}
        </a>

        {/* Zone 2: Navigation links */}
        <nav
          aria-label={t.primaryNavAria}
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#002733]/80 dark:text-[#D5E6E6]"
        >
          <a
            href="#inicio"
            className="hover:text-[#008C82] dark:hover:text-[#C2FE06] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#008C82] dark:hover:border-[#C2FE06]"
          >
            {t.overview}
          </a>
          <a
            href="#guia"
            className="hover:text-[#008C82] dark:hover:text-[#C2FE06] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#008C82] dark:hover:border-[#C2FE06]"
          >
            {t.guide}
          </a>
          <a
            href="#registro"
            className="hover:text-[#008C82] dark:hover:text-[#C2FE06] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#008C82] dark:hover:border-[#C2FE06]"
          >
            {t.registration}
          </a>
        </nav>

        {/* Zone 3: Language Switcher (ES | EN) + Theme Toggle + Primary CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div
            role="group"
            aria-label={t.langGroupAria}
            data-testid="lang-switcher"
            className="neo-inset inline-flex items-center rounded-xl p-1 gap-0.5 shrink-0 min-h-[40px]"
          >
            {(['es', 'en'] as const).map((code) => {
              const active = lang === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onChangeLang(code)}
                  aria-pressed={active}
                  data-testid={`lang-btn-${code}`}
                  className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold uppercase tracking-wide transition-all cursor-pointer whitespace-nowrap min-h-[30px] ${
                    active
                      ? 'bg-[#008C82] text-white dark:bg-[#C2FE06] dark:text-[#002733] shadow-sm'
                      : 'text-[#002733]/70 dark:text-[#CBE0E0] hover:text-[#002733] dark:hover:text-white'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={(e) => {
              triggerRipple(e);
              onToggleTheme();
            }}
            aria-label={theme === 'dark' ? t.switchToLight : t.switchToDark}
            aria-pressed={theme === 'dark'}
            title={theme === 'dark' ? t.switchToLight : t.switchToDark}
            data-testid="theme-toggle"
            className="btn-neo inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] min-w-[40px]"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-[#C2FE06] shrink-0" aria-hidden="true" />
                <span className="hidden md:inline">{t.lightLabel}</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#008C82] shrink-0" aria-hidden="true" />
                <span className="hidden md:inline">{t.darkLabel}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              triggerRipple(e);
              onNavigateToForm();
            }}
            className="btn-lime inline-flex items-center gap-1 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            {t.cta}
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
