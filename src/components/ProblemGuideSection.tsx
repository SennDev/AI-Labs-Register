import { useState } from 'react';
import { ClipboardCheck, Compass, Sparkles, TrendingUp } from 'lucide-react';
import type { ThemeMode } from '../App';
import { triggerRipple } from './Navbar';

interface ProblemGuideSectionProps {
  theme: ThemeMode;
  onApplyTemplate: (templateText: string) => void;
}

const GUIDE_CARDS = [
  {
    step: '01.',
    title: 'Current workflow or bottleneck',
    description:
      'Describe which repetitive task, manual data entry, or approval delay slows down your daily workflow.',
    example:
      'Example: “Every Monday we manually consolidate 12 RFQ spreadsheets in different supplier layouts before we can compare pricing.”',
    icon: Compass,
  },
  {
    step: '02.',
    title: 'Time, quality, or operational impact',
    description:
      'Quantify or explain the operational cost of the problem: hours spent, rework cycles, or delayed supplier responses.',
    example:
      'Example: “It takes 6 hours per buyer each week and leads to missed price validity dates or delivery terms.”',
    icon: TrendingUp,
  },
  {
    step: '03.',
    title: 'Expected AI outcome',
    description:
      'Define the concrete deliverable or improvement you want to validate during the January sessions, without worrying about the technical stack.',
    example:
      'Example: “A prototype that reads incoming quotes and automatically builds a comparison matrix flagging deviations.”',
    icon: Sparkles,
  },
] as const;

const PROBLEM_TEMPLATE = `1. Current workflow or bottleneck:
Describe step by step which task or handoff causes delays or manual rework today.

2. Time, quality, or operational impact:
Indicate how many hours it takes, how often it happens, and what errors or risks it creates.

3. Expected outcome:
Explain what you want to achieve or validate during the January IA Labs sessions.`;

export function ProblemGuideSection({
  theme,
  onApplyTemplate,
}: ProblemGuideSectionProps) {
  const [iconError, setIconError] = useState(false);

  const badgeSrc =
    theme === 'dark'
      ? './assets/Icono_App_512.png'
      : './assets/Icono_Turquesa.png';

  return (
    <section id="guia" className="scroll-mt-20 py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10 reveal-item">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              {!iconError && (
                <img
                  src={badgeSrc}
                  alt=""
                  aria-hidden="true"
                  className="w-7 h-7 object-contain rounded-md"
                  referrerPolicy="no-referrer"
                  onError={() => setIconError(true)}
                />
              )}
              <span className="text-sm font-semibold text-[#008C82] dark:text-[#2DD4BF]">
                Submission Guide
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#002733] dark:text-white tracking-tight [text-wrap:balance]">
              How should you frame your underlying problem?
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#002733]/75 dark:text-[#CBE0E0] leading-relaxed">
              The strongest <strong className="font-semibold text-[#002733] dark:text-white">IA Labs</strong> cases start with a clearly defined operational pain point rather than a specific tool. Structure your proposal around these three elements:
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
            <ClipboardCheck
              className="w-4 h-4 text-[#008C82] dark:text-[#C2FE06] shrink-0"
              aria-hidden="true"
            />
            Use template in form
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
                    <span className="font-mono-tabular text-sm font-semibold text-[#008C82] dark:text-[#C2FE06]">
                      {card.step}
                    </span>
                    <div className="neo-inset w-10 h-10 rounded-xl flex items-center justify-center text-[#008C82] dark:text-[#2DD4BF]">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#002733] dark:text-white leading-snug mb-2.5">
                    {card.title}
                  </h3>

                  <p className="text-sm text-[#002733]/75 dark:text-[#CBE0E0] leading-relaxed mb-5">
                    {card.description}
                  </p>
                </div>

                <div className="neo-inset rounded-2xl p-4">
                  <p className="text-xs sm:text-[13px] text-[#002733]/80 dark:text-[#D5E6E6] leading-relaxed">
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
