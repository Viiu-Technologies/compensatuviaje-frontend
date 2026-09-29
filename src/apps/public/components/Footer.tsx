import { useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { HiArrowRight } from 'react-icons/hi';
import { useGsapReveal } from '../hooks/useGsapReveal';
import { LEGAL, LEGAL_ROUTES, ownerLine } from '../../../shared/config/legal';
import { subscribeToNewsletter } from '../services/newsService';
import './Footer.css';

// Rutas absolutas (el footer también se usa fuera de la landing, donde un
// "#faq" suelto no apunta a nada). Las anclas /#… las resuelve el Header.
// "Nosotros" se quitó: no existe esa página ni esa sección.
const SECTIONS = [
  {
    title: 'Servicios',
    links: [
      { label: 'Calculadora CO₂', href: '/calculadora' },
      { label: 'Proyectos', href: '/#proyectos' },
      { label: 'Empresas', href: '/#empresas' },
    ],
  },
  {
    title: 'Información',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Sé un aliado', href: '/aliados' },
      { label: 'Verificar certificado', href: '/#verificar' },
      { label: 'Metodología', href: '/calculadora#metodologia' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    title: 'Contacto',
    links: [
      { label: 'Contáctanos', href: `mailto:${LEGAL.emails.contact}` },
      { label: 'Soporte', href: `mailto:${LEGAL.emails.support}?subject=Soporte` },
      { label: 'Prensa', href: `mailto:${LEGAL.emails.contact}?subject=Prensa` },
      { label: 'Empresas', href: `mailto:${LEGAL.emails.contact}?subject=Empresas` },
      { label: 'Partners', href: `mailto:${LEGAL.emails.contact}?subject=Partners` },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Términos y Condiciones', href: LEGAL_ROUTES.terms },
      { label: 'Privacidad', href: LEGAL_ROUTES.privacy },
      { label: 'Reembolsos y Retracto', href: LEGAL_ROUTES.refunds },
      { label: 'Cookies', href: LEGAL_ROUTES.cookies },
    ],
  },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Misma lista que el boletín del blog: doble opt-in, el backend solo envía
  // el correo de confirmación.
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    const res = await subscribeToNewsletter(email.trim());
    setMessage(res.message);
    setStatus(res.ok ? 'done' : 'error');
    if (res.ok) setEmail('');
  };

  const scopeRef = useGsapReveal<HTMLElement>(() => {
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

          <Link to="/calculadora" className="ft-display-cta">
            Empieza ahora
            <HiArrowRight aria-hidden="true" />
          </Link>
        </div>

        {/* ── Newsletter ── */}
        <div className="ft-newsletter">
          <div className="ft-newsletter__copy">
            <p className="ft-newsletter__label">Newsletter</p>
            <h3 className="ft-newsletter__title">Recibe novedades de sostenibilidad en tu correo.</h3>
          </div>

          <div className="ft-newsletter__row">
            {status === 'done' ? (
              <p className="ft-newsletter__msg" role="status">{message}</p>
            ) : (
            <form className="ft-newsletter__form" onSubmit={handleSubscribe}>
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Correo electrónico"
                className="ft-newsletter__input"
                disabled={status === 'sending'}
              />
              <button type="submit" className="ft-newsletter__btn" disabled={status === 'sending'}>
                {status === 'sending' ? 'Enviando…' : 'Suscribirme'}
                <HiArrowRight aria-hidden="true" />
              </button>
            </form>
            )}
            {status === 'error' && <p className="ft-newsletter__msg ft-newsletter__msg--error" role="alert">{message}</p>}
            <p className="ft-newsletter__legal">
              Te enviaremos un correo para confirmar. Puedes darte de baja cuando quieras.
              Ver <Link to={LEGAL_ROUTES.privacy}>Política de Privacidad</Link>.
            </p>
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
          <a href={`mailto:${LEGAL.emails.contact}?subject=Postulacion%20Proyecto%20ESG`} className="ft-esg-banner__btn">
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
          {ownerLine() && <p className="ft-bottom__legal">{ownerLine()}</p>}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
