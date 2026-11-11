import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { SproutSvg, GlobeSvg, TreeSvg } from '../components/badges/BadgeSvgs';

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_APP_API_URL ||
  'http://localhost:3001/api';

// ─── Types ─────────────────────────────────────────────────────────────────────
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

// ─── Badge config ──────────────────────────────────────────────────────────────
const BADGE_LEVELS = [
  {
    slug: 'semilla',
    title: 'Semilla Climática',
    emoji: '🌱',
    threshold: 0.001,
    Svg: SproutSvg,
    color: '#F9A825',
    colorDim: '#F9A82540',
  },
  {
    slug: 'viajero',
    title: 'Viajero Consciente',
    emoji: '🌍',
    threshold: 1000,
    Svg: GlobeSvg,
    color: '#29B6F6',
    colorDim: '#29B6F640',
  },
  {
    slug: 'guardian',
    title: 'Guardián del Clima',
    emoji: '🌳',
    threshold: 5000,
    Svg: TreeSvg,
    color: '#66BB6A',
    colorDim: '#66BB6A40',
  },
];

// ─── Formatters ────────────────────────────────────────────────────────────────
function formatKg(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2).replace('.', ',')} t`;
  return `${Math.round(kg).toLocaleString('es-CL')} kg`;
}

// ─── Count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setValue(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

// ─── Google Fonts loader ───────────────────────────────────────────────────────
function useFonts() {
  useEffect(() => {
    if (document.getElementById('pip-fonts')) return;
    const link = document.createElement('link');
    link.id = 'pip-fonts';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,300&family=DM+Sans:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);
}

// ─── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  value,
  unit,
  label,
  icon,
  delay,
}: {
  value: string;
  unit: string;
  label: string;
  icon: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 20,
        padding: '20px 24px',
        textAlign: 'center',
        flex: '1 1 0',
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {value}
        <span style={{ fontSize: '0.5em', fontWeight: 300, marginLeft: 4, opacity: 0.7 }}>
          {unit}
        </span>
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </div>
    </motion.div>
  );
}

// ─── Journey badge item ────────────────────────────────────────────────────────
function JourneyBadge({
  badge,
  isUnlocked,
  isCurrent,
  totalKg,
  index,
}: {
  badge: (typeof BADGE_LEVELS)[0];
  isUnlocked: boolean;
  isCurrent: boolean;
  totalKg: number;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const progress =
    badge.threshold <= 0.001
      ? 100
      : Math.min(100, (totalKg / badge.threshold) * 100);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        flex: '1 1 0',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        opacity: isUnlocked ? 1 : 0.45,
        position: 'relative',
      }}
    >
      {/* Glow ring on current badge */}
      <div
        style={{
          position: 'relative',
          width: isUnlocked ? 88 : 72,
          height: isUnlocked ? 88 : 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isCurrent && (
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${badge.color}60 0%, transparent 70%)`,
            }}
          />
        )}
        <badge.Svg />
      </div>

      {/* Badge name */}
      <div
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 15,
          fontWeight: 700,
          color: isUnlocked ? '#fff' : 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {badge.title}
      </div>

      {/* Status */}
      {isUnlocked ? (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: badge.color,
            fontFamily: "'DM Sans', sans-serif",
            background: `${badge.color}18`,
            border: `1px solid ${badge.color}40`,
            borderRadius: 20,
            padding: '3px 10px',
          }}
        >
          ✓ Desbloqueado
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: 96 }}>
          <div
            style={{
              height: 4,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.1)',
              overflow: 'hidden',
              marginBottom: 4,
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: `${progress}%` } : {}}
              transition={{ delay: index * 0.12 + 0.3, duration: 0.9, ease: 'easeOut' }}
              style={{
                height: '100%',
                borderRadius: 4,
                background: `linear-gradient(90deg, ${badge.color}80, ${badge.color})`,
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>
            {badge.threshold <= 0.001
              ? ''
              : `Faltan ${badge.threshold - totalKg >= 1000
                  ? `${((badge.threshold - totalKg) / 1000).toFixed(1)} t`
                  : `${Math.ceil(badge.threshold - totalKg)} kg`}`}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
const PublicImpactProfile: React.FC = () => {
  useFonts();
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/public/share/profile/${userId}/data`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(json => {
        if (json?.success) {
          setData(json);
          // Slight delay so fonts load before count-up starts
          setTimeout(() => setHeroReady(true), 200);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [userId]);

  const totalKg = data?.totalCompensatedKg ?? 0;
  const counted = useCountUp(Math.round(totalKg), 1800, heroReady);
  const level = data?.level;

  // Resolve theme colors
  const themeFrom = level?.gradient[0] ?? '#134e1a';
  const themeTo   = level?.gradient[1] ?? '#1a6324';
  const currentBadge = BADGE_LEVELS.find(b => b.slug === level?.slug);
  const accentColor = currentBadge?.color ?? '#66BB6A';

  // Equivalences
  const trees = Math.round(totalKg / 21);
  const flights = Math.round(totalKg / 115); // ~BCN-MAD avg

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#071209',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#66BB6A',
          }}
        />
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (notFound || !data) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#071209',
          gap: 16,
          padding: '32px 24px',
          textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ fontSize: 56 }}>🌿</div>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>
          Perfil no encontrado
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, maxWidth: 320 }}>
          Este enlace puede haber expirado o ser incorrecto.
        </p>
        <Link
          to="/b2c/calculator"
          style={{
            marginTop: 8,
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff',
            borderRadius: 14,
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: 15,
          }}
        >
          Calcula tu huella aquí
        </Link>
      </div>
    );
  }

  const { nombre, avatarUrl } = data;
  const firstName = nombre.split(' ')[0];

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#071209',
        fontFamily: "'DM Sans', sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingBottom: 64,
        }}
      >
        {/* Mesh background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 80% 60% at 50% -10%, ${themeFrom}cc 0%, transparent 60%),
              radial-gradient(ellipse 60% 80% at 100% 100%, ${themeTo}55 0%, transparent 50%),
              linear-gradient(180deg, #071209 60%, #0a1a0e 100%)
            `,
          }}
        />

        {/* Subtle grain overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />

        {/* Brand header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            padding: '24px 24px 0',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            compensatuviaje.com
          </div>
        </motion.div>

        {/* Content */}
        <div
          style={{
            position: 'relative',
            maxWidth: 560,
            margin: '0 auto',
            padding: '40px 24px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'relative', marginBottom: 20 }}
          >
            {/* Glow ring */}
            <motion.div
              animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.15, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: -10,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${accentColor}80 0%, transparent 70%)`,
              }}
            />
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={nombre}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  border: `2px solid ${accentColor}60`,
                  objectFit: 'cover',
                  position: 'relative',
                }}
              />
            ) : (
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  border: `2px solid ${accentColor}60`,
                  background: `${accentColor}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 34,
                  fontWeight: 700,
                  color: accentColor,
                  fontFamily: "'Fraunces', serif",
                  position: 'relative',
                }}
              >
                {nombre[0]?.toUpperCase()}
              </div>
            )}
          </motion.div>

          {/* Badge chip */}
          {level && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: `${accentColor}18`,
                border: `1px solid ${accentColor}45`,
                borderRadius: 40,
                padding: '7px 16px',
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 16 }}>{level.emoji}</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: accentColor,
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '0.02em',
                }}
              >
                {level.title}
              </span>
            </motion.div>
          )}

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(2rem, 7vw, 3.2rem)',
              fontWeight: 700,
              color: '#fff',
              margin: '0 0 8px',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}
          >
            {firstName}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.5)',
              margin: '0 0 32px',
              fontWeight: 400,
            }}
          >
            ha neutralizado su huella de carbono
          </motion.p>

          {/* CO₂ big number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.6, type: 'spring', bounce: 0.3 }}
            style={{ marginBottom: 6 }}
          >
            <div
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 'clamp(4rem, 18vw, 7rem)',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                color: '#fff',
                // Text gradient
                background: `linear-gradient(135deg, #fff 30%, ${accentColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {totalKg >= 1000
                ? `${(counted / 1000).toFixed(2).replace('.', ',')} t`
                : `${counted.toLocaleString('es-CL')} kg`}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: 17,
              color: 'rgba(255,255,255,0.4)',
              margin: 0,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            de CO₂ compensados
          </motion.p>
        </div>
      </div>

      {/* ── STATS STRIP ────────────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 560,
          margin: '0 auto',
          padding: '0 20px',
          transform: 'translateY(-28px)',
        }}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 4 }}>
          <StatCard
            value={trees >= 1000 ? `${(trees / 1000).toFixed(1)}k` : String(trees)}
            unit="árboles"
            label="equivalente anual"
            icon="🌲"
            delay={0.55}
          />
          <StatCard
            value={String(flights)}
            unit="vuelos"
            label="cortos compensados"
            icon="✈️"
            delay={0.65}
          />
          <StatCard
            value={String(BADGE_LEVELS.filter(b => totalKg >= b.threshold).length)}
            unit={`/ ${BADGE_LEVELS.length}`}
            label="insignias ganadas"
            icon="🏅"
            delay={0.75}
          />
        </div>
      </div>

      {/* ── JOURNEY ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '8px 24px 48px' }}>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 32, textAlign: 'center' }}
        >
          <div
            style={{
              display: 'inline-block',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: accentColor,
              marginBottom: 8,
            }}
          >
            Camino climático
          </div>
          <h2
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
              fontWeight: 700,
              color: '#fff',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Sus insignias de impacto
          </h2>
        </motion.div>

        {/* Badge cards */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 24,
            padding: '32px 20px',
          }}
        >
          {/* Connector line */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: 44,
                left: '16.5%',
                right: '16.5%',
                height: 2,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 2,
              }}
            />
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.min(100, ((BADGE_LEVELS.filter(b => totalKg >= b.threshold).length - 1) / (BADGE_LEVELS.length - 1)) * 67)}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: 44,
                left: '16.5%',
                height: 2,
                background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)`,
                borderRadius: 2,
              }}
            />

            {/* Badges row */}
            <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
              {BADGE_LEVELS.map((badge, i) => (
                <JourneyBadge
                  key={badge.slug}
                  badge={badge}
                  isUnlocked={totalKg >= badge.threshold}
                  isCurrent={badge.slug === level?.slug}
                  totalKg={totalKg}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          margin: '0 20px 40px',
          maxWidth: 520,
          marginLeft: 'auto',
          marginRight: 'auto',
          borderRadius: 28,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${themeFrom}ee 0%, ${themeTo}ee 100%)`,
            padding: 'clamp(28px, 6vw, 44px)',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Decorative blobs */}
          <div
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌍</div>
            <h3
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 'clamp(1.3rem, 4vw, 1.75rem)',
                fontWeight: 700,
                color: '#fff',
                margin: '0 0 10px',
                lineHeight: 1.25,
              }}
            >
              ¿Te inspira la huella de {firstName}?
            </h3>
            <p
              style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.65)',
                margin: '0 0 28px',
                maxWidth: 360,
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.55,
              }}
            >
              Calcula las emisiones de tus vuelos y compénsalas apoyando proyectos
              de carbono verificados en Chile.
            </p>
            <Link
              to="/b2c/calculator"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '15px 32px',
                background: '#fff',
                color: themeFrom,
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
              }}
            >
              ✈️ Calcula y compensa tu huella
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Brand footer */}
      <div style={{ textAlign: 'center', paddingBottom: 40 }}>
        <Link
          to="/"
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.2)',
            textDecoration: 'none',
            letterSpacing: '0.08em',
            fontWeight: 500,
          }}
        >
          compensatuviaje.com
        </Link>
      </div>
    </div>
  );
};

export default PublicImpactProfile;
