import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout, { type LegalSection } from '../../components/legal/LegalLayout';
import { LEGAL, LEGAL_ROUTES } from '../../../../shared/config/legal';

// Proveedores que tratan datos por cuenta de CompensaTuViaje. Mantener
// sincronizado con las integraciones reales del backend.
const PROCESSORS = [
  { name: 'Supabase', purpose: 'Autenticación e inicio de sesión (incluido Google)', location: 'Estados Unidos' },
  { name: 'Railway', purpose: 'Servidores de la aplicación y base de datos', location: 'Estados Unidos' },
  { name: 'Vercel', purpose: 'Alojamiento del sitio web', location: 'Estados Unidos' },
  { name: 'Cloudflare R2', purpose: 'Almacenamiento de documentos y archivos', location: 'Estados Unidos / global' },
  { name: 'Resend y proveedor SMTP', purpose: 'Envío de correos transaccionales y newsletter', location: 'Estados Unidos' },
  { name: 'Transbank (Webpay)', purpose: 'Procesamiento de pagos', location: 'Chile' },
  { name: 'Google (Gemini)', purpose: 'Análisis automatizado de documentos de Aliados y Empresas', location: 'Estados Unidos' },
  { name: 'Telegram', purpose: 'Notificaciones internas a nuestro equipo sobre solicitudes de Aliados', location: 'Global' },
  { name: 'Pinata (IPFS) y red Polygon', purpose: 'Registro público de Certificados', location: 'Red descentralizada' },
];

const sections: LegalSection[] = [
  {
    id: 'responsable',
    title: 'Responsable del tratamiento',
    body: (
      <p>
        El responsable de tus datos personales es <strong>{LEGAL.legalName}</strong>, RUT{' '}
        {LEGAL.rut}, con domicilio en {LEGAL.address}. Para cualquier consulta sobre privacidad
        escríbenos a <a href={`mailto:${LEGAL.emails.privacy}`}>{LEGAL.emails.privacy}</a>.
      </p>
    ),
  },
  {
    id: 'datos',
    title: 'Qué datos tratamos',
    body: (
      <ul>
        <li><strong>Cuenta:</strong> nombre, correo electrónico, contraseña cifrada o identificador de Google, y preferencias.</li>
        <li><strong>Viajes y cálculos:</strong> origen, destino, fechas, medio de transporte, pasajeros y emisiones calculadas.</li>
        <li><strong>Empresas:</strong> razón social, RUT, giro, datos de facturación, datos de contacto del representante y de los usuarios que la empresa invite.</li>
        <li><strong>Aliados:</strong> datos del titular del proyecto y la documentación que suban para su verificación.</li>
        <li><strong>Pagos:</strong> monto, fecha, estado y código de autorización. <strong>No recibimos ni guardamos los datos de tu tarjeta</strong>; los procesa Transbank.</li>
        <li><strong>Comunicaciones:</strong> mensajes que nos envías por formularios o correo, y tu suscripción al newsletter.</li>
        <li><strong>Datos técnicos:</strong> dirección IP, navegador y registros de actividad necesarios para la seguridad del servicio.</li>
      </ul>
    ),
  },
  {
    id: 'finalidades',
    title: 'Para qué los usamos y con qué base legal',
    body: (
      <div className="lgl-table-wrap">
        <table className="lgl-table">
          <thead>
            <tr><th>Finalidad</th><th>Base de licitud</th></tr>
          </thead>
          <tbody>
            <tr><td>Crear tu cuenta, calcular tu huella, procesar tu compra y emitir tu Certificado</td><td>Ejecución del contrato</td></tr>
            <tr><td>Emitir boletas o facturas y llevar la contabilidad</td><td>Obligación legal</td></tr>
            <tr><td>Verificar a Empresas y Aliados y prevenir fraude</td><td>Interés legítimo</td></tr>
            <tr><td>Responder consultas y dar soporte</td><td>Ejecución del contrato o interés legítimo</td></tr>
            <tr><td>Enviarte el newsletter y novedades</td><td>Consentimiento (puedes retirarlo en cualquier correo)</td></tr>
            <tr><td>Mostrar tu perfil público de impacto</td><td>Consentimiento (solo si lo activas)</td></tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: 'terceros',
    title: 'Con quién compartimos datos',
    body: (
      <>
        <p>
          No vendemos tus datos. Los compartimos solo con proveedores que nos prestan servicios y que
          los tratan por nuestra cuenta, bajo obligaciones de confidencialidad y seguridad:
        </p>
        <div className="lgl-table-wrap">
          <table className="lgl-table">
            <thead>
              <tr><th>Proveedor</th><th>Uso</th><th>Ubicación</th></tr>
            </thead>
            <tbody>
              {PROCESSORS.map((p) => (
                <tr key={p.name}><td>{p.name}</td><td>{p.purpose}</td><td>{p.location}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          También compartimos con el Aliado del proyecto que elijas la información agregada de la
          Compensación (volumen y fecha), sin tus datos de contacto. Podemos entregar datos a
          autoridades cuando la ley lo exija.
        </p>
      </>
    ),
  },
  {
    id: 'transferencias',
    title: 'Transferencias internacionales',
    body: (
      <p>
        Varios de nuestros proveedores están fuera de Chile, principalmente en Estados Unidos. En
        esos casos exigimos contractualmente un nivel de protección adecuado y usamos proveedores que
        aplican medidas de seguridad reconocidas internacionalmente.
      </p>
    ),
  },
  {
    id: 'blockchain',
    title: 'Registro público de Certificados',
    body: (
      <>
        <p className="lgl-callout">
          Cada Certificado se registra en IPFS y en la red pública Polygon para que pueda verificarse
          sin depender de nosotros. <strong>Ese registro es permanente: no puede modificarse ni
          eliminarse</strong>, ni siquiera si cierras tu cuenta.
        </p>
        <p>
          El registro público incluye el identificador de la Compensación, las toneladas de CO₂, el
          proyecto y su país, el tipo de viaje y, cuando corresponde, el origen, el destino y la fecha
          del viaje. <strong>No incluye tu nombre, correo ni RUT.</strong> La relación entre un
          Certificado y tu identidad solo existe en nuestra base de datos, donde sí puedes pedir su
          eliminación.
        </p>
      </>
    ),
  },
  {
    id: 'perfil',
    title: 'Perfil público de impacto',
    body: (
      <p>
        Puedes activar un perfil público que muestra tu impacto acumulado. Está desactivado por
        defecto; puedes activarlo o desactivarlo cuando quieras desde tu cuenta y, al desactivarlo,
        deja de estar accesible.
      </p>
    ),
  },
  {
    id: 'automatizadas',
    title: 'Evaluaciones automatizadas',
    body: (
      <p>
        Usamos inteligencia artificial para hacer una primera revisión de la documentación que envían
        Aliados y Empresas. Esa revisión no decide por sí sola: la aprobación final la hace una
        persona de nuestro equipo, y puedes pedir que se revise manualmente cualquier resultado.
      </p>
    ),
  },
  {
    id: 'conservacion',
    title: 'Cuánto tiempo guardamos los datos',
    body: (
      <ul>
        <li>Datos de cuenta: mientras la cuenta esté activa y hasta 12 meses después de cerrarla.</li>
        <li>Datos de compras y documentos tributarios: 6 años, por obligación tributaria.</li>
        <li>Newsletter: hasta que te des de baja.</li>
        <li>Registros técnicos de seguridad: hasta 12 meses.</li>
      </ul>
    ),
  },
  {
    id: 'derechos',
    title: 'Tus derechos',
    body: (
      <>
        <p>
          Puedes ejercer tus derechos de <strong>acceso, rectificación, supresión, oposición,
          portabilidad y bloqueo</strong> de tus datos, y retirar tu consentimiento en cualquier
          momento, escribiendo a{' '}
          <a href={`mailto:${LEGAL.emails.privacy}`}>{LEGAL.emails.privacy}</a> desde el correo
          asociado a tu cuenta. El ejercicio de estos derechos es gratuito.
        </p>
        <p>
          Responderemos dentro de 30 días corridos, plazo que podremos extender una vez por igual
          período si la solicitud es compleja, informándote el motivo. Si no quedas conforme, puedes
          reclamar ante la Agencia de Protección de Datos Personales.
        </p>
      </>
    ),
  },
  {
    id: 'seguridad',
    title: 'Seguridad',
    body: (
      <p>
        Usamos conexiones cifradas (HTTPS), contraseñas almacenadas con hash, control de acceso por
        roles y respaldos. Si ocurre una vulneración de seguridad que afecte tus datos, te
        informaremos a ti y a la autoridad según lo exija la ley.
      </p>
    ),
  },
  {
    id: 'menores',
    title: 'Menores de edad',
    body: (
      <p>
        La plataforma no está dirigida a menores de 18 años y no recolectamos sus datos de forma
        intencional. Si detectamos una cuenta de un menor, la eliminaremos.
      </p>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies y almacenamiento local',
    body: (
      <p>
        Solo usamos almacenamiento técnico necesario para que el sitio funcione. El detalle está en
        la <Link to={LEGAL_ROUTES.cookies}>Política de Cookies</Link>.
      </p>
    ),
  },
  {
    id: 'cambios',
    title: 'Cambios a esta política',
    body: (
      <p>
        Si cambiamos esta política publicaremos la nueva versión aquí con su fecha y, si el cambio es
        relevante, te avisaremos por correo.
      </p>
    ),
  },
];

const PrivacyPage: React.FC = () => (
  <LegalLayout
    title="Política de Privacidad"
    description={`Cómo ${LEGAL.brand} trata tus datos personales: qué recolectamos, para qué, con quién los compartimos y cómo ejercer tus derechos.`}
    path={LEGAL_ROUTES.privacy}
    intro={
      <p>
        Esta política explica cómo tratamos los datos personales de quienes usan {LEGAL.brand}, de
        acuerdo con la Ley N° 19.628 sobre protección de la vida privada y la Ley N° 21.719.
      </p>
    }
    sections={sections}
  />
);

export default PrivacyPage;
