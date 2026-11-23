import { useState } from 'react';

export function Footer() {
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="bg-[#002733] text-white mt-12 py-10 px-4 sm:px-6">
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
          aria-label="Enlaces institucionales"
          className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-white/75"
        >
          <a href="#inicio" className="hover:text-[#C2FE06] transition-colors">
            Convocatoria
          </a>
          <a href="#guia" className="hover:text-[#C2FE06] transition-colors">
            Cómo plantearlo
          </a>
          <a href="#registro" className="hover:text-[#C2FE06] transition-colors">
            Postulación
          </a>
        </nav>

        <p className="text-xs text-white/65">
          Procurement AI Academy · IA Labs Edición Enero
        </p>
      </div>
    </footer>
  );
}
