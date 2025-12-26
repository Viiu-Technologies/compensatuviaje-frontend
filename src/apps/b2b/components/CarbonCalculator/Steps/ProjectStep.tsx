import React from "react";
import { motion } from "framer-motion";
import { Users, TreeDeciduous, Info, Plane, MapPin, ChevronRight, Droplets, Home, Shirt } from "lucide-react";
import type { ProjectStepProps, FormData } from "../types";
import { useTheme } from "../../../../../shared/context/ThemeContext";

export const ProjectStep: React.FC<ProjectStepProps> = ({ formData, setValue, onNext, calculationResult }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const projectType = formData.projectType;
  
  const projects = [
    {
      id: "social",
      title: "Impacto Social",
      description: "Apoya comunidades vulnerables a través de educación y energía limpia.",
      icon: Users,
      color: "!bg-orange-500",
      stats: calculationResult?.equivalencies?.trees ? `${Math.ceil(calculationResult.equivalencies.trees * 0.5)} Familias` : "5 Familias",
      detail: "Proyectos de cocinas limpias en Perú"
    },
    {
      id: "environmental",
      title: "Reforestación",
      description: "Restaura ecosistemas nativos y protege la biodiversidad local.",
      icon: TreeDeciduous,
      color: "!bg-green-600",
      stats: calculationResult?.equivalencies?.trees ? `${calculationResult.equivalencies.trees} Árboles` : "12 Árboles",
      detail: "Conservación de bosque valdiviano"
    }
  ];

  // Formatear precio
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="!space-y-8"
    >
      {/* Calculation Summary */}
      {calculationResult && (
        <div className={`!rounded-2xl !p-6 !border ${
          isDark 
            ? '!bg-gradient-to-r !from-green-900/30 !to-emerald-900/30 !border-green-700/50' 
            : '!bg-gradient-to-r !from-green-50 !to-emerald-50 !border-green-200'
        }`}>
          <div className="!flex !items-center !justify-between !mb-4">
            <div className="!flex !items-center !gap-3">
              <div className="!w-10 !h-10 !bg-green-500 !rounded-full !flex !items-center !justify-center">
                <Plane className="!w-5 !h-5 !text-white" />
              </div>
              <div>
                <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Tu ruta</p>
                <p className={`!font-bold ${isDark ? '!text-gray-100' : '!text-gray-800'}`}>
                  {calculationResult.meta.route.origin.code} → {calculationResult.meta.route.destination.code}
                </p>
              </div>
            </div>
            <div className="!text-right">
              <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Distancia</p>
              <p className={`!font-bold ${isDark ? '!text-gray-100' : '!text-gray-800'}`}>{calculationResult.meta.distanceKmTotal.toLocaleString()} km</p>
            </div>
          </div>
          
          <div className={`!grid !grid-cols-2 md:!grid-cols-4 !gap-4 !pt-4 !border-t ${isDark ? '!border-green-700/50' : '!border-green-200'}`}>
            <div className="!text-center">
              <p className="!text-2xl !font-bold !text-green-600">{calculationResult.emissions.kgCO2e.toFixed(1)}</p>
              <p className={`!text-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>kg CO₂e</p>
            </div>
            <div className="!text-center">
              <p className="!text-2xl !font-bold !text-blue-600">{calculationResult.equivalencies?.trees || 0}</p>
              <p className={`!text-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Árboles equiv.</p>
            </div>
            <div className="!text-center">
              <p className="!text-2xl !font-bold !text-orange-600">{formatPrice(calculationResult.pricing.totalPriceCLP)}</p>
              <p className={`!text-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Compensación</p>
            </div>
            <div className="!text-center">
              <p className="!text-2xl !font-bold !text-purple-600">${calculationResult.pricing.totalPriceUSD}</p>
              <p className={`!text-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>USD</p>
            </div>
          </div>
        </div>
      )}

      <div className="!text-center !space-y-2">
        <h2 className={`!text-2xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-800'}`}>Elige tu impacto</h2>
        <p className={isDark ? '!text-gray-400' : '!text-gray-500'}>
          Tu vuelo generó aproximadamente{" "}
          <span className="!font-bold !text-green-600">
            {calculationResult ? `${calculationResult.emissions.tonCO2e.toFixed(3)} toneladas` : "0.4 toneladas"}
          </span>{" "}
          de CO₂
        </p>
      </div>

      <div className="!grid md:!grid-cols-2 !gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => setValue("projectType", project.id as FormData["projectType"])}
            className="!group !cursor-pointer"
          >
            <motion.div
              className={`!relative !w-full !transition-all !duration-300 ${
                projectType === project.id ? "!ring-4 !ring-emerald-500/30 !rounded-2xl" : ""
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Card Content */}
              <div className={`!relative !rounded-2xl !p-6 !flex !flex-col !justify-between !border !shadow-sm !transition-colors !min-h-[16rem] ${
                projectType === project.id 
                  ? isDark ? "!border-emerald-500 !bg-gray-800" : "!border-emerald-500 !bg-white"
                  : isDark ? "!border-gray-600 !bg-gray-800/50" : "!border-gray-100 !bg-white"
              }`}>
                <div>
                  <div className={`!w-12 !h-12 !rounded-full !flex !items-center !justify-center !mb-4 !text-white ${project.color}`}>
                    <project.icon size={24} />
                  </div>
                  <h3 className={`!text-xl !font-bold !mb-2 ${isDark ? '!text-gray-100' : '!text-gray-800'}`}>{project.title}</h3>
                  <p className={`!text-sm !leading-relaxed ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>{project.description}</p>
                </div>
                
                <div className={`!flex !items-center !justify-between !pt-4 !border-t !mt-4 ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
                  <div className="!flex !flex-col">
                    <span className={`!text-xs !uppercase !tracking-wider ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>Impacto</span>
                    <span className={`!font-bold ${isDark ? '!text-gray-100' : '!text-gray-800'}`}>{project.stats}</span>
                  </div>
                  <div className="!group/tooltip !relative">
                    <Info size={18} className={`hover:!text-emerald-500 !transition-colors !cursor-help ${isDark ? '!text-gray-500' : '!text-gray-300'}`} />
                    <div className="!absolute !bottom-full !right-0 !mb-2 !px-3 !py-1.5 !bg-gray-800 !text-white !text-xs !rounded-lg !shadow-lg !whitespace-nowrap !opacity-0 group-hover/tooltip:!opacity-100 !transition-opacity !z-50">
                      {project.detail}
                    </div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {projectType === project.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="!absolute !top-4 !right-4 !w-6 !h-6 !bg-green-500 !rounded-full !flex !items-center !justify-center"
                  >
                    <svg className="!w-4 !h-4 !text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <motion.button
        type="button"
        onClick={onNext}
        disabled={!projectType}
        className={`!w-full !py-4 !rounded-xl !font-semibold !text-lg !transition-all !duration-300 !border-0 !flex !items-center !justify-center !gap-2 ${
          projectType
            ? "!bg-gradient-to-r !from-green-500 !to-emerald-600 hover:!from-green-600 hover:!to-emerald-700 !text-white !shadow-lg !shadow-green-500/30"
            : "!bg-gray-200 !text-gray-400 !cursor-not-allowed"
        }`}
        whileHover={projectType ? { scale: 1.02 } : {}}
        whileTap={projectType ? { scale: 0.98 } : {}}
      >
        Continuar al Pago
        <ChevronRight className="!w-5 !h-5" />
      </motion.button>
    </motion.div>
  );
};
