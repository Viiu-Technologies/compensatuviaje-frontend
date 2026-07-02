import { lazy, Suspense, useState } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import { gsap, useGsapReveal, sectionTimeline } from '../hooks/useGsapReveal';
import LogoLoopComponent from './LogoLoop';
import { CO2EmissionSVG, MetricsSVG, CircuitLeafSVG } from './Illustrations';
import { BlobField } from './landing/EcoArt';
import './Features.css';

const CarbonCalculatorModal = lazy(() => import('../../b2c/components/CarbonCalculatorModal'));

const STEPS = [
  {
    num: '01',
    title: 'Ingresa tu viaje',
    body: 'Selecciona el medio de transporte, la ruta y los pasajeros. Tres campos, sin formularios largos.',
    Illustration: CO2EmissionSVG,
  },
  {
    num: '02',
    title: 'Calcula con datos oficiales',
    body: 'Aplicamos factores de emisión DEFRA 2024, GHG Protocol e ICAO. Cálculo auditable.',
    Illustration: MetricsSVG,
  },
  {
    num: '03',
    title: 'Compensa con proyectos verificados',
    body: 'Apoya iniciativas certificadas internacionalmente y recibe tu certificado digital.',
    Illustration: CircuitLeafSVG,
  },
];

const Features = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    gsap.set('.ctv-reveal', { autoAlpha: 1 });

    // Reveal disparado al entrar la sección al viewport (una sola vez)
    const tl = sectionTimeline(root);
    tl.from('.ft-eyebrow', { y: 14, autoAlpha: 0, duration: 0.6 }, 0)
      .from('.ft-title .hero-line__inner', { yPercent: 110, stagger: 0.1, duration: 0.9 }, 0.1)
      .from('.ft-lede', { y: 16, autoAlpha: 0, duration: 0.7 }, 0.4)
      .from('.ft-step', { y: 36, autoAlpha: 0, stagger: 0.14, duration: 0.7 }, 0.45)
      .from('.ft-step__art > svg', {
        scale: 0.72,
        autoAlpha: 0,
        stagger: 0.14,
        duration: 0.7,
        ease: 'back.out(1.7)',
      }, 0.6);

    // La tarjeta calculadora vive más abajo: trigger propio
    gsap.from('.ft-card', {
      y: 44,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.ft-card', start: 'top 84%', once: true },
    });

    // Micro-vida en las ilustraciones (loops sutiles, sin re-renders)
    gsap.to('.ft-step__art', {
      y: -7,
      duration: 3.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 0.45,
    });
    gsap.to('.molecule-co2', {
      y: -6,
      duration: 2.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      transformOrigin: '50% 50%',
    });
    gsap.to('.leaf-capture', {
      rotation: 3,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      transformOrigin: '50% 100%',
    });
  }, []);

  return (
    <section ref={scopeRef} className="ft-section" id="calculadora">
      {/* Patrón de blobs de marca, muy sutil */}
      <BlobField className="ft-section__bg" tone="rgba(7, 61, 61, 0.03)" />

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

        {/* ── Pasos 01 / 02 / 03 — tarjetas con arte CO₂ ── */}
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

        {/* ── Card calculadora — panel teal de marca ── */}
        <div className="ft-card">
          <BlobField className="ft-card__pattern" tone="rgba(255, 255, 255, 0.05)" />

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
