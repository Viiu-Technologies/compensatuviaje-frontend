import { Link } from 'react-router-dom';
import { HiArrowRight, HiOutlineMail } from 'react-icons/hi';
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
  Art: React.ComponentType<{ className?: string }>;
  badge?: { label: string; tone: 'pending' | 'ai' | 'approved' | 'rejected' };
};

const STEPS: Step[] = [
  {
    num: '01',
    eyebrow: 'Invitación',
    title: 'Recibes tu acceso por correo',
    body:
      'CompensaTuViaje es una red de aliados por invitación. Nuestro equipo crea tu cuenta y te envía credenciales temporales al correo de contacto de tu organización.',
    bullets: ['Cuenta creada por el equipo CompensaTuViaje', 'Un solo usuario administrador por aliado', 'Login en /partner/login'],
    Art: Step1InvitationArt,
  },
  {
    num: '02',
    eyebrow: 'Seguridad',
    title: 'Cambias tu contraseña temporal',
    body:
      'En tu primer ingreso te pedimos reemplazar la contraseña temporal por una definitiva, con mínimo 8 caracteres, una mayúscula y un número.',
    bullets: ['Obligatorio antes de continuar', 'Mínimo 8 caracteres · mayúscula · número'],
    Art: Step2SecurityArt,
  },
  {
    num: '03',
    eyebrow: 'Onboarding',
    title: 'Completas el perfil de tu organización',
    body:
      'Dos pasos rápidos: subes el logo y los datos de tu organización, y luego registras los datos bancarios donde recibirás el pago de tus compensaciones.',
    bullets: ['Logo y datos de contacto', 'Datos bancarios (uso confidencial)', 'Habilita el resto de la plataforma'],
    Art: Step3OnboardingArt,
  },
  {
    num: '04',
    eyebrow: 'Verificación empresarial · KYB',
    title: 'Tu empresa pasa la verificación KYB',
    body:
      'Subes un dossier con tu documentación legal, financiera y comercial. Nuestra IA evalúa cuatro dimensiones y asigna un puntaje; luego un administrador confirma la decisión.',
    bullets: ['Documento PDF · máx. 10MB', 'Evalúa: legal, financiero, técnico, referencias', 'Tier asignado: PLATINUM · GOLD · SILVER'],
    badge: { label: 'Empresa verificada', tone: 'approved' },
    Art: Step4KybVerificationArt,
  },
  {
    num: '05',
    eyebrow: 'Proyectos ESG',
    title: 'Creas y envías tu primer proyecto',
    body:
      'Con la cuenta activa, cargas tu proyecto de compensación (reforestación, energía renovable, conservación marina, etc.) con sus métricas de impacto y lo envías a revisión.',
    bullets: ['Guarda como borrador cuantas veces quieras', 'Envías a revisión cuando esté completo', 'Un SuperAdmin aprueba o solicita ajustes'],
    Art: Step5EsgProjectsArt,
  },
  {
    num: '06',
    eyebrow: 'Certificación ESG',
    title: 'Certificas el proyecto y comienzas a operar',
    body:
      'Subes el documento PDD del proyecto para la auditoría de impacto ESG. La IA genera un informe y un nivel de certificación; el admin confirma y tu proyecto queda activo para recibir compensaciones.',
    bullets: ['Niveles: Platino Impacto · Oro · Plata', 'Informe de auditoría en detalle', 'Proyecto activo = recibe ventas'],
    badge: { label: 'Proyecto certificado', tone: 'approved' },
    Art: Step6EsgCertificationArt,
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

            <div className="pg-timeline__rail">
              <div className="pg-timeline__rail-track" />
              <div className="pg-timeline__rail-fill" />
            </div>

            <ol className="pg-steps">
              {STEPS.map((step, i) => {
                const { Art } = step;
                return (
                  <li key={step.num} className={`pg-step${i % 2 === 0 ? ' pg-step--left' : ' pg-step--right'}`}>
                    <span className="pg-step__dot">{step.num}</span>
                    <div className="pg-step__card">
                      <span className="pg-step__eyebrow">{step.eyebrow}</span>
                      <h3 className="pg-step__title">{step.title}</h3>
                      <p className="pg-step__body">{step.body}</p>
                      <ul className="pg-step__bullets">
                        {step.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                      {step.badge && (
                        <span className={`pg-badge pg-badge--${step.badge.tone}`}>
                          ✅ {step.badge.label}
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

