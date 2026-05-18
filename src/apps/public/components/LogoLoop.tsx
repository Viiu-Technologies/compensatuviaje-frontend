import React from 'react';
import './LogoLoop.css';

/* ─────────────────────────────────────────────────────────────────
   Stripe — path oficial extraído de simple-icons (hex: #635BFF)
   viewBox 0 0 24 24
   ───────────────────────────────────────────────────────────────── */
const StripeLogo = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Stripe"
    className="pm-logo pm-logo--stripe"
  >
    <path
      fill="#635BFF"
      d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305
         1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975
         15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757
         4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445
         1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921
         -6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0
         4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732
         0-4.128-2.524-5.851-6.594-7.305h.003z"
    />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────
   Webpay — logo pill oficial con colores de marca Transbank
   ───────────────────────────────────────────────────────────────── */
const WebpayLogo = () => (
  <svg
    viewBox="0 0 130 40"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Webpay by Transbank"
    role="img"
    className="pm-logo pm-logo--webpay"
  >
    {/* Pill rojo */}
    <rect width="130" height="40" rx="8" fill="#E30613" />
    {/* Texto WEBPAY */}
    <text
      x="12" y="27"
      fontFamily="'Arial Black', Arial, sans-serif"
      fontWeight="900"
      fontSize="17"
      fill="white"
      letterSpacing="1.2"
    >
      WEBPAY
    </text>
    {/* Ícono tarjeta */}
    <rect x="98" y="11" width="22" height="18" rx="3.5" fill="white" fillOpacity=".20" />
    <rect x="98" y="17" width="22" height="5"  fill="white" fillOpacity=".40" />
    <rect x="100" y="25" width="7" height="2"  rx="1"   fill="white" fillOpacity=".55" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────
   Items del marquee — duplicados para loop infinito seamless
   ───────────────────────────────────────────────────────────────── */
const ITEMS = [
  { id: 'stripe',  Logo: StripeLogo,  name: 'Stripe',  sub: 'Crédito · Débito · Wallet', accent: 'rgba(99,91,255,0.18)',  accentHover: 'rgba(99,91,255,0.42)'  },
  { id: 'webpay',  Logo: WebpayLogo,  name: 'Webpay',  sub: 'Transbank · Chile',          accent: 'rgba(227,6,19,0.15)',   accentHover: 'rgba(227,6,19,0.40)'   },
];

const LOOP = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS]; // 4 repeticiones para un loop fluido

/* ─────────────────────────────────────────────────────────────────
   Componente principal
   ───────────────────────────────────────────────────────────────── */
const LogoLoop: React.FC = () => (
  <section className="pm-section" aria-label="Métodos de pago aceptados">
    <p className="pm-eyebrow">Pagos seguros con</p>

    <div className="pm-marquee-outer">
      {/* fade edges */}
      <div className="pm-fade pm-fade--left"  aria-hidden="true" />
      <div className="pm-fade pm-fade--right" aria-hidden="true" />

      <div className="pm-marquee-track">
        {LOOP.map((item, i) => {
          const { Logo } = item;
          return (
            <div
              key={`${item.id}-${i}`}
              className={`pm-card pm-card--${item.id}`}
              style={{
                '--accent':       item.accent,
                '--accent-hover': item.accentHover,
              } as React.CSSProperties}
            >
              <div className="pm-card__logo">
                <Logo />
              </div>
              <div className="pm-card__info">
                <span className="pm-card__name">{item.name}</span>
                <span className="pm-card__sub">{item.sub}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default LogoLoop;