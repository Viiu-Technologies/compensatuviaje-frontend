import { lazy, Suspense, useState } from 'react';
import gsap from 'gsap';
import { HiArrowRight } from 'react-icons/hi';
import { useGsapReveal } from '../hooks/useGsapReveal';
import LogoLoopComponent from './LogoLoop';
import './Features.css';

const CarbonCalculatorModal = lazy(() => import('../../b2c/components/CarbonCalculatorModal'));

const STEPS = [
  {
    num: '01',
    title: 'Ingresa tu viaje',
    body: 'Selecciona el medio de transporte, la ruta y los pasajeros. Tres campos, sin formularios largos.',
  },
  {
    num: '02',
    title: 'Calcula con datos oficiales',
    body: 'Aplicamos factores de emisión DEFRA 2024, GHG Protocol e ICAO. Cálculo auditable.',
  },
  {
    num: '03',
    title: 'Compensa con proyectos verificados',
    body: 'Apoya iniciativas certificadas internacionalmente y recibe tu certificado digital.',
  },
];

const Features = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    gsap.set(root.querySelectorAll('.ctv-reveal'), { autoAlpha: 1 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out', duration: 0.8 },
      scrollTrigger: undefined,
    });

    // Reveal header
    tl.from('.ft-eyebrow', { y: 14, autoAlpha: 0, duration: 0.6 }, 0);
    tl.from('.ft-title .hero-line__inner', {
      yPercent: 110,
      stagger: 0.1,
      duration: 0.9,
    }, 0.1);
    tl.from('.ft-lede', { y: 16, autoAlpha: 0, duration: 0.7 }, 0.4);

    // Steps stagger
    tl.from('.ft-step', { y: 24, autoAlpha: 0, stagger: 0.12, duration: 0.7 }, 0.5);

    // Card
    tl.from('.ft-card', { y: 30, autoAlpha: 0, duration: 0.9 }, 0.7);
  }, []);

  return (
    <section ref={scopeRef} className="ft-section" id="calculadora">
      <div className="ft-container">
        {/* ── Eyebrow + título ── */}
        <header className="ft-header">
          <span className="ft-eyebrow ctv-reveal">
            <span className="ft-eyebrow__line" />
            Cómo funciona
          </span>

          <h2 className="ft-title">
            <span className="hero-line"><span className="hero-line__inner">La forma más</span></span>
            <span className="hero-line ft-title--accent">
              <span className="hero-line__inner"><em>transparente</em> de compensar</span>
            </span>
            <span className="hero-line"><span className="hero-line__inner">tu impacto.</span></span>
          </h2>

          <p className="ft-lede ctv-reveal">
            Tres pasos. Cero opacidad. Datos oficiales del DEFRA, metodología certificada
            y proyectos verificados internacionalmente.
          </p>
        </header>

        {/* ── Pasos 01 / 02 / 03 ── */}
        <ol className="ft-steps" id="calculadora-content">
          {STEPS.map((step) => (
            <li key={step.num} className="ft-step">
              <span className="ft-step__num">{step.num}</span>
              <h3 className="ft-step__title">{step.title}</h3>
              <p className="ft-step__body">{step.body}</p>
            </li>
          ))}
        </ol>

        {/* ── Card calculadora ── */}
        <div className="ft-card">
          <div className="ft-card__copy">
            <span className="ft-card__pill">1 cálculo gratuito</span>
            <h3 className="ft-card__name">Calculadora de carbono</h3>
            <p className="ft-card__sub">
              Cálculos precisos con factores de emisión oficiales del DEFRA 2024 y
              metodologías certificadas internacionalmente.
            </p>

            <button className="ft-cta" onClick={() => setIsModalOpen(true)}>
              Calcular mi huella
              <HiArrowRight aria-hidden="true" />
            </button>

            <p className="ft-card__fine">
              DEFRA 2024 · GHG Protocol · ICAO Carbon Calculator
            </p>
          </div>

          <div className="ft-card__aside">
            <span className="ft-card__aside-label">Confiado por</span>
            <LogoLoopComponent />
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Suspense fallback={null}>
          <CarbonCalculatorModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </Suspense>
      )}
    </section>
  );
};

export default Features;
