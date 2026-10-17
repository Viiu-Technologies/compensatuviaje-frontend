import React, { useEffect, useId, useRef, useState } from 'react';
import { HiChevronDown, HiSearch } from 'react-icons/hi';
import { POPULAR_AIRPORTS, searchAirports, AirportOption } from '../services/publicApi';
import './AirportPicker.css';

/** Espera tras la última tecla antes de consultar al backend. */
const SEARCH_DEBOUNCE_MS = 250;

export interface AirportPickerProps {
  /** "Origen" o "Destino": encabeza la tarjeta y nombra el campo. */
  label: string;
  icon: React.ReactNode;
  value: AirportOption;
  /** El otro extremo de la ruta: no se ofrece para no repetir aeropuerto. */
  excludeCode?: string;
  onSelect: (airport: AirportOption) => void;
}

/**
 * Tarjeta de aeropuerto con buscador.
 *
 * Antes cada tarjeta escondía un <select> con 12 aeropuertos fijos. Ahora, al
 * abrirla, muestra esos mismos como sugerencias y, desde 2 letras, busca en
 * todos los aeropuertos del backend por código, ciudad o país.
 *
 * Sigue el patrón combobox de WAI-ARIA: flechas para moverse, Enter para
 * elegir y Escape para cerrar sin cambiar nada.
 */
export const AirportPicker: React.FC<AirportPickerProps> = ({ label, icon, value, excludeCode, onSelect }) => {
  const id = useId();
  const listId = `${id}-list`;
  const optionId = (code: string) => `${id}-opt-${code}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AirportOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isSearching = query.trim().length >= 2;
  const options = (isSearching ? results : POPULAR_AIRPORTS).filter((a) => a.code !== excludeCode);

  // Búsqueda en el backend, con debounce y cancelando la consulta anterior
  useEffect(() => {
    if (!isSearching) {
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const timeoutId = setTimeout(async () => {
      try {
        setResults(await searchAirports(query, controller.signal));
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setResults([]);
        setError(err?.message || 'No pudimos buscar aeropuertos. Inténtalo de nuevo.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, isSearching]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, results]);

  // Cerrar al hacer clic fuera de la tarjeta
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const openPicker = () => {
    setQuery('');
    setResults([]);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const choose = (airport: AirportOption) => {
    onSelect(airport);
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (options[activeIndex]) choose(options[activeIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  const activeOption = open ? options[activeIndex] : undefined;

  let status: string | null = null;
  if (loading) status = 'Buscando…';
  else if (error) status = error;
  else if (isSearching && options.length === 0) status = `No encontramos aeropuertos para "${query.trim()}".`;

  return (
    <div className={`qfc-airport-card ap-card ${open ? 'ap-card--open' : ''}`} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className="ap-trigger"
        onClick={() => (open ? close() : openPicker())}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${value.city} (${value.code}). Cambiar aeropuerto`}
      >
        <div className="qfc-card-top">
          <span className="qfc-card-tag">
            {icon}
            {label}
          </span>
          <HiChevronDown className="qfc-chevron" aria-hidden="true" />
        </div>
        <div className="qfc-airport-visual">
          <span className="qfc-airport-code">{value.code}</span>
          <div className="qfc-airport-meta">
            <span className="qfc-airport-city">{value.city}, {value.country}</span>
            <span className="qfc-airport-name">{value.name}</span>
          </div>
        </div>
      </button>

      {open && (
        <div className="ap-popover">
          <div className="ap-search">
            <HiSearch className="ap-search-icon" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              className="ap-input"
              role="combobox"
              aria-label={`Buscar aeropuerto de ${label.toLowerCase()}`}
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeOption ? optionId(activeOption.code) : undefined}
              placeholder="Ciudad, país o código"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {!isSearching && <p className="ap-hint">Destinos frecuentes</p>}

          <ul id={listId} role="listbox" className="ap-list" aria-label={`Aeropuertos de ${label.toLowerCase()}`}>
            {!loading && options.map((a, i) => (
              <li
                key={a.code}
                id={optionId(a.code)}
                role="option"
                aria-selected={i === activeIndex}
                className={`ap-option ${i === activeIndex ? 'ap-option--active' : ''}`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => choose(a)}
              >
                <span className="ap-option-code">{a.code}</span>
                <span className="ap-option-meta">
                  <span className="ap-option-city">{a.city}, {a.country}</span>
                  <span className="ap-option-name">{a.name}</span>
                </span>
              </li>
            ))}
          </ul>

          {status && (
            <p className={`ap-status ${error ? 'ap-status--error' : ''}`} role="status">
              {status}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AirportPicker;
