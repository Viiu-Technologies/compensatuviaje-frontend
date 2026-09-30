import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShareAlt, FaLinkedin, FaCheck, FaLeaf } from 'react-icons/fa';
import B2CLayout from '../components/B2CLayout';
import { TrophyRoomPanel, BADGES } from '../components/badges/TrophyRoomPanel';
import b2cApi from '../services/b2cApi';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, Skeleton, btn, fmtTons } from '../ui';

/** Insignia más alta alcanzada; null si todavía no compensa nada. */
function currentBadge(kg: number) {
  return [...BADGES].reverse().find((b) => kg >= b.threshold) ?? null;
}

/**
 * Antes el botón de compartir aparecía aunque el usuario no hubiera
 * compensado nada, con un texto que decía "Acabo de neutralizar mi huella
 * de carbono y gané mi insignia oficial". Ahora solo aparece con una
 * insignia desbloqueada y el texto dice cuánto compensó. También se quitó
 * la tarjeta "Próximamente: reducción de temperatura", que no tenía nada
 * detrás.
 */
function ShareCard({ userId, totalKg }: { userId: string; totalKg: number }) {
  const [copied, setCopied] = useState(false);
  const badge = currentBadge(totalKg);
  if (!badge) return null;

  const shareUrl = `${window.location.origin}/share/profile/${userId}`;
  const text = `Compensé ${fmtTons(totalKg / 1000)} de CO₂e de mis viajes y obtuve la insignia «${badge.title}» en CompensaTuViaje.`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Mi insignia: ${badge.title}`, text, url: shareUrl });
      } catch {
        // El usuario cerró el diálogo de compartir.
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLinkedIn = () => {
    const now = new Date();
    // Pendiente: agregar &organizationId= cuando exista la página de empresa en LinkedIn.
    const url =
      'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME' +
      `&name=${encodeURIComponent(badge.title)}` +
      `&organizationName=${encodeURIComponent('CompensaTuViaje')}` +
      `&issueYear=${now.getFullYear()}&issueMonth=${now.getMonth() + 1}` +
      `&certUrl=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader
        icon={FaShareAlt}
        title="Comparte tu insignia"
        subtitle={<>Tu insignia actual es <b className="text-gray-800">{badge.title}</b>.</>}
      />
      <p className="text-sm text-gray-600 m-0 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">{text}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={handleShare} className={btn.primary}>
          {copied ? <FaCheck aria-hidden="true" /> : <FaShareAlt aria-hidden="true" />}
          {copied ? 'Texto copiado' : 'Compartir'}
        </button>
        <button type="button" onClick={handleLinkedIn} className={btn.secondary}>
          <FaLinkedin className="text-[#0A66C2]" aria-hidden="true" /> Añadir a LinkedIn
        </button>
      </div>
    </Card>
  );
}

const B2CAchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const [totalKg, setTotalKg] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await b2cApi.getDashboardStats('all');
        setTotalKg(data.stats.lifetimeCompensatedKg);
      } catch {
        // Sin datos, las insignias se muestran bloqueadas.
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <B2CLayout title="Mis logros" subtitle="Insignias según el CO₂e que compensaste">
      <div className="space-y-6">
        {loading ? (
          <Skeleton className="h-72" />
        ) : (
          <>
            <TrophyRoomPanel totalCompensatedKg={totalKg} />
            {user && totalKg > 0 ? (
              <ShareCard userId={user.id} totalKg={totalKg} />
            ) : (
              <Card className="p-6 flex items-center justify-between gap-4 flex-wrap">
                <p className="text-sm text-gray-600 m-0">Compensa tu primer viaje para desbloquear la insignia Semilla Climática.</p>
                <Link to="/b2c/calculator" className={btn.primary}><FaLeaf aria-hidden="true" /> Calcular mi huella</Link>
              </Card>
            )}
          </>
        )}
      </div>
    </B2CLayout>
  );
};

export default B2CAchievementsPage;
