import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShareAlt, FaLinkedin, FaCheck, FaLeaf, FaWhatsapp } from 'react-icons/fa';
import B2CLayout from '../components/B2CLayout';
import { TrophyRoomPanel, BADGES } from '../components/badges/TrophyRoomPanel';
import b2cApi, { type B2CBadgeItem, type ShareCardData } from '../services/b2cApi';
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
 *
 * La tarjeta muestra la misma imagen que verá quien reciba el enlace. Pedirla
 * aquí hace que ya esté generada cuando WhatsApp la busque: antes, el primer
 * envío solía salir sin imagen porque WhatsApp no esperaba a que se generara.
 */
function ShareCard({ userId, totalKg }: { userId: string; totalKg: number }) {
  const [copied, setCopied] = useState(false);
  const [card, setCard] = useState<ShareCardData | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setPreviewFailed(false);
    b2cApi.getShareCard(userId).then((c) => { if (alive) setCard(c); });
    return () => { alive = false; };
  }, [userId, totalKg]);

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

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`;
  const previewUrl = previewFailed ? null : card?.ogImageUrl ?? null;
  const showPreview = previewUrl !== null;

  return (
    <Card>
      <CardHeader
        icon={FaShareAlt}
        title="Comparte tu insignia"
        subtitle={<>Tu insignia actual es <b className="text-gray-800">{badge.title}</b>.</>}
      />
      <div className={showPreview ? 'grid gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:items-center' : ''}>
        {previewUrl && (
          <figure className="m-0">
            <img
              src={previewUrl}
              alt={`Vista previa al compartir: insignia ${badge.title}`}
              width={1200}
              height={630}
              decoding="async"
              onError={() => setPreviewFailed(true)}
              className="block w-full h-auto aspect-[1200/630] rounded-xl border border-gray-200 bg-brand-950 shadow-sm"
            />
            <figcaption className="mt-2 text-xs text-gray-500">Así se verá tu enlace en WhatsApp, LinkedIn y otras redes.</figcaption>
          </figure>
        )}
        <div>
          <p className="text-sm text-gray-600 m-0 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">{text}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={btn.primary}>
              <FaWhatsapp aria-hidden="true" /> Enviar por WhatsApp
            </a>
            <button type="button" onClick={handleShare} className={btn.secondary}>
              {copied ? <FaCheck aria-hidden="true" /> : <FaShareAlt aria-hidden="true" />}
              {copied ? 'Texto copiado' : 'Compartir'}
            </button>
            <button type="button" onClick={handleLinkedIn} className={btn.secondary}>
              <FaLinkedin className="text-[#0A66C2]" aria-hidden="true" /> Añadir a LinkedIn
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

const B2CAchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const [totalKg, setTotalKg] = useState(0);
  const [badges, setBadges] = useState<B2CBadgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [data, badgesRes] = await Promise.all([
          b2cApi.getDashboardStats('all'),
          b2cApi.getBadges(),
        ]);
        const calcKg = data?.stats?.lifetimeCompensatedKg ?? 0;
        setTotalKg(Math.max(calcKg, badgesRes.totalCompensatedKg ?? 0));
        setBadges(badgesRes.badges ?? []);
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
            <TrophyRoomPanel totalCompensatedKg={totalKg} badges={badges} />
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
