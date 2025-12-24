import React, { useEffect, useState } from 'react';
import './LogoLoop.css';

type LogoItem = { src: string; alt?: string };

interface Props {
  logos: LogoItem[];
  logoHeight?: number;
  gap?: number;
  speed?: number;
}

// Native CSS-based continuous loop fallback
const NativeLogoLoop: React.FC<Props> = ({ logos, logoHeight = 88, gap = 120, speed = 90 }) => {
  // Duplicate the logos so the loop is seamless
  const items = [...logos, ...logos];

  // Estimate animation duration (seconds) based on number of items, logo size and gap and desired speed
  // duration = total_length_in_px / speed_px_per_s. We approximate width per item ~= logoHeight * 1.8
  // Use a slightly more conservative estimate for item width to give breathing room
  const approxItemWidth = logoHeight * 2 + gap;
  const totalLength = approxItemWidth * logos.length; // one set length in px
  // duration in seconds = totalLength(px) / speed(px/s)
  const durationSeconds = Math.max(8, Math.round(totalLength / speed));

  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [allLoaded, setAllLoaded] = React.useState(false);

  // Wait for images to load, measure one set width, then set CSS vars for seamless loop
  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const imgs = Array.from(track.querySelectorAll('img')) as HTMLImageElement[];
    if (!imgs.length) {
      setAllLoaded(true);
      return;
    }

    let loaded = 0;
    const onImgLoad = () => {
      loaded += 1;
      if (loaded === imgs.length) {
        // all images in both duplicated halves are loaded
        // measure the width of the first half
        const children = Array.from(track.children) as HTMLElement[];
        const half = Math.floor(children.length / 2);
        if (half === 0) {
          setAllLoaded(true);
          return;
        }
        let width = 0;
        for (let i = 0; i < half; i++) {
          const el = children[i] as HTMLElement;
          const rect = el.getBoundingClientRect();
          width += rect.width;
        }

        // set CSS vars: translate distance and duration based on speed (px per second)
        const pxPerSec = Math.max(10, speed); // avoid divide by zero
        const duration = Math.max(1, Math.round((width / pxPerSec) * 100) / 100);

        // set track width explicitly to avoid flex reflow during animation
        track.style.width = `${width * 2}px`;
        track.style.setProperty('--translate-x', `-${width}px`);
        track.style.setProperty('--loop-duration', `${duration}s`);

        // allow animation to run by adding running class (we keep base class present)
        track.classList.add('native-loop-running');
        setAllLoaded(true);
      }
    };

    imgs.forEach((img) => {
      if (img.complete) {
        onImgLoad();
      } else {
        img.addEventListener('load', onImgLoad, { once: true });
        img.addEventListener('error', onImgLoad, { once: true });
      }
    });

    return () => {
      imgs.forEach((img) => {
        img.removeEventListener('load', onImgLoad);
        img.removeEventListener('error', onImgLoad);
      });
    };
  }, [logos, speed]);

  return (
    <div className="native-loop-outer" aria-label="Métodos de pago">
      <div
        ref={trackRef}
        className="native-loop-track"
        style={{
          '--logo-height': `${logoHeight}px`,
          '--loop-gap': `${gap}px`,
          // keep default duration until measured
          '--loop-duration': `${durationSeconds}s`,
          // translate-x will be set after measurement
        } as React.CSSProperties}
      >
        {items.map((l, i) => (
          <div className="native-loop-item" key={i}>
            <img src={l.src} alt={l.alt || `logo-${i}`} style={{ height: logoHeight }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const tryImports = [
  '@react-bits/logo-loop',
  '@react-bits/logo-loop-js-css',
  '@react-bits/LogoLoop-JS-CSS',
  '@react-bits/logoloop'
];

const LogoLoopComponent: React.FC<Props> = ({ logos, logoHeight = 60, gap = 48, speed = 100 }) => {
  const [RemoteComp, setRemoteComp] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      for (const name of tryImports) {
        try {
          // try to dynamically import candidate module names
          // eslint-disable-next-line no-await-in-loop
          const mod = await import(/* webpackIgnore: true */ name).catch(() => null);
          if (mod && mounted) {
            const comp = (mod as any).default ?? (mod as any).LogoLoop ?? mod;
            setRemoteComp(() => comp);
            return;
          }
        } catch (e) {
          // continue to next candidate
        }
      }
      // If none available, leave RemoteComp null => use native fallback
    })();

    return () => { mounted = false; };
  }, []);

  if (RemoteComp) {
    const C = RemoteComp;
    return (
      <div className="logo-loop-container">
        {/* @ts-ignore */}
        <C
          logos={logos.map(l => l.src)}
          logoHeight={logoHeight}
          gap={gap}
          speed={speed}
          hoverSpeed={0}
          fadeOut
          scaleOnHover
          ariaLabel="Métodos de pago"
          className="custom-logo-loop"
        />
      </div>
    );
  }

  return <NativeLogoLoop logos={logos} logoHeight={logoHeight} gap={gap} speed={speed} />;
};

export default LogoLoopComponent;