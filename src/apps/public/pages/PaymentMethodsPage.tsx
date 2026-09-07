import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiShieldCheck, 
  HiLockClosed, 
  HiCheckCircle, 
  HiArrowLeft, 
  HiCreditCard,
  HiOutlineReceiptTax,
  HiOutlineClipboardCheck
} from 'react-icons/hi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PaymentMethodsPage.css';

const PaymentMethodsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Métodos de Pago y Seguridad | CompensaTuViaje';
  }, []);

  return (
    <div className="pmp-page">
      <Header />

      <main className="pmp-main">
        {/* Hero */}
        <section className="pmp-hero">
          <div className="pmp-container">
            <Link to="/" className="pmp-back-link">
              <HiArrowLeft /> Volver al inicio
            </Link>

            <span className="pmp-eyebrow">
              <HiShieldCheck /> Pasarela de Pago y Seguridad Bancaria
            </span>

            <h1 className="pmp-title">
              Paga con total tranquilidad y transparencia.
            </h1>

            <p className="pmp-lead">
              En CompensaTuViaje tus transacciones están protegidas con los más altos estándares de cifrado bancario.
              Aceptamos exclusivamente medios de pago verificados en Chile e internacionalmente.
            </p>
          </div>
        </section>

        {/* Métodos de pago aceptados */}
        <section className="pmp-methods-section">
          <div className="pmp-container">
            <h2 className="pmp-section-title">Medios de pago disponibles</h2>
            <p className="pmp-section-sub">
              Diseñados para brindarte conveniencia inmediata tanto para aportes personales como corporativos.
            </p>

            <div className="pmp-cards-grid">
              {/* Webpay Plus */}
              <div className="pmp-card pmp-card--featured">
                <div className="pmp-card__header">
                  <div className="pmp-webpay-badge-large">
                    <span className="pmp-webpay-text">webpay</span>
                    <span className="pmp-webpay-plus">plus</span>
                  </div>
                  <span className="pmp-card__pill">Recomendado en Chile</span>
                </div>
                <h3 className="pmp-card__title">Webpay Plus (Transbank)</h3>
                <p className="pmp-card__desc">
                  La red de pagos más confiable de Chile. Paga al instante utilizando tu cuenta bancaria o aplicación móvil.
                </p>
                <ul className="pmp-card__list">
                  <li><HiCheckCircle /> Tarjetas de Débito y Redcompra de todos los bancos nacionales.</li>
                  <li><HiCheckCircle /> Compatible con CuentaRUT de BancoEstado sin recargos.</li>
                  <li><HiCheckCircle /> Tarjetas prepago digitales (Tenpo, Mach, Mercado Pago).</li>
                  <li><HiCheckCircle /> Acreditación instantánea del certificado de compensación.</li>
                </ul>
              </div>

              {/* Visa */}
              <div className="pmp-card">
                <div className="pmp-card__header">
                  <div className="pmp-visa-badge-large">
                    <span>VISA</span>
                  </div>
                  <span className="pmp-card__pill pmp-card__pill--intl">Nacional & Global</span>
                </div>
                <h3 className="pmp-card__title">Tarjetas Visa</h3>
                <p className="pmp-card__desc">
                  Aceptamos todas las tarjetas Visa nacionales e internacionales con protocolo de seguridad 3D Secure.
                </p>
                <ul className="pmp-card__list">
                  <li><HiCheckCircle /> Visa Débito y Visa Crédito.</li>
                  <li><HiCheckCircle /> Soporte para tarjetas emitidas en Chile y en el extranjero.</li>
                  <li><HiCheckCircle /> Autenticación segura de 2 factores (Verified by Visa).</li>
                  <li><HiCheckCircle /> Conversión de divisas transparente y sin tarifas sorpresa.</li>
                </ul>
              </div>

              {/* Tarjetas de Crédito y Débito */}
              <div className="pmp-card">
                <div className="pmp-card__header">
                  <div className="pmp-credit-badge-large">
                    <HiCreditCard className="pmp-credit-icon" />
                    <span>Crédito & Débito</span>
                  </div>
                  <span className="pmp-card__pill">Bancario</span>
                </div>
                <h3 className="pmp-card__title">Tarjetas de Crédito y Débito</h3>
                <p className="pmp-card__desc">
                  Paga con las tarjetas emitidas por tu banco favorito, con opción de financiamiento según tus convenios.
                </p>
                <ul className="pmp-card__list">
                  <li><HiCheckCircle /> Posibilidad de pago en cuotas (según promociones de tu banco emisor).</li>
                  <li><HiCheckCircle /> Mastercard y redes bancarias interbancarias autorizadas.</li>
                  <li><HiCheckCircle /> Cifrado de extremo a extremo sin retención de datos sensibles.</li>
                  <li><HiCheckCircle /> Emisión de comprobante tributario y factura si lo requieres.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Garantías de Seguridad */}
        <section className="pmp-security-section">
          <div className="pmp-container">
            <div className="pmp-security-box">
              <div className="pmp-security-header">
                <div className="pmp-security-icon">
                  <HiLockClosed />
                </div>
                <div>
                  <h2 className="pmp-security-title">Compromiso de Seguridad y Privacidad</h2>
                  <p className="pmp-security-desc">
                    Tus fondos y tu privacidad son nuestra máxima prioridad en cada viaje compensado.
                  </p>
                </div>
              </div>

              <div className="pmp-security-grid">
                <div className="pmp-sec-item">
                  <HiShieldCheck className="pmp-sec-item__icon" />
                  <div>
                    <h4>Cifrado SSL 256-Bit</h4>
                    <p>
                      Toda la comunicación entre tu navegador y la pasarela de pago viaja a través de un túnel cifrado de grado militar.
                    </p>
                  </div>
                </div>

                <div className="pmp-sec-item">
                  <HiOutlineClipboardCheck className="pmp-sec-item__icon" />
                  <div>
                    <h4>Cero almacenamiento de tarjetas</h4>
                    <p>
                      CompensaTuViaje nunca almacena números de tarjeta ni códigos CVV. La transacción se realiza directamente con Transbank.
                    </p>
                  </div>
                </div>

                <div className="pmp-sec-item">
                  <HiOutlineReceiptTax className="pmp-sec-item__icon" />
                  <div>
                    <h4>Comprobante y Certificado Inmediato</h4>
                    <p>
                      Al completar el pago, descargas al instante tu certificado digital verificable con hash inmutable y registro blockchain.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pmp-cta-wrap">
              <h3>¿Listo para calcular y compensar tu próximo viaje?</h3>
              <p>Conoce las toneladas de CO₂ de tu ruta y neutralízalas con proyectos auditados.</p>
              <div className="pmp-cta-btns">
                <Link to="/calculadora" className="pmp-btn pmp-btn--primary">
                  Ir a la Calculadora
                </Link>
                <Link to="/contacto" className="pmp-btn pmp-btn--outline">
                  ¿Tienes dudas? Contáctanos
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentMethodsPage;
