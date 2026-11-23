import { useEffect, useState } from 'react';
import { DotGridBackground } from './components/DotGridBackground';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { ProblemGuideSection } from './components/ProblemGuideSection';
import { RegistrationForm } from './components/RegistrationForm';
import { testConnection } from './firebase-config';
import {
  LANG_STORAGE_KEY,
  TRANSLATIONS,
  getInitialLanguage,
  type Language,
} from './utils/i18n';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'ia_labs_theme';

function getInitialTheme(): ThemeMode {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark'
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [lang, setLang] = useState<Language>(getInitialLanguage);
  const [templateRequest, setTemplateRequest] = useState<{
    text: string;
    nonce: number;
  } | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors in restricted environments
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = TRANSLATIONS[lang].meta.pageTitle;
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors in restricted environments
    }
  }, [lang]);

  useEffect(() => {
    void testConnection();
  }, []);

  // Staggered scroll-reveal via IntersectionObserver
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('.reveal-item'));
    if (items.length === 0) {
      return;
    }

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -24px 0px' }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const scrollToForm = () => {
    const el = document.getElementById('registro');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleApplyTemplate = (templateText: string) => {
    setTemplateRequest({ text: templateText, nonce: Date.now() });
    scrollToForm();
  };

  return (
    <ErrorBoundary lang={lang}>
      <div className="relative min-h-screen flex flex-col bg-[#F0F6F6] dark:bg-[#041820] text-[#002733] dark:text-[#F0F6F6] transition-colors duration-200">
        <DotGridBackground theme={theme} />
        <Navbar
          theme={theme}
          lang={lang}
          onToggleTheme={toggleTheme}
          onChangeLang={setLang}
          onNavigateToForm={scrollToForm}
        />
        <div className="relative z-10 flex-1 flex flex-col">
          <main className="flex-1">
            <HeroSection lang={lang} onNavigateToForm={scrollToForm} />
            <ProblemGuideSection
              theme={theme}
              lang={lang}
              onApplyTemplate={handleApplyTemplate}
            />
            <RegistrationForm
              theme={theme}
              lang={lang}
              templateRequest={templateRequest}
            />
          </main>
          <Footer lang={lang} />
        </div>
      </div>
    </ErrorBoundary>
  );
}
