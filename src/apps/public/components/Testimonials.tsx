import { useState } from 'react';
import gsap from 'gsap';
import { 
  HiArrowLeft, 
  HiArrowRight, 
  HiOutlineShieldCheck, 
  HiSparkles,
  HiLocationMarker 
} from 'react-icons/hi';
import { FaTree } from 'react-icons/fa';
import { useGsapReveal } from '../hooks/useGsapReveal';
import './Testimonials.css';

const PARTNERS = [
  'LATAM Airlines',
  'Sky Airline',
  'Copec Verde',
  'Banco de Chile',
  'Fundación Verde',
  'EcoAventura Chile',
];

const TESTIMONIALS = [
  {
    id: 1,
    quote: 'Entendí mi huella de carbono por primera vez. Ahora compenso cada viaje sin pensarlo y sé exactamente qué hectárea de bosque nativo se está protegiendo.',
    name: 'Laura Sánchez',
    role: 'Ecologista y viajera consciente',
    company: 'Fundación Verde Chile',
    image: '/images/testimonials/laura.jpg',
    impact: '2.8 tCO₂e compensadas',
    project: 'Bosque Nativo Valdiviano',
    location: 'Puerto Varas, Chile',
  },
  {
    id: 2,
    quote: 'La calculadora es directa, los resultados claros. Una herramienta imprescindible para recorrer las rutas de Chile cuidando nuestro patrimonio natural.',
    name: 'Carlos Mendoza',
    role: 'Defensor del medio ambiente',
    company: 'EcoAventura Chile',
    image: '/images/testimonials/carlos.jpg',
    impact: '4.2 tCO₂e compensadas',
    project: 'Conservación Cordillera Sur',
    location: 'Aysén, Chile',
  },
  {
    id: 3,
    quote: 'Aprendí cómo mis decisiones de viaje afectan al planeta. El certificado con QR y registro inmutable le da una confianza total a mi comunidad.',
    name: 'Ana López',
    role: 'Bloguera de sostenibilidad',
    company: 'Viajes Conscientes',
    image: '/images/testimonials/ana.jpg',
    impact: '1.9 tCO₂e compensadas',
    project: 'Reforestación Maule Costero',
    location: 'Santiago, Chile',
  },
  {
    id: 4,
    quote: 'Lo implementamos para los viajes corporativos de nuestro equipo ejecutivo. El feedback de los colaboradores y la auditoría de reportes ESG ha sido impecable.',
    name: 'Diego Rojas',
    role: 'Director de Sostenibilidad',
    company: 'LATAM Corporate',
    image: '/images/testimonials/diego.jpg',
    impact: '18.5 tCO₂e compensadas',
    project: 'Parque Solar Atacama',
    location: 'Santiago, Chile',
  },
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);
  const current = TESTIMONIALS[index];

  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    gsap.set(root.querySelectorAll('.ctv-reveal'), { autoAlpha: 1 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out', duration: 0.8 },
      scrollTrigger: {
        trigger: root,
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });
    tl.from('.ts-eyebrow', { y: 12, autoAlpha: 0, duration: 0.6 }, 0);
    tl.from('.ts-title .hero-line__inner', {
      yPercent: 110,
      stagger: 0.1,
      duration: 0.9,
    }, 0.1);
    tl.from('.ts-ticker', { y: 14, autoAlpha: 0, duration: 0.6 }, 0.35);
    tl.from('.ts-quote', { y: 20, autoAlpha: 0, duration: 0.8 }, 0.45);
    tl.from('.ts-author > *', { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.6);
    tl.from('.ts-nav', { y: 14, autoAlpha: 0, duration: 0.6 }, 0.75);
    tl.from('.ts-visual', { x: 24, autoAlpha: 0, duration: 0.85 }, 0.4);
  }, []);

  const animateSwap = (next: number) => {
    const root = scopeRef.current;
    if (!root) return;
    const quote = root.querySelector('.ts-quote');
    const author = root.querySelector('.ts-author');
    const photo = root.querySelector('.ts-photo-card');

    if (!quote || !author) {
      setIndex(next);
      return;
    }

    gsap.to([quote, author, photo], {
      autoAlpha: 0,
      y: -8,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        setIndex(next);
        gsap.fromTo(
          [quote, author, photo],
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06 },
        );
      },
    });
  };

  const prev = () => animateSwap((index - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => animateSwap((index + 1) % TESTIMONIALS.length);

  return (
    <section ref={scopeRef} className="ts-section">
      <div className="ts-container">
        {/* Ticker Infinito de Organizaciones Aliadas */}
        <div className="ts-ticker ctv-reveal" aria-label="Organizaciones que confían en nosotros">
          <span className="ts-ticker__label">Organizaciones que confían:</span>
          <div className="ts-ticker__track-wrap">
            <div className="ts-ticker__track">
              {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, i) => (
                <span key={`${partner}-${i}`} className="ts-ticker__item">
                  <HiOutlineShieldCheck aria-hidden="true" />
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="ts-grid">
          <div className="ts-content">
            <header className="ts-header">
              <span className="ts-eyebrow ctv-reveal">
                <span className="ts-eyebrow__line" />
                Historias de Impacto
              </span>

              <h2 className="ts-title">
                <span className="hero-line"><span className="hero-line__inner">Voces que ya</span></span>
                <span className="hero-line ts-title--accent">
                  <span className="hero-line__inner"><em>compensan</em></span>
                </span>
                <span className="hero-line"><span className="hero-line__inner">su impacto.</span></span>
              </h2>
            </header>

            <article className="ts-quote-wrap" aria-live="polite">
              <blockquote className="ts-quote">
                <span className="ts-quote__mark" aria-hidden="true">“</span>
                {current.quote}
              </blockquote>

              <footer className="ts-author">
                <div className="ts-author__avatar" aria-hidden="true">
                  <img
                    src={current.image}
                    alt={current.name}
                    className="ts-author__avatar-img"
                  />
                </div>
                <div className="ts-author__meta">
                  <p className="ts-author__name">{current.name}</p>
                  <p className="ts-author__role">{current.role}</p>
                  <span className="ts-author__company-pill">{current.company}</span>
                </div>
              </footer>
            </article>

            <div className="ts-nav">
              <div className="ts-nav__counter">
                <span className="ts-nav__index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="ts-nav__sep">/</span>
                <span className="ts-nav__total">
                  {String(TESTIMONIALS.length).padStart(2, '0')}
                </span>
              </div>

              <div className="ts-nav__btns">
                <button onClick={prev} className="ts-nav__btn" aria-label="Anterior">
                  <HiArrowLeft />
                </button>
                <button onClick={next} className="ts-nav__btn" aria-label="Siguiente">
                  <HiArrowRight />
                </button>
              </div>
            </div>
          </div>

          {/* Fotografía de personas reales con tarjetas de impacto editorial */}
          <div className="ts-visual ctv-reveal">
            <div className="ts-photo-card">
              <div className="ts-photo-wrapper">
                <img
                  src={current.image}
                  alt={current.name}
                  className="ts-photo-img"
                />
                <div className="ts-photo-overlay" />
              </div>

              {/* Badges de impacto sobre la foto */}
              <div className="ts-photo-badges">
                <div className="ts-photo-badge ts-photo-badge--impact">
                  <HiSparkles />
                  <span>{current.impact}</span>
                </div>
                <div className="ts-photo-badge ts-photo-badge--project">
                  <FaTree />
                  <span>{current.project}</span>
                </div>
                <div className="ts-photo-badge ts-photo-badge--location">
                  <HiLocationMarker />
                  <span>{current.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
