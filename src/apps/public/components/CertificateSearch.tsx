import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch, FaShieldAlt, FaCheckCircle, FaTimesCircle,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import { searchCertificateByNumber, publicVerifyCertificate } from '../../../shared/services/blockchainApi';
import type { PublicVerification } from '../../../types/blockchain.types';
import { useGsapReveal, reveal, sectionTimeline } from '../hooks/useGsapReveal';
import { Button, Input } from '../../../shared/components/ui';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import VerificationFlow, { type FlowData } from './verificationFlow/VerificationFlow';
import './CertificateSearch.css';

const TRUST = [
  'Polygon Blockchain',
  'Registro inmutable en blockchain',
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
    const tl = sectionTimeline(root);
    tl.from('.cs-eyebrow', { y: 10, autoAlpha: 0 }, 0);
    tl.add(reveal(root, '.cs-title'), 0.05);
    tl.add(reveal(root, '.cs-sub', 'text'), 0.15);
    tl.from('.cs-form', { y: 14, autoAlpha: 0 }, 0.2);
    tl.from('.cs-trust > *', { y: 8, autoAlpha: 0, stagger: 0.05, duration: 0.4 }, 0.28);
    tl.from('.cs-visual', { x: 16, autoAlpha: 0, duration: 0.6 }, 0.2);
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

  // La ilustración cuenta el resultado: esquema de ejemplo, certificado
  // verificado (con sus datos reales) o no encontrado.
  const flow: FlowData =
    result?.valid && result.certificate
      ? {
          status: 'valid',
          kg: result.certificate.co2AmountKg,
          tokenId: result.certificate.tokenId,
          network: result.blockchain?.network ?? 'Polygon',
          txHash: result.blockchain?.txHash ?? result.certificate.txHash,
        }
      : searched && !loading && (error || (result && !result.valid))
        ? { status: 'invalid' }
        : { status: 'demo' };

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
                <span className="hero-line"><span className="hero-line__inner">Verifica tu certificado</span></span>
                <span className="hero-line"><span className="hero-line__inner">en blockchain.</span></span>
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
                        <dt>ID de certificado</dt>
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
