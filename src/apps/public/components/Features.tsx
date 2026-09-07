import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiExternalLink } from 'react-icons/hi';
import { FaLeaf } from 'react-icons/fa';
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

const OFFICIAL_STANDARDS = [
  {
    label: 'DEFRA 2024 / 2025',
    url: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting',
    tooltip: 'Factores oficiales de conversión de emisiones del Reino Unido',
  },
  {
    label: 'GHG Protocol Scope 3',
    url: 'https://ghgprotocol.org/',
    tooltip: 'Estándar global de contabilidad de carbono para empresas y viajes',
  },
  {
    label: 'ICAO Carbon Calculator',
    url: 'https://www.icao.int/environmental-protection/CarbonOffset/Pages/default.aspx',
    tooltip: 'Metodología de la Organización de Aviación Civil Internacional',
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
      y: -6,
      duration: 3.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 0.45,
    });

    // Animación continua de balanceo de hojas en la caja de metodología
    gsap.to('.ft-floating-leaf--1', {
      y: -12,
      rotation: 15,
      duration: 3.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
    gsap.to('.ft-floating-leaf--2', {
      y: 10,
      rotation: -18,
      duration: 4.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 0.5,
    });
    gsap.to('.ft-floating-leaf--3', {
      y: -8,
      rotation: 12,
      duration: 3.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 1.2,
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

        {/* Pasos 01 / 02 / 03: tarjetas con ilustraciones vectoriales grandes (1/3 del card) */}
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

        {/* Card resumen metodológico y garantías de pago con animaciones de hojas */}
        <div className="ft-card">
          <BlobField className="ft-card__pattern" tone="rgba(255, 255, 255, 0.05)" />

          {/* Hojas animadas flotantes de fondo */}
          <div className="ft-floating-leaf ft-floating-leaf--1" aria-hidden="true">
            <FaLeaf />
          </div>
          <div className="ft-floating-leaf ft-floating-leaf--2" aria-hidden="true">
            <FaLeaf />
          </div>
          <div className="ft-floating-leaf ft-floating-leaf--3" aria-hidden="true">
            <FaLeaf />
          </div>

          <div className="ft-card__copy">
            <div className="ft-card__pill-group">
              <span className="ft-card__pill">
                <FaLeaf className="ft-leaf-inline" /> Metodología auditada
              </span>
            </div>

            <h3 className="ft-card__name">Cálculo transparente y certificado</h3>
            <p className="ft-card__sub">
              Aplicamos los factores oficiales de emisión del DEFRA 2024 y estándares internacionales del GHG Protocol
              para asegurar que cada gramo de CO₂e sea exactamente atribuible y verificable.
            </p>

            {/* Enlaces oficiales verificables a DEFRA, GHG Protocol e ICAO */}
            <div className="ft-standards-links">
              <span className="ft-standards-label">Fuentes oficiales validadas:</span>
              <div className="ft-standards-badges">
                {OFFICIAL_STANDARDS.map((std) => (
                  <a
                    key={std.label}
                    href={std.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ft-standard-badge"
                    title={std.tooltip}
                  >
                    <span>{std.label}</span>
                    <HiExternalLink aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            <div className="ft-card__actions">
              <Link to="/calculadora" className="ft-cta">
                Abrir calculadora completa
                <HiArrowRight aria-hidden="true" />
              </Link>
            </div>
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
