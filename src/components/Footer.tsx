import { useState } from 'react';
import { TRANSLATIONS, type Language } from '../utils/i18n';

interface FooterProps {
  lang: Language;
}

export function Footer({ lang }: FooterProps) {
  const [logoError, setLogoError] = useState(false);
  const t = TRANSLATIONS[lang].footer;

  return (
    <footer className="bg-[#002733] dark:bg-[#021016] text-white mt-12 py-10 px-4 sm:px-6 border-t border-transparent dark:border-white/10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {!logoError ? (
            <img
              src="./assets/VW_Procurement_Academy_Blanco.png"
              alt="Volkswagen Procurement Academy"
              className="h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="font-display text-base font-bold text-white">
              Procurement Academy
            </span>
          )}
        </div>

        <nav
          aria-label={t.navAria}
          className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-white/75"
        >
          <a href="#inicio" className="hover:text-[#C2FE06] transition-colors">
            {t.overview}
          </a>
          <a href="#guia" className="hover:text-[#C2FE06] transition-colors">
            {t.guide}
          </a>
          <a href="#registro" className="hover:text-[#C2FE06] transition-colors">
            {t.registration}
          </a>
        </nav>

        <p className="text-xs text-white/65">{t.copyright}</p>
      </div>
    </footer>
  );
}
