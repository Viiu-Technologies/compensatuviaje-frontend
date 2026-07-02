import { useState } from 'react';
import gsap from 'gsap';
import { FaFacebook, FaLinkedin } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import { useGsapReveal } from '../hooks/useGsapReveal';
import './Footer.css';

const SECTIONS = [
  {
    title: 'Servicios',
    links: [
      { label: 'Calculadora CO₂', href: '#calculadora' },
      { label: 'Compensación', href: '#compensacion' },
      { label: 'Proyectos', href: '#proyectos' },
      { label: 'Certificación', href: '#certificacion' },
    ],
  },
  {
    title: 'Información',
    links: [
      { label: 'Blog', href: '#blog' },
      { label: 'Transparencia', href: '#transparencia' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Nosotros', href: '#nosotros' },
    ],
  },
  {
    title: 'Contacto',
    links: [
      { label: 'Contáctanos', href: 'mailto:compensatuviaje@gmail.com' },
      { label: 'Soporte', href: 'mailto:compensatuviaje@gmail.com?subject=Soporte' },
      { label: 'Prensa', href: 'mailto:compensatuviaje@gmail.com?subject=Prensa' },
      { label: 'Empresas', href: 'mailto:compensatuviaje@gmail.com?subject=Empresas' },
      { label: 'Partners', href: 'mailto:compensatuviaje@gmail.com?subject=Partners' },
    ],
  },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');

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
                    <a href={link.href} className="ft-col__link">{link.label}</a>
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

          <div className="ft-bottom__social">
            <a href="#" aria-label="Facebook" onClick={(e) => e.preventDefault()} className="ft-bottom__icon">
              <FaFacebook />
            </a>
            <a href="#" aria-label="LinkedIn" onClick={(e) => e.preventDefault()} className="ft-bottom__icon">
              <FaLinkedin />
            </a>
          </div>

          <div className="ft-bottom__legal">
            <a href="#privacidad" className="ft-bottom__link">Privacidad</a>
            <a href="#terminos" className="ft-bottom__link">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
