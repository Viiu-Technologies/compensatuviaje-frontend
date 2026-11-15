import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout, { type LegalSection } from '../../components/legal/LegalLayout';
import { LEGAL, LEGAL_ROUTES } from '../../../../shared/config/legal';
import { PUBLIC_SEO } from '../../../../shared/config/publicSeo';

const sections: LegalSection[] = [
  {
    id: 'retracto',
    title: 'Derecho de retracto (10 días corridos)',
    body: (
      <>
        <p className="lgl-callout">
          Conforme a la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores (Art. 3 bis),{' '}
          <strong>puedes ejercer tu derecho de retracto dentro de los 10 días corridos</strong> contados desde
          la confirmación del pago o desde que recibes tu Certificado de Compensación.
        </p>
        <p>
          Para solicitar el retracto dentro de ese plazo, escríbenos desde tu correo registrado indicando el
          identificador del pago o certificado. Una vez procesada la devolución, el Certificado asociado se
          revoca (pasa a estado <strong>revocado</strong>) y las unidades de impacto regresan al stock disponible
          del proyecto.
        </p>
      </>
    ),
  },
  {
    id: 'casos',
    title: 'Cuándo sí devolvemos tu dinero',
    body: (
      <ul>
        <li><strong>Cobro duplicado:</strong> se te cobró más de una vez por la misma Compensación.</li>
        <li><strong>Pago sin Certificado:</strong> el pago fue aprobado pero no pudimos asignar la Compensación ni emitir el Certificado (por ejemplo, porque el proyecto se quedó sin cupo).</li>
        <li><strong>Error de monto:</strong> se cobró un valor distinto al informado antes de pagar.</li>
        <li><strong>Proyecto retirado:</strong> el proyecto fue retirado antes de asignar tu Compensación. En este caso puedes elegir el reembolso o reasignar tu aporte a otro proyecto.</li>
      </ul>
    ),
  },
  {
    id: 'como',
    title: 'Cómo solicitarlo',
    body: (
      <>
        <p>
          Escríbenos a <a href={`mailto:${LEGAL.emails.support}`}>{LEGAL.emails.support}</a> desde el
          correo de tu cuenta e incluye la fecha del pago, el monto y el identificador de la
          compensación o el código de autorización de Webpay.
        </p>
        <p>
          Te responderemos en un máximo de 10 días hábiles. Si corresponde el reembolso, lo haremos
          por el mismo medio de pago que usaste. El plazo en que se refleja depende de tu banco o
          emisor de tarjeta.
        </p>
      </>
    ),
  },
  {
    id: 'certificado',
    title: 'Qué pasa con el Certificado',
    body: (
      <p>
        Si reembolsamos una Compensación o ejerces tu derecho de retracto,{' '}
        <strong>el Certificado pasa a estado revocado</strong>, deja de ser válido y el verificador
        público lo muestra como revocado. Además, las unidades de impacto asignadas regresan al stock
        disponible del proyecto.
      </p>
    ),
  },
  {
    id: 'empresas',
    title: 'Empresas',
    body: (
      <p>
        Para Usuarios Empresa con contrato o propuesta particular, las condiciones de facturación y
        devolución son las que establezca ese documento. En lo no regulado, se aplica esta política.
      </p>
    ),
  },
  {
    id: 'reclamos',
    title: 'Reclamos',
    body: (
      <p>
        Si no quedas conforme con nuestra respuesta, puedes acudir al{' '}
        <a href="https://www.sernac.cl" target="_blank" rel="noopener noreferrer">SERNAC</a>. Revisa
        también nuestros <Link to={LEGAL_ROUTES.terms}>Términos y Condiciones</Link>.
      </p>
    ),
  },
];

const RefundsPage: React.FC = () => (
  <LegalLayout
    title={PUBLIC_SEO[LEGAL_ROUTES.refunds].title}
    description={PUBLIC_SEO[LEGAL_ROUTES.refunds].description}
    path={LEGAL_ROUTES.refunds}
    intro={
      <p>
        Queremos que sepas antes de pagar qué pasa si algo sale mal. Aquí explicamos cuándo
        devolvemos tu dinero y cómo pedirlo.
      </p>
    }
    sections={sections}
  />
);

export default RefundsPage;
