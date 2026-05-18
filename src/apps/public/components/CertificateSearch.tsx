/**
 * CompensaTuViaje — Certificate Search Section
 * Rediseñado: sin framer-motion, glassmorphism oscuro premium
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch, FaShieldAlt, FaCheckCircle, FaTimesCircle,
  FaCubes, FaExternalLinkAlt, FaLeaf, FaSpinner,
} from 'react-icons/fa';
import { searchCertificateByNumber, publicVerifyCertificate } from '../../../shared/services/blockchainApi';
import type { PublicVerification } from '../../../types/blockchain.types';
import './CertificateSearch.css';

const TRUST_BADGES = [
  { icon: FaCubes,    label: 'Polygon Blockchain', mod: ''        },
  { icon: FaShieldAlt,label: 'ERC-721 Verificado', mod: ''        },
  { icon: FaLeaf,     label: 'Impacto Trazable',   mod: 'cs-trust-item--teal' },
];

const CertificateSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query,    setQuery]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<PublicVerification | null>(null);
  const [searched, setSearched] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

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
    <section className="cs-section" id="verificar">

      {/* ── Fondo animado ── */}
      <div className="cs-bg" aria-hidden="true">
        <div className="cs-orb cs-orb--purple" />
        <div className="cs-orb cs-orb--teal"   />
        <div className="cs-orb cs-orb--blue"   />
        <div className="cs-grid-dots"          />
        <div className="cs-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`cs-p cs-p--${i + 1}`} />
          ))}
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="cs-container">

        {/* Badge */}
        <div className="cs-header cs-reveal">
          <span className="cs-badge">
            <FaCubes aria-hidden="true" />
            Blockchain Verificación
          </span>

          <h2 className="cs-title">
            Verifica tu{' '}
            <span className="cs-title__accent">Certificado NFT</span>
          </h2>

          <p className="cs-sub">
            Busca por número de certificado o ID de compensación para verificar
            su autenticidad en blockchain
          </p>
        </div>

        {/* Buscador */}
        <form
          className="cs-form cs-reveal cs-reveal--delay"
          onSubmit={handleSearch}
        >
          <div className="cs-input-wrap">
            <FaSearch className="cs-input-icon" aria-hidden="true" />
            <input
              type="text"
              className="cs-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: CERT-2024-SCL-MIA-001 o ID de compensación..."
            />
          </div>

          <button
            type="submit"
            className="cs-btn"
            disabled={loading || !query.trim()}
          >
            {loading
              ? <FaSpinner className="cs-spin" aria-hidden="true" />
              : <FaShieldAlt aria-hidden="true" />
            }
            Verificar
          </button>
        </form>

        {/* Resultados */}
        {searched && !loading && (
          <div className="cs-result-wrap">

            {/* ✅ Válido */}
            {result?.valid && result.certificate && (
              <div className="cs-result cs-result--ok">
                <div className="cs-result__head">
                  <div className="cs-check-circle">
                    <FaCheckCircle aria-hidden="true" />
                  </div>
                  <div>
                    <p className="cs-result__title">Certificado Verificado ✓</p>
                    <p className="cs-result__sub">
                      Este certificado es auténtico y existe en la blockchain
                    </p>
                  </div>
                </div>

                <div className="cs-stats">
                  <div className="cs-stat">
                    <span className="cs-stat__label">Token ID</span>
                    <span className="cs-stat__val">#{result.certificate.tokenId}</span>
                  </div>
                  <div className="cs-stat">
                    <span className="cs-stat__label">CO₂ Compensado</span>
                    <span className="cs-stat__val cs-stat__val--green">
                      {result.certificate.co2AmountKg.toFixed(2)} kg
                    </span>
                  </div>
                  <div className="cs-stat">
                    <span className="cs-stat__label">Proyecto</span>
                    <span className="cs-stat__val cs-stat__val--sm">
                      {result.certificate.projectName}
                    </span>
                  </div>
                </div>

                <div className="cs-result-actions">
                  <button
                    className="cs-action-btn cs-action-btn--purple"
                    onClick={() => navigate(`/verify/${result.certificate!.compensationId}`)}
                  >
                    <FaShieldAlt aria-hidden="true" />
                    Ver detalles completos
                  </button>

                  {result.blockchain?.txHash && (
                    <a
                      href={`https://polygonscan.com/tx/${result.blockchain.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cs-action-btn cs-action-btn--ghost"
                    >
                      <FaExternalLinkAlt aria-hidden="true" />
                      Polygonscan
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* ❌ No encontrado */}
            {(!result?.valid || !result?.certificate) && !error && (
              <div className="cs-result cs-result--err">
                <FaTimesCircle className="cs-result__big-icon" aria-hidden="true" />
                <p className="cs-result__title">Certificado no encontrado</p>
                <p className="cs-result__sub">
                  No existe un certificado NFT con ese identificador.
                  Verifica el número e intenta de nuevo.
                </p>
              </div>
            )}

            {/* ⚠️ Error de red */}
            {error && (
              <div className="cs-result cs-result--err">
                <FaTimesCircle className="cs-result__big-icon" aria-hidden="true" />
                <p className="cs-result__title">Error</p>
                <p className="cs-result__sub">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Trust badges */}
        <div className="cs-trust">
          {TRUST_BADGES.map(({ icon: Icon, label, mod }) => (
            <div key={label} className={`cs-trust-item ${mod}`}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CertificateSearch;