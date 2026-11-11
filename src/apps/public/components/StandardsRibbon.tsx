import React, { useEffect, useRef } from 'react';
import { HiCheckCircle } from 'react-icons/hi';
import { gsap } from '../hooks/useGsapReveal';
import './StandardsRibbon.css';

interface StandardItem {
  name: string;
  category: string;
  scope: string;
  code: string;
}

const STANDARDS: StandardItem[] = [
  {
    name: 'DEFRA 2025',
    category: 'Factores de Emisión',
    scope: 'UK Gov Greenhouse Gas Reporting',
    code: 'DEFRA-25',
  },
  {
    name: 'GHG Protocol',
    category: 'Estándar Global',
    scope: 'Corporate Scope 3 (Cat. 6)',
    code: 'GHG-SCOPE3',
  },
  {
    name: 'Veritas AI',
    category: 'Verificación de Proyectos',
    scope: 'Agentes de IA + revisión humana',
    code: 'CTV-VERITAS',
  },
  {
    name: 'Polygon PoS',
    category: 'Trazabilidad Inmutable',
    scope: 'Auditoría Criptográfica Descentralizada',
    code: 'CHAIN-AUDIT',
  },
];

/** Cuántas veces más rápido puede ir la cinta con un scroll fuerte. */
const MAX_BOOST = 4;

export const StandardsRibbon: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  // La cinta corre con una animación CSS; aquí solo se le cambia la velocidad:
  // se acelera según la rapidez del scroll y vuelve sola a su paso normal. Con
  // prefers-reduced-motion no hay animación y esto no hace nada.
  useEffect(() => {
    const section = sectionRef.current;
    const track = section?.querySelector('.st-ribbon-track');
    if (!section || !track) return;
    // La animación se busca al usarla: al montar todavía puede no existir.
    let marquee: Animation | undefined;
    const speed = { rate: 1 };
    const apply = () => {
      marquee ??= track.getAnimations()[0];
      if (marquee) marquee.playbackRate = speed.rate;
    };
    // La rapidez se mide del scroll mismo y solo con la cinta a la vista. No
    // usa ScrollTrigger: la cinta va justo después del hero fijado y se monta
    // antes de que él reserve su tramo, así que un disparador creado aquí
    // quedaba con la posición de la página sin ese tramo y nunca se activaba.
    let lastY = window.scrollY;
    let lastT = performance.now();
    const onScroll = () => {
      const now = performance.now();
      const elapsed = now - lastT;
      const moved = Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      lastT = now;
      if (elapsed <= 0 || elapsed > 200) return;
      // px por segundo; 500 px/s ya duplica la velocidad.
      const boost = Math.min(MAX_BOOST, (moved / elapsed) * 1000 / 500);
      if (1 + boost > speed.rate) {
        speed.rate = 1 + boost;
        apply();
      }
      gsap.to(speed, { rate: 1, duration: 1.2, ease: 'power2.out', overwrite: true, onUpdate: apply });
    };
    const inView = new IntersectionObserver(([entry]) => {
      window.removeEventListener('scroll', onScroll);
      if (!entry.isIntersecting) return;
      lastY = window.scrollY;
      lastT = performance.now();
      window.addEventListener('scroll', onScroll, { passive: true });
    });
    inView.observe(section);
    return () => {
      inView.disconnect();
      window.removeEventListener('scroll', onScroll);
      gsap.killTweensOf(speed);
      if (marquee) marquee.playbackRate = 1;
    };
  }, []);

  return (
    <section ref={sectionRef} className="st-ribbon-section" aria-label="Estándares y metodologías de cálculo">
      <div className="st-ribbon-container">
        <div className="st-ribbon-intro">
          <p className="st-ribbon-text">
            Protocolos y metodologías activas para cálculo de emisiones y auditoría climática:
          </p>
          <span className="st-ribbon-spec">ESPECIFICACIÓN TÉCNICA · 2025/2026</span>
        </div>

        <div className="st-ribbon-track-wrapper">
          <div className="st-ribbon-track" aria-hidden="true">
            {[...STANDARDS, ...STANDARDS].map((item, idx) => (
              <div key={`${item.name}-${idx}`} className="st-item">
                <div className="st-item-header">
                  <span className="st-item-name">{item.name}</span>
                  <span className="st-item-code">
                    <HiCheckCircle className="st-item-check" aria-hidden="true" />
                    {item.code}
                  </span>
                </div>
                <div className="st-item-category">{item.category}</div>
                <div className="st-item-scope">{item.scope}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StandardsRibbon;
