import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { HiArrowRight } from 'react-icons/hi';
import { useGsapReveal } from '../hooks/useGsapReveal';
import './Footer.css';

// Decorative 3D brand object beside the newsletter. Lazy so three.js stays out of the
// landing page's initial bundle -- it is an ornament, not content, and the footer is
// below the fold.
const LeaningCardsFooterScene = lazy(() => import('../../../threejs-assets/LeaningCardsFooterScene'));

/**
 * Mounts the WebGL canvas only once the newsletter row is about to enter the
 * viewport. Every page that renders <Footer> (landing, blog, calculator,
 * contact, partners guide, payment methods) pays for this scene's shaders
 * and PBR textures the instant its lazy chunk resolves -- with no visibility
 * gate, that happened as soon as the page loaded, regardless of whether the
 * visitor ever scrolled this far. Same pattern as VirtualForestSection's
 * ForestCanvas gate.
 */
function useIsNearViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px 200px 0px', threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

const SECTIONS = [
  {
    title: 'Servicios',
    links: [
      { label: 'Calculadora de Carbono', href: '/calculadora' },
      { label: 'Proyectos de Conservación', href: '/#proyectos' },
      { label: 'Soluciones Empresas (B2B)', href: '/#empresas' },
      { label: 'Métodos de Pago y Seguridad', href: '/pagos' },
    ],
  },
  {
    title: 'Información',
    links: [
      { label: 'Blog de Impacto', href: '/blog' },
      { label: 'Sé un Aliado', href: '/aliados' },
      { label: 'Metodología DEFRA', href: '/#calculadora-content' },
      { label: 'Preguntas Frecuentes', href: '/#faq' },
    ],
  },
  {
    title: 'Atención y Consultas',
    links: [
      { label: 'Formulario de Contacto', href: '/contacto' },
      { label: 'Email Oficial', href: 'mailto:contacto@compensatuviaje.com' },
      { label: 'Soporte y Verificación', href: '/contacto' },
      { label: 'Postulación de Proyectos', href: '/aliados' },
    ],
  },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const { ref: sceneRowRef, isVisible: isSceneVisible } = useIsNearViewport<HTMLDivElement>();

  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    gsap.set(root.querySelectorAll('.ctv-reveal'), { autoAlpha: 1 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
    tl.from('.ft-display .hero-line__inner', {
      yPercent: 110, stagger: 0.08, duration: 0.9,
    }, 0);
    tl.from('.ft-newsletter', { y: 18, autoAlpha: 0, duration: 0.7 }, 0.3);
    tl.from('.ft-col', { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.45);
    tl.from('.ft-bottom > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, 0.7);
  }, []);

  return (
    <footer ref={scopeRef} className="ft-footer">
      <div className="ft-footer-container">

        {/* ── Display block ── */}
        <div className="ft-display-block">
          <h2 className="ft-display">
            <span className="hero-line"><span className="hero-line__inner">La sostenibilidad</span></span>
            <span className="hero-line"><span className="hero-line__inner"><em>es posible</em>.</span></span>
          </h2>

          <a href="#calculadora" className="ft-display-cta">
            Empieza ahora
            <HiArrowRight aria-hidden="true" />
          </a>
        </div>

        {/* ── Newsletter ── */}
        <div className="ft-newsletter">
          <div className="ft-newsletter__copy">
            <p className="ft-newsletter__label">Newsletter</p>
            <h3 className="ft-newsletter__title">Recibe historias de impacto cada mes.</h3>
          </div>

          <div className="ft-newsletter__row">
            <form
              className="ft-newsletter__form"
              onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
            >
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ft-newsletter__input"
              />
              <button type="submit" className="ft-newsletter__btn">
                Suscribirme
                <HiArrowRight aria-hidden="true" />
              </button>
            </form>

            <div className="ft-newsletter__scene-row" ref={sceneRowRef}>
              {isSceneVisible && (
                <Suspense fallback={null}>
                  <LeaningCardsFooterScene />
                </Suspense>
              )}
            </div>
          </div>
        </div>

        {/* ── Banner de Proyectos ESG / Partners ── */}
        <div className="ft-esg-banner">
          <div className="ft-esg-banner__copy">
            <span className="ft-esg-banner__pill">Proyectos ESG</span>
            <h3 className="ft-esg-banner__title">¿Tienes un proyecto de sostenibilidad?</h3>
            <p className="ft-esg-banner__text">
              Si quieres ser parte de nuestra red de compensación, postula a Proyectos ESG. Envíanos un email para presentar tu iniciativa e iniciar conversaciones.
            </p>
          </div>
          <a href="mailto:compensatuviaje@gmail.com?subject=Postulacion%20Proyecto%20ESG" className="ft-esg-banner__btn">
            Aplicar ahora
            <HiArrowRight aria-hidden="true" />
          </a>
        </div>

        {/* ── Columnas ── */}
        <div className="ft-cols">
          <div className="ft-col ft-col--brand">
            <img
              src="/images/brand/logo-horizontal-white.svg"
              alt="CompensaTuViaje"
              className="ft-logo"
            />
            <p className="ft-tagline">
              Compensamos la huella de carbono de tus viajes apoyando proyectos
              verificados en Chile y el mundo.
            </p>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title} className="ft-col">
              <h4 className="ft-col__title">{section.title}</h4>
              <ul className="ft-col__list">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link to={link.href} className="ft-col__link">{link.label}</Link>
                    ) : (
                      <a href={link.href} className="ft-col__link">{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom ── */}
        <div className="ft-bottom">
          <p className="ft-bottom__copy">
            © {year} CompensaTuViaje. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
