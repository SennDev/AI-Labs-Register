import { useState } from 'react';
import { ArrowDown, ArrowRight, Calendar, Layers, Users } from 'lucide-react';
import { TRANSLATIONS, type Language } from '../utils/i18n';
import { triggerRipple } from './Navbar';

interface HeroSectionProps {
  lang: Language;
  onNavigateToForm: () => void;
}

export function HeroSection({ lang, onNavigateToForm }: HeroSectionProps) {
  const [whiteLogoError, setWhiteLogoError] = useState(false);
  const [appIconError, setAppIconError] = useState(false);
  const t = TRANSLATIONS[lang].hero;

  const highlightIcons = [Calendar, Users, Layers] as const;

  return (
    <section
      id="inicio"
      className="scroll-mt-20 pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* High-contrast VW Navy focal panel */}
          <div className="lg:col-span-8 neo-navy-panel rounded-3xl p-7 sm:p-11 text-white flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                {!whiteLogoError ? (
                  <img
                    src="./assets/VW_Procurement_Academy_Blanco.png"
                    alt="Volkswagen Procurement Academy"
                    className="h-11 sm:h-12 w-auto object-contain"
                    referrerPolicy="no-referrer"
                    onError={() => setWhiteLogoError(true)}
                  />
                ) : (
                  <span className="font-display text-xl font-bold text-white tracking-tight">
                    Procurement Academy
                  </span>
                )}

                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white/80 tracking-wide">
                  <span className="text-[#C2FE06] font-semibold">IA Labs</span>
                  <span aria-hidden="true">·</span>
                  <span>{t.edition}</span>
                </div>
              </div>

              <h1 className="font-display text-[clamp(1.75rem,3.6vw,3.25rem)] font-extrabold leading-[1.14] tracking-tight text-white [text-wrap:balance] mb-5">
                {t.title}
              </h1>

              <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl mb-8">
                {t.descPart1}
                <strong className="text-white font-semibold">{t.descLabs}</strong>
                {t.descPart2}
                <strong className="text-white font-semibold">{t.descAcademy}</strong>
                {t.descPart3}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  triggerRipple(e);
                  onNavigateToForm();
                }}
                className="btn-lime inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm sm:text-base font-bold cursor-pointer min-h-[44px]"
              >
                {t.ctaPrimary}
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>

              <a
                href="#guia"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium text-white/90 hover:text-[#C2FE06] transition-colors min-h-[44px]"
              >
                {t.ctaSecondary}
                <ArrowDown className="w-4 h-4 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Neomorphic companion summary panel */}
          <aside className="lg:col-span-4 neo-surface rounded-3xl p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="neo-surface-sm w-16 h-16 rounded-2xl p-2 flex items-center justify-center shrink-0">
                  {!appIconError ? (
                    <img
                      src="./assets/Icono_App_512.png"
                      alt="Procurement Academy IA Labs Badge"
                      className="w-full h-full object-contain rounded-xl"
                      referrerPolicy="no-referrer"
                      onError={() => setAppIconError(true)}
                    />
                  ) : (
                    <Layers className="w-7 h-7 text-[#008C82] dark:text-[#2DD4BF]" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#008C82] dark:text-[#2DD4BF] tracking-wide">
                    {t.openCall}
                  </p>
                  <h2 className="font-display text-xl font-bold text-[#002733] dark:text-white leading-snug">
                    {t.labTitle}
                  </h2>
                </div>
              </div>

              <div className="space-y-4 border-t border-[#002733]/10 dark:border-white/10 pt-5">
                {t.highlights.map((item, idx) => {
                  const Icon = highlightIcons[idx];
                  return (
                    <div key={item.title} className="flex items-start gap-3.5">
                      <div className="neo-inset w-9 h-9 rounded-xl flex items-center justify-center text-[#008C82] dark:text-[#2DD4BF] shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#002733] dark:text-white">
                          {item.title}
                        </p>
                        <p className="text-xs sm:text-sm text-[#002733]/72 dark:text-[#CBE0E0] leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#002733]/10 dark:border-white/10">
              <p className="text-xs text-[#002733]/70 dark:text-[#CBE0E0] leading-relaxed">
                {t.domainsPrefix}
                <span className="font-mono-tabular font-semibold text-[#002733] dark:text-white">@vw.com.mx</span>,{' '}
                <span className="font-mono-tabular font-semibold text-[#002733] dark:text-white">@proveed-vw.com.mx</span>
                {t.domainsAnd}
                <span className="font-mono-tabular font-semibold text-[#002733] dark:text-white">@outlook.com</span>
                {t.domainsSuffix}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
