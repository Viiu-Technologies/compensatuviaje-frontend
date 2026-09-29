import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout, { type LegalSection } from '../../components/legal/LegalLayout';
import { LEGAL, LEGAL_ROUTES } from '../../../../shared/config/legal';

// Almacenamiento real que usa el frontend. Si se agrega analítica o
// publicidad (GA, Meta Pixel, etc.) hay que listarla aquí y pedir
// consentimiento previo con un banner.
const STORAGE = [
  { name: 'access_token, refresh_token', type: 'Almacenamiento local', purpose: 'Mantener tu sesión iniciada', duration: 'Hasta cerrar sesión' },
  { name: 'Sesión de Supabase (sb-*)', type: 'Almacenamiento local', purpose: 'Autenticación e inicio de sesión con Google', duration: 'Hasta cerrar sesión' },
  { name: 'Tema visual', type: 'Almacenamiento local', purpose: 'Recordar si prefieres modo claro u oscuro', duration: 'Persistente' },
  { name: 'Borradores de formularios', type: 'Almacenamiento local', purpose: 'No perder lo que escribiste en el registro de empresa y perfil', duration: 'Hasta completar el formulario' },
];

const sections: LegalSection[] = [
  {
    id: 'que-usamos',
    title: 'Qué usamos',
    body: (
      <>
        <p>
          {LEGAL.brand} <strong>no usa cookies de publicidad ni de analítica de terceros</strong>.
          Solo usamos almacenamiento técnico en tu navegador, necesario para que el sitio funcione:
        </p>
        <div className="lgl-table-wrap">
          <table className="lgl-table">
            <thead>
              <tr><th>Elemento</th><th>Tipo</th><th>Finalidad</th><th>Duración</th></tr>
            </thead>
            <tbody>
              {STORAGE.map((s) => (
                <tr key={s.name}><td>{s.name}</td><td>{s.type}</td><td>{s.purpose}</td><td>{s.duration}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: 'terceros',
    title: 'Servicios de terceros',
    body: (
      <p>
        Al cargar el sitio, tu navegador solicita las tipografías a Google Fonts, que recibe tu
        dirección IP para entregarlas. Al pagar, Webpay (Transbank) puede usar sus propias cookies
        en su sitio, bajo sus políticas.
      </p>
    ),
  },
  {
    id: 'control',
    title: 'Cómo controlarlas',
    body: (
      <p>
        Puedes borrar el almacenamiento local desde la configuración de tu navegador. Si lo haces se
        cerrará tu sesión y perderás tus preferencias. Si en el futuro incorporamos cookies no
        esenciales, te pediremos tu consentimiento antes de activarlas.
      </p>
    ),
  },
  {
    id: 'mas',
    title: 'Más información',
    body: (
      <p>
        Revisa nuestra <Link to={LEGAL_ROUTES.privacy}>Política de Privacidad</Link> o escríbenos a{' '}
        <a href={`mailto:${LEGAL.emails.privacy}`}>{LEGAL.emails.privacy}</a>.
      </p>
    ),
  },
];

const CookiesPage: React.FC = () => (
  <LegalLayout
    title="Política de Cookies"
    description={`Qué cookies y almacenamiento local usa ${LEGAL.brand} y cómo controlarlos.`}
    path={LEGAL_ROUTES.cookies}
    intro={<p>Te contamos qué guardamos en tu navegador y para qué.</p>}
    sections={sections}
  />
);

export default CookiesPage;
