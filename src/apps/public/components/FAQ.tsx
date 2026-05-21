import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { HiPlus, HiMinus, HiArrowRight } from 'react-icons/hi';
import { useGsapReveal } from '../hooks/useGsapReveal';
import './FAQ.css';

const FAQS = [
  {
    id: 1,
    q: '¿Cómo calculo mi huella de carbono?',
    a: 'Selecciona el medio de transporte, la distancia y el número de pasajeros. Obtienes resultados instantáneos en kg de CO₂ con factores oficiales del DEFRA 2024.',
  },
  {
    id: 2,
    q: '¿Qué es la compensación de carbono?',
    a: 'Es invertir en proyectos verificados que reducen o capturan emisiones —reforestación, energías renovables, conservación— para equilibrar tu propio impacto.',
  },
  {
    id: 3,
    q: '¿Por qué importa compensar?',
    a: 'Porque reducir y compensar es la combinación más efectiva contra el cambio climático. Protege biodiversidad, mejora aire y agua, y financia transición energética.',
  },
  {
    id: 4,
    q: '¿Qué proyectos apoyan?',
    a: 'Reforestación nativa, energía solar y eólica, conservación de bosques y economía circular. Todos certificados por Gold Standard o VCS.',
  },
  {
    id: 5,
    q: '¿Mis datos están seguros?',
    a: 'Sí. Encriptación de extremo a extremo, GDPR y Ley de Protección de Datos Personales de Chile. No compartimos información con terceros.',
  },
  {
    id: 6,
    q: '¿Cuánto cuesta compensar un viaje?',
    a: 'Aproximadamente USD 25 por tonelada de CO₂. Un Santiago–Buenos Aires ida y vuelta ronda USD 12,5. Calcula tu costo exacto en la calculadora.',
  },
  {
    id: 7,
    q: '¿Recibo un certificado?',
    a: 'Sí, un certificado digital verificado con QR único y registro NFT en blockchain pública. Las empresas reciben certificados corporativos con detalle del impacto.',
  },
];

const FAQ = () => {
  const [openId, setOpenId] = useState<number | null>(1);
  const panelsRef = useRef<Map<number, HTMLDivElement>>(new Map());

  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    gsap.set(root.querySelectorAll('.ctv-reveal'), { autoAlpha: 1 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
    tl.from('.faq-eyebrow', { y: 12, autoAlpha: 0, duration: 0.6 }, 0);
    tl.from('.faq-title .hero-line__inner', {
      yPercent: 110, stagger: 0.1, duration: 0.9,
    }, 0.1);
    tl.from('.faq-item', { y: 14, autoAlpha: 0, stagger: 0.06, duration: 0.5 }, 0.4);
    tl.from('.faq-cta', { y: 14, autoAlpha: 0, duration: 0.6 }, 0.7);
  }, []);

  // Animar apertura/cierre del panel con GSAP
  useEffect(() => {
    panelsRef.current.forEach((panel, id) => {
      const isOpen = openId === id;
      gsap.to(panel, {
        height: isOpen ? 'auto' : 0,
        autoAlpha: isOpen ? 1 : 0,
        duration: 0.4,
        ease: 'power3.out',
      });
    });
  }, [openId]);

  const toggle = (id: number) => setOpenId((curr) => (curr === id ? null : id));

  return (
    <section ref={scopeRef} className="faq-section">
      <div className="faq-container">
        <header className="faq-header">
          <span className="faq-eyebrow ctv-reveal">
            <span className="faq-eyebrow__line" />
            Preguntas frecuentes
          </span>

          <h2 className="faq-title">
            <span className="hero-line"><span className="hero-line__inner">Lo que más</span></span>
            <span className="hero-line faq-title--accent">
              <span className="hero-line__inner"><em>preguntan</em>,</span>
            </span>
            <span className="hero-line"><span className="hero-line__inner">respondido.</span></span>
          </h2>
        </header>

        <ul className="faq-list">
          {FAQS.map((f) => {
            const isOpen = openId === f.id;
            return (
              <li key={f.id} className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
                <button
                  className="faq-item__head"
                  onClick={() => toggle(f.id)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-item__q">{f.q}</span>
                  <span className="faq-item__icon" aria-hidden="true">
                    {isOpen ? <HiMinus /> : <HiPlus />}
                  </span>
                </button>

                <div
                  className="faq-item__panel"
                  ref={(el) => {
                    if (el) panelsRef.current.set(f.id, el);
                    else panelsRef.current.delete(f.id);
                  }}
                  style={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, overflow: 'hidden' }}
                >
                  <p className="faq-item__a">{f.a}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="faq-cta">
          <p className="faq-cta__text">¿Te queda otra duda? Estamos a un mensaje.</p>
          <a href="#contacto" className="faq-cta__link">
            Contáctanos
            <HiArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
