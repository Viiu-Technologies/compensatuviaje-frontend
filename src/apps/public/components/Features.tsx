import { useLayoutEffect, type CSSProperties } from 'react';
import { gsap, useGsapReveal, sectionTimeline, reveal } from '../hooks/useGsapReveal';
import { stackCards } from '../hooks/motion';
import HowItWorksFigure, { type FigureKind } from './howItWorks/HowItWorksFigure';
import { BlobField } from './landing/EcoArt';
import './Features.css';

const STEPS: Array<{
  protocol: string;
  spec: string;
  title: string;
  body: string;
  figure: FigureKind;
  featured?: boolean;
}> = [
  {
    protocol: 'IATA · GEODESIA DE RUTA',
    spec: 'Distancia ortodrómica + cabina',
    title: 'Ingresa tu itinerario real',
    body: 'Selecciona origen, destino, cabina y pasajeros en tres clics. Trazamos el arco geodésico exacto entre aeropuertos sin formularios extensos.',
    figure: 'route',
  },
  {
    protocol: 'DEFRA 2025 · MOTOR GHG',
    spec: 'kg CO₂e / pasajero-km',
    title: 'Calcula con factores oficiales',
    body: 'Aplicamos los factores de conversión vigentes de DEFRA 2025 bajo el estándar GHG Protocol, desglosando tramo corto, medio o largo radio.',
    figure: 'funnel',
  },
  {
    protocol: 'VERITAS AI · POLYGON POS',
    spec: 'Auditoría agéntica + registro on-chain',
    title: 'Compensa en proyectos auditados y verifica tu certificado',
    body: 'Destina tu aporte a iniciativas validadas documentalmente por Veritas AI y obtén un certificado único verificable en la red pública Polygon.',
    figure: 'certificate',
    featured: true,
  },
];

/**
 * Cuándo los pasos se apilan como cartillas: pantallas anchas y con alto para
 * que una tarjeta entera quepa fija bajo el header. Debe coincidir con la media
 * query de "Cartillas apiladas" en Features.css. En móvil, pantallas bajas o
 * con prefers-reduced-motion queda la grilla normal.
 */
const STACK_QUERY = '(min-width: 900px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)';

const Features = () => {
  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    const tl = sectionTimeline(root);
    tl.add(reveal(root, '.ft-title'), 0.05)
      .add(reveal(root, '.ft-lede', 'text'), 0.15)
      .from('.ft-step', { y: 20, autoAlpha: 0, stagger: 0.06 }, 0.2);
  }, []);

  // La profundidad de la pila: cada paso se achica y se apaga cuando el
  // siguiente lo cubre.
  useLayoutEffect(() => {
    const root = scopeRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add(STACK_QUERY, () => {
      const list = root.querySelector('.ft-steps');
      if (!list) return;
      return stackCards([...list.querySelectorAll<HTMLElement>('.ft-step')], list);
    });
    return () => mm.revert();
  }, [scopeRef]);

  return (
    <section ref={scopeRef} className="ft-section" id="como-funciona">
      <BlobField className="ft-section__bg" tone="rgba(7, 61, 61, 0.03)" />

      <div className="ft-container">
        {/* Encabezado apilado (sin split-header ni exceso de eyebrows) */}
        <header className="ft-header">
          <h2 className="ft-title">
            <span className="hero-line"><span className="hero-line__inner">Del itinerario aéreo al registro</span></span>
            <span className="hero-line"><span className="hero-line__inner">climático verificable.</span></span>
          </h2>

          <p className="ft-lede ctv-reveal">
            Cada cálculo conecta tu vuelo con factores oficiales de emisión y proyectos auditados,
            mostrando en tiempo real la fórmula aplicada a tu ruta.
          </p>
        </header>

        {/* En escritorio, cartillas apiladas: cada paso queda fijo y el siguiente
            lo cubre. En móvil, bento de una columna. */}
        <ol className="ft-steps" id="como-funciona-content">
          {STEPS.map((step, i) => {
            return (
              <li
                key={step.protocol}
                className={`ft-step ${step.featured ? 'ft-step--featured' : ''}`}
                style={{ '--ft-i': i } as CSSProperties}
                data-spotlight
              >
                <div className="ft-step__art">
                  <HowItWorksFigure kind={step.figure} />
                </div>
                <div className="ft-step__content">
                  <span className="ft-step__index" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')} <span>/ {String(STEPS.length).padStart(2, '0')}</span>
                  </span>
                  <div className="ft-step__meta">
                    <span className="ft-step__protocol">{step.protocol}</span>
                    <span className="ft-step__spec">{step.spec}</span>
                  </div>
                  <h3 className="ft-step__title">{step.title}</h3>
                  <p className="ft-step__body">{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default Features;
