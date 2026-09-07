import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  FaSearch, FaShieldAlt, FaCheckCircle, FaTimesCircle,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import { searchCertificateByNumber, publicVerifyCertificate } from '../../../shared/services/blockchainApi';
import type { PublicVerification } from '../../../types/blockchain.types';
import { useGsapReveal } from '../hooks/useGsapReveal';
import { Button, Input } from '../../../shared/components/ui';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import { BlockchainESGSVG } from './BlockchainESGSVG';
import './CertificateSearch.css';

const TRUST = [
  'Polygon Blockchain',
  'Retiro Inmutable Auditado',
  'Trazabilidad Pública',
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
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (sampleCode: string) => {
    setQuery(sampleCode);
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
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
                  <span className="hero-line__inner"><em>certificado</em> inmutable.</span>
                </span>
              </h2>

              <p className="cs-sub ctv-reveal">
                Busca por número de certificado o ID de compensación. Todo registrado en
                blockchain pública, auditable por cualquiera.
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

            {/* Chips de prueba rápida 1-Click */}
            <div className="cs-demo-chips ctv-reveal">
              <span className="cs-demo-label">Probar ejemplo:</span>
              <button type="button" className="cs-demo-chip" onClick={() => handleDemoClick('CERT-2024-SCL-MIA-001')}>
                CERT-2024-SCL-MIA-001
              </button>
              <button type="button" className="cs-demo-chip" onClick={() => handleDemoClick('CMP-84920-CL')}>
                CMP-84920-CL
              </button>
            </div>

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
                        <dt>ID de Retiro</dt>
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
                  <div className="cs-result cs-result--err" role="status">
                    <FaTimesCircle className="cs-result__icon" aria-hidden="true" />
                    <div>
                      <p className="cs-result__title">Certificado no encontrado</p>
                      <p className="cs-result__sub">Verifica el número e intenta de nuevo.</p>
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

          {/* Columna derecha: Tarjeta Holográfica 3D */}
          <div className="cs-visual ctv-reveal">
            <div
              className="cs-card-wrapper cs-card-wrapper--holographic"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="cs-hologram-sheen" aria-hidden="true" />
              <BlockchainESGSVG className="cs-certificate-img" style={{ width: '270px', height: '270px' }} />
              <div className="cs-card-meta">
                <span className="cs-card-meta__network">POLYGON MAINNET · RETIRO AUDITADO</span>
                <span className="cs-card-meta__hash">0x71C...4a9b</span>
              </div>
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
