import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Leaf, CreditCard, ChevronRight, Download, Share2, Plane, TreePine } from "lucide-react";
import type { PaymentStepProps } from "../types";
import { useTheme } from "../../../../../shared/context/ThemeContext";

export const PaymentStep: React.FC<PaymentStepProps> = ({ formData, onComplete, calculationResult }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [certificateId, setCertificateId] = useState("0000");

  useEffect(() => {
    setCertificateId(Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
  }, []);

  const handlePayment = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsCompleted(true);
      onComplete();
    }, 2000);
  };

  // Formatear precio
  const formatPriceCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const priceCLP = calculationResult?.pricing?.totalPriceCLP || 12500;
  const priceUSD = calculationResult?.pricing?.totalPriceUSD || 12.50;
  const kgCO2 = calculationResult?.emissions?.kgCO2e || 400;
  const tonCO2 = calculationResult?.emissions?.tonCO2e || 0.4;

  if (isCompleted) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="!text-center !py-8 !space-y-6"
      >
        <div className="!relative !w-24 !h-24 !mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className={`!w-full !h-full !rounded-full !flex !items-center !justify-center !text-green-600 ${isDark ? '!bg-green-900/50' : '!bg-green-100'}`}
          >
            <Check size={48} strokeWidth={3} />
          </motion.div>
          {/* Eco Confetti */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, x: 0, y: 0 }}
              animate={{ 
                opacity: 0, 
                x: (Math.random() - 0.5) * 200, 
                y: (Math.random() - 0.5) * 200,
                rotate: Math.random() * 360
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="!absolute !top-1/2 !left-1/2 !text-green-600"
            >
              <Leaf size={12} />
            </motion.div>
          ))}
        </div>
        
        <div className="!space-y-2">
          <h2 className={`!text-3xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-800'}`}>¡Compensación Exitosa!</h2>
          <p className={`!max-w-md !mx-auto ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
            Gracias por contribuir a un futuro más verde. Has compensado <span className="!font-bold !text-green-600">{kgCO2.toFixed(1)} kg de CO₂</span>.
          </p>
        </div>

        {/* Certificate Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`!p-6 !rounded-xl !shadow-lg !max-w-sm !mx-auto !border !relative !overflow-hidden ${
            isDark ? '!bg-gray-800 !border-green-700/50' : '!bg-white !border-green-200'
          }`}
        >
          <div className="!absolute !top-0 !left-0 !w-full !h-2 !bg-gradient-to-r !from-green-500 !to-emerald-500" />
          <h3 className={`!font-serif !text-xl !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-800'}`}>Certificado de Impacto</h3>
          <div className="!space-y-3 !text-sm !text-left">
            {calculationResult && (
              <div className="!flex !justify-between">
                <span className={isDark ? '!text-gray-400' : '!text-gray-500'}>Ruta</span>
                <span className={`!font-medium ${isDark ? '!text-gray-200' : ''}`}>{calculationResult.meta.route.origin.code} → {calculationResult.meta.route.destination.code}</span>
              </div>
            )}
            <div className="!flex !justify-between">
              <span className={isDark ? '!text-gray-400' : '!text-gray-500'}>Proyecto</span>
              <span className={`!font-medium !capitalize ${isDark ? '!text-gray-200' : ''}`}>{formData.projectType === 'social' ? 'Impacto Social' : 'Reforestación'}</span>
            </div>
            <div className="!flex !justify-between">
              <span className={isDark ? '!text-gray-400' : '!text-gray-500'}>Compensación</span>
              <span className="!font-medium !text-green-600">{tonCO2.toFixed(3)} tCO₂e</span>
            </div>
            <div className="!flex !justify-between">
              <span className={isDark ? '!text-gray-400' : '!text-gray-500'}>Monto</span>
              <span className={`!font-medium ${isDark ? '!text-gray-200' : ''}`}>{formatPriceCLP(priceCLP)}</span>
            </div>
          </div>
          <div className={`!mt-6 !pt-4 !border-t !flex !justify-between !items-center ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
            <span className={`!text-xs ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>ID: #ECO-{certificateId}</span>
            <Leaf size={16} className="!text-green-600" />
          </div>
        </motion.div>

        {/* Actions */}
        <div className="!flex !justify-center !gap-4 !pt-4">
          <button className={`!flex !items-center !gap-2 !px-4 !py-2 !rounded-xl !font-medium !transition-colors !border-0 ${
            isDark ? '!bg-gray-700 hover:!bg-gray-600 !text-gray-200' : '!bg-gray-100 hover:!bg-gray-200 !text-gray-600'
          }`}>
            <Download size={18} /> Descargar
          </button>
          <button className={`!flex !items-center !gap-2 !px-4 !py-2 !rounded-xl !font-medium !transition-colors !border-0 ${
            isDark ? '!bg-green-900/50 hover:!bg-green-900 !text-green-400' : '!bg-green-100 hover:!bg-green-200 !text-green-700'
          }`}>
            <Share2 size={18} /> Compartir
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="!space-y-8"
    >
      {/* Trip Summary */}
      <div className={`!rounded-2xl !p-6 !shadow-sm !border ${
        isDark ? '!bg-gray-800 !border-gray-700' : '!bg-white !border-gray-100'
      }`}>
        <h3 className={`!text-lg !font-bold !mb-4 !flex !items-center !gap-2 ${isDark ? '!text-gray-100' : '!text-gray-800'}`}>
          <Plane className="!w-5 !h-5 !text-green-600" />
          Resumen del Viaje
        </h3>
        <div className={`!relative !pl-6 !border-l-2 !space-y-6 ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
          <div className="!relative">
            <div className="!absolute !-left-[29px] !top-1 !w-4 !h-4 !rounded-full !bg-emerald-500 !border-2 !border-white !shadow-sm" />
            <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-400'}`}>Origen</p>
            <p className={`!font-medium ${isDark ? '!text-gray-100' : '!text-gray-800'}`}>
              {calculationResult?.meta?.route?.origin?.city || formData.origin} 
              {calculationResult?.meta?.route?.origin?.code && ` (${calculationResult.meta.route.origin.code})`}
            </p>
          </div>
          <div className="!relative">
            <div className="!absolute !-left-[29px] !top-1 !w-4 !h-4 !rounded-full !bg-orange-500 !border-2 !border-white !shadow-sm" />
            <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-400'}`}>Destino</p>
            <p className={`!font-medium ${isDark ? '!text-gray-100' : '!text-gray-800'}`}>
              {calculationResult?.meta?.route?.destination?.city || formData.destination}
              {calculationResult?.meta?.route?.destination?.code && ` (${calculationResult.meta.route.destination.code})`}
            </p>
          </div>
        </div>
        
        {/* Emission Details */}
        <div className={`!mt-6 !pt-4 !border-t !grid !grid-cols-3 !gap-4 !text-center ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
          <div>
            <p className="!text-xl !font-bold !text-green-600">{kgCO2.toFixed(1)}</p>
            <p className={`!text-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>kg CO₂e</p>
          </div>
          <div>
            <p className="!text-xl !font-bold !text-blue-600">{calculationResult?.meta?.distanceKmTotal?.toLocaleString() || '0'}</p>
            <p className={`!text-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>km</p>
          </div>
          <div>
            <p className="!text-xl !font-bold !text-purple-600">{calculationResult?.equivalencies?.trees || 0}</p>
            <p className={`!text-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>árboles equiv.</p>
          </div>
        </div>
      </div>

      {/* Project Selected */}
      <div className={`!rounded-xl !p-4 !border !flex !items-center !gap-4 ${
        isDark 
          ? '!bg-gradient-to-r !from-green-900/30 !to-emerald-900/30 !border-green-700/50' 
          : '!bg-gradient-to-r !from-green-50 !to-emerald-50 !border-green-200'
      }`}>
        <div className={`!w-12 !h-12 !rounded-full !flex !items-center !justify-center !text-white ${
          formData.projectType === 'social' ? '!bg-orange-500' : '!bg-green-600'
        }`}>
          {formData.projectType === 'social' ? <Leaf className="!w-6 !h-6" /> : <TreePine className="!w-6 !h-6" />}
        </div>
        <div>
          <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Proyecto seleccionado</p>
          <p className={`!font-bold ${isDark ? '!text-gray-100' : '!text-gray-800'}`}>
            {formData.projectType === 'social' ? 'Impacto Social' : 'Reforestación'}
          </p>
        </div>
      </div>

      {/* Payment Card */}
      <div className="!bg-gradient-to-br !from-gray-900 !to-gray-800 !rounded-2xl !p-6 !text-white !shadow-xl !relative !overflow-hidden">
        <div className="!absolute !top-0 !right-0 !w-32 !h-32 !bg-white/5 !rounded-full !-mr-16 !-mt-16 !blur-2xl" />
        
        <div className="!flex !justify-between !items-start !mb-6">
          <div>
            <p className="!text-gray-400 !text-sm !mb-1">Total a pagar</p>
            <h3 className="!text-3xl !font-bold">${priceUSD} USD</h3>
            <p className="!text-sm !text-gray-400 !mt-1">{formatPriceCLP(priceCLP)} CLP</p>
          </div>
          <CreditCard className="!text-white/80 !w-8 !h-8" />
        </div>

        <div className="!space-y-4">
          <div className="!bg-white/10 !rounded-lg !p-3 !backdrop-blur-sm !border !border-white/10">
            <div className="!flex !items-center !gap-3">
              <div className="!w-10 !h-6 !bg-gradient-to-r !from-blue-600 !to-blue-800 !rounded !flex !items-center !justify-center">
                <span className="!text-[10px] !font-bold">VISA</span>
              </div>
              <span className="!text-sm !tracking-wider">•••• •••• •••• 4242</span>
            </div>
          </div>
          <p className="!text-xs !text-gray-400 !text-center">Demo: El pago es simulado</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="!w-full !mt-6 !py-4 !bg-green-500 hover:!bg-green-600 disabled:!opacity-70 !text-white !rounded-xl !font-semibold !text-lg !transition-all !duration-300 !flex !items-center !justify-center !gap-2 !shadow-lg !shadow-green-500/20 !border-0"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Leaf size={24} />
            </motion.div>
          ) : (
            <>
              Pagar y Compensar <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
