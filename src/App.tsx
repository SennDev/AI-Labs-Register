import { useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { ProblemGuideSection } from './components/ProblemGuideSection';
import { RegistrationForm } from './components/RegistrationForm';
import { testConnection } from './firebase-config';

export default function App() {
  const [templateRequest, setTemplateRequest] = useState<{
    text: string;
    nonce: number;
  } | null>(null);

  useEffect(() => {
    void testConnection();
  }, []);

  // Entrada escalonada al hacer scroll mediante IntersectionObserver
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
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#F0F6F6] text-[#002733]">
        <Navbar onNavigateToForm={scrollToForm} />
        <main className="flex-1">
          <HeroSection onNavigateToForm={scrollToForm} />
          <ProblemGuideSection onApplyTemplate={handleApplyTemplate} />
          <RegistrationForm templateRequest={templateRequest} />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
