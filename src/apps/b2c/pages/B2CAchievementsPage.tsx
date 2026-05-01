import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaLock,
  FaShareAlt,
  FaLeaf,
  FaTrophy,
  FaLinkedin,
  FaCopy,
  FaCheck,
} from 'react-icons/fa';
import B2CLayout from '../components/B2CLayout';
import { TrophyRoomPanel } from '../components/badges/TrophyRoomPanel';
import b2cApi from '../services/b2cApi';
import { useAuth } from '../context/AuthContext';

/* ── Badge thresholds (mirrors shareService.js) ──────────────── */
const BADGE_LEVELS = [
  { slug: 'guardian', title: 'Guardián del Clima', minKg: 5000 },
  { slug: 'viajero',  title: 'Viajero Consciente', minKg: 1000 },
  { slug: 'semilla',  title: 'Semilla Climática',  minKg: 0.001 },
] as const;

function getBadgeTitle(kg: number): string {
  for (const level of BADGE_LEVELS) {
    if (kg >= level.minKg) return level.title;
  }
  return 'Semilla Climática';
}

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
      <div className="!absolute !inset-0 !bg-gradient-to-br !from-gray-50 !to-white !pointer-events-none" />
      <div className="!absolute !top-4 !right-4 !flex !items-center !gap-1.5 !bg-gray-100 !text-gray-500 !text-xs !font-semibold !px-3 !py-1 !rounded-full">
        <FaLock className="!text-[10px]" />
        Próximamente
      </div>
      <div className="!relative !flex !items-start !gap-4">
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

/* ── Tarjeta de compartir (desbloqueada) ─────────────────────── */
interface ShareCardProps {
  userId: string;
  totalKg: number;
}

function ShareCard({ userId, totalKg }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const API_BASE =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_APP_API_URL ||
    'http://localhost:3001/api';
  const shareUrl = `${API_BASE}/public/share/profile/${userId}`;
  const badgeTitle = getBadgeTitle(totalKg);
  const shareText = `Acabo de neutralizar mi huella de carbono y gané mi insignia oficial en Compensatuviaje. 🌱🌍 ¡Mide tu huella y únete a mí aquí! ${shareUrl}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mi insignia: ${badgeTitle}`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // user cancelled — do nothing
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLinkedIn = () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    // TODO: add &organizationId=XXXXX once LinkedIn company page is created
    const url =
      `https://www.linkedin.com/profile/add` +
      `?startTask=CERTIFICATION_NAME` +
      `&name=${encodeURIComponent(badgeTitle)}` +
      `&organizationName=${encodeURIComponent('CompensaTuViaje')}` +
      `&issueYear=${year}` +
      `&issueMonth=${month}` +
      `&certUrl=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="!relative !bg-white !rounded-2xl !border !border-green-100 !shadow-sm !p-6 !overflow-hidden">
      <div className="!absolute !inset-0 !bg-gradient-to-br !from-green-50/40 !to-white !pointer-events-none" />

      <div className="!relative !flex !items-start !gap-4">
        {/* Icono */}
        <div className="!w-12 !h-12 !rounded-xl !bg-green-100 !flex !items-center !justify-center !text-green-600 !text-xl !flex-shrink-0">
          <FaShareAlt />
        </div>

        <div className="!flex-1 !min-w-0">
          <h3 className="!text-base !font-bold !text-gray-800 !mb-1">Compartir mi Impacto</h3>
          <p className="!text-sm !text-gray-500 !leading-relaxed !mb-4">
            Comparte tu insignia <span className="!font-semibold !text-green-700">{badgeTitle}</span> en redes sociales y muestra tu compromiso con el clima.
          </p>

          <div className="!flex !flex-wrap !gap-3">
            {/* Botón compartir / copiar */}
            <button
              onClick={handleShare}
              className="!flex !items-center !gap-2 !bg-green-600 hover:!bg-green-700 !text-white !text-sm !font-semibold !px-4 !py-2 !rounded-xl !transition-colors !cursor-pointer"
            >
              {copied ? <FaCheck className="!text-xs" /> : <FaShareAlt className="!text-xs" />}
              {copied ? '¡Texto copiado!' : 'Compartir mi Impacto'}
            </button>

            {/* Botón LinkedIn */}
            <button
              onClick={handleLinkedIn}
              className="!flex !items-center !gap-2 !bg-[#0A66C2] hover:!bg-[#004182] !text-white !text-sm !font-semibold !px-4 !py-2 !rounded-xl !transition-colors !cursor-pointer"
            >
              <FaLinkedin />
              Añadir a LinkedIn
            </button>

            {/* Hint copiar en desktop */}
            {!('share' in navigator) && !copied && (
              <span className="!self-center !flex !items-center !gap-1 !text-xs !text-gray-400">
                <FaCopy className="!text-[10px]" />
                Se copiará el texto listo para pegar
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Página principal ─────────────────────────────────────────── */
const B2CAchievementsPage: React.FC = () => {
  const { user } = useAuth();
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

        {/* Compartir + Funciones próximamente */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="!space-y-4"
        >
          <h2 className="!text-sm !font-bold !text-gray-400 !uppercase !tracking-wider !px-1">
            Comparte tu impacto
          </h2>

          {/* Share card — only shown when user is loaded and has at least some kg */}
          {user && !loading && (
            <ShareCard userId={user.id} totalKg={totalKg} />
          )}

          <h2 className="!text-sm !font-bold !text-gray-400 !uppercase !tracking-wider !px-1 !pt-2">
            Más funciones en camino
          </h2>

          <LockedFeatureCard
            icon={<FaLeaf />}
            title="Impacto Ecológico"
            description="Visualiza métricas detalladas de tu impacto: árboles equivalentes, reducción de temperatura y más."
            hint="En desarrollo"
          />
        </motion.div>

      </div>
    </B2CLayout>
  );
};

export default B2CAchievementsPage;
