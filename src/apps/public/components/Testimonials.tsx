import { useState } from 'react';
import gsap from 'gsap';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import { useGsapReveal } from '../hooks/useGsapReveal';
import { ForestSVG } from './Illustrations';
import './Testimonials.css';

const TESTIMONIALS = [
  {
    id: 1,
    quote: 'Entendí mi huella de carbono por primera vez. Ahora compenso cada viaje sin pensarlo.',
    name: 'Laura Sánchez',
    role: 'Ecologista y viajera consciente',
    company: 'Fundación Verde Chile',
  },
  {
    id: 2,
    quote: 'La calculadora es directa, los resultados claros. Una herramienta imprescindible.',
    name: 'Carlos Mendoza',
    role: 'Defensor del medio ambiente',
    company: 'EcoAventura Chile',
  },
  {
    id: 3,
    quote: 'Aprendí cómo mis decisiones afectan al planeta. Lo recomiendo a quien viaje seguido.',
    name: 'Ana López',
    role: 'Bloguera de sostenibilidad',
    company: 'Viajes Conscientes',
  },
  {
    id: 4,
    quote: 'Lo implementamos para pasajeros frecuentes. El feedback ha sido excelente.',
    name: 'Diego Rojas',
    role: 'Director de Sostenibilidad',
    company: 'LATAM Airlines',
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
    tl.from('.ts-quote', { y: 20, autoAlpha: 0, duration: 0.8 }, 0.4);
    tl.from('.ts-author > *', { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.6);
    tl.from('.ts-nav', { y: 14, autoAlpha: 0, duration: 0.6 }, 0.75);
    tl.from('.ts-visual', { x: 24, autoAlpha: 0, duration: 0.85 }, 0.4);
  }, []);

  const animateSwap = (next: number) => {
    const root = scopeRef.current;
    if (!root) return;
    const quote = root.querySelector('.ts-quote');
    const author = root.querySelector('.ts-author');
    if (!quote || !author) {
      setIndex(next);
      return;
    }
    gsap.to([quote, author], {
      autoAlpha: 0,
      y: -10,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        setIndex(next);
        gsap.fromTo(
          [quote, author],
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08 },
        );
      },
    });
  };

  const prev = () => animateSwap((index - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => animateSwap((index + 1) % TESTIMONIALS.length);

  return (
    <section ref={scopeRef} className="ts-section">
      <div className="ts-container">
        <div className="ts-grid">
          <div className="ts-content">
            <header className="ts-header">
              <span className="ts-eyebrow ctv-reveal">
                <span className="ts-eyebrow__line" />
                Historias
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
                  {current.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                </div>
                <div className="ts-author__meta">
                  <p className="ts-author__name">{current.name}</p>
                  <p className="ts-author__role">{current.role}</p>
                  <p className="ts-author__company">{current.company}</p>
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

          <div className="ts-visual ctv-reveal">
            <div className="ts-svg-wrapper">
              <ForestSVG className="ts-tech-svg" style={{ width: '280px', height: '280px' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
