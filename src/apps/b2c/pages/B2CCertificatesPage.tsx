import React, { useState } from 'react';
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
  FaLeaf
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import B2CLayout from '../components/B2CLayout';

interface Certificate {
  id: string;
  certificateNumber: string;
  date: string;
  co2Compensated: number;
  project: string;
  flightRoute?: string;
  status: 'verified' | 'pending';
  equivalencies: {
    trees: number;
    water: number;
  };
}

const B2CCertificatesPage: React.FC = () => {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Mock data - Esto vendrá del backend
  const certificates: Certificate[] = [
    {
      id: '1',
      certificateNumber: 'CERT-2024-SCL-MIA-001',
      date: '2024-12-20',
      co2Compensated: 2.45,
      project: 'Reforestación Amazonía',
      flightRoute: 'SCL → MIA',
      status: 'verified',
      equivalencies: {
        trees: 122,
        water: 12250
      }
    },
    {
      id: '2',
      certificateNumber: 'CERT-2024-MIA-JFK-002',
      date: '2024-12-15',
      co2Compensated: 1.8,
      project: 'Eólica Marina',
      flightRoute: 'MIA → JFK',
      status: 'verified',
      equivalencies: {
        trees: 90,
        water: 9000
      }
    },
    {
      id: '3',
      certificateNumber: 'CERT-2024-SCL-MAD-003',
      date: '2024-12-10',
      co2Compensated: 3.2,
      project: 'Conservación Azul',
      status: 'pending',
      equivalencies: {
        trees: 160,
        water: 16000
      }
    }
  ];

  const totalCompensated = certificates.reduce((sum, cert) => sum + cert.co2Compensated, 0);
  const totalTrees = certificates.reduce((sum, cert) => sum + cert.equivalencies.trees, 0);

  const handleDownload = (cert: Certificate) => {
    // TODO: Implementar descarga de certificado PDF
    console.log('Downloading certificate:', cert.certificateNumber);
  };

  const handleShare = (cert: Certificate) => {
    // TODO: Implementar compartir en redes sociales
    console.log('Sharing certificate:', cert.certificateNumber);
  };

  return (
    <B2CLayout title="Mis Certificados" subtitle="Certificados de compensación de huella de carbono">
      <div className="!space-y-6">
        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="!bg-gradient-to-r !from-green-500 !via-green-600 !to-emerald-600 !rounded-2xl sm:!rounded-3xl !p-6 sm:!p-8 !text-white !shadow-xl !relative !overflow-hidden"
        >
          {/* Background decoration */}
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
              <div className="!text-green-100 !text-sm">Árboles plantados</div>
            </div>
            <div className="!text-center sm:!text-left">
              <div className="!text-green-100 !text-sm !font-medium !mb-1">Certificados</div>
              <div className="!text-3xl sm:!text-4xl !font-bold !mb-1">{certificates.length}</div>
              <div className="!text-green-100 !text-sm">Compensaciones verificadas</div>
            </div>
          </div>
        </motion.div>

        {/* Certificates Grid */}
        {certificates.length > 0 ? (
          <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 !gap-4 sm:!gap-6">
            {certificates.map((cert, index) => (
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
                  ) : (
                    <span className="!inline-flex !items-center !gap-1 !px-3 !py-1 !rounded-full !bg-orange-100 !text-orange-700 !text-xs !font-semibold">
                      <HiSparkles /> Pendiente
                    </span>
                  )}
                </div>

                {/* Certificate Info */}
                <div className="!mb-4">
                  <div className="!text-xs !text-gray-500 !mb-1">Certificado</div>
                  <div className="!font-mono !text-sm !text-gray-700 !mb-3">#{cert.certificateNumber.split('-').slice(-1)}</div>
                  
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
                    <div className="!text-sm !font-bold !text-gray-800">{cert.equivalencies.trees}</div>
                    <div className="!text-xs !text-gray-500">Árboles</div>
                  </div>
                  <div className="!text-center !p-2 !bg-gray-50 !rounded-lg">
                    <div className="!text-xl !mb-1">💧</div>
                    <div className="!text-sm !font-bold !text-gray-800">{(cert.equivalencies.water / 1000).toFixed(1)}k</div>
                    <div className="!text-xs !text-gray-500">Litros</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="!flex !gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(cert);
                    }}
                    className="!flex-1 !px-3 !py-2 !bg-green-600 !text-white !rounded-lg !text-sm !font-semibold hover:!bg-green-700 !transition !border-0 !flex !items-center !justify-center !gap-2"
                  >
                    <FaDownload /> Descargar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(cert);
                    }}
                    className="!px-3 !py-2 !bg-gray-100 !text-gray-700 !rounded-lg !text-sm !font-semibold hover:!bg-gray-200 !transition !border-0"
                  >
                    <FaShare />
                  </motion.button>
                </div>
              </motion.div>
            ))}
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
            <Link to="/calculator">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="!px-6 !py-3 !bg-green-600 !text-white !rounded-full !font-bold !shadow-lg hover:!bg-green-700 !transition !border-0 !flex !items-center !gap-2 !mx-auto"
              >
                <FaLeaf /> Compensar Ahora
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Certificate Detail Modal */}
        <AnimatePresence>
          {selectedCertificate && (
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
                    className="!absolute !top-4 !right-4 !w-10 !h-10 !bg-white/20 !backdrop-blur-sm !rounded-full !flex !items-center !justify-center !text-white hover:!bg-white/30 !transition !border-0"
                  >
                    <FaTimes />
                  </button>
                  
                  <div className="!text-center !mb-6">
                    <div className="!w-20 !h-20 !mx-auto !mb-4 !rounded-full !bg-white/20 !backdrop-blur-sm !flex !items-center !justify-center">
                      <FaCertificate className="!text-4xl" />
                    </div>
                    <h2 className="!text-2xl !font-bold !mb-2">Certificado de Compensación</h2>
                    <div className="!font-mono !text-green-100">#{selectedCertificate.certificateNumber}</div>
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

                  {/* Equivalencies */}
                  <div className="!bg-gradient-to-br !from-green-50 !to-white !rounded-2xl !p-6 !mb-6">
                    <h3 className="!font-bold !text-gray-900 !mb-4">Equivale a:</h3>
                    <div className="!grid !grid-cols-2 !gap-4">
                      <div className="!text-center !p-4 !bg-white !rounded-xl !shadow-sm">
                        <div className="!text-4xl !mb-2">🌳</div>
                        <div className="!text-2xl !font-bold !text-gray-900 !mb-1">{selectedCertificate.equivalencies.trees}</div>
                        <div className="!text-sm !text-gray-600">Árboles plantados</div>
                      </div>
                      <div className="!text-center !p-4 !bg-white !rounded-xl !shadow-sm">
                        <div className="!text-4xl !mb-2">💧</div>
                        <div className="!text-2xl !font-bold !text-gray-900 !mb-1">
                          {(selectedCertificate.equivalencies.water / 1000).toFixed(1)}k
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
                      className="!px-6 !py-3 !bg-green-600 !text-white !rounded-xl !font-bold !shadow-lg hover:!bg-green-700 !transition !border-0 !flex !items-center !justify-center !gap-2"
                    >
                      <FaDownload /> Descargar PDF
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleShare(selectedCertificate)}
                      className="!px-6 !py-3 !bg-gray-100 !text-gray-700 !rounded-xl !font-semibold hover:!bg-gray-200 !transition !border-0 !flex !items-center !justify-center !gap-2"
                    >
                      <FaShare /> Compartir
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </B2CLayout>
  );
};

export default B2CCertificatesPage;
