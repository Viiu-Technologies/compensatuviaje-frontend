import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  FaSearch, FaShieldAlt, FaCheckCircle, FaTimesCircle,
  FaExternalLinkAlt, FaSpinner,
} from 'react-icons/fa';
import { searchCertificateByNumber, publicVerifyCertificate } from '../../../shared/services/blockchainApi';
import type { PublicVerification } from '../../../types/blockchain.types';
import { useGsapReveal } from '../hooks/useGsapReveal';
import { PlanetDataSVG } from './Illustrations';
import './CertificateSearch.css';

const TRUST = [
  'Polygon Blockchain',
  'ERC-721 Verificado',
  'Impacto Trazable',
];

const CertificateSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicVerification | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    gsap.set(root.querySelectorAll('.ctv-reveal'), { autoAlpha: 1 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
    tl.from('.cs-eyebrow', { y: 12, autoAlpha: 0, duration: 0.6 }, 0);
    tl.from('.cs-title .hero-line__inner', {
      yPercent: 110, stagger: 0.1, duration: 0.9,
    }, 0.1);
    tl.from('.cs-sub', { y: 14, autoAlpha: 0, duration: 0.6 }, 0.4);
    tl.from('.cs-form', { y: 20, autoAlpha: 0, duration: 0.7 }, 0.55);
    tl.from('.cs-trust > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, 0.7);
    tl.from('.cs-visual', { x: 24, autoAlpha: 0, duration: 0.85 }, 0.5);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);

    try {
      const res: PublicVerification =
        query.startsWith('CERT-') || query.startsWith('cert-')
          ? await searchCertificateByNumber(query.trim())
          : await publicVerifyCertificate(query.trim());
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error al buscar el certificado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={scopeRef} className="cs-section" id="verificar">
      <div className="cs-container">
        <div className="cs-grid">
          {/* Columna izquierda: formulario y resultados */}
          <div className="cs-content">
            <header className="cs-header">
              <span className="cs-eyebrow ctv-reveal">
                <span className="cs-eyebrow__line" />
                Verificación blockchain
              </span>

              <h2 className="cs-title">
                <span className="hero-line"><span className="hero-line__inner">Verifica tu</span></span>
                <span className="hero-line cs-title--accent">
                  <span className="hero-line__inner"><em>certificado</em> NFT.</span>
                </span>
              </h2>

              <p className="cs-sub ctv-reveal">
                Busca por número de certificado o ID de compensación. Todo registrado en
                blockchain pública, auditable por cualquiera.
              </p>
            </header>

            <form className="cs-form ctv-reveal" onSubmit={handleSearch}>
              <div className="cs-input-wrap">
                <FaSearch className="cs-input-icon" aria-hidden="true" />
                <input
                  type="text"
                  className="cs-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="CERT-2024-SCL-MIA-001 o ID de compensación"
                />
              </div>
              <button type="submit" className="cs-btn" disabled={loading || !query.trim()}>
                {loading ? <FaSpinner className="cs-spin" aria-hidden="true" /> : null}
                Verificar
              </button>
            </form>

            {/* Resultados */}
            {searched && !loading && (
              <div className="cs-result-wrap">
                {result?.valid && result.certificate && (
                  <div className="cs-result cs-result--ok">
                    <div className="cs-result__head">
                      <FaCheckCircle className="cs-result__icon" aria-hidden="true" />
                      <div>
                        <p className="cs-result__title">Certificado auténtico</p>
                        <p className="cs-result__sub">
                          Existe en la blockchain y los datos coinciden con el registro.
                        </p>
                      </div>
                    </div>

                    <dl className="cs-stats">
                      <div className="cs-stat">
                        <dt>Token ID</dt>
                        <dd>#{result.certificate.tokenId}</dd>
                      </div>
                      <div className="cs-stat">
                        <dt>CO₂ compensado</dt>
                        <dd>{result.certificate.co2AmountKg.toFixed(2)} kg</dd>
                      </div>
                      <div className="cs-stat">
                        <dt>Proyecto</dt>
                        <dd className="cs-stat__sm">{result.certificate.projectName}</dd>
                      </div>
                    </dl>

                    <div className="cs-result-actions">
                      <button
                        className="cs-action"
                        onClick={() => navigate(`/verify/${result.certificate!.compensationId}`)}
                      >
                        <FaShieldAlt aria-hidden="true" />
                        Ver detalles
                      </button>
                      {result.blockchain?.txHash && (
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
                  <div className="cs-result cs-result--err">
                    <FaTimesCircle className="cs-result__icon" aria-hidden="true" />
                    <div>
                      <p className="cs-result__title">Certificado no encontrado</p>
                      <p className="cs-result__sub">Verifica el número e intenta de nuevo.</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="cs-result cs-result--err">
                    <FaTimesCircle className="cs-result__icon" aria-hidden="true" />
                    <div>
                      <p className="cs-result__title">Error</p>
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

          {/* Columna derecha: Visual e ilustración */}
          <div className="cs-visual ctv-reveal">
            <div className="cs-card-wrapper">
              <PlanetDataSVG className="cs-certificate-img" style={{ width: '220px', height: '220px' }} />
              <div className="cs-card-badge">
                <FaShieldAlt className="cs-card-badge__icon" aria-hidden="true" />
                <span>100% Seguro & Transparente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CertificateSearch;
