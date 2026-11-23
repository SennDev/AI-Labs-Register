import { useState } from 'react';
import { ArrowDown, ArrowRight, Calendar, Layers, Users } from 'lucide-react';
import { triggerRipple } from './Navbar';

interface HeroSectionProps {
  onNavigateToForm: () => void;
}

export function HeroSection({ onNavigateToForm }: HeroSectionProps) {
  const [whiteLogoError, setWhiteLogoError] = useState(false);
  const [appIconError, setAppIconError] = useState(false);

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
                  <span>January Edition</span>
                </div>
              </div>

              <h1 className="font-display text-[clamp(1.75rem,3.6vw,3.25rem)] font-extrabold leading-[1.14] tracking-tight text-white [text-wrap:balance] mb-5">
                Submit a real procurement problem and prototype its AI solution.
              </h1>

              <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl mb-8">
                During the hands-on <strong className="text-white font-semibold">IA Labs · January</strong> sessions at{' '}
                <strong className="text-white font-semibold">Procurement Academy</strong>, we will work directly on real day-to-day operational bottlenecks to design and validate practical Artificial Intelligence prototypes.
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
                Submit my challenge
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>

              <a
                href="#guia"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium text-white/90 hover:text-[#C2FE06] transition-colors min-h-[44px]"
              >
                How to frame your problem
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
                    Open Call
                  </p>
                  <h2 className="font-display text-xl font-bold text-[#002733] dark:text-white leading-snug">
                    IA Labs · January
                  </h2>
                </div>
              </div>

              <div className="space-y-4 border-t border-[#002733]/10 dark:border-white/10 pt-5">
                <div className="flex items-start gap-3.5">
                  <div className="neo-inset w-9 h-9 rounded-xl flex items-center justify-center text-[#008C82] dark:text-[#2DD4BF] shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#002733] dark:text-white">
                      Hands-on sessions in January
                    </p>
                    <p className="text-xs sm:text-sm text-[#002733]/72 dark:text-[#CBE0E0] leading-relaxed">
                      Guided coaching to move from an operational bottleneck to a working prototype.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="neo-inset w-9 h-9 rounded-xl flex items-center justify-center text-[#008C82] dark:text-[#2DD4BF] shrink-0 mt-0.5">
                    <Users className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#002733] dark:text-white">
                      Individual or team format
                    </p>
                    <p className="text-xs sm:text-sm text-[#002733]/72 dark:text-[#CBE0E0] leading-relaxed">
                      Submit a solo initiative or collaborate with colleagues from your department.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="neo-inset w-9 h-9 rounded-xl flex items-center justify-center text-[#008C82] dark:text-[#2DD4BF] shrink-0 mt-0.5">
                    <Layers className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#002733] dark:text-white">
                      No prior coding required
                    </p>
                    <p className="text-xs sm:text-sm text-[#002733]/72 dark:text-[#CBE0E0] leading-relaxed">
                      What matters most is clearly articulating the business pain point and its impact.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#002733]/10 dark:border-white/10">
              <p className="text-xs text-[#002733]/70 dark:text-[#CBE0E0] leading-relaxed">
                Registration open for{' '}
                <span className="font-mono-tabular font-semibold text-[#002733] dark:text-white">@vw.com.mx</span>,{' '}
                <span className="font-mono-tabular font-semibold text-[#002733] dark:text-white">@proveed-vw.com.mx</span>, and{' '}
                <span className="font-mono-tabular font-semibold text-[#002733] dark:text-white">@outlook.com</span> addresses.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
