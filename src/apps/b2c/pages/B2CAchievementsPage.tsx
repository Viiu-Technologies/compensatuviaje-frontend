import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaLock,
  FaShareAlt,
  FaLeaf,
  FaTrophy,
} from 'react-icons/fa';
import B2CLayout from '../components/B2CLayout';
import { TrophyRoomPanel } from '../components/badges/TrophyRoomPanel';
import b2cApi from '../services/b2cApi';

/* ── Tarjeta de función próximamente ─────────────────────────── */
interface LockedFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  hint: string;
}

function LockedFeatureCard({ icon, title, description, hint }: LockedFeatureCardProps) {
  return (
    <div className="!relative !bg-white !rounded-2xl !border !border-gray-100 !shadow-sm !p-6 !overflow-hidden !opacity-70">
      {/* Fondo decorativo */}
      <div className="!absolute !inset-0 !bg-gradient-to-br !from-gray-50 !to-white !pointer-events-none" />

      {/* Chip "Próximamente" */}
      <div className="!absolute !top-4 !right-4 !flex !items-center !gap-1.5 !bg-gray-100 !text-gray-500 !text-xs !font-semibold !px-3 !py-1 !rounded-full">
        <FaLock className="!text-[10px]" />
        Próximamente
      </div>

      <div className="!relative !flex !items-start !gap-4">
        {/* Icono */}
        <div className="!w-12 !h-12 !rounded-xl !bg-gray-100 !flex !items-center !justify-center !text-gray-400 !text-xl !flex-shrink-0">
          {icon}
        </div>

        <div>
          <h3 className="!text-base !font-bold !text-gray-600 !mb-1">{title}</h3>
          <p className="!text-sm !text-gray-400 !leading-relaxed">{description}</p>
          <p className="!text-xs !text-green-500 !font-medium !mt-2 !italic">{hint}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Página principal ─────────────────────────────────────────── */
const B2CAchievementsPage: React.FC = () => {
  const [totalKg, setTotalKg] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await b2cApi.getDashboardStats();
        setTotalKg(data.stats.totalCompensatedKg ?? 0);
      } catch {
        // silently degrade — badges still render with kg=0
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const LOCKED_FEATURES: LockedFeatureCardProps[] = [
    {
      icon: <FaShareAlt />,
      title: 'Compartir Logro',
      description:
        'Comparte tus insignias desbloqueadas en redes sociales y muestra tu compromiso con el clima.',
      hint: 'Próxima actualización',
    },
    {
      icon: <FaLeaf />,
      title: 'Impacto Ecológico',
      description:
        'Visualiza métricas detalladas de tu impacto: árboles equivalentes, reducción de temperatura y más.',
      hint: 'En desarrollo',
    },
  ];

  return (
    <B2CLayout>
      <div className="!max-w-3xl !mx-auto !px-4 !py-8 !space-y-8">

        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="!flex !items-center !gap-3"
        >
          <div className="!w-10 !h-10 !rounded-xl !bg-green-50 !flex !items-center !justify-center !text-green-600 !text-xl">
            <FaTrophy />
          </div>
          <div>
            <h1 className="!text-2xl !font-bold !text-gray-900">Mis Logros</h1>
            <p className="!text-sm !text-gray-500">Tu historial de impacto y recompensas climáticas</p>
          </div>
        </motion.div>

        {/* Insignias */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          {loading ? (
            <div className="!bg-white !rounded-2xl !border !border-gray-100 !shadow-sm !p-12 !flex !justify-center">
              <div className="!w-8 !h-8 !rounded-full !border-2 !border-green-500 !border-t-transparent !animate-spin" />
            </div>
          ) : (
            <TrophyRoomPanel totalCompensatedKg={totalKg} />
          )}
        </motion.div>

        {/* Funciones próximamente */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="!space-y-4"
        >
          <h2 className="!text-sm !font-bold !text-gray-400 !uppercase !tracking-wider !px-1">
            Más funciones en camino
          </h2>
          {LOCKED_FEATURES.map((feat) => (
            <LockedFeatureCard key={feat.title} {...feat} />
          ))}
        </motion.div>

      </div>
    </B2CLayout>
  );
};

export default B2CAchievementsPage;
