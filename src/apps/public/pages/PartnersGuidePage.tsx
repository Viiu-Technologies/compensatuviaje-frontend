import { Link } from 'react-router-dom';
import {
  HiArrowRight,
  HiOutlineMail,
  HiCheckCircle,
  HiCheck,
  HiShieldCheck,
  HiOutlineKey,
  HiOutlineOfficeBuilding,
  HiOutlineGlobeAlt,
  HiBadgeCheck,
  HiSparkles,
  HiExternalLink,
} from 'react-icons/hi';
import { FaSun, FaTree, FaSeedling } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { gsap, useGsapReveal, sectionTimeline } from '../hooks/useGsapReveal';
import { BlobField, CertificateArt } from '../components/landing/EcoArt';
import {
  HeroPartnersNetworkArt,
  Step1InvitationArt,
  Step2SecurityArt,
  Step3OnboardingArt,
  Step4KybVerificationArt,
  Step5EsgProjectsArt,
  Step6EsgCertificationArt,
} from './PartnersGuideArt';
import './PartnersGuidePage.css';

type Step = {
  num: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  Icon: React.ComponentType<{ className?: string }>;
  Art: React.ComponentType<{ className?: string }>;
  badge?: { label: string; tone: 'pending' | 'ai' | 'approved' | 'rejected' };
};

const STEPS: Step[] = [
  {
    num: '01',
    eyebrow: 'Invitación oficial',
    title: 'Recibes tu acceso por correo corporativo',
    body:
      'CompensaTuViaje es una red de aliados por invitación. Nuestro equipo crea tu cuenta y te envía credenciales temporales al correo de contacto oficial de tu organización.',
    bullets: ['Cuenta creada por el equipo CompensaTuViaje', 'Un solo usuario administrador por aliado', 'Acceso seguro al portal de partners'],
    Icon: HiOutlineMail,
    Art: Step1InvitationArt,
  },
  {
    num: '02',
    eyebrow: 'Seguridad y autenticación',
    title: 'Estableces tu contraseña definitiva',
    body:
      'En tu primer ingreso te pedimos reemplazar la contraseña temporal por una definitiva con altos estándares de seguridad criptográfica.',
    bullets: ['Obligatorio antes de continuar', 'Mínimo 8 caracteres, mayúscula y números', 'Sesión cifrada con JWT'],
    Icon: HiOutlineKey,
    Art: Step2SecurityArt,
  },
  {
    num: '03',
    eyebrow: 'Onboarding organizacional',
    title: 'Completas el perfil de tu organización',
    body:
      'Dos pasos rápidos: subes el logo y datos legales de tu organización, y luego registras los datos bancarios protegidos donde recibirás el pago por tus compensaciones.',
    bullets: ['Logo corporativo e información de contacto', 'Datos bancarios con resguardo confidencial', 'Habilitación de dashboard de proyectos'],
    Icon: HiOutlineOfficeBuilding,
    Art: Step3OnboardingArt,
  },
  {
    num: '04',
    eyebrow: 'Verificación empresarial · KYB',
    title: 'Tu empresa pasa la verificación KYB',
    body:
      'Subes un dossier con tu documentación legal, financiera y técnica. Nuestra IA evalúa cuatro dimensiones y asigna un puntaje; luego un auditor senior confirma la acreditación.',
    bullets: ['Documento PDF auditado hasta 10MB', 'Evaluación legal, financiera y de solvencia técnica', 'Acreditación en niveles PLATINUM, GOLD o SILVER'],
    badge: { label: 'Organización verificada KYB', tone: 'approved' },
    Icon: HiShieldCheck,
    Art: Step4KybVerificationArt,
  },
  {
    num: '05',
    eyebrow: 'Proyectos climáticos ESG',
    title: 'Cargas y postulas tu primer proyecto',
    body:
      'Con la cuenta activa, cargas tu iniciativa de compensación (reforestación nativa, parques solares, conservación biológica) con sus métricas auditables y geolocalización.',
    bullets: ['Edición en borrador las veces que requieras', 'Envío a revisión con documentación técnica', 'Revisión técnica de estándares internacionales'],
    Icon: HiOutlineGlobeAlt,
    Art: Step5EsgProjectsArt,
  },
  {
    num: '06',
    eyebrow: 'Certificación ESG y Operación',
    title: 'Certificas el proyecto y comienzas a monetizar',
    body:
      'Subes el documento PDD para la auditoría de impacto. Nuestro sistema audita y emite la certificación; tu proyecto queda activo para recibir fondos de viajeros y corporaciones.',
    bullets: ['Niveles de certificación de impacto Platino, Oro y Plata', 'Informe de auditoría técnica con trazabilidad', 'Proyecto activo en marketplace público y B2B'],
    badge: { label: 'Proyecto certificado y activo', tone: 'approved' },
    Icon: HiBadgeCheck,
    Art: Step6EsgCertificationArt,
  },
];

const CERTIFIED_SHOWCASE = [
  {
    title: 'Parque Solar Fotovoltaico Atacama',
    location: 'Región de Antofagasta, Chile',
    category: 'Energía Renovable',
    standard: 'Verra VCS & Gold Standard',
    metric: '45.000 t CO₂/año evitadas',
    image: '/images/atacama_solar_park.jpg',
    Icon: FaSun,
  },
  {
    title: 'Reserva Biológica Selva Valdiviana',
    location: 'Región de Los Ríos, Chile',
    category: 'Conservación y Biodiversidad',
    standard: 'Estándar VCS · Defra Audit',
    metric: '18.200 t CO₂ capturadas',
    image: '/images/realistic_forest_canopy.png',
    Icon: FaTree,
  },
  {
    title: 'Restauración Comunitaria de Ecosistemas',
    location: 'Cordillera Central, Chile',
    category: 'Reforestación Nativa',
    standard: 'Polygon Blockchain ERC-721',
    metric: '12.000 árboles plantados',
    image: '/images/realistic_eco_seedling.png',
    Icon: FaSeedling,
  },
];

const FAQS = [
  {
    q: '¿Cómo me uno como Impact Partner?',
    a: 'El ingreso es por invitación. Escríbenos y, si tu proyecto encaja con nuestros estándares ESG, el equipo crea tu cuenta y te envía las credenciales de acceso.',
  },
  {
    q: '¿Cuánto demora la verificación KYB?',
    a: 'La evaluación de IA suele finalizar en algunas horas. Luego un administrador revisa el resultado antes de activar tu cuenta, normalmente dentro de 1 a 2 días hábiles.',
  },
  {
    q: '¿Qué pasa si mi documentación es rechazada?',
    a: 'Te mostramos el motivo exacto del rechazo (KYB o certificación de proyecto) y puedes corregir y volver a enviar la documentación las veces que necesites.',
  },
  {
    q: '¿Puedo editar un proyecto ya enviado a revisión?',
    a: 'Solo puedes editar proyectos en estado borrador o rechazado. Mientras está en revisión o activo, permanece de solo lectura para mantener la integridad del proceso.',
  },
];

const PartnersGuidePage = () => {
  const heroRef = useGsapReveal<HTMLElement>((root) => {
    gsap.set('.ctv-reveal', { autoAlpha: 1 });
    const tl = sectionTimeline(root, { scrollTrigger: undefined, delay: 0.1 });
    tl.from('.pg-hero__eyebrow', { y: 14, autoAlpha: 0 }, 0)
      .from('.pg-hero__title .hero-line__inner', { yPercent: 110, stagger: 0.08, duration: 0.9 }, 0.08)
      .from('.pg-hero__lead', { y: 16, autoAlpha: 0 }, 0.35)
      .from('.pg-hero__actions', { y: 16, autoAlpha: 0 }, 0.45)
      .from('.pg-hero__art', { scale: 0.85, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.6)' }, 0.3);

    gsap.to('.pg-hero__art', { y: -10, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }, []);

  const timelineRef = useGsapReveal<HTMLElement>((root) => {
    gsap.set('.ctv-reveal', { autoAlpha: 1 });

    const tl = sectionTimeline(root);
    tl.from('.pg-timeline__eyebrow', { y: 14, autoAlpha: 0 }, 0)
      .from('.pg-timeline__title .hero-line__inner', { yPercent: 110, stagger: 0.08, duration: 0.9 }, 0.08)
      .from('.pg-timeline__lead', { y: 16, autoAlpha: 0 }, 0.35);

    const items = gsap.utils.toArray<HTMLElement>('.pg-step', root);
    items.forEach((item, i) => {
      const fromLeft = i % 2 === 0;
      gsap.from(item, {
        x: fromLeft ? -40 : 40,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 82%', once: true },
      });
      gsap.from(item.querySelector('.pg-step__dot'), {
        scale: 0,
        duration: 0.5,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: item, start: 'top 82%', once: true },
      });
      gsap.from(item.querySelector('.pg-step__art'), {
        scale: 0.82,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'back.out(1.4)',
        scrollTrigger: { trigger: item, start: 'top 82%', once: true },
      });
    });

    gsap.from('.pg-timeline__rail-fill', {
      scaleY: 0,
      transformOrigin: 'top',
      ease: 'none',
      scrollTrigger: {
        trigger: '.pg-timeline__rail',
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: 0.6,
      },
    });

    // Flotación desfasada (yoyo loop) en las ilustraciones de los pasos
    gsap.to('.pg-step__art', {
      y: -8,
      duration: 3.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 0.3,
    });
  }, []);

  const ctaRef = useGsapReveal<HTMLElement>((root) => {
    gsap.set('.ctv-reveal', { autoAlpha: 1 });
    gsap.from('.pg-cta__panel', {
      y: 44,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: root, start: 'top 84%', once: true },
    });
  }, []);

  const faqRef = useGsapReveal<HTMLElement>((root) => {
    gsap.set('.ctv-reveal', { autoAlpha: 1 });
    const tl = sectionTimeline(root);
    tl.from('.pg-faq__eyebrow', { y: 14, autoAlpha: 0 }, 0)
      .from('.pg-faq__title .hero-line__inner', { yPercent: 110, stagger: 0.08, duration: 0.9 }, 0.08)
      .from('.pg-faq-item', { y: 24, autoAlpha: 0, stagger: 0.1 }, 0.3);
  }, []);

  return (
    <div className="pg-page">
      <Header />
      <main>
        {/* ── Hero ── */}
        <section ref={heroRef} className="pg-hero">
          <BlobField className="pg-hero__bg" tone="rgba(255, 255, 255, 0.05)" />
          <div className="pg-hero__container">
            <div className="pg-hero__copy">
              <span className="pg-hero__eyebrow ctv-reveal">
                <span className="ft-eyebrow__line" />
                Guía para nuevos aliados
              </span>
              <h1 className="pg-hero__title">
                <span className="hero-line"><span className="hero-line__inner">Conviértete en</span></span>
                <span className="hero-line pg-hero__title--accent">
                  <span className="hero-line__inner"><em>Impact Partner</em></span>
                </span>
                <span className="hero-line"><span className="hero-line__inner">de CompensaTuViaje.</span></span>
              </h1>
              <p className="pg-hero__lead ctv-reveal">
                Así es el camino completo, paso a paso, para que tu organización provea proyectos de
                compensación de carbono verificados en nuestra plataforma: desde la invitación hasta
                tu primer proyecto activo.
              </p>
              <div className="pg-hero__actions ctv-reveal">
                <a href="#pasos" className="ctv-btn ctv-btn--primary">
                  Ver los 6 pasos
                  <HiArrowRight aria-hidden="true" />
                </a>
                <a href="#contacto-aliados" className="ctv-btn ctv-btn--outline">
                  <HiOutlineMail aria-hidden="true" />
                  Quiero postular
                </a>
              </div>
            </div>
            <div className="pg-hero__art" aria-hidden="true">
              <HeroPartnersNetworkArt className="pg-hero__network-art" />
            </div>
          </div>
        </section>

        {/* ── Timeline de 6 pasos ── */}
        <section ref={timelineRef} className="pg-timeline" id="pasos">
          <div className="pg-timeline__container">
            <header className="pg-timeline__header">
              <span className="pg-timeline__eyebrow ctv-reveal">
                <span className="ft-eyebrow__line" />
                El camino del aliado
              </span>
              <h2 className="pg-timeline__title">
                <span className="hero-line"><span className="hero-line__inner">Del correo de</span></span>
                <span className="hero-line">
                  <span className="hero-line__inner">invitación a tu <em>proyecto activo</em>.</span>
                </span>
              </h2>
              <p className="pg-timeline__lead ctv-reveal">
                Seis etapas claras. Sabrás en todo momento en qué estado está tu cuenta y tus proyectos.
              </p>
            </header>

            <div className="pg-timeline__steps-wrap">
              <div className="pg-timeline__rail">
                <div className="pg-timeline__rail-track" />
                <div className="pg-timeline__rail-fill" />
              </div>

              <ol className="pg-steps">
                {STEPS.map((step, i) => {
                  const { Art, Icon } = step;
                  return (
                    <li key={step.num} className={`pg-step${i % 2 === 0 ? ' pg-step--left' : ' pg-step--right'}`}>
                      <span className="pg-step__dot">{step.num}</span>
                      <div className="pg-step__card">
                        <div className="pg-step__eyebrow-wrap">
                          <Icon className="pg-step__eyebrow-icon" aria-hidden="true" />
                          <span className="pg-step__eyebrow">{step.eyebrow}</span>
                        </div>
                        <h3 className="pg-step__title">{step.title}</h3>
                        <p className="pg-step__body">{step.body}</p>
                        <ul className="pg-step__bullets">
                          {step.bullets.map((b) => (
                            <li key={b}>
                              <HiCheck className="pg-bullet__check-icon" aria-hidden="true" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                        {step.badge && (
                          <span className={`pg-badge pg-badge--${step.badge.tone}`}>
                            <HiCheckCircle className="pg-badge__check-icon" aria-hidden="true" />
                            <span>{step.badge.label}</span>
                          </span>
                        )}
                      </div>
                      <div className="pg-step__art" aria-hidden="true">
                        <Art />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Galería Real de Proyectos de Aliados Certificados ── */}
        <section className="pg-showcase" aria-label="Proyectos de aliados en operación">
          <div className="pg-showcase__container">
            <header className="pg-showcase__header">
              <span className="pg-showcase__eyebrow">
                <HiShieldCheck aria-hidden="true" />
                Impacto en Operación
              </span>
              <h2 className="pg-showcase__title">
                Proyectos de aliados que ya reciben compensaciones
              </h2>
              <p className="pg-showcase__lead">
                Iniciativas auditadas con factores DEFRA 2024, GHG Protocol y registro inmutable en blockchain.
              </p>
            </header>

            <div className="pg-showcase__grid">
              {CERTIFIED_SHOWCASE.map((item) => {
                const { Icon } = item;
                return (
                  <div key={item.title} className="pg-showcase__card">
                    <div className="pg-showcase__image-wrap">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="pg-showcase__img"
                        loading="lazy"
                      />
                      <span className="pg-showcase__category-badge">
                        <Icon aria-hidden="true" />
                        <span>{item.category}</span>
                      </span>
                    </div>

                    <div className="pg-showcase__body">
                      <h3 className="pg-showcase__card-title">{item.title}</h3>
                      <p className="pg-showcase__card-location">{item.location}</p>

                      <div className="pg-showcase__meta-row">
                        <div className="pg-showcase__meta-item">
                          <span className="pg-showcase__meta-label">Estándar</span>
                          <span className="pg-showcase__meta-val">{item.standard}</span>
                        </div>
                        <div className="pg-showcase__meta-item">
                          <span className="pg-showcase__meta-label">Impacto anual</span>
                          <span className="pg-showcase__meta-val pg-showcase__meta-val--green">
                            {item.metric}
                          </span>
                        </div>
                      </div>

                      <div className="pg-showcase__footer">
                        <span className="pg-showcase__verified-pill">
                          <HiCheckCircle aria-hidden="true" />
                          Certificación Activa
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA panel teal ── */}
        <section ref={ctaRef} className="pg-cta" id="contacto-aliados">
          <div className="pg-cta__panel">
            <BlobField className="pg-cta__pattern" tone="rgba(255, 255, 255, 0.05)" />
            <div className="pg-cta__copy">
              <span className="pg-cta__pill">Postulación por invitación</span>
              <h3 className="pg-cta__name">¿Tu organización tiene un proyecto de impacto ambiental?</h3>
              <p className="pg-cta__sub">
                Escríbenos contándonos sobre tu proyecto (reforestación, conservación, energía renovable,
                agricultura sostenible, gestión de residuos, agua limpia). Si encaja con nuestros
                estándares ESG, te enviamos tu invitación como Impact Partner.
              </p>
              <a href="mailto:partners@compensatuviaje.com" className="ft-cta">
                Escribir a partners@compensatuviaje.com
                <HiArrowRight aria-hidden="true" />
              </a>
              <p className="pg-cta__fine">Respuesta habitual en 2 a 3 días hábiles</p>
            </div>
            <div className="pg-cta__art" aria-hidden="true">
              <CertificateArt className="pg-cta__cert" />
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section ref={faqRef} className="pg-faq">
          <div className="pg-faq__container">
            <header className="pg-faq__header">
              <span className="pg-faq__eyebrow ctv-reveal">
                <span className="ft-eyebrow__line" />
                Preguntas frecuentes
              </span>
              <h2 className="pg-faq__title">
                <span className="hero-line"><span className="hero-line__inner">Antes de escribirnos</span></span>
              </h2>
            </header>
            <div className="pg-faq__list">
              {FAQS.map((item) => (
                <div key={item.q} className="pg-faq-item">
                  <h3 className="pg-faq-item__q">{item.q}</h3>
                  <p className="pg-faq-item__a">{item.a}</p>
                </div>
              ))}
            </div>
            <div className="pg-faq__footer-link">
              <Link to="/partner/login" className="ctv-btn ctv-btn--outline">
                Ya soy aliado, iniciar sesión
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PartnersGuidePage;

