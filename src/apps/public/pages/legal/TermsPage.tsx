import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout, { type LegalSection } from '../../components/legal/LegalLayout';
import { LEGAL, LEGAL_ROUTES, OWNER_NAME } from '../../../../shared/config/legal';

const sections: LegalSection[] = [
  {
    id: 'proveedor',
    title: 'Identificación del proveedor',
    body: (
      <p>
        El sitio {LEGAL.site.replace('https://', '')} y la plataforma {LEGAL.brand} son operados por{' '}
        <strong>{OWNER_NAME}</strong>
        {LEGAL.rut && <>, RUT {LEGAL.rut}</>}
        {LEGAL.address && <>, con domicilio en {LEGAL.address}</>} (en
        adelante, “{LEGAL.brand}”). Puedes escribirnos a{' '}
        <a href={`mailto:${LEGAL.emails.contact}`}>{LEGAL.emails.contact}</a>.
      </p>
    ),
  },
  {
    id: 'definiciones',
    title: 'Objeto y definiciones',
    body: (
      <>
        <p>
          Estos Términos regulan el uso del sitio y la contratación de servicios de cálculo y
          compensación de emisiones de gases de efecto invernadero. Al crear una cuenta o realizar un
          pago declaras haberlos leído y aceptado.
        </p>
        <ul>
          <li><strong>Usuario Persona:</strong> persona natural que usa la plataforma para fines personales. Tiene la calidad de consumidor según la Ley N° 19.496.</li>
          <li><strong>Usuario Empresa:</strong> persona jurídica que usa la plataforma para sus actividades comerciales, representada por quien declara tener facultades para obligarla.</li>
          <li><strong>Aliado:</strong> desarrollador o titular de un proyecto ambiental que ofrece su impacto a través de la plataforma.</li>
          <li><strong>Compensación:</strong> aporte económico que financia un volumen de reducción o captura de emisiones de un proyecto, equivalente a la huella calculada.</li>
          <li><strong>Certificado:</strong> constancia digital emitida por {LEGAL.brand} que acredita una Compensación y puede verificarse públicamente.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'cuenta',
    title: 'Registro y cuenta',
    body: (
      <>
        <p>
          Para comprar compensaciones debes registrarte con datos veraces y ser mayor de 18 años. Eres
          responsable de la confidencialidad de tus credenciales y de toda actividad realizada desde tu
          cuenta. Avísanos de inmediato si detectas un uso no autorizado.
        </p>
        <p>
          Las cuentas de Usuario Empresa quedan sujetas a un proceso de verificación de antecedentes.
          Podemos rechazar o suspender una cuenta cuando la información entregada sea falsa o
          incompleta, o cuando se use la plataforma en contra de estos Términos.
        </p>
      </>
    ),
  },
  {
    id: 'calculo',
    title: 'Cálculo de la huella de carbono',
    body: (
      <>
        <p>
          La calculadora entrega una <strong>estimación</strong> basada en factores de emisión
          públicos de referencia (entre ellos DEFRA/DESNZ del Reino Unido y metodologías compatibles
          con el GHG Protocol) y en los datos que tú ingresas. El resultado depende de la exactitud de
          esos datos y de los supuestos de la metodología.
        </p>
        <p>
          El cálculo no constituye una auditoría ni una verificación de inventario de emisiones por un
          tercero independiente. Si una Empresa necesita reportar bajo un estándar específico, es su
          responsabilidad confirmar que la metodología cumple los requisitos de ese estándar.
        </p>
      </>
    ),
  },
  {
    id: 'compra',
    title: 'Contratación, precio y pago',
    body: (
      <>
        <p>
          Antes de pagar verás el proyecto elegido, el volumen de emisiones a compensar y el precio
          total en pesos chilenos, con los impuestos que correspondan. El precio informado al momento
          de confirmar es el que se cobra.
        </p>
        <p>
          Los pagos se procesan a través de Webpay (Transbank). {LEGAL.brand} no recibe ni almacena los
          datos de tu tarjeta. La contratación se perfecciona cuando Transbank confirma el pago; en
          ese momento te enviaremos la confirmación por correo electrónico.
        </p>
        <p>
          Emitiremos el documento tributario que corresponda (boleta o factura electrónica) según la
          normativa del Servicio de Impuestos Internos.
        </p>
      </>
    ),
  },
  {
    id: 'proyectos',
    title: 'Proyectos y certificados',
    body: (
      <>
        <p>
          Cada proyecto muestra en su ficha el tipo de iniciativa, su ubicación y el impacto que
          ofrece. Antes de publicarse, pasa por <strong>Veritas AI</strong>, nuestro proceso de
          verificación: agentes de inteligencia artificial revisan la documentación entregada por el
          Aliado (titularidad, permisos, evidencia de impacto y coherencia de las cifras) y luego una
          persona de nuestro equipo la valida y aprueba. La veracidad de la documentación es
          responsabilidad del Aliado.
        </p>
        <p className="lgl-callout">
          Los Certificados son emitidos por {LEGAL.brand} a partir de este proceso propio.{' '}
          <strong>No son créditos de carbono registrados en estándares internacionales</strong> (como
          Verra VCS o Gold Standard) ni han sido validados por un organismo verificador independiente,
          salvo que la ficha del proyecto lo indique expresamente con su enlace al registro
          correspondiente.
        </p>
        <p>
          Una vez confirmado el pago, asignamos la Compensación al proyecto elegido y emitimos tu
          Certificado. El Certificado se registra en una red blockchain pública para que cualquiera
          pueda verificarlo; ese registro es permanente y no puede modificarse ni eliminarse. Revisa
          qué datos incluye en la{' '}
          <Link to={LEGAL_ROUTES.privacy}>Política de Privacidad</Link>.
        </p>
        <p>
          El Certificado acredita tu aporte a un proyecto determinado. No es un instrumento financiero,
          no es transferible como crédito de carbono y no otorga derechos sobre el proyecto.
        </p>
      </>
    ),
  },
  {
    id: 'retracto',
    title: 'Derecho de retracto y reembolsos',
    body: (
      <p className="lgl-callout">
        De acuerdo con el artículo 3 bis de la Ley N° 19.496, informamos de forma expresa que{' '}
        <strong>no procede el derecho de retracto</strong> una vez confirmado el pago, porque la
        Compensación se asigna y el Certificado se emite de inmediato. Los casos en que sí
        corresponde un reembolso se detallan en la{' '}
        <Link to={LEGAL_ROUTES.refunds}>Política de Reembolsos y Retracto</Link>.
      </p>
    ),
  },
  {
    id: 'empresas',
    title: 'Condiciones para Empresas',
    body: (
      <p>
        Los servicios corporativos (compensación por volumen, reportes, gestión de usuarios y
        emisión de certificados corporativos) pueden regirse además por una propuesta o contrato
        particular. Si existe contradicción, prevalece lo pactado en ese contrato. Las Empresas
        declaran que usarán los Certificados y reportes de forma fiel a su contenido y no los
        presentarán como una verificación independiente de su inventario de emisiones ni como
        créditos de carbono registrados en un estándar internacional.
      </p>
    ),
  },
  {
    id: 'aliados',
    title: 'Condiciones para Aliados',
    body: (
      <p>
        Los Aliados declaran que son titulares o están autorizados para ofrecer el impacto de sus
        proyectos, que la información y la documentación que suben es veraz, y que no ofrecen el
        mismo impacto a través de otros canales de forma que genere doble contabilización. Podemos
        pausar o retirar un proyecto si detectamos inconsistencias. Las condiciones comerciales de
        cada Aliado se regulan en su acuerdo particular.
      </p>
    ),
  },
  {
    id: 'uso',
    title: 'Uso aceptable',
    body: (
      <ul>
        <li>No usar la plataforma para fines ilícitos ni para suplantar a otra persona o empresa.</li>
        <li>No intentar acceder a cuentas, datos o sistemas sin autorización, ni interferir con su funcionamiento.</li>
        <li>No alterar, falsificar ni presentar de forma engañosa los Certificados emitidos.</li>
        <li>No extraer de forma automatizada el contenido del sitio sin autorización escrita.</li>
      </ul>
    ),
  },
  {
    id: 'propiedad',
    title: 'Propiedad intelectual',
    body: (
      <p>
        La marca {LEGAL.brand}, el logotipo, el diseño, el software y los contenidos del sitio
        pertenecen a {OWNER_NAME} o a sus licenciantes. Puedes compartir tus Certificados y
        tu perfil de impacto, pero no puedes reproducir ni explotar comercialmente el resto del
        contenido sin autorización.
      </p>
    ),
  },
  {
    id: 'responsabilidad',
    title: 'Responsabilidad',
    body: (
      <>
        <p>
          Trabajamos para que la plataforma esté disponible y sea precisa, pero puede haber
          interrupciones por mantenimiento o por causas ajenas a nosotros. Respondemos por los
          servicios contratados conforme a la ley.
        </p>
        <p>
          Nada en estos Términos limita los derechos irrenunciables que la Ley N° 19.496 reconoce a
          los consumidores.
        </p>
      </>
    ),
  },
  {
    id: 'cambios',
    title: 'Modificaciones',
    body: (
      <p>
        Podemos actualizar estos Términos. Publicaremos la nueva versión en esta página con su fecha
        y, si el cambio es relevante, te avisaremos por correo antes de que entre en vigencia. Las
        compras ya realizadas se rigen por los Términos vigentes al momento de la compra.
      </p>
    ),
  },
  {
    id: 'ley',
    title: 'Ley aplicable y reclamos',
    body: (
      <p>
        Estos Términos se rigen por las leyes de la República de Chile. Si tienes un problema,
        escríbenos primero a{' '}
        <a href={`mailto:${LEGAL.emails.support}`}>{LEGAL.emails.support}</a> y te responderemos en
        un plazo máximo de 10 días hábiles. Como consumidor, también puedes presentar un reclamo ante
        el <a href="https://www.sernac.cl" target="_blank" rel="noopener noreferrer">SERNAC</a> o
        ante el Juzgado de Policía Local competente.
      </p>
    ),
  },
];

const TermsPage: React.FC = () => (
  <LegalLayout
    title="Términos y Condiciones"
    description={`Condiciones de uso de ${LEGAL.brand}: cálculo de huella de carbono, compra de compensaciones, certificados, retracto y reclamos.`}
    path={LEGAL_ROUTES.terms}
    intro={
      <p>
        Estas condiciones aplican a personas y empresas que usan {LEGAL.brand} para calcular y
        compensar la huella de carbono de sus viajes, y a los aliados que publican proyectos.
      </p>
    }
    sections={sections}
  />
);

export default TermsPage;
