import React from 'react';
import { Link } from 'react-router-dom';
import { HiLockClosed, HiShieldCheck, HiArrowRight } from 'react-icons/hi';
import './LogoLoop.css';

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
   Visa clean badge
   ───────────────────────────────────────────────────────────────── */
const VisaBadge = () => (
  <div className="pm-visa-badge">
    <span>VISA</span>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   Tarjetas de Crédito y Débito
   ───────────────────────────────────────────────────────────────── */
const CardNetworkBadge = () => (
  <div className="pm-cards-badge">
    <span className="pm-card-chip pm-card-chip--credit">CRÉDITO</span>
    <span className="pm-card-chip pm-card-chip--debit">DÉBITO</span>
  </div>
);

const TRUST_ITEMS = [
  {
    id: 'webpay',
    Component: WebpayBadge,
    label: 'Webpay Plus',
    sub: 'Transbank Chile / Redcompra',
  },
  {
    id: 'visa',
    Component: VisaBadge,
    label: 'Tarjetas Visa',
    sub: 'Nacional e Internacional',
  },
  {
    id: 'cards',
    Component: CardNetworkBadge,
    label: 'Tarjetas Bancarias',
    sub: 'Crédito y Débito en cuotas',
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
    sub: 'Tokens y 3D Secure 2.0',
  },
];

export const LogoLoop: React.FC = () => {
  return (
    <div className="pm-container" aria-label="Plataforma de pagos segura y verificada">
      <div className="pm-header">
        <HiShieldCheck aria-hidden="true" />
        <span>Métodos de pago habilitados</span>
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

      <Link to="/pagos" className="pm-details-link">
        Conoce más sobre métodos de pago y seguridad
        <HiArrowRight aria-hidden="true" />
      </Link>
    </div>
  );
};

export default LogoLoop;