import React, { useState } from 'react';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '../../../shared/config/apps';
import './AppDownload.css';

type Platform = 'android' | 'ios' | null;

/**
 * Sistema del teléfono, o null en escritorio. iPadOS se presenta como Mac, así
 * que un "Mac" táctil cuenta como iOS.
 */
function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return 'ios';
  return null;
}

/* Insignias oficiales de Apple y Google: sus guías de marca no permiten
   redibujarlas ni cambiarles el color. */
const AppStoreBadge: React.FC<{ className?: string }> = ({ className }) => (
  <a className={`ad-badge ${className ?? ''}`} href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
    <img
      src="/images/apps/app-store-badge.svg"
      alt="Descargar en el App Store"
      width={120}
      height={40}
      loading="lazy"
      decoding="async"
    />
  </a>
);

const GooglePlayBadge: React.FC<{ className?: string }> = ({ className }) => (
  <a className={`ad-badge ${className ?? ''}`} href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer">
    <img
      src="/images/apps/google-play-badge-es.png"
      alt="Disponible en Google Play"
      width={135}
      height={40}
      loading="lazy"
      decoding="async"
    />
  </a>
);

/**
 * Descarga de las apps para personas.
 *
 * - En el teléfono, solo la tienda de ese teléfono (un QR ahí no sirve: no se
 *   puede escanear la propia pantalla), con la opción de ver la otra.
 * - En escritorio, las dos tiendas y un QR que lleva a la correcta según el
 *   teléfono que lo escanee.
 *
 * `compact`: solo las insignias, para el pie de página.
 */
const AppDownload: React.FC<{ variant?: 'section' | 'compact' }> = ({ variant = 'section' }) => {
  const [platform] = useState<Platform>(detectPlatform);
  const [showBoth, setShowBoth] = useState(false);

  const both = platform === null || showBoth;
  const badges = (
    <div className="ad-badges">
      {(both || platform === 'android') && <GooglePlayBadge />}
      {(both || platform === 'ios') && <AppStoreBadge />}
    </div>
  );
  const otherStore = !both && (
    <button type="button" className="ad-other" onClick={() => setShowBoth(true)}>
      ¿Otro teléfono? Ver {platform === 'android' ? 'App Store' : 'Google Play'}
    </button>
  );

  if (variant === 'compact') {
    return (
      <div className="ad-compact">
        <p className="ad-compact__label">Descarga la app</p>
        {badges}
        {otherStore}
      </div>
    );
  }

  return (
    <section className="ad-section" aria-labelledby="ad-title">
      <div className="ad-container">
        <div className="ad-card">
          <div className="ad-copy">
            <p className="ad-eyebrow">App para personas</p>
            <h2 id="ad-title" className="ad-title">CompensaTuViaje también en tu teléfono</h2>
            <p className="ad-lead">Descarga la app gratis en Android o iPhone.</p>
            {badges}
            {otherStore}
          </div>

          {platform === null && (
            <figure className="ad-qr">
              <img
                src="/images/apps/app-qr.svg"
                alt="Código QR para descargar la app"
                width={160}
                height={160}
                loading="lazy"
                decoding="async"
              />
              <figcaption className="ad-qr__caption">
                Escanéalo con la cámara de tu teléfono: abre la tienda que corresponde.
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
};

export default AppDownload;
