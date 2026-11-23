import { useState } from 'react';
import { ClipboardCheck, Compass, Sparkles, TrendingUp } from 'lucide-react';
import { triggerRipple } from './Navbar';

interface ProblemGuideSectionProps {
  onApplyTemplate: (templateText: string) => void;
}

const GUIDE_CARDS = [
  {
    step: '01.',
    title: 'Proceso o cuello de botella actual',
    description:
      'Describe qué actividad repetitiva, captura manual o espera de validación frena hoy tu flujo de trabajo.',
    example:
      'Ejemplo: “Cada semana consolidamos manualmente 12 hojas de cálculo con cotizaciones RFQ en distintos formatos antes de comparar ofertas.”',
    icon: Compass,
  },
  {
    step: '02.',
    title: 'Impacto en tiempo, calidad u operación',
    description:
      'Cuantifica o explica qué costo operativo tiene el problema: horas invertidas, retrabajos o demoras en respuesta.',
    example:
      'Ejemplo: “Toma 6 horas semanales por comprador y genera omisiones en vigencias de precios o cláusulas de entrega.”',
    icon: TrendingUp,
  },
  {
    step: '03.',
    title: 'Resultado esperado con IA',
    description:
      'Indica qué entregable o mejora concreta esperas validar durante las sesiones de enero, sin preocuparte por la herramienta técnica.',
    example:
      'Ejemplo: “Un prototipo que lea las cotizaciones y genere automáticamente una tabla comparativa con alertas de desviación.”',
    icon: Sparkles,
  },
] as const;

const PROBLEM_TEMPLATE = `1. Proceso o cuello de botella actual:
Describe paso a paso qué tarea o flujo genera retrasos o trabajo manual hoy.

2. Impacto en tiempo, calidad u operación:
Indica cuántas horas toma, con qué frecuencia ocurre y qué errores o riesgos provoca.

3. Resultado esperado:
Explica qué te gustaría lograr o validar en las sesiones de IA Labs en enero.`;

export function ProblemGuideSection({ onApplyTemplate }: ProblemGuideSectionProps) {
  const [turqIconError, setTurqIconError] = useState(false);

  return (
    <section id="guia" className="scroll-mt-20 py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10 reveal-item">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              {!turqIconError && (
                <img
                  src="./assets/Icono_Turquesa.png"
                  alt=""
                  aria-hidden="true"
                  className="w-7 h-7 object-contain"
                  referrerPolicy="no-referrer"
                  onError={() => setTurqIconError(true)}
                />
              )}
              <span className="text-sm font-semibold text-[#008C82]">
                Guía de postulación
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#002733] tracking-tight [text-wrap:balance]">
              ¿Cómo plantear tu problema de fondo?
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#002733]/75 leading-relaxed">
              Los mejores casos de <strong className="font-semibold text-[#002733]">IA Labs</strong> parten de un dolor operativo bien definido, no de una tecnología específica. Estructura tu propuesta con estos tres elementos:
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              triggerRipple(e);
              onApplyTemplate(PROBLEM_TEMPLATE);
            }}
            className="btn-neo inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold self-start md:self-auto shrink-0 cursor-pointer min-h-[44px]"
          >
            <ClipboardCheck className="w-4 h-4 text-[#008C82] shrink-0" aria-hidden="true" />
            Usar estructura en el formulario
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GUIDE_CARDS.map((card, index) => {
            const Icon = card.icon;
            return (
              <article
                key={card.step}
                style={{ transitionDelay: `${index * 80}ms` }}
                className="neo-surface rounded-3xl p-7 flex flex-col justify-between reveal-item"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <span className="font-mono-tabular text-sm font-semibold text-[#008C82]">
                      {card.step}
                    </span>
                    <div className="neo-inset w-10 h-10 rounded-xl flex items-center justify-center text-[#008C82]">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#002733] leading-snug mb-2.5">
                    {card.title}
                  </h3>

                  <p className="text-sm text-[#002733]/75 leading-relaxed mb-5">
                    {card.description}
                  </p>
                </div>

                <div className="neo-inset rounded-2xl p-4">
                  <p className="text-xs sm:text-[13px] text-[#002733]/80 leading-relaxed">
                    {card.example}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
