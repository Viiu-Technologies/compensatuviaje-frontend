import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { HiPlus, HiMinus, HiArrowRight } from 'react-icons/hi';
import { useGsapReveal } from '../hooks/useGsapReveal';
import './FAQ.css';

const FAQS_B2C = [
  {
    id: 1,
    q: '¿Cómo calculo mi huella de carbono?',
    a: 'Ingresa tu vuelo: origen, destino, clase de cabina y número de pasajeros. Obtienes el resultado al instante en kg de CO₂e, calculado con los factores oficiales DEFRA 2025.',
  },
  {
    id: 2,
    q: '¿Qué es la compensación de carbono?',
    a: 'Es invertir en proyectos verificados que reducen o capturan emisiones (reforestación, energías renovables, conservación) para equilibrar tu propio impacto.',
  },
  {
    id: 3,
    q: '¿Por qué importa compensar?',
    a: 'Porque reducir y compensar es la combinación más efectiva contra el cambio climático. Protege biodiversidad, mejora aire y agua, y financia transición energética.',
  },
  {
    id: 4,
    q: '¿Qué proyectos apoyan?',
    a: 'Reforestación nativa, energía solar y eólica, conservación de bosques y economía circular. Cada proyecto pasa por Veritas AI, nuestra certificación agéntica, y por una revisión humana antes de publicarse.',
  },
  {
    id: 5,
    q: '¿Mis datos están seguros?',
    a: 'Sí. Tus datos viajan cifrados (HTTPS) y los tratamos según la ley chilena de protección de datos personales. Solo los compartimos con quienes necesitamos para operar, como el procesador de pagos. El detalle está en nuestra Política de Privacidad.',
  },
  {
    id: 6,
    q: '¿Cuánto cuesta compensar un viaje?',
    a: 'Depende de tu vuelo y del proyecto que elijas: cada proyecto tiene su propio precio por tonelada. La calculadora te muestra el monto exacto antes de pagar.',
  },
  {
    id: 7,
    q: '¿Recibo un certificado?',
    a: 'Sí, un certificado digital con número único. Desde tu panel puedes registrarlo como NFT en blockchain pública (Polygon), y así cualquiera puede verificarlo. Las empresas reciben certificados corporativos con el detalle del impacto.',
  },
];

const FAQS_B2B = [
  {
    id: 101,
    q: '¿Cómo calculo la huella corporativa?',
    a: 'Nuestra plataforma B2B permite cargar datos masivos de vuelos de sus colaboradores para obtener un cálculo agregado según el GHG Protocol.',
  },
  {
    id: 102,
    q: '¿Qué tipo de certificados entregan a empresas?',
    a: 'Entregamos certificados corporativos emitidos por CompensaTuViaje, que respaldan tus aportes en reportes ESG y memorias de sostenibilidad. No corresponden a créditos de carbono de registros internacionales.',
  },
  {
    id: 103,
    q: '¿Podemos integrar la API a nuestro sistema de reservas?',
    a: 'Hoy la carga de viajes se hace subiendo los archivos de tu agencia (Excel o CSV). Si necesitas una integración directa con tu sistema de reservas, escríbenos y la evaluamos contigo.',
  },
  {
    id: 104,
    q: '¿Los proyectos tienen beneficios tributarios?',
    a: 'No ofrecemos beneficios tributarios directos. Los certificados sirven como respaldo de tus aportes en reportes de sostenibilidad; si un aporte tiene efectos tributarios depende de tu caso, así que conviene revisarlo con tu asesor.',
  },
];

const FAQS_PARTNER = [
  {
    id: 201,
    q: 'Tengo un proyecto de sostenibilidad, ¿cómo puedo ser parte?',
    a: 'Si posees o gestionas un proyecto de reforestación, conservación, energías renovables u otro impacto ESG, puedes postular enviándonos un correo con la ficha técnica. Evaluamos factibilidad y metodologías de certificación.',
  },
  {
    id: 202,
    q: '¿Qué tipo de verificación requieren los proyectos?',
    a: 'Cada proyecto pasa por Veritas AI, nuestro proceso de verificación: agentes de IA revisan la documentación (titularidad, permisos, evidencia de impacto y coherencia de las cifras) y luego una persona de nuestro equipo la valida antes de aprobar la publicación.',
  },
  {
    id: 203,
    q: '¿Cómo reciben aportes los proyectos?',
    a: 'Tu proyecto se publica en nuestra plataforma para personas y empresas. Cada compensación queda registrada con su certificado y te liquidamos lo recaudado según el acuerdo firmado. No emitimos ni vendemos créditos de carbono de registros internacionales.',
  },
  {
    id: 204,
    q: '¿Qué costo tiene para el desarrollador del proyecto?',
    a: 'No cobramos costos de incorporación ni cuotas anuales. Trabajamos bajo un modelo de comisión por volumen transado en la plataforma, alineando incentivos en beneficio de la restauración ecológica.',
  },
];

const FAQ = () => {
  const [activeTab, setActiveTab] = useState<'b2c' | 'b2b' | 'partner'>('b2c');
  const [openId, setOpenId] = useState<number | null>(1);
  const panelsRef = useRef<Map<number, HTMLDivElement>>(new Map());

  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    gsap.set(root.querySelectorAll('.ctv-reveal'), { autoAlpha: 1 });

    const tl = gsap.timeline({ 
      defaults: { ease: 'power3.out', duration: 0.8 },
      scrollTrigger: {
        trigger: root,
        start: 'top 75%',
        toggleActions: 'play none none none',
      }
    });

    tl.from('.faq-eyebrow', { y: 16, autoAlpha: 0, duration: 0.6 }, 0);
    tl.from('.faq-title .hero-line__inner', {
      yPercent: 110, stagger: 0.1, duration: 0.9,
    }, 0.1);
    tl.from('.faq-tabs', { y: 20, autoAlpha: 0, duration: 0.6 }, 0.25);
    // Animación de scroll-stagger: las preguntas suben desde abajo ordenándose en cascada
    tl.from('.faq-item', { 
      y: 55, 
      autoAlpha: 0, 
      stagger: 0.08, 
      duration: 0.7, 
      ease: 'power3.out',
      clearProps: 'transform,opacity'
    }, 0.35);
    tl.from('.faq-cta', { y: 20, autoAlpha: 0, duration: 0.6 }, 0.7);
  }, []);

  const currentFaqs = activeTab === 'b2c' ? FAQS_B2C : activeTab === 'b2b' ? FAQS_B2B : FAQS_PARTNER;

  useEffect(() => {
    if (currentFaqs.length > 0) {
      setOpenId(currentFaqs[0].id);
    }

    // Animación fluida de entrada al alternar entre pestañas
    if (scopeRef.current) {
      const items = scopeRef.current.querySelectorAll('.faq-item');
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { y: 35, autoAlpha: 0 },
          { 
            y: 0, 
            autoAlpha: 1, 
            stagger: 0.06, 
            duration: 0.5, 
            ease: 'power3.out',
            clearProps: 'transform,opacity' 
          }
        );
      }
    }
  }, [activeTab]);

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
    <section ref={scopeRef} className="faq-section" id="faq">
      <div className="faq-container">
        <header className="faq-header">
          <span className="faq-eyebrow ctv-reveal">
            <span className="faq-eyebrow__line" />
            Preguntas frecuentes
          </span>

          <h2 className="faq-title">
            <span className="hero-line"><span className="hero-line__inner">Lo que más preguntan,</span></span>
            <span className="hero-line"><span className="hero-line__inner">respondido.</span></span>
          </h2>
        </header>

        <div className="faq-tabs ctv-reveal">
          <button
            className={`faq-tab ${activeTab === 'b2c' ? 'faq-tab--active' : ''}`}
            onClick={() => setActiveTab('b2c')}
          >
            Viajeros
          </button>
          <button
            className={`faq-tab ${activeTab === 'b2b' ? 'faq-tab--active' : ''}`}
            onClick={() => setActiveTab('b2b')}
          >
            Empresas
          </button>
          <button
            className={`faq-tab ${activeTab === 'partner' ? 'faq-tab--active' : ''}`}
            onClick={() => setActiveTab('partner')}
          >
            Partners
          </button>
        </div>

        <ul className="faq-list">
          {currentFaqs.map((f) => {
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
          <Link to="/contacto" className="faq-cta__link">
            Contáctanos
            <HiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
