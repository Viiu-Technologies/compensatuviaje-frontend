import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaCertificate,
  FaDownload,
  FaEye,
  FaShare,
  FaTimes,
  FaCheckCircle,
  FaTree,
  FaCalendarAlt,
  FaHashtag,
  FaLeaf,
  FaCubes
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import B2CLayout from '../components/B2CLayout';
import b2cApi, { type B2CCertificate } from '../services/b2cApi';
import { MintNFTModal } from '../../../shared/components/blockchain';
import { downloadCertificatePDF } from '../utils/CertificatePDF';
import { useAuth } from '../context/AuthContext';

const B2CCertificatesPage: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<B2CCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<B2CCertificate | null>(null);
  const [mintCert, setMintCert] = useState<B2CCertificate | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const data = await b2cApi.getCertificates();
        setCertificates(data.certificates || []);
      } catch (err: any) {
        console.error('Error fetching certificates:', err);
        setError(err.message || 'Error cargando certificados');
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const totalCompensated = certificates.reduce((sum, cert) => sum + cert.co2Compensated, 0);
  const totalTrees = Math.round(totalCompensated * 50); // ~50 trees per ton CO2

  const handleDownload = async (cert: B2CCertificate) => {
    const [origin, destination] = (cert.flightRoute || '').split('→').map(s => s.trim());
    const treesEquiv = cert.equivalencies?.trees || Math.round(cert.co2Compensated * 50);
    const waterLiters = cert.equivalencies?.water || Math.round(cert.co2Compensated * 5000);
    await downloadCertificatePDF({
      certificateNumber: cert.certificateNumber || cert.id,
      userName: user?.nombre || user?.email?.split('@')[0] || 'Usuario',
      userEmail: user?.email,
      co2Tons: cert.co2Compensated,
      co2Kg: cert.co2Compensated * 1000,
      origin: origin || '',
      destination: destination || '',
      date: cert.date,
      projectName: cert.project,
      treesEquiv,
      carKmAvoided: Math.round(cert.co2Compensated * 4000),
      waterLiters,
      nftTxHash: cert.nftTxHash,
      // Doble métrica: leídas de la BD, sin recalcular
      unitsFinanced: cert.unitsFinanced ?? null,
      impactUnit: cert.impactUnit ?? null,
    });
  };

  const handleShare = (cert: B2CCertificate) => {
    const text = `¡He compensado ${cert.co2Compensated.toFixed(2)} toneladas de CO₂ con ${cert.project}! 🌱 #CompensaTuViaje`;
    if (navigator.share) {
      navigator.share({ title: 'Certificado de Compensación', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Texto copiado al portapapeles');
    }
  };

  if (loading) {
    return (
      <B2CLayout title="Mis Certificados" subtitle="Certificados de compensación de huella de carbono">
        <div className="!flex !items-center !justify-center !py-20">
          <div className="!text-center">
            <div className="!w-16 !h-16 !border-4 !border-green-200 !border-t-green-600 !rounded-full !animate-spin !mx-auto !mb-4"></div>
            <p className="!text-gray-500">Cargando certificados...</p>
          </div>
        </div>
      </B2CLayout>
    );
  }

  return (
    <B2CLayout title="Mis Certificados" subtitle="Certificados de compensación de huella de carbono">
      <div className="!space-y-6">
        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="!bg-gradient-to-r !from-green-500 !via-green-600 !to-emerald-600 !rounded-2xl sm:!rounded-3xl !p-6 sm:!p-8 !text-white !shadow-xl !relative !overflow-hidden"
        >
          <div className="!absolute !top-0 !right-0 !w-64 !h-64 !bg-white/10 !rounded-full !blur-3xl"></div>
          
          <div className="!relative !z-10 !grid !grid-cols-1 sm:!grid-cols-3 !gap-4 sm:!gap-6">
            <div className="!text-center sm:!text-left">
              <div className="!text-green-100 !text-sm !font-medium !mb-1">Total Compensado</div>
              <div className="!text-3xl sm:!text-4xl !font-bold !mb-1">{totalCompensated.toFixed(2)} t</div>
              <div className="!text-green-100 !text-sm">CO₂ compensado</div>
            </div>
            <div className="!text-center sm:!text-left">
              <div className="!text-green-100 !text-sm !font-medium !mb-1">Árboles Equivalentes</div>
              <div className="!text-3xl sm:!text-4xl !font-bold !mb-1 !flex !items-center !justify-center sm:!justify-start !gap-2">
                <FaTree /> {totalTrees}
              </div>
              <div className="!text-green-100 !text-sm">Árboles equivalentes</div>
            </div>
            <div className="!text-center sm:!text-left">
              <div className="!text-green-100 !text-sm !font-medium !mb-1">Certificados</div>
              <div className="!text-3xl sm:!text-4xl !font-bold !mb-1">{certificates.length}</div>
              <div className="!text-green-100 !text-sm">Compensaciones</div>
            </div>
          </div>
        </motion.div>

        {/* Certificates Grid */}
        {certificates.length > 0 ? (
          <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 !gap-4 sm:!gap-6">
            {certificates.map((cert, index) => {
              const treesEquiv = Math.round(cert.co2Compensated * 50);
              const waterEquiv = Math.round(cert.co2Compensated * 5000);
              return (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  className="!bg-white !rounded-2xl !p-6 !border !border-gray-200 !shadow-sm !transition-all !cursor-pointer"
                  onClick={() => setSelectedCertificate(cert)}
                >
                  {/* Certificate Header */}
                  <div className="!flex !items-start !justify-between !mb-4">
                    <div className="!w-12 !h-12 !rounded-full !bg-gradient-to-br !from-green-500 !to-green-600 !flex !items-center !justify-center !text-white !text-xl">
                      <FaCertificate />
                    </div>
                    {cert.status === 'verified' ? (
                      <span className="!inline-flex !items-center !gap-1 !px-3 !py-1 !rounded-full !bg-green-100 !text-green-700 !text-xs !font-semibold">
                        <FaCheckCircle /> Verificado
                      </span>
                    ) : cert.status === 'pending' ? (
                      <span className="!inline-flex !items-center !gap-1 !px-3 !py-1 !rounded-full !bg-orange-100 !text-orange-700 !text-xs !font-semibold">
                        <HiSparkles /> Borrador
                      </span>
                    ) : (
                      <span className="!inline-flex !items-center !gap-1 !px-3 !py-1 !rounded-full !bg-blue-100 !text-blue-700 !text-xs !font-semibold">
                        Compensado
                      </span>
                    )}
                  </div>

                  {/* Certificate Info */}
                  <div className="!mb-4">
                    <div className="!text-xs !text-gray-500 !mb-1">Certificado</div>
                    <div className="!font-mono !text-sm !text-gray-700 !mb-3">
                      #{cert.certificateNumber || cert.id.slice(0, 8)}
                    </div>
                    
                    {cert.flightRoute && (
                      <div className="!text-sm !text-gray-600 !mb-2">
                        <span className="!font-semibold">Vuelo:</span> {cert.flightRoute}
                      </div>
                    )}
                    
                    <div className="!text-sm !text-gray-600 !mb-2">
                      <span className="!font-semibold">Proyecto:</span> {cert.project}
                    </div>
                    
                    <div className="!flex !items-center !gap-1 !text-xs !text-gray-500">
                      <FaCalendarAlt />
                      {new Date(cert.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* CO2 Badge */}
                  <div className="!bg-gradient-to-br !from-green-50 !to-green-100 !rounded-xl !p-4 !mb-4">
                    <div className="!text-center">
                      <div className="!text-3xl !font-bold !text-green-700 !mb-1">
                        {cert.co2Compensated.toFixed(2)} t
                      </div>
                      <div className="!text-xs !text-green-600 !font-semibold">CO₂ Compensado</div>
                    </div>
                  </div>

                  {/* Equivalencies */}
                  <div className="!grid !grid-cols-2 !gap-3 !mb-4">
                    <div className="!text-center !p-2 !bg-gray-50 !rounded-lg">
                      <div className="!text-xl !mb-1">🌳</div>
                      <div className="!text-sm !font-bold !text-gray-800">{treesEquiv}</div>
                      <div className="!text-xs !text-gray-500">Árboles</div>
                    </div>
                    <div className="!text-center !p-2 !bg-gray-50 !rounded-lg">
                      <div className="!text-xl !mb-1">💧</div>
                      <div className="!text-sm !font-bold !text-gray-800">{(waterEquiv / 1000).toFixed(1)}k</div>
                      <div className="!text-xs !text-gray-500">Litros</div>
                    </div>
                  </div>

                  {/* NFT Badge */}
                  {cert.nftTxHash && (
                    <div className="!mb-4 !px-3 !py-2 !bg-purple-50 !border !border-purple-200 !rounded-lg !text-xs !text-purple-700 !font-medium !flex !items-center !gap-1">
                      🔗 NFT Certificado en Blockchain
                    </div>
                  )}

                  {/* Actions */}
                  <div className="!flex !gap-2">
                    {/* Mint NFT Button - only when no NFT yet */}
                    {!cert.nftTxHash && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMintCert(cert);
                        }}
                        className="!flex-1 !px-3 !py-2 !bg-gradient-to-r !from-purple-600 !to-blue-600 !text-white !rounded-lg !text-sm !font-semibold hover:!from-purple-700 hover:!to-blue-700 !transition !border-0 !flex !items-center !justify-center !gap-2 !cursor-pointer"
                      >
                        <FaCubes /> Mintear NFT
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(cert);
                      }}
                      className={`${cert.nftTxHash ? '!flex-1' : ''} !px-3 !py-2 !bg-green-600 !text-white !rounded-lg !text-sm !font-semibold hover:!bg-green-700 !transition !border-0 !flex !items-center !justify-center !gap-2 !cursor-pointer`}
                    >
                      <FaDownload /> {cert.nftTxHash ? 'Descargar' : ''}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(cert);
                      }}
                      className="!px-3 !py-2 !bg-gray-100 !text-gray-700 !rounded-lg !text-sm !font-semibold hover:!bg-gray-200 !transition !border-0 !cursor-pointer"
                    >
                      <FaShare />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          // Empty State
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="!bg-white !rounded-2xl !p-12 !text-center !shadow-sm !border !border-gray-200"
          >
            <div className="!w-20 !h-20 !mx-auto !mb-6 !rounded-full !bg-gray-100 !flex !items-center !justify-center">
              <FaCertificate className="!text-4xl !text-gray-400" />
            </div>
            <h3 className="!text-xl !font-bold !text-gray-900 !mb-2">
              Aún no tienes certificados
            </h3>
            <p className="!text-gray-600 !mb-6 !max-w-md !mx-auto">
              Compensa tu huella de carbono y obtén certificados verificados de tus contribuciones ambientales
            </p>
            <Link to="/b2c/calculator">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="!px-6 !py-3 !bg-green-600 !text-white !rounded-full !font-bold !shadow-lg hover:!bg-green-700 !transition !border-0 !flex !items-center !gap-2 !mx-auto !cursor-pointer"
              >
                <FaLeaf /> Compensar Ahora
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Certificate Detail Modal */}
        <AnimatePresence>
          {selectedCertificate && (() => {
            const treesEquiv = Math.round(selectedCertificate.co2Compensated * 50);
            const waterEquiv = Math.round(selectedCertificate.co2Compensated * 5000);
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCertificate(null)}
                className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !z-50 !flex !items-center !justify-center !p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="!bg-white !rounded-3xl !max-w-2xl !w-full !max-h-[90vh] !overflow-y-auto !shadow-2xl"
                >
                  {/* Certificate Preview */}
                  <div className="!bg-gradient-to-br !from-green-500 !to-green-600 !p-8 !text-white !relative">
                    <button
                      onClick={() => setSelectedCertificate(null)}
                      className="!absolute !top-4 !right-4 !w-10 !h-10 !bg-white/20 !backdrop-blur-sm !rounded-full !flex !items-center !justify-center !text-white hover:!bg-white/30 !transition !border-0 !cursor-pointer"
                    >
                      <FaTimes />
                    </button>
                    
                    <div className="!text-center !mb-6">
                      <div className="!w-20 !h-20 !mx-auto !mb-4 !rounded-full !bg-white/20 !backdrop-blur-sm !flex !items-center !justify-center">
                        <FaCertificate className="!text-4xl" />
                      </div>
                      <h2 className="!text-2xl !font-bold !mb-2">Certificado de Compensación</h2>
                      <div className="!font-mono !text-green-100">#{selectedCertificate.certificateNumber || selectedCertificate.id.slice(0, 8)}</div>
                    </div>

                    <div className="!bg-white/10 !backdrop-blur-sm !rounded-2xl !p-6 !text-center">
                      <div className="!text-5xl !font-bold !mb-2">{selectedCertificate.co2Compensated.toFixed(2)} t</div>
                      <div className="!text-green-100 !font-semibold">CO₂ Compensado</div>
                    </div>
                  </div>

                  <div className="!p-8">
                    {/* Details */}
                    <div className="!space-y-4 !mb-6">
                      <div className="!flex !items-start !justify-between !p-4 !bg-gray-50 !rounded-xl">
                        <div>
                          <div className="!text-sm !text-gray-500 !mb-1">Proyecto Apoyado</div>
                          <div className="!font-semibold !text-gray-900">{selectedCertificate.project}</div>
                        </div>
                        <FaLeaf className="!text-green-600 !text-xl" />
                      </div>

                      {selectedCertificate.flightRoute && (
                        <div className="!flex !items-start !justify-between !p-4 !bg-gray-50 !rounded-xl">
                          <div>
                            <div className="!text-sm !text-gray-500 !mb-1">Ruta del Vuelo</div>
                            <div className="!font-semibold !text-gray-900">{selectedCertificate.flightRoute}</div>
                          </div>
                        </div>
                      )}

                      <div className="!flex !items-start !justify-between !p-4 !bg-gray-50 !rounded-xl">
                        <div>
                          <div className="!text-sm !text-gray-500 !mb-1">Fecha de Emisión</div>
                          <div className="!font-semibold !text-gray-900">
                            {new Date(selectedCertificate.date).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <FaCalendarAlt className="!text-gray-400 !text-xl" />
                      </div>
                    </div>

                    {/* NFT Info */}
                    {selectedCertificate.nftTxHash && (
                      <div className="!mb-6 !p-4 !bg-purple-50 !border !border-purple-200 !rounded-xl">
                        <h3 className="!font-bold !text-purple-800 !mb-2">🔗 Certificado NFT</h3>
                        <div className="!text-xs !text-purple-600 !font-mono !break-all">
                          TX: {selectedCertificate.nftTxHash}
                        </div>
                      </div>
                    )}

                    {/* Equivalencies */}
                    <div className="!bg-gradient-to-br !from-green-50 !to-white !rounded-2xl !p-6 !mb-6">
                      <h3 className="!font-bold !text-gray-900 !mb-4">Equivale a:</h3>
                      <div className="!grid !grid-cols-2 !gap-4">
                        <div className="!text-center !p-4 !bg-white !rounded-xl !shadow-sm">
                          <div className="!text-4xl !mb-2">🌳</div>
                          <div className="!text-2xl !font-bold !text-gray-900 !mb-1">{treesEquiv}</div>
                          <div className="!text-sm !text-gray-600">Árboles plantados</div>
                        </div>
                        <div className="!text-center !p-4 !bg-white !rounded-xl !shadow-sm">
                          <div className="!text-4xl !mb-2">💧</div>
                          <div className="!text-2xl !font-bold !text-gray-900 !mb-1">
                            {(waterEquiv / 1000).toFixed(1)}k
                          </div>
                          <div className="!text-sm !text-gray-600">Litros de agua</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="!grid !grid-cols-2 !gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload(selectedCertificate)}
                        className="!px-6 !py-3 !bg-green-600 !text-white !rounded-xl !font-bold !shadow-lg hover:!bg-green-700 !transition !border-0 !flex !items-center !justify-center !gap-2 !cursor-pointer"
                      >
                        <FaDownload /> Descargar PDF
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleShare(selectedCertificate)}
                        className="!px-6 !py-3 !bg-gray-100 !text-gray-700 !rounded-xl !font-semibold hover:!bg-gray-200 !transition !border-0 !flex !items-center !justify-center !gap-2 !cursor-pointer"
                      >
                        <FaShare /> Compartir
                      </motion.button>
                    </div>

                    {/* Mint NFT Button in modal */}
                    {!selectedCertificate.nftTxHash && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedCertificate(null);
                          setMintCert(selectedCertificate);
                        }}
                        className="!w-full !mt-4 !px-6 !py-3 !bg-gradient-to-r !from-purple-600 !to-blue-600 !text-white !rounded-xl !font-bold !shadow-lg hover:!from-purple-700 hover:!to-blue-700 !transition !border-0 !flex !items-center !justify-center !gap-2 !cursor-pointer"
                      >
                        <FaCubes /> Mintear como NFT en Blockchain
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* Mint NFT Modal */}
      {mintCert && (
        <MintNFTModal
          isOpen={!!mintCert}
          onClose={() => setMintCert(null)}
          compensationId={mintCert.id}
          compensationData={{
            co2Amount: mintCert.co2Compensated * 1000, // tons to kg
            projectName: mintCert.project || 'Proyecto ESG',
            travelType: 'flight',
          }}
          onSuccess={() => {
            // Refresh certificates list to show NFT badge
            setMintCert(null);
            b2cApi.getCertificates().then((data) => {
              setCertificates(data.certificates || []);
            });
          }}
        />
      )}
    </B2CLayout>
  );
};

export default B2CCertificatesPage;
