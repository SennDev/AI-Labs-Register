import { useState, type MouseEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface NavbarProps {
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

export function Navbar({ onNavigateToForm }: NavbarProps) {
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F0F6F6]/90 backdrop-blur-md border-b border-[#002733]/8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zona 1: Marca */}
        <a
          href="#inicio"
          className="flex items-center shrink-0 focus-visible:rounded-lg"
          aria-label="Inicio de Procurement Academy IA Labs"
        >
          {!logoError ? (
            <img
              src="./assets/VW_Procurement_Academy_Turquesa.png"
              alt="Volkswagen Procurement Academy"
              className="h-9 sm:h-10 w-auto object-contain"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="font-display text-lg font-bold tracking-tight text-[#008C82] whitespace-nowrap">
              Procurement Academy
            </span>
          )}
        </a>

        {/* Zona 2: Enlaces de navegación (máx 4, una sola línea) */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#002733]/80"
        >
          <a
            href="#inicio"
            className="hover:text-[#008C82] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#008C82]"
          >
            Convocatoria
          </a>
          <a
            href="#guia"
            className="hover:text-[#008C82] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#008C82]"
          >
            Cómo plantearlo
          </a>
          <a
            href="#registro"
            className="hover:text-[#008C82] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#008C82]"
          >
            Postulación
          </a>
        </nav>

        {/* Zona 3: Única acción primaria */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={(e) => {
              triggerRipple(e);
              onNavigateToForm();
            }}
            className="btn-lime inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            Postular reto
            <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
