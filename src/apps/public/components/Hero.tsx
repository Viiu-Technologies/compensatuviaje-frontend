import gsap from 'gsap';
import { HiArrowRight } from 'react-icons/hi';
import { useGsapReveal } from '../hooks/useGsapReveal';
import './Hero.css';

const Hero = () => {
  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out', duration: 0.9 },
    });

    // Marca todo como listo (quita el opacity:0 inicial)
    gsap.set(root.querySelectorAll('.ctv-reveal'), { autoAlpha: 1 });

    // Mask reveal de las líneas del titular
    tl.from('.hero-display .hero-line__inner', {
      yPercent: 110,
      stagger: 0.12,
      duration: 1.0,
    }, 0);

    // Eyebrow y párrafo
    tl.from('.hero-eyebrow', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.1);
    tl.from('.hero-lede',    { y: 16, autoAlpha: 0, duration: 0.7 }, 0.55);

    // CTAs
    tl.from('.hero-actions > *', {
      y: 16,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.6,
    }, 0.75);

    // Stat card
    tl.from('.hero-stat', {
      y: 28,
      autoAlpha: 0,
      duration: 0.8,
    }, 0.5);

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

    // Línea horizontal (separador inferior) line-draw
    tl.from('.hero-rule', { scaleX: 0, transformOrigin: 'left center', duration: 1.0 }, 0.4);

    // Footer meta
    tl.from('.hero-meta > *', { y: 10, autoAlpha: 0, stagger: 0.1, duration: 0.5 }, 1.0);
  }, []);

  const scrollToCalculator = () => {
    document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={scopeRef} className="hero" id="inicio">
      {/* Grano sutil opcional */}
      <div className="hero__grain" aria-hidden="true" />

      <div className="hero__container">
        <div className="hero__grid">
          {/* ─────────── Columna principal ─────────── */}
          <div className="hero__main">
            <span className="hero-eyebrow ctv-reveal">
              <span className="hero-eyebrow__dot" />
              La sostenibilidad es posible
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
              certificados internacionalmente.
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

          {/* ─────────── Stat card minimal ─────────── */}
          <aside className="hero-stat ctv-reveal" aria-label="Toneladas compensadas">
            <span className="hero-stat__label">Toneladas de CO₂ ya neutralizadas</span>
            <div className="hero-stat__number-row">
              <span
                className="hero-stat__number"
                data-value="15420"
              >
                15,420
              </span>
              <span className="hero-stat__suffix">t</span>
            </div>
            <div className="hero-stat__live">
              <span className="hero-stat__pulse" />
              Datos verificados en tiempo real
            </div>
          </aside>
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
