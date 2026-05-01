import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Download,
  Loader2,
  RefreshCw,
  TreePine,
  Calendar,
  Award,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { getMyCertificates, type B2BCertificate } from '../../services/certificatesService';

const CertificatesView: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [certificates, setCertificates] = useState<B2BCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCertificates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyCertificates();
      setCertificates(data.certificates);
    } catch (err: any) {
      setError('Error al cargar los certificados');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const totalTons = certificates.reduce((acc, c) => acc + c.tonsCompensated, 0);
  const totalCLP = certificates.reduce((acc, c) => acc + c.totalAmountClp, 0);

  if (isLoading) {
    return (
      <div className="!flex !items-center !justify-center !py-20">
        <div className="!text-center">
          <Loader2 className="!w-12 !h-12 !text-green-500 !animate-spin !mx-auto !mb-4" />
          <p className={isDark ? '!text-gray-400' : '!text-gray-500'}>Cargando certificados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !flex-col sm:!flex-row !items-start sm:!items-center !justify-between !gap-4">
        <div>
          <h2 className={`!text-2xl !font-bold !flex !items-center !gap-2 ${isDark ? '!text-white' : '!text-gray-900'}`}>
            <ShieldCheck className="!text-green-500 !w-7 !h-7" />
            Bóveda de Certificados
          </h2>
          <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
            Certificados de compensación de huella de carbono emitidos a tu empresa
          </p>
        </div>
        <button
          onClick={loadCertificates}
          className={`!flex !items-center !gap-2 !px-4 !py-2 !rounded-xl !text-sm !font-medium !border !border-transparent !transition-all ${
            isDark
              ? '!bg-gray-700 !text-gray-300 hover:!bg-gray-600 !border-gray-600'
              : '!bg-white !text-gray-600 !border-gray-200 hover:!bg-gray-50'
          }`}
        >
          <RefreshCw className="!w-4 !h-4" /> Actualizar
        </button>
      </div>

      {/* Stats */}
      {certificates.length > 0 && (
        <div className="!grid sm:!grid-cols-3 !gap-4">
          {[
            {
              label: 'Certificados emitidos',
              value: certificates.length,
              icon: Award,
              gradient: 'from-emerald-500 to-green-600'
            },
            {
              label: 'Toneladas compensadas',
              value: `${totalTons.toFixed(2)} tCO₂`,
              icon: TreePine,
              gradient: 'from-green-500 to-teal-600'
            },
            {
              label: 'Inversión total',
              value: `$${totalCLP.toLocaleString('es-CL')} CLP`,
              icon: ShieldCheck,
              gradient: 'from-teal-500 to-cyan-600'
            }
          ].map((stat) => (
            <div
              key={stat.label}
              className={`!rounded-2xl !p-4 !border !shadow-sm ${
                isDark ? '!bg-gray-800 !border-gray-700' : '!bg-white !border-gray-200'
              }`}
            >
              <div className="!flex !items-center !gap-3">
                <div className={`!w-10 !h-10 !rounded-xl !bg-gradient-to-br ${stat.gradient} !flex !items-center !justify-center`}>
                  <stat.icon className="!w-5 !h-5 !text-white" />
                </div>
                <div>
                  <p className={`!text-xl !font-bold ${isDark ? '!text-white' : '!text-gray-900'}`}>{stat.value}</p>
                  <p className={`!text-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="!flex !items-center !gap-2 !p-4 !rounded-xl !bg-red-50 !border !border-red-200 !text-red-700 !text-sm">
          <AlertCircle className="!w-4 !h-4 !flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && certificates.length === 0 && !error && (
        <div className={`!text-center !py-20 !rounded-2xl !border ${
          isDark ? '!bg-gray-800/50 !border-gray-700' : '!bg-white !border-gray-200'
        }`}>
          <ShieldCheck className={`!w-16 !h-16 !mx-auto !mb-4 ${isDark ? '!text-gray-600' : '!text-gray-300'}`} />
          <p className={`!text-lg !font-medium !mb-2 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>
            Aún no tienes certificados
          </p>
          <p className={`!text-sm ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>
            Los certificados se emiten automáticamente cuando se aprueba una orden de compensación.
          </p>
        </div>
      )}

      {/* Certificates grid */}
      {certificates.length > 0 && (
        <div className="!grid sm:!grid-cols-2 xl:!grid-cols-3 !gap-5">
          {certificates.map((cert, idx) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`!rounded-2xl !border !overflow-hidden !shadow-sm !flex !flex-col ${
                isDark ? '!bg-gray-800 !border-gray-700' : '!bg-white !border-gray-200'
              }`}
            >
              {/* Card header — dark green accent */}
              <div className="!bg-gradient-to-r !from-emerald-600 !to-green-700 !px-5 !py-4">
                <div className="!flex !items-center !justify-between !mb-1">
                  <ShieldCheck className="!w-6 !h-6 !text-white/90" />
                  <span className="!text-xs !font-semibold !text-white/70 !bg-white/10 !px-2 !py-0.5 !rounded-full">
                    EMITIDO
                  </span>
                </div>
                <p className="!text-white !font-bold !text-lg !leading-tight !mt-2">
                  {cert.number}
                </p>
                <p className="!text-white/70 !text-xs !mt-0.5">Certificado de Compensación</p>
              </div>

              {/* Card body */}
              <div className="!px-5 !py-4 !flex-1 !space-y-3">
                {/* Tons — hero value */}
                <div className="!text-center !py-3 !rounded-xl !bg-gradient-to-br !from-green-50 !to-emerald-50 !border !border-green-100">
                  <p className={`!text-3xl !font-bold !text-green-600`}>
                    {cert.tonsCompensated.toFixed(2)}
                  </p>
                  <p className="!text-xs !text-green-700/70 !font-medium">toneladas CO₂ compensadas</p>
                </div>

                {/* Project */}
                <div className="!flex !items-start !gap-2">
                  <TreePine className="!w-4 !h-4 !text-green-500 !flex-shrink-0 !mt-0.5" />
                  <div>
                    <p className={`!text-sm !font-medium !leading-snug ${isDark ? '!text-white' : '!text-gray-800'}`}>
                      {cert.project?.name || 'Proyecto ESG'}
                    </p>
                    {cert.project?.country && (
                      <p className={`!text-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
                        {cert.project.type && `${cert.project.type} · `}{cert.project.country}
                      </p>
                    )}
                  </div>
                </div>

                {/* Issue date */}
                <div className="!flex !items-center !gap-2">
                  <Calendar className={`!w-4 !h-4 !flex-shrink-0 ${isDark ? '!text-gray-400' : '!text-gray-400'}`} />
                  <p className={`!text-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
                    Emitido el{' '}
                    {cert.issuedAt
                      ? new Date(cert.issuedAt).toLocaleDateString('es-CL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : new Date(cert.createdAt).toLocaleDateString('es-CL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                  </p>
                </div>

                {/* Amount */}
                <div className={`!flex !items-center !justify-between !pt-1 !border-t ${
                  isDark ? '!border-gray-700' : '!border-gray-100'
                }`}>
                  <span className={`!text-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Inversión</span>
                  <span className={`!text-sm !font-semibold ${isDark ? '!text-white' : '!text-gray-800'}`}>
                    ${cert.totalAmountClp.toLocaleString('es-CL')} CLP
                  </span>
                </div>
              </div>

              {/* Card footer — download button */}
              <div className="!px-5 !pb-5">
                {cert.pdfUrl ? (
                  <a
                    href={cert.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="!flex !items-center !justify-center !gap-2 !w-full !py-2.5 !rounded-xl !bg-gradient-to-r !from-emerald-600 !to-green-700 !text-white !text-sm !font-semibold !transition-all hover:!opacity-90 !no-underline"
                  >
                    <Download className="!w-4 !h-4" />
                    Descargar Certificado PDF
                  </a>
                ) : (
                  <div className={`!flex !items-center !justify-center !gap-2 !w-full !py-2.5 !rounded-xl !text-sm !font-medium ${
                    isDark ? '!bg-gray-700 !text-gray-400' : '!bg-gray-100 !text-gray-400'
                  }`}>
                    <FileText className="!w-4 !h-4" />
                    PDF generándose…
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesView;
