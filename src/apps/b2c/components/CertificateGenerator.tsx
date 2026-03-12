import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  FaDownload,
  FaLeaf,
  FaGlobeAmericas,
  FaCheckCircle,
  FaTree,
  FaCar,
  FaPlane,
  FaShareAlt,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaCubes
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { MintNFTModal } from '../../../shared/components/blockchain';

interface CertificateData {
  certificateId: string;
  userName: string;
  userEmail?: string;
  emissionsTons: number;
  emissionsKg: number;
  origin: string;
  destination: string;
  flightDate?: string;
  compensationDate: string;
  projectName: string;
  projectType: string;
  equivalences?: {
    treesPlanted?: number;
    carKmAvoided?: number;
    flightsOffset?: number;
  };
  amountPaid?: number;
  currency?: string;
}

interface CertificateGeneratorProps {
  data: CertificateData;
  onClose?: () => void;
}

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({ data, onClose }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const [nftMinted, setNftMinted] = useState(false);

  const generatePDF = async () => {
    if (!certificateRef.current) {
      console.error('No se encontró el elemento del certificado');
      return;
    }
    
    setIsGenerating(true);
    try {
      // Esperar a que las imágenes y estilos se carguen completamente
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const element = certificateRef.current;
      
      // Clonar el elemento para manipularlo sin afectar la UI
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '800px';
      clone.style.backgroundColor = '#ffffff';
      document.body.appendChild(clone);
      
      // Esperar renderizado
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Capturar el certificado como imagen
      const canvas = await html2canvas(clone, {
        scale: 3, // Alta resolución
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Asegurar que todos los estilos se apliquen
          const clonedElement = clonedDoc.body.querySelector('[data-certificate]');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.transform = 'none';
          }
        }
      });
      
      // Remover el clon
      document.body.removeChild(clone);

      // Crear PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calcular dimensiones manteniendo proporción
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      
      // Descargar el PDF
      pdf.save(`Certificado_CO2_${data.certificateId}.pdf`);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Hubo un error generando el PDF. Por favor intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareOnSocial = (platform: string) => {
    const text = `¡He compensado ${data.emissionsKg.toLocaleString()} kg de CO₂ con @CompensaTuViaje! 🌱🌍 #SostenibilidadAérea #HuellaDeCarbono`;
    const url = 'https://compensatuviaje.cl';
    
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="!fixed !inset-0 !z-[100] !flex !items-center !justify-center !p-4 !bg-black/60 !backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="!bg-white !rounded-2xl !shadow-2xl !max-w-5xl !w-full !max-h-[95vh] !overflow-auto"
      >
        {/* Barra de acciones */}
        <div className="!sticky !top-0 !bg-white !border-b !border-gray-200 !px-6 !py-4 !flex !items-center !justify-between !z-10">
          <div className="!flex !items-center !gap-3">
            <div className="!w-10 !h-10 !bg-green-100 !rounded-full !flex !items-center !justify-center">
              <FaLeaf className="!text-green-600" />
            </div>
            <div>
              <h3 className="!font-bold !text-gray-900">Tu Certificado de Compensación</h3>
              <p className="!text-sm !text-gray-500">ID: {data.certificateId}</p>
            </div>
          </div>
          
          <div className="!flex !items-center !gap-3">
            {/* Botón compartir */}
            <div className="!relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="!px-4 !py-2.5 !bg-gray-100 !text-gray-700 !rounded-xl !font-semibold !flex !items-center !gap-2 !border-0 !cursor-pointer hover:!bg-gray-200 !transition"
              >
                <FaShareAlt /> Compartir
              </motion.button>
              
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="!absolute !right-0 !mt-2 !bg-white !rounded-xl !shadow-xl !border !border-gray-200 !py-2 !w-48 !z-20"
                >
                  <button
                    onClick={() => shareOnSocial('twitter')}
                    className="!w-full !px-4 !py-2.5 !text-left !flex !items-center !gap-3 hover:!bg-gray-50 !bg-transparent !border-0 !cursor-pointer"
                  >
                    <FaTwitter className="!text-[#1DA1F2]" /> Twitter
                  </button>
                  <button
                    onClick={() => shareOnSocial('linkedin')}
                    className="!w-full !px-4 !py-2.5 !text-left !flex !items-center !gap-3 hover:!bg-gray-50 !bg-transparent !border-0 !cursor-pointer"
                  >
                    <FaLinkedin className="!text-[#0A66C2]" /> LinkedIn
                  </button>
                  <button
                    onClick={() => shareOnSocial('facebook')}
                    className="!w-full !px-4 !py-2.5 !text-left !flex !items-center !gap-3 hover:!bg-gray-50 !bg-transparent !border-0 !cursor-pointer"
                  >
                    <FaFacebook className="!text-[#1877F2]" /> Facebook
                  </button>
                </motion.div>
              )}
            </div>

            {/* Botón Convertir a NFT */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMintModal(true)}
              className={`!px-5 !py-2.5 !rounded-xl !font-bold !flex !items-center !gap-2 !border-0 !cursor-pointer !shadow-lg hover:!shadow-xl !transition ${
                nftMinted
                  ? '!bg-purple-100 !text-purple-700'
                  : '!bg-gradient-to-r !from-purple-600 !to-violet-600 !text-white'
              }`}
            >
              {nftMinted ? (
                <>
                  <FaCheckCircle /> NFT Creado
                </>
              ) : (
                <>
                  <FaCubes /> Convertir a NFT
                </>
              )}
            </motion.button>

            {/* Botón descargar PDF */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generatePDF}
              disabled={isGenerating}
              className="!px-5 !py-2.5 !bg-gradient-to-r !from-green-600 !to-emerald-600 !text-white !rounded-xl !font-bold !flex !items-center !gap-2 !border-0 !cursor-pointer !shadow-lg hover:!shadow-xl !transition disabled:!opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="!w-5 !h-5 !border-2 !border-white/30 !border-t-white !rounded-full !animate-spin"></div>
                  Generando...
                </>
              ) : (
                <>
                  <FaDownload /> Descargar PDF
                </>
              )}
            </motion.button>

            {/* Botón cerrar */}
            {onClose && (
              <button
                onClick={onClose}
                className="!p-2 !text-gray-400 hover:!text-gray-600 !bg-transparent !border-0 !cursor-pointer !text-2xl"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Certificado Visual */}
        <div className="!p-6">
          <div 
            ref={certificateRef}
            data-certificate
            style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              position: 'relative',
              width: '100%',
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            {/* Contenedor del certificado con borde decorativo */}
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #ecfdf5 100%)',
              padding: '32px',
              position: 'relative'
            }}>
              
              {/* Borde interno decorativo */}
              <div style={{ 
                position: 'absolute', 
                inset: '16px', 
                border: '2px solid #bbf7d0', 
                borderRadius: '12px',
                pointerEvents: 'none',
                zIndex: 1 
              }}></div>
              <div style={{ 
                position: 'absolute', 
                inset: '24px', 
                border: '1px solid #dcfce7', 
                borderRadius: '8px',
                pointerEvents: 'none',
                zIndex: 1 
              }}></div>

              {/* Contenido */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                
                {/* Header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '24px' 
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <img 
                      src="/images/brand/logo-horizontal.png" 
                      alt="CompensaTuViaje"
                      style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
                      crossOrigin="anonymous"
                    />
                  </div>
                  
                  <div style={{
                    textAlign: 'right',
                    backgroundColor: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'flex-end',
                      color: '#16a34a',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      <FaCheckCircle />
                      <span>Certificado Verificado</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      ID: {data.certificateId}
                    </div>
                  </div>
                </div>

                {/* Título principal */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    borderRadius: '999px',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}>
                    <HiSparkles /> Certificado de Compensación de Carbono
                  </div>
                  <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '8px',
                    marginTop: '0'
                  }}>
                    Certificado de Neutralización
                  </h1>
                  <p style={{ color: '#4b5563', margin: '0' }}>
                    Este documento certifica que
                  </p>
                </div>

                {/* Nombre del usuario */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#15803d',
                    borderBottom: '2px solid #bbf7d0',
                    paddingBottom: '8px',
                    display: 'inline-block',
                    padding: '0 32px 8px 32px'
                  }}>
                    {data.userName}
                  </div>
                </div>

                {/* Descripción */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <p style={{ color: '#374151', fontSize: '18px', margin: '0 0 12px 0' }}>
                    ha compensado exitosamente las emisiones de carbono generadas por su vuelo
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    marginTop: '12px'
                  }}>
                    <span style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>{data.origin}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e' }}>
                      <div style={{ width: '48px', height: '2px', backgroundColor: '#86efac' }}></div>
                      <FaPlane />
                      <div style={{ width: '48px', height: '2px', backgroundColor: '#86efac' }}></div>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>{data.destination}</span>
                  </div>
                </div>

                {/* Cantidad compensada */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                    borderRadius: '16px',
                    padding: '20px 40px',
                    color: '#ffffff',
                    textAlign: 'center',
                    boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)'
                  }}>
                    <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '4px' }}>
                      {data.emissionsKg.toLocaleString()} kg
                    </div>
                    <div style={{ color: '#bbf7d0', fontSize: '14px' }}>
                      de CO₂ compensado
                    </div>
                  </div>
                </div>

                {/* Equivalencias */}
                {data.equivalences && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '24px' }}>
                    {data.equivalences.treesPlanted && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: '#dcfce7',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 8px auto'
                        }}>
                          <FaTree style={{ color: '#16a34a', fontSize: '20px' }} />
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                          {data.equivalences.treesPlanted}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>árboles plantados</div>
                      </div>
                    )}
                    {data.equivalences.carKmAvoided && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: '#dbeafe',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 8px auto'
                        }}>
                          <FaCar style={{ color: '#2563eb', fontSize: '20px' }} />
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                          {data.equivalences.carKmAvoided.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>km en auto evitados</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer con proyecto y fecha */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Proyecto de compensación</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaGlobeAmericas style={{ color: '#22c55e' }} />
                      <span style={{ fontWeight: '600', color: '#374151' }}>{data.projectName}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{data.projectType}</div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Fecha de compensación</div>
                    <div style={{ fontWeight: '600', color: '#374151' }}>{formatDate(data.compensationDate)}</div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      border: '2px solid #bbf7d0',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#ffffff'
                    }}>
                      <div>
                        <FaLeaf style={{ color: '#22c55e', fontSize: '24px' }} />
                        <div style={{ fontSize: '8px', color: '#16a34a', fontWeight: '700', marginTop: '4px' }}>VERIFICADO</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info adicional */}
        <div className="!px-6 !pb-6">
          <div className="!bg-gray-50 !rounded-xl !p-4 !text-center !text-sm !text-gray-600">
            <p>
              Este certificado es válido y verificable. Tu contribución apoya proyectos de 
              reforestación y energías renovables certificados internacionalmente.
            </p>
            <p className="!mt-2 !text-xs !text-gray-400">
              www.compensatuviaje.cl | contacto@compensatuviaje.cl
            </p>
          </div>
        </div>
      </motion.div>

      {/* Mint NFT Modal */}
      <MintNFTModal
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        compensationId={data.certificateId}
        compensationData={{
          co2Amount: data.emissionsKg,
          projectName: data.projectName,
          travelType: data.projectType
        }}
        onSuccess={() => setNftMinted(true)}
      />
    </div>
  );
};

export default CertificateGenerator;
