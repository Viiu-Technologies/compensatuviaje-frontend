import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch, FaShieldAlt, FaCheckCircle, FaTimesCircle,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import { searchCertificateByNumber, publicVerifyCertificate } from '../../../shared/services/blockchainApi';
import type { PublicVerification } from '../../../types/blockchain.types';
import { useGsapReveal, reveal, sectionTimeline } from '../hooks/useGsapReveal';
import { enterFrom, expandPlate, parallax, scrubThrough } from '../hooks/motion';
import { useDarkHeaderOver } from '../hooks/useHeaderTheme';
import { Button, Input } from '../../../shared/components/ui';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import VerificationFlow, { type FlowData } from './verificationFlow/VerificationFlow';
import './CertificateSearch.css';

const TRUST = [
  'Verificación pública',
  'Registro de CompensaTuViaje',
  'Respaldo en Polygon si está acuñado',
];

// Curvas de nivel del fondo: un mismo contorno, centrado en el origen, repetido
// a distintas escalas en dos cerros.
const TOPO_CONTOUR =
  'M-10 -165 C110 -185 230 -105 210 15 C195 115 90 185 -20 165 C-140 145 -220 65 -200 -45 C-185 -115 -110 -150 -10 -165 Z';
const TOPO_SCALES = [0.3, 0.55, 0.8, 1.05, 1.3, 1.6, 1.95];
const TOPO_CLUSTERS = [
  { x: 1010, y: 150, rotate: 0 },
  { x: 140, y: 610, rotate: 140 },
];

const CertificateSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicVerification | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    // El fondo sigue al scroll: la placa oscura se abre al llegar y, mientras
    // la sección cruza la pantalla, el resplandor la recorre y las curvas de
    // nivel se quedan atrás.
    expandPlate('.cs-plate', root);
    // En móvil solo se abre la placa: las dos capas que se desplazan ocupan
    // toda la sección y repintarlas en cada cuadro de scroll no compensa en
    // una pantalla donde apenas se aprecian.
    if (window.matchMedia('(min-width: 768px)').matches) {
      scrubThrough('.cs-plate__glow', root, { xPercent: -35, yPercent: -20 }, { xPercent: 35, yPercent: 25 });
      parallax('.cs-plate__topo', root, 70);
    }

    // El contenido entra desde los lados: el texto y el buscador por la
    // izquierda, el recorrido de la verificación por la derecha, girando.
    const tl = sectionTimeline(root);
    tl.add(enterFrom('.cs-eyebrow', 'left', { x: -24, duration: 0.5 }), 0);
    tl.add(reveal(root, '.cs-title'), 0.05);
    tl.add(enterFrom('.cs-sub', 'left', { x: -24, duration: 0.5 }), 0.15);
    tl.add(enterFrom('.cs-form', 'left'), 0.22);
    tl.from('.cs-trust > *', { y: 8, autoAlpha: 0, stagger: 0.06, duration: 0.4 }, 0.4);
    tl.add(enterFrom('.cs-visual', 'right', { x: 72, rotationY: -16, duration: 0.9 }), 0.15);
  }, []);
  // Sección oscura: el header pasa a texto claro mientras está encima.
  useDarkHeaderOver(scopeRef);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);

    try {
      const trimmed = query.trim();
      const res: PublicVerification =
        trimmed.startsWith('CERT-') || trimmed.startsWith('cert-')
          ? await searchCertificateByNumber(trimmed)
          : await publicVerifyCertificate(trimmed);
      setResult(res);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Un certificado es válido si está emitido, tenga o no NFT. La ilustración
  // de la cadena de bloques solo usa datos reales cuando el NFT existe.
  const minted = Boolean(result?.blockchain?.minted && result.blockchain.txHash && result.certificate?.tokenId);

  // La ilustración cuenta el resultado: esquema de ejemplo, certificado
  // registrado en blockchain (con sus datos reales) o no encontrado.
  const flow: FlowData =
    result?.valid && result.certificate && minted
      ? {
          status: 'valid',
          kg: result.certificate.co2AmountKg,
          tokenId: result.certificate.tokenId!,
          network: 'Polygon',
          txHash: result.blockchain!.txHash!,
        }
      : searched && !loading && (error || (result && !result.valid))
        ? { status: 'invalid' }
        : { status: 'demo' };

  return (
    <section ref={scopeRef} className="cs-section" id="verificar" data-tone="dark">
      {/* Fondo: placa oscura con un resplandor y curvas de nivel (el terreno
          que se regenera) sobre una retícula fina (el registro). */}
      <div className="cs-plate" aria-hidden="true">
        <div className="cs-plate__grid" />
        <div className="cs-plate__glow" />
        <svg className="cs-plate__topo" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" focusable="false">
          {TOPO_CLUSTERS.map(({ x, y, rotate }) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${rotate})`}>
              {TOPO_SCALES.map((s) => (
                <path key={s} d={TOPO_CONTOUR} transform={`scale(${s})`} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
          ))}
        </svg>
      </div>
      <div className="cs-container">
        <div className="cs-grid">
          {/* Columna izquierda: formulario y resultados */}
          <div className="cs-content">
            <header className="cs-header">
              <span className="cs-eyebrow ctv-reveal">
                <span className="cs-eyebrow__line" />
                Verificación pública
              </span>

              <h2 className="cs-title">
                <span className="hero-line"><span className="hero-line__inner">Verifica tu certificado</span></span>
                <span className="hero-line"><span className="hero-line__inner cs-title__accent">en segundos.</span></span>
              </h2>

              <p className="cs-sub ctv-reveal">
                Busca por número de certificado o ID de compensación. Si el certificado también
                está registrado en blockchain, verás su transacción en Polygon.
              </p>
            </header>

            <form className="cs-form ctv-reveal" onSubmit={handleSearch}>
              <Input
                label="Número de certificado o ID de compensación"
                hideLabel
                bare
                fullWidth={false}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="CERT-2024-SCL-MIA-001 o ID de compensación"
                iconLeft={<FaSearch />}
              />
              <Button
                type="submit"
                variant="secondary"
                loading={loading}
                loadingLabel="Verificando certificado…"
                disabled={!query.trim()}
              >
                Verificar
              </Button>
            </form>

            {/* Resultados */}
            {searched && !loading && (
              <div className="cs-result-wrap" data-tone="light">
                {result?.valid && result.certificate && (
                  <div className="cs-result cs-result--ok">
                    <div className="cs-result__head">
                      <FaCheckCircle className="cs-result__icon" aria-hidden="true" />
                      <div>
                        <p className="cs-result__title">Certificado válido</p>
                        <p className="cs-result__sub">
                          {minted
                            ? 'Emitido por CompensaTuViaje y registrado en la blockchain de Polygon.'
                            : 'Emitido por CompensaTuViaje y vigente en nuestro registro.'}
                        </p>
                      </div>
                    </div>

                    <dl className="cs-stats">
                      <div className="cs-stat">
                        <dt>N.º de certificado</dt>
                        <dd>{result.certificate.certificateNumber}</dd>
                      </div>
                      <div className="cs-stat">
                        <dt>CO₂ de la contribución</dt>
                        <dd>{result.certificate.co2AmountKg.toFixed(2)} kg</dd>
                      </div>
                      <div className="cs-stat">
                        <dt>Proyecto</dt>
                        <dd className="cs-stat__sm">{result.certificate.projectName}</dd>
                      </div>
                      {result.certificate.integrityHash && (
                        <div className="cs-stat">
                          <dt>Sello SHA-256</dt>
                          <dd className="cs-stat__sm" title={result.certificate.integrityHash}>
                            {result.certificate.integrityHash.slice(0, 16)}…
                          </dd>
                        </div>
                      )}
                    </dl>

                    <div className="cs-result-actions">
                      <button
                        className="cs-action"
                        onClick={() => navigate(`/verificar/${encodeURIComponent(result.certificate!.certificateNumber)}`)}
                      >
                        <FaShieldAlt aria-hidden="true" />
                        Ver certificado completo
                      </button>
                      {minted && result.blockchain?.txHash && (
                        <a
                          href={`https://polygonscan.com/tx/${result.blockchain.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cs-action cs-action--ghost"
                        >
                          <FaExternalLinkAlt aria-hidden="true" />
                          Polygonscan
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {(!result?.valid || !result?.certificate) && !error && (
                  <div className="cs-result cs-result--err" role="status">
                    <FaTimesCircle className="cs-result__icon" aria-hidden="true" />
                    <div>
                      {result?.status === 'revoked' ? (
                        <>
                          <p className="cs-result__title">Certificado revocado</p>
                          <p className="cs-result__sub">
                            Este certificado fue anulado y ya no es válido. Si tienes dudas, escríbenos.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="cs-result__title">Certificado no encontrado</p>
                          <p className="cs-result__sub">Verifica el número e intenta de nuevo.</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="cs-result cs-result--err" role="alert">
                    <FaTimesCircle className="cs-result__icon" aria-hidden="true" />
                    <div>
                      <p className="cs-result__title">No se pudo completar la verificación</p>
                      <p className="cs-result__sub">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <ul className="cs-trust ctv-reveal">
              {TRUST.map((label) => (
                <li key={label} className="cs-trust__item">
                  <span className="cs-trust__dot" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Columna derecha: cómo se verifica (certificado → huella → cadena → registro) */}
          <div className="cs-visual ctv-reveal">
            <VerificationFlow data={flow} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CertificateSearch;
