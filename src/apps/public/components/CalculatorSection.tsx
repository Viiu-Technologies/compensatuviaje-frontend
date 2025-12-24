import React from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaPlane, FaRobot } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { CalculatorAI } from './Calculator';

const CalculatorSection: React.FC = () => {
  return (
    <section id="calculadora" className="!py-20 !relative !overflow-hidden !bg-gradient-to-br !from-[#0a0f1a] !via-[#0f172a] !to-[#1e293b]">
      {/* Background decorations */}
      <div className="!absolute !inset-0 !overflow-hidden !pointer-events-none">
        <div className="!absolute !top-0 !left-1/2 !-translate-x-1/2 !w-[800px] !h-[400px] !bg-green-500/5 !rounded-full !blur-3xl" />
        <div className="!absolute !bottom-0 !right-0 !w-[600px] !h-[600px] !bg-blue-500/5 !rounded-full !blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="!absolute !inset-0 !opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="!container !mx-auto !px-4 !relative !z-10">
        {/* Header */}
        <motion.div
          className="!text-center !mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="!inline-flex !items-center !gap-2 !px-4 !py-2 !bg-green-500/10 !rounded-full !border !border-green-500/20 !mb-6"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <HiSparkles className="!text-green-400" />
            <span className="!text-green-400 !text-sm !font-medium">Asistente IA</span>
          </motion.div>

          <h2 className="!text-3xl md:!text-4xl lg:!text-5xl !font-bold !text-white !mb-4">
            Calcula tu{' '}
            <span className="!bg-gradient-to-r !from-green-400 !to-emerald-500 !bg-clip-text !text-transparent">
              Huella de Carbono
            </span>
          </h2>
          
          <p className="!text-lg !text-gray-400 !max-w-2xl !mx-auto">
            Nuestro asistente inteligente te guiará paso a paso para calcular las emisiones de tu vuelo
            y descubrir cómo puedes compensarlas.
          </p>
        </motion.div>

        {/* Features pills */}
        <motion.div
          className="!flex !flex-wrap !justify-center !gap-4 !mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FeaturePill icon={<FaRobot />} text="Chat conversacional" />
          <FeaturePill icon={<FaPlane />} text="+10,000 aeropuertos" />
          <FeaturePill icon={<FaLeaf />} text="Metodología DEFRA 2025" />
        </motion.div>

        {/* Calculator Container */}
        <motion.div
          className="!max-w-3xl !mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <CalculatorAI />
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="!text-center !mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="!text-gray-500 !text-sm">
            ¿Tienes muchos vuelos? <a href="/empresas" className="!text-green-400 hover:!underline">Conoce nuestras soluciones empresariales →</a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Feature pill component
const FeaturePill: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="!flex !items-center !gap-2 !px-4 !py-2 !bg-white/5 !rounded-full !border !border-white/10">
    <span className="!text-green-400 !text-sm">{icon}</span>
    <span className="!text-gray-300 !text-sm">{text}</span>
  </div>
);

export default CalculatorSection;
