import React from 'react';

/**
 * Wordmark "CompensaTuViaje" envuelto en bruma.
 *
 * El h1 es texto real (SEO y lectores de pantalla). En móvil se parte en dos
 * líneas ("CompensaTu / Viaje") con dos spans sin espacio entre ellos, así se
 * sigue leyendo como una sola palabra.
 *
 * La bruma es un SVG de elipses blancas deformadas con feTurbulence +
 * feDisplacementMap y difuminadas. Las coordenadas viven en un viewBox de
 * 1000 × 400 estirado sobre el wordmark: el hero convierte la x de cada elipse
 * a la del escenario para abrirla justo cuando pasa el avión.
 */

/** cx, cy, rx, ry, opacidad. `desktopOnly`: en móvil hay menos elipses. */
export const MIST_ELLIPSES: { cx: number; cy: number; rx: number; ry: number; o: number; desktopOnly?: boolean }[] = [
  { cx: 70, cy: 205, rx: 130, ry: 62, o: 0.62 },
  { cx: 190, cy: 240, rx: 140, ry: 54, o: 0.7, desktopOnly: true },
  { cx: 300, cy: 180, rx: 135, ry: 64, o: 0.66 },
  { cx: 420, cy: 225, rx: 150, ry: 58, o: 0.74, desktopOnly: true },
  { cx: 530, cy: 190, rx: 145, ry: 62, o: 0.7 },
  { cx: 650, cy: 232, rx: 140, ry: 56, o: 0.74, desktopOnly: true },
  { cx: 760, cy: 196, rx: 150, ry: 62, o: 0.72 },
  { cx: 880, cy: 228, rx: 125, ry: 56, o: 0.66, desktopOnly: true },
  { cx: 960, cy: 190, rx: 110, ry: 52, o: 0.6 },
];

type Props = {
  methodology: string;
};

const CloudWordmark: React.FC<Props> = ({ methodology }) => (
  <div className="hs-wordmark">
    <p className="hs-eyebrow">Huella de carbono · medible y trazable</p>

    <div className="hs-wm">
      <h1 className="hs-wm__title">
        <span className="hs-wm__line">CompensaTu</span>
        <span className="hs-wm__line">Viaje</span>
      </h1>

      <svg
        className="hs-mist"
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id="hs-mist-filter" x="-20%" y="-60%" width="140%" height="220%">
            <feTurbulence type="fractalNoise" baseFrequency="0.011 0.028" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="70" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <g filter="url(#hs-mist-filter)">
          {MIST_ELLIPSES.map((e, i) => (
            <ellipse
              key={i}
              className={`hs-mist__e${e.desktopOnly ? ' hs-mist__e--desktop' : ''}`}
              data-cx={e.cx}
              cx={e.cx}
              cy={e.cy}
              rx={e.rx}
              ry={e.ry}
              fill="#ffffff"
              opacity={e.o}
            />
          ))}
        </g>
      </svg>
    </div>

    <p className="hs-sub">
      Calcula y compensa las emisiones de tus vuelos con factores oficiales {methodology}.
    </p>
  </div>
);

export default CloudWordmark;
