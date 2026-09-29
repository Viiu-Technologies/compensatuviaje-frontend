import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout, { type LegalSection } from '../../components/legal/LegalLayout';
import { LEGAL, LEGAL_ROUTES } from '../../../../shared/config/legal';

const sections: LegalSection[] = [
  {
    id: 'retracto',
    title: 'Exclusión del derecho de retracto',
    body: (
      <>
        <p className="lgl-callout">
          Conforme al artículo 3 bis, letra b), de la Ley N° 19.496, informamos de forma expresa que{' '}
          <strong>las compensaciones no admiten derecho de retracto una vez confirmado el pago</strong>.
        </p>
        <p>
          El motivo es que, al confirmarse el pago, la Compensación se asigna al proyecto y el
          Certificado se registra de forma permanente en una red pública. Ese impacto no puede
          “devolverse” ni revenderse. Antes de pagar te pedimos aceptar esta condición de forma
          explícita.
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
        Si reembolsamos una Compensación que ya tenía Certificado, lo anularemos en nuestros
        registros y dejará de ser válido. Como el registro en la red pública es permanente, ese
        registro seguirá existiendo, pero no representará una compensación vigente.
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
    title="Reembolsos y Derecho de Retracto"
    description={`Política de reembolsos de ${LEGAL.brand}: cuándo procede una devolución y por qué las compensaciones no admiten retracto.`}
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
