import { lazy, Suspense } from 'react';
import { HiArrowRight, HiCheck } from 'react-icons/hi';
import { gsap, useGsapReveal } from '../hooks/useGsapReveal';
import { BrandCloud, TechGrid } from './landing/EcoArt';
import './Hero.css';

// Lazy-load Three.js bundle para no bloquear el LCP
const HeroPlanet = lazy(() => import('./HeroPlanet'));

const Hero = () => {
  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    // Marca todo como listo (quita el opacity:0 inicial)
    gsap.set('.ctv-reveal', { autoAlpha: 1 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out', duration: 0.9 },
    });

    // Mask reveal de las líneas del titular
    tl.from('.hero-display .hero-line__inner', {
      yPercent: 110,
      stagger: 0.12,
      duration: 1.0,
    }, 0);

    tl.from('.hero-eyebrow', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.1);
    tl.from('.hero-lede', { y: 16, autoAlpha: 0, duration: 0.7 }, 0.55);

    tl.from('.hero-actions > *', {
      y: 16,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.6,
    }, 0.75);

    // Planeta + stat card
    tl.from('.hero__aside-wrapper', { y: 28, autoAlpha: 0, duration: 0.8 }, 0.5);

    // Chips flotantes: entran y luego levitan en loop suave
    tl.from('.hero-chip', {
      y: 18,
      autoAlpha: 0,
      scale: 0.9,
      stagger: 0.12,
      duration: 0.7,
      ease: 'back.out(1.6)',
    }, 1.0);

    gsap.to('.hero-chip--a', {
      y: -10, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.8,
    });
    gsap.to('.hero-chip--b', {
      y: -8, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.1,
    });

    // Counter up
    const target = root.querySelector<HTMLElement>('.hero-stat__number');
    if (target) {
      const end = Number(target.dataset.value ?? 0);
      const obj = { v: 0 };
      tl.to(obj, {
        v: end,
        duration: 1.6,
        ease: 'power2.out',
        snap: { v: 1 },
        onUpdate: () => {
          target.textContent = Math.round(obj.v).toLocaleString('es-CL');
        },
      }, 0.7);
    }

    tl.from('.hero-rule', { scaleX: 0, transformOrigin: 'left center', duration: 1.0 }, 0.4);
    tl.from('.hero-meta > *', { y: 10, autoAlpha: 0, stagger: 0.1, duration: 0.5 }, 1.0);

    // Profundidad: los glows y el planeta se desplazan a distinta velocidad
    // al hacer scroll (parallax con scrub, sin re-renders)
    gsap.to('.hero__glow--a', {
      yPercent: 24,
      ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6 },
    });
    gsap.to('.hero__aside-wrapper', {
      y: -48,
      ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.8 },
    });
  }, []);

  const scrollToCalculator = () => {
    document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={scopeRef} className="hero" id="inicio">
      {/* Fondo con profundidad: glows + nube de marca + grano */}
      <div className="hero__glow hero__glow--a" aria-hidden="true" />
      <div className="hero__glow hero__glow--b" aria-hidden="true" />
      <BrandCloud className="hero__cloud-bg" fill="rgba(7, 61, 61, 0.04)" />
      <TechGrid opacity={0.07} />
      <div className="hero__grain" aria-hidden="true" />

      <div className="hero__container">
        <div className="hero__grid">
          {/* ─────────── Columna principal ─────────── */}
          <div className="hero__main">
            <span className="hero-eyebrow ctv-reveal">
              <span className="hero-eyebrow__dot" />
              Tecnología climática · La sostenibilidad es posible
            </span>

            <h1 className="hero-display">
              <span className="hero-line"><span className="hero-line__inner">Compensa la huella</span></span>
              <span className="hero-line"><span className="hero-line__inner">de cada viaje,</span></span>
              <span className="hero-line hero-line--accent">
                <span className="hero-line__inner"><em>medible</em> y verificada.</span>
              </span>
            </h1>

            <p className="hero-lede ctv-reveal">
              Neutraliza el impacto ambiental de tus vuelos y operaciones con proyectos
              certificados internacionalmente, datos oficiales y trazabilidad blockchain.
            </p>

            <div className="hero-actions ctv-reveal">
              <button onClick={scrollToCalculator} className="hero-btn hero-btn--primary">
                Calcula tu huella
                <HiArrowRight aria-hidden="true" />
              </button>
              <button className="hero-btn hero-btn--ghost">
                Cómo funciona
              </button>
            </div>
          </div>

          {/* ─────────── Planeta 3D + stat card + chips ─────────── */}
          <div className="hero__aside-wrapper ctv-reveal">
            <Suspense fallback={null}>
              <HeroPlanet />
            </Suspense>

            <span className="hero-chip hero-chip--a">
              <span className="hero-chip__icon hero-chip__icon--leaf" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M6 20 C4 12 8 5 19 4 C20 14 15 19 8 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M6 20 C8 15 11 11 15 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              −2,4 t CO₂
            </span>

            <span className="hero-chip hero-chip--b">
              <span className="hero-chip__icon hero-chip__icon--check" aria-hidden="true">
                <HiCheck />
              </span>
              Verificado
            </span>

            <aside className="hero-stat" aria-label="Toneladas compensadas">
              <span className="hero-stat__label">Toneladas de CO₂ ya neutralizadas</span>
              <div className="hero-stat__number-row">
                <span className="hero-stat__number" data-value="15420">
                  15.420
                </span>
                <span className="hero-stat__suffix">t</span>
              </div>
              <div className="hero-stat__live">
                <span className="hero-stat__pulse" />
                Datos verificados en tiempo real
              </div>
            </aside>
          </div>
        </div>

        {/* Separador */}
        <div className="hero-rule" aria-hidden="true" />

        {/* Meta */}
        <div className="hero-meta">
          <div className="hero-meta__item">
            <span className="hero-meta__num">01</span>
            <span className="hero-meta__txt">DEFRA 2024 · GHG Protocol</span>
          </div>
          <div className="hero-meta__item">
            <span className="hero-meta__num">02</span>
            <span className="hero-meta__txt">Proyectos verificados</span>
          </div>
          <div className="hero-meta__item">
            <span className="hero-meta__num">03</span>
            <span className="hero-meta__txt">Certificado para empresas</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
