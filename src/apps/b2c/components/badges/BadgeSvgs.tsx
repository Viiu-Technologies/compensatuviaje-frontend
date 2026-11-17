/**
 * Insignias isométricas: Semilla (brote), Viajero (globo) y Guardián (árbol).
 *
 * El dibujo vive en el backend (src/modules/public/og/badgeArt.js), que lo usa
 * también para la imagen que se ve al compartir el perfil por WhatsApp: así la
 * insignia de la app y la de la vista previa son la misma. Para cambiarlo, se
 * edita allá y se regenera badgeArt.generated.ts con
 * `node scripts/export-badge-svgs.js`.
 *
 * Se insertan como HTML (no JSX) porque traen sus propias animaciones CSS, que
 * se desactivan con prefers-reduced-motion.
 */
import { SEMILLA_SVG, VIAJERO_SVG, GUARDIAN_SVG } from './badgeArt.generated';

interface SvgProps {
  className?: string;
}

function RawSvg({ svg, className }: { svg: string; className?: string }) {
  return (
    <div
      className={className}
      style={{ width: '100%', height: '100%' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function SproutSvg({ className }: SvgProps) {
  return <RawSvg svg={SEMILLA_SVG} className={className} />;
}

export function GlobeSvg({ className }: SvgProps) {
  return <RawSvg svg={VIAJERO_SVG} className={className} />;
}

export function TreeSvg({ className }: SvgProps) {
  return <RawSvg svg={GUARDIAN_SVG} className={className} />;
}
