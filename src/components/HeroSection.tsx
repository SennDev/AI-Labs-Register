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
          {/* Bloque principal de alto contraste VW Navy */}
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
                  <span>Edición Enero</span>
                </div>
              </div>

              <h1 className="font-display text-[clamp(1.75rem,3.6vw,3.25rem)] font-extrabold leading-[1.14] tracking-tight text-white [text-wrap:balance] mb-5">
                Postula un problema real de compras y prototipa su solución con IA.
              </h1>

              <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl mb-8">
                En las sesiones prácticas de <strong className="text-white font-semibold">IA Labs · Enero</strong> de{' '}
                <strong className="text-white font-semibold">Procurement Academy</strong>, trabajaremos sobre retos reales de tu operación diaria para diseñar y validar prototipos funcionales con Inteligencia Artificial.
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
                Postular mi reto
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>

              <a
                href="#guia"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium text-white/90 hover:text-[#C2FE06] transition-colors min-h-[44px]"
              >
                Cómo plantear el problema
                <ArrowDown className="w-4 h-4 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Columna lateral neomórfica sobre Mist */}
          <aside className="lg:col-span-4 neo-surface rounded-3xl p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="neo-surface-sm w-16 h-16 rounded-2xl p-2 flex items-center justify-center shrink-0">
                  {!appIconError ? (
                    <img
                      src="./assets/Icono_App_512.png"
                      alt="Insignia IA Labs Procurement Academy"
                      className="w-full h-full object-contain rounded-xl"
                      referrerPolicy="no-referrer"
                      onError={() => setAppIconError(true)}
                    />
                  ) : (
                    <Layers className="w-7 h-7 text-[#008C82]" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#008C82] tracking-wide">
                    Convocatoria Abierta
                  </p>
                  <h2 className="font-display text-xl font-bold text-[#002733] leading-snug">
                    IA Labs · Enero
                  </h2>
                </div>
              </div>

              <div className="space-y-4 border-t border-[#002733]/10 pt-5">
                <div className="flex items-start gap-3.5">
                  <div className="neo-inset w-9 h-9 rounded-xl flex items-center justify-center text-[#008C82] shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#002733]">
                      Sesiones prácticas en enero
                    </p>
                    <p className="text-xs sm:text-sm text-[#002733]/72 leading-relaxed">
                      Acompañamiento guiado para pasar del cuello de botella al prototipo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="neo-inset w-9 h-9 rounded-xl flex items-center justify-center text-[#008C82] shrink-0 mt-0.5">
                    <Users className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#002733]">
                      Individual o en equipo
                    </p>
                    <p className="text-xs sm:text-sm text-[#002733]/72 leading-relaxed">
                      Postula un caso propio o colabora con compañeros de tu gerencia.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="neo-inset w-9 h-9 rounded-xl flex items-center justify-center text-[#008C82] shrink-0 mt-0.5">
                    <Layers className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#002733]">
                      Sin requisitos previos de código
                    </p>
                    <p className="text-xs sm:text-sm text-[#002733]/72 leading-relaxed">
                      Lo esencial es la claridad del problema de negocio y su impacto.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#002733]/10">
              <p className="text-xs text-[#002733]/70 leading-relaxed">
                Registro habilitado para dominios{' '}
                <span className="font-mono-tabular font-semibold text-[#002733]">@vw.com.mx</span>,{' '}
                <span className="font-mono-tabular font-semibold text-[#002733]">@proveed-vw.com.mx</span> y{' '}
                <span className="font-mono-tabular font-semibold text-[#002733]">@outlook.com</span>.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
