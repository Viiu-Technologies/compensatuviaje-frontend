import { lazy, Suspense, useState } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import { gsap, useGsapReveal, sectionTimeline } from '../hooks/useGsapReveal';
import LogoLoopComponent from './LogoLoop';
import { StepTripInputSVG, StepCalculationSVG, StepCompensationSVG } from './Illustrations';
import { BlobField } from './landing/EcoArt';
import './Features.css';

const CarbonCalculatorModal = lazy(() => import('../../b2c/components/CarbonCalculatorModal'));

const STEPS = [
  {
    num: '01',
    title: 'Ingresa tu viaje',
    body: 'Selecciona tu ruta, clase de cabina y pasajeros en tres clics, sin formularios largos ni registros previos.',
    Illustration: StepTripInputSVG,
  },
  {
    num: '02',
    title: 'Calcula con datos oficiales',
    body: 'Aplicamos factores oficiales del DEFRA 2024, GHG Protocol e ICAO. Cálculo transparente y 100% auditable.',
    Illustration: StepCalculationSVG,
  },
  {
    num: '03',
    title: 'Compensa con proyectos verificados',
    body: 'Apoya iniciativas certificadas bajo estándares Verra VCS o Gold Standard y recibe tu certificado digital inmutable.',
    Illustration: StepCompensationSVG,
  },
];

const Features = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    gsap.set('.ctv-reveal', { autoAlpha: 1 });

    const tl = sectionTimeline(root);
    tl.from('.ft-eyebrow', { y: 14, autoAlpha: 0, duration: 0.6 }, 0)
      .from('.ft-title .hero-line__inner', { yPercent: 110, stagger: 0.1, duration: 0.9 }, 0.1)
      .from('.ft-lede', { y: 16, autoAlpha: 0, duration: 0.7 }, 0.4)
      .from('.ft-step', { y: 36, autoAlpha: 0, stagger: 0.14, duration: 0.7 }, 0.45)
      .from('.ft-step__art > svg', {
        scale: 0.85,
        autoAlpha: 0,
        stagger: 0.14,
        duration: 0.7,
        ease: 'back.out(1.5)',
      }, 0.6);

    gsap.from('.ft-card', {
      y: 44,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.ft-card', start: 'top 84%', once: true },
    });

    // Micro-animación suave en las tarjetas
    gsap.to('.ft-step__art', {
      y: -5,
      duration: 3.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 0.45,
    });
  }, []);

  return (
    <section ref={scopeRef} className="ft-section" id="calculadora">
      <BlobField className="ft-section__bg" tone="rgba(7, 61, 61, 0.03)" />

      <div className="ft-container">
        {/* Eyebrow + título */}
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

        {/* Pasos 01 / 02 / 03: tarjetas con ilustraciones vectoriales claras */}
        <ol className="ft-steps" id="calculadora-content">
          {STEPS.map((step) => {
            const { Illustration } = step;
            return (
              <li key={step.num} className="ft-step">
                <div className="ft-step__art" aria-hidden="true">
                  <Illustration />
                </div>
                <span className="ft-step__num">{step.num}</span>
                <h3 className="ft-step__title">{step.title}</h3>
                <p className="ft-step__body">{step.body}</p>
              </li>
            );
          })}
        </ol>

        {/* Card resumen metodológico y garantías de pago */}
        <div className="ft-card">
          <BlobField className="ft-card__pattern" tone="rgba(255, 255, 255, 0.05)" />

          <div className="ft-card__copy">
            <span className="ft-card__pill">Metodología auditada</span>
            <h3 className="ft-card__name">Cálculo transparente y certificado</h3>
            <p className="ft-card__sub">
              Aplicamos los factores oficiales de emisión del DEFRA 2024 y estándares internacionales del GHG Protocol
              para asegurar que cada gramo de CO₂e sea exactamente atribuible y verificable.
            </p>

            <button
              className="ft-cta"
              onClick={() => document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Calcular mi ruta ahora
              <HiArrowRight aria-hidden="true" />
            </button>

            <p className="ft-card__fine">
              DEFRA 2024 · GHG Protocol · ICAO Carbon Calculator
            </p>
          </div>

          <div className="ft-card__aside">
            <span className="ft-card__aside-label">Garantía de seguridad y pagos</span>
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
