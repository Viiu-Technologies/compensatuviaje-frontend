import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf, FaCalculator, FaTrophy } from 'react-icons/fa';
import { TrophyRoomPanel } from '../components/badges/TrophyRoomPanel';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_API_URL || 'http://localhost:3001/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ImpactData {
  nombre: string;
  avatarUrl: string | null;
  totalCompensatedKg: number;
  level: {
    slug: string;
    title: string;
    emoji: string;
    gradient: string[];
  } | null;
}

// ─── Formatters ───────────────────────────────────────────────────────────────
function formatKg(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2).replace('.', ',')} t`;
  }
  return `${Math.round(kg).toLocaleString('es-CL')} kg`;
}

// ─── Public page (no auth) ────────────────────────────────────────────────────
const PublicImpactProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/public/share/profile/${userId}/data`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(json => {
        if (json?.success) setData(json);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [userId]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="w-10 h-10 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (notFound || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 p-8 text-center">
        <FaLeaf className="text-5xl text-green-300" />
        <h1 className="text-2xl font-bold text-gray-700">Perfil no encontrado</h1>
        <p className="text-gray-500">Este enlace puede haber expirado o ser incorrecto.</p>
        <Link to="/b2c/calculator" className="mt-4 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 no-underline">
          Calcula tu huella aquí
        </Link>
      </div>
    );
  }

  const { nombre, avatarUrl, totalCompensatedKg, level } = data;

  // ── Background gradient from badge level (or default green) ─────────────
  const gradFrom = level?.gradient[0] ?? '#14532d';
  const gradTo   = level?.gradient[1] ?? '#166534';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)` }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(-30%,30%)' }} />

        <div className="relative max-w-3xl mx-auto px-6 py-16 text-center text-white">

          {/* Avatar */}
          {avatarUrl ? (
            <motion.img
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={avatarUrl}
              alt={nombre}
              className="w-24 h-24 rounded-full border-4 border-white/40 shadow-xl mx-auto mb-5 object-cover"
            />
          ) : (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 rounded-full border-4 border-white/40 shadow-xl mx-auto mb-5 flex items-center justify-center text-4xl font-bold"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              {nombre[0]?.toUpperCase()}
            </motion.div>
          )}

          {/* Badge chip */}
          {level && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)' }}
            >
              <span>{level.emoji}</span>
              <span>{level.title}</span>
            </motion.div>
          )}

          {/* Nombre */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-4xl font-bold mb-2"
          >
            {nombre}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/75 mb-6 text-lg"
          >
            ha compensado su huella de carbono
          </motion.p>

          {/* Big KG */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, type: 'spring' }}
            className="text-6xl font-bold tracking-tight mb-2"
          >
            {formatKg(totalCompensatedKg)}
          </motion.div>
          <p className="text-white/70 text-xl">de CO₂ compensados</p>

        </div>
      </div>

      {/* ── Trophy Room ───────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FaTrophy className="text-yellow-500" />
            <h2 className="text-lg font-bold text-gray-800">Sus Logros Climáticos</h2>
          </div>
          <TrophyRoomPanel totalCompensatedKg={totalCompensatedKg} />
        </motion.div>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl p-8 text-center"
          style={{ background: `linear-gradient(135deg, ${gradFrom}15 0%, ${gradTo}25 100%)`, border: `1px solid ${gradFrom}30` }}
        >
          <div className="text-3xl mb-3">🌍</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">¿Quieres compensar tu propia huella?</h3>
          <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">
            Calcula las emisiones de tus vuelos y compensalas apoyando proyectos de carbono verificados en Chile.
          </p>
          <Link
            to="/b2c/calculator"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-base no-underline shadow-lg hover:shadow-xl transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)` }}
          >
            <FaCalculator />
            Calcula y compensa tu huella aquí
          </Link>
        </motion.div>

        {/* Brand footer */}
        <div className="text-center pb-8">
          <Link to="/" className="text-gray-400 text-sm no-underline hover:text-gray-600">
            compensatuviaje.com
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PublicImpactProfile;
