import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import Header from '../Header';
import Footer from '../Footer';
import { LEGAL, LEGAL_ROUTES, OWNER_NAME } from '../../../../shared/config/legal';
import { useSeo } from '../../../../shared/utils/useSeo';
import './LegalLayout.css';

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

interface LegalLayoutProps {
  title: string;
  description: string;
  path: string;
  intro: React.ReactNode;
  sections: LegalSection[];
}

const RELATED = [
  { to: LEGAL_ROUTES.terms, label: 'Términos y Condiciones' },
  { to: LEGAL_ROUTES.privacy, label: 'Política de Privacidad' },
  { to: LEGAL_ROUTES.refunds, label: 'Reembolsos y Retracto' },
  { to: LEGAL_ROUTES.cookies, label: 'Política de Cookies' },
];

/** Estructura común de las páginas legales: índice lateral + secciones numeradas. */
const LegalLayout: React.FC<LegalLayoutProps> = ({ title, description, path, intro, sections }) => {
  useSeo({ title, description, path });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return (
    <div className="lgl-page">
      <Header />

      <main className="lgl-main">
        <div className="lgl-container">
          <Link to="/" className="lgl-back">
            <HiArrowLeft aria-hidden="true" /> Volver al inicio
          </Link>

          <header className="lgl-head">
            <p className="lgl-eyebrow">Legal</p>
            <h1 className="lgl-title">{title}</h1>
            <p className="lgl-meta">Última actualización: {LEGAL.lastUpdated}</p>
            <div className="lgl-intro">{intro}</div>
          </header>

          <div className="lgl-grid">
            <aside className="lgl-toc" aria-label="Contenido">
              <p className="lgl-toc__title">Contenido</p>
              <ol>
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>{s.title}</a>
                  </li>
                ))}
              </ol>

              <p className="lgl-toc__title lgl-toc__title--related">Otros documentos</p>
              <ul>
                {RELATED.filter((r) => r.to !== path).map((r) => (
                  <li key={r.to}>
                    <Link to={r.to}>{r.label}</Link>
                  </li>
                ))}
              </ul>
            </aside>

            <article className="lgl-body">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="lgl-section">
                  <h2>
                    <span className="lgl-num">{i + 1}.</span> {s.title}
                  </h2>
                  {s.body}
                </section>
              ))}

              <footer className="lgl-owner">
                <p>
                  <strong>{OWNER_NAME}</strong>
                  {LEGAL.rut && <> · RUT {LEGAL.rut}</>}
                  <br />
                  {LEGAL.address && <>{LEGAL.address}<br /></>}
                  <a href={`mailto:${LEGAL.emails.contact}`}>{LEGAL.emails.contact}</a>
                </p>
              </footer>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalLayout;
