import React from 'react';
import { HiLockClosed, HiShieldCheck } from 'react-icons/hi';
import './LogoLoop.css';

/* ─────────────────────────────────────────────────────────────────
   Stripe Logo: Clean modern SVG
   ───────────────────────────────────────────────────────────────── */
const StripeBadge = () => (
  <svg viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="pm-svg">
    <path
      d="M59.64 14.28c0-4.48-2.18-8-6.44-8-4.28 0-6.86 3.54-6.86 8 0 5.28 3.06 7.96 7.42 7.96 2.12 0 3.72-.48 4.92-1.16v-3.52c-1.2.6-2.58.94-4.14.94-1.68 0-3.08-.6-3.26-2.38h8.32c.02-.32.04-.6.04-.84zm-8.4-1.7c0-1.64.98-2.32 2-2.32s1.96.68 1.96 2.32h-3.96zm-7.6-6.3c-1.74 0-2.88.82-3.46 1.4V6.52H35.5v15.46h4.72v-9.28c0-2.02 1.34-3.02 2.76-3.02.48 0 .9.08 1.18.18V6.44c-.48-.12-.96-.16-1.46-.16zm-11.88-5.7v4.62h-2.34v3.52h2.34v7.38c0 3.1 1.7 4.94 4.58 4.94 1.32 0 2.28-.24 2.82-.54v-3.52c-.44.18-1.02.3-1.68.3-1.18 0-1.72-.6-1.72-1.94v-6.62h3.5v-3.52h-3.5V.58h-4zm-8.8 8.7c-1.14-.54-2.7-.96-3.86-1.38-.82-.3-1.12-.66-1.12-1.14 0-.68.62-1.14 1.76-1.14 1.62 0 3.3.62 4.46 1.28l1.32-3.72c-1.34-.72-3.32-1.24-5.78-1.24-4.1 0-6.88 2.18-6.88 5.84 0 3.16 1.96 4.78 5.12 5.92 1.28.48 2.58.9 2.58 1.48 0 .74-.72 1.24-1.98 1.24-1.84 0-3.98-.82-5.4-1.8l-1.38 3.82c1.62 1.08 3.96 1.76 6.78 1.76 4.38 0 7.12-2.18 7.12-5.88-.02-3.34-2.12-4.96-4.72-6.04z"
      fill="#635BFF"
    />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────
   Webpay Plus: Clean modern typography & dual shield
   ───────────────────────────────────────────────────────────────── */
const WebpayBadge = () => (
  <div className="pm-webpay-badge">
    <span className="pm-webpay-text">webpay</span>
    <span className="pm-webpay-plus">plus</span>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   Visa / Mastercard clean badge
   ───────────────────────────────────────────────────────────────── */
const CardNetworkBadge = () => (
  <div className="pm-cards-badge">
    <span className="pm-card-chip pm-card-chip--visa">VISA</span>
    <span className="pm-card-chip pm-card-chip--mc">MC</span>
  </div>
);

const TRUST_ITEMS = [
  {
    id: 'stripe',
    Component: StripeBadge,
    label: 'Stripe Payments',
    sub: 'Tarjetas globales',
  },
  {
    id: 'webpay',
    Component: WebpayBadge,
    label: 'Webpay Plus',
    sub: 'Transbank Chile',
  },
  {
    id: 'cards',
    Component: CardNetworkBadge,
    label: 'Tarjetas Débito y Crédito',
    sub: 'Procesamiento encriptado',
  },
  {
    id: 'security',
    Component: () => (
      <div className="pm-ssl-badge">
        <HiLockClosed aria-hidden="true" />
        <span>SSL 256-Bit</span>
      </div>
    ),
    label: 'Seguridad Bancaria',
    sub: 'Tokens y 3D Secure',
  },
];

const LOOP = [...TRUST_ITEMS, ...TRUST_ITEMS];

export const LogoLoop: React.FC = () => {
  return (
    <div className="pm-container" aria-label="Plataforma de pagos segura y verificada">
      <div className="pm-header">
        <HiShieldCheck aria-hidden="true" />
        <span>Pasarela de pago segura</span>
      </div>

      <div className="pm-grid">
        {TRUST_ITEMS.map((item) => {
          const { Component } = item;
          return (
            <div key={item.id} className="pm-card">
              <div className="pm-card-visual">
                <Component />
              </div>
              <div className="pm-card-text">
                <span className="pm-card-title">{item.label}</span>
                <span className="pm-card-sub">{item.sub}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LogoLoop;