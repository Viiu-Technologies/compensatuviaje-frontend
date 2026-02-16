/**
 * CompensaTuViaje - Certificate Search Section
 * Sección de búsqueda de certificados NFT para el landing page
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCubes,
  FaExternalLinkAlt,
  FaLeaf,
  FaSpinner
} from 'react-icons/fa';
import { searchCertificateByNumber, publicVerifyCertificate } from '../../../shared/services/blockchainApi';
import type { PublicVerification } from '../../../types/blockchain.types';

const CertificateSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicVerification | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);

    try {
      // Try searching by certificate number first, then by compensationId
      let res: PublicVerification;
      if (query.startsWith('CERT-') || query.startsWith('cert-')) {
        res = await searchCertificateByNumber(query.trim());
      } else {
        res = await publicVerifyCertificate(query.trim());
      }
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error al buscar el certificado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="certificate-search-section" style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
      padding: '80px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.1,
        backgroundImage: 'radial-gradient(circle at 20% 50%, #a78bfa 0%, transparent 50%), radial-gradient(circle at 80% 50%, #34d399 0%, transparent 50%)'
      }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(139, 92, 246, 0.2)', padding: '6px 16px',
            borderRadius: '100px', marginBottom: '16px',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <FaCubes style={{ color: '#a78bfa', fontSize: '14px' }} />
            <span style={{ color: '#c4b5fd', fontSize: '13px', fontWeight: 600 }}>Blockchain Verificación</span>
          </div>

          <h2 style={{
            fontSize: '2rem', fontWeight: 800, color: '#ffffff',
            margin: '0 0 12px 0', lineHeight: 1.2
          }}>
            Verifica tu Certificado NFT
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
            Busca por número de certificado o ID de compensación para verificar su autenticidad en blockchain
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            display: 'flex', gap: '12px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            padding: '8px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <FaSearch style={{
              position: 'absolute', left: '16px', top: '50%',
              transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px'
            }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: CERT-2024-SCL-MIA-001 o ID de compensación..."
              style={{
                width: '100%', padding: '14px 16px 14px 44px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: '#ffffff',
                fontSize: '15px', outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                e.target.style.background = 'rgba(255,255,255,0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.background = 'rgba(255,255,255,0.08)';
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              color: '#ffffff', fontWeight: 700,
              border: 'none', borderRadius: '12px',
              cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !query.trim() ? 0.6 : 1,
              fontSize: '15px', display: 'flex',
              alignItems: 'center', gap: '8px',
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            {loading ? (
              <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <FaShieldAlt />
            )}
            Verificar
          </button>
        </motion.form>

        {/* Results */}
        <AnimatePresence mode="wait">
          {searched && !loading && (
            <motion.div
              key={result?.valid ? 'valid' : 'invalid'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ marginTop: '24px' }}
            >
              {/* Valid result */}
              {result?.valid && result.certificate && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '16px', padding: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <FaCheckCircle style={{ color: '#34d399', fontSize: '24px' }} />
                    <div>
                      <h3 style={{ margin: 0, color: '#34d399', fontWeight: 700, fontSize: '18px' }}>
                        Certificado Verificado ✓
                      </h3>
                      <p style={{ margin: 0, color: '#6ee7b7', fontSize: '13px' }}>
                        Este certificado es auténtico y existe en la blockchain
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px', marginBottom: '16px'
                  }}>
                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px', borderRadius: '10px' }}>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Token ID</p>
                      <p style={{ margin: '4px 0 0', color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}>
                        #{result.certificate.tokenId}
                      </p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px', borderRadius: '10px' }}>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>CO₂ Compensado</p>
                      <p style={{ margin: '4px 0 0', color: '#34d399', fontWeight: 700, fontSize: '18px' }}>
                        {result.certificate.co2AmountKg.toFixed(2)} kg
                      </p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px', borderRadius: '10px' }}>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Proyecto</p>
                      <p style={{ margin: '4px 0 0', color: '#fff', fontWeight: 600, fontSize: '14px' }}>
                        {result.certificate.projectName}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => navigate(`/verify/${result.certificate!.compensationId}`)}
                      style={{
                        padding: '10px 20px', background: 'rgba(139, 92, 246, 0.3)',
                        color: '#c4b5fd', fontWeight: 600, border: '1px solid rgba(139, 92, 246, 0.4)',
                        borderRadius: '10px', cursor: 'pointer', fontSize: '13px',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <FaShieldAlt /> Ver detalles completos
                    </button>
                    {result.blockchain?.txHash && (
                      <a
                        href={`https://polygonscan.com/tx/${result.blockchain.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '10px 20px', background: 'rgba(255,255,255,0.06)',
                          color: '#94a3b8', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '10px', cursor: 'pointer', fontSize: '13px',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          textDecoration: 'none'
                        }}
                      >
                        <FaExternalLinkAlt /> Polygonscan
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Not found */}
              {(!result?.valid || !result?.certificate) && !error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '16px', padding: '24px', textAlign: 'center'
                }}>
                  <FaTimesCircle style={{ color: '#f87171', fontSize: '32px', marginBottom: '12px' }} />
                  <h3 style={{ margin: '0 0 8px', color: '#fca5a5', fontWeight: 700 }}>
                    Certificado No Encontrado
                  </h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                    No se encontró un certificado NFT con ese identificador. Verifica el número e intenta de nuevo.
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '16px', padding: '24px', textAlign: 'center'
                }}>
                  <FaTimesCircle style={{ color: '#f87171', fontSize: '32px', marginBottom: '12px' }} />
                  <h3 style={{ margin: '0 0 8px', color: '#fca5a5', fontWeight: 700 }}>Error</h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>{error}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'flex', justifyContent: 'center', gap: '32px',
            marginTop: '40px', flexWrap: 'wrap'
          }}
        >
          {[
            { icon: FaCubes, text: 'Polygon Blockchain' },
            { icon: FaShieldAlt, text: 'ERC-721 Verificado' },
            { icon: FaLeaf, text: 'Impacto Trazable' },
          ].map((badge, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: '#64748b', fontSize: '13px'
            }}>
              <badge.icon style={{ color: '#8b5cf6' }} />
              <span>{badge.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default CertificateSearch;
