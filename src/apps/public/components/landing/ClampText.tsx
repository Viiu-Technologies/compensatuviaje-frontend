import React, { useEffect, useId, useRef, useState } from 'react';
import './ClampText.css';

/**
 * Párrafo que en móvil se corta a unas pocas líneas y ofrece "Ver más".
 *
 * En escritorio es un <p> normal: el corte y el botón solo existen bajo 768 px
 * (ClampText.css). El botón aparece únicamente si el texto de verdad no cabe
 * en las líneas pedidas, así que un párrafo corto queda igual que antes.
 *
 * El botón va después del párrafo, como hermano, y no dentro: así el <p>
 * conserva su clase y las animaciones de entrada que lo buscan por ella.
 */

type Props = {
  className?: string;
  /** Líneas visibles en móvil antes de cortar. */
  lines?: number;
  children: React.ReactNode;
};

const MOBILE_QUERY = '(max-width: 767.98px)';

const ClampText: React.FC<Props> = ({ className = '', lines = 3, children }) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const openRef = useRef(false);
  const id = useId();
  const [open, setOpen] = useState(false);
  const [needed, setNeeded] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const mq = window.matchMedia(MOBILE_QUERY);
    const measure = () => {
      if (!mq.matches) return setNeeded(false);
      // Abierto no hay nada que medir: el texto ya se ve entero.
      if (openRef.current) return;
      setNeeded(el.scrollHeight > el.clientHeight + 2);
    };
    measure();
    // El ancho cambia (rotar el teléfono) y las fuentes llegan después del
    // primer pintado: en ambos casos cambia cuántas líneas ocupa el texto.
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    mq.addEventListener('change', measure);
    return () => {
      observer.disconnect();
      mq.removeEventListener('change', measure);
    };
  }, []);

  const toggle = () => {
    openRef.current = !open;
    setOpen(!open);
  };

  return (
    <>
      <p
        ref={textRef}
        id={id}
        className={`ctv-clamp ${className}`.trim()}
        data-open={open}
        style={{ '--ctv-clamp-lines': lines } as React.CSSProperties}
      >
        {children}
      </p>
      <button
        type="button"
        className="ctv-clamp-btn"
        data-needed={needed}
        aria-expanded={open}
        aria-controls={id}
        onClick={toggle}
      >
        {open ? 'Ver menos' : 'Ver más'}
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d={open ? 'M3.5 10L8 5.5l4.5 4.5' : 'M3.5 6L8 10.5 12.5 6'} />
        </svg>
      </button>
    </>
  );
};

export default ClampText;
