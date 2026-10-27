import { useGsapReveal, sectionTimeline, reveal } from '../hooks/useGsapReveal';
import HowItWorksFigure, { type FigureKind } from './howItWorks/HowItWorksFigure';
import { BlobField } from './landing/EcoArt';
import './Features.css';

const STEPS: Array<{ num: string; title: string; body: string; figure: FigureKind }> = [
  {
    num: '01',
    title: 'Ingresa tu viaje',
    body: 'Selecciona tu ruta, clase de cabina y pasajeros en tres clics, sin formularios largos ni registros previos.',
    figure: 'route',
  },
  {
    num: '02',
    title: 'Calcula con datos oficiales',
    body: 'Aplicamos los factores oficiales de DEFRA 2025 según el GHG Protocol. Cálculo transparente y trazable.',
    figure: 'funnel',
  },
  {
    num: '03',
    title: 'Compensa con proyectos verificados',
    body: 'Elige un proyecto evaluado por Veritas AI y recibe un certificado digital, que puedes registrar en blockchain.',
    figure: 'certificate',
  },
];

const Features = () => {
  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    const tl = sectionTimeline(root);
    tl.from('.ft-eyebrow', { y: 10, autoAlpha: 0 }, 0)
      .add(reveal(root, '.ft-title'), 0.05)
      .add(reveal(root, '.ft-lede', 'text'), 0.15)
      .from('.ft-step', { y: 20, autoAlpha: 0, stagger: 0.06 }, 0.2);
  }, []);

  return (
    <section ref={scopeRef} className="ft-section" id="como-funciona">
      <BlobField className="ft-section__bg" tone="rgba(7, 61, 61, 0.03)" />

      <div className="ft-container">
        {/* Eyebrow + título */}
        <header className="ft-header">
          <span className="ft-eyebrow ctv-reveal">
            <span className="ft-eyebrow__line" />
            Cómo funciona
          </span>

          <h2 className="ft-title">
            <span className="hero-line"><span className="hero-line__inner">La forma más transparente</span></span>
            <span className="hero-line"><span className="hero-line__inner">de compensar tu impacto.</span></span>
          </h2>

          <p className="ft-lede ctv-reveal">
            Tres pasos, sin letra chica: ingresas tu vuelo, lo calculamos con factores oficiales
            y eliges el proyecto que quieres apoyar.
          </p>
        </header>

        {/* Pasos 01 / 02 / 03: tarjetas con ilustraciones vectoriales grandes (1/3 del card) */}
        <ol className="ft-steps" id="como-funciona-content">
          {STEPS.map((step) => {
            return (
              <li key={step.num} className="ft-step">
                <div className="ft-step__art">
                  <HowItWorksFigure kind={step.figure} />
                </div>
                <span className="ft-step__num">{step.num}</span>
                <h3 className="ft-step__title">{step.title}</h3>
                <p className="ft-step__body">{step.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default Features;
