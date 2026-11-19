import React, { useEffect, useRef, useState } from 'react';
import './ForestPassage.css';

/**
 * Entrada a los proyectos: se avanza por un sendero entre árboles hasta llegar
 * a un claro de luz, y ahí aparecen los proyectos.
 *
 * - Una vez por sesión (no cada vez que se vuelve a la página).
 * - Con prefers-reduced-motion no se monta: la lista aparece directo.
 * - Dura menos de 3,5 s y se puede saltar (botón o Esc).
 * - Solo anima transform y opacity: cada capa de árboles es un <svg> que crece
 *   desde el horizonte y se desvanece al pasar junto a la cámara.
 *
 * `ready` indica que los proyectos ya cargaron: el claro no se abre antes,
 * así la animación también cubre la carga.
 */

const SEEN_KEY = 'ctv:b2c-bosque-visto';
const LAYERS = 7;

/** Pseudoaleatorio estable: el bosque es el mismo en cada visita. */
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

type Tree = { x: number; h: number; kind: 'pine' | 'round'; shade: number };

/** Árboles a ambos lados, dejando libre el sendero del centro. */
function layerTrees(layer: number): Tree[] {
  const trees: Tree[] = [];
  for (let i = 0; i < 9; i++) {
    const r = rand(layer * 31 + i);
    const left = i % 2 === 0;
    // 0–36 % a la izquierda, 64–100 % a la derecha.
    const x = left ? 20 + r * 340 : 640 + r * 340;
    trees.push({
      x,
      h: 150 + rand(layer * 17 + i * 3) * 110,
      kind: rand(layer * 7 + i * 11) > 0.35 ? 'pine' : 'round',
      shade: rand(layer * 13 + i * 5),
    });
  }
  return trees;
}

const BASE = 372; // pie de los árboles, apenas bajo el horizonte (y = 330)

const TreeShape: React.FC<{ t: Tree }> = ({ t }) => {
  const fill = t.shade > 0.5 ? 'var(--fp-tree-a)' : 'var(--fp-tree-b)';
  const trunk = <rect x={t.x - 4} y={BASE - 18} width={8} height={18} fill="var(--fp-trunk)" />;
  if (t.kind === 'round') {
    const r = t.h * 0.3;
    return (
      <g>
        {trunk}
        <ellipse cx={t.x} cy={BASE - 18 - r * 0.9} rx={r * 0.85} ry={r} fill={fill} />
      </g>
    );
  }
  const w = t.h * 0.42;
  const tiers = [0, 0.3, 0.55];
  return (
    <g>
      {trunk}
      {tiers.map((k, i) => {
        const bottom = BASE - 14 - t.h * k;
        const tw = w * (1 - k * 0.65);
        return (
          <polygon
            key={i}
            points={`${t.x - tw / 2},${bottom} ${t.x + tw / 2},${bottom} ${t.x},${bottom - t.h * 0.48}`}
            fill={fill}
          />
        );
      })}
    </g>
  );
};

const FOREST = Array.from({ length: LAYERS }, (_, i) => layerTrees(i));

function shouldPlay(): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return false;
  try {
    return sessionStorage.getItem(SEEN_KEY) !== '1';
  } catch {
    return true;
  }
}

const ForestPassage: React.FC<{ ready: boolean }> = ({ ready }) => {
  const [playing, setPlaying] = useState(shouldPlay);
  const [clearing, setClearing] = useState(false);
  const [minDone, setMinDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Recorrido mínimo por el bosque antes de abrir el claro.
  useEffect(() => {
    if (!playing) return;
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* sin almacenamiento */ }
    const t = window.setTimeout(() => setMinDone(true), 2100);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPlaying(false); };
    window.addEventListener('keydown', onKey);
    return () => { window.clearTimeout(t); window.removeEventListener('keydown', onKey); };
  }, [playing]);

  useEffect(() => {
    if (playing && minDone && ready) setClearing(true);
  }, [playing, minDone, ready]);

  if (!playing) return null;

  return (
    <div
      ref={rootRef}
      className={`fp-root${clearing ? ' fp-root--clearing' : ''}`}
      // El claro termina con la capa en opacidad 0: recién ahí se desmonta.
      onAnimationEnd={(e) => { if (e.target === rootRef.current && e.animationName === 'fp-root-out') setPlaying(false); }}
    >
      <div className="fp-camera" aria-hidden="true">
        <div className="fp-sky" />
        <div className="fp-sun" />
        <div className="fp-ground" />
        <div className="fp-trees">
        {FOREST.map((trees, i) => (
          <svg
            key={i}
            className="fp-layer"
            viewBox="0 0 1000 600"
            preserveAspectRatio="xMidYMid slice"
            style={{ '--fp-i': i } as React.CSSProperties}
          >
            {trees.map((t, k) => <TreeShape key={k} t={t} />)}
          </svg>
        ))}
        </div>
        <div className="fp-mist" />
        <div className="fp-light" />
      </div>

      <p className="fp-caption" role="status">
        {clearing ? 'Llegaste al claro' : 'Buscando proyectos para tu viaje…'}
      </p>
      <button type="button" className="fp-skip" onClick={() => setPlaying(false)}>
        Saltar
      </button>
    </div>
  );
};

export default ForestPassage;
