// Cierre sobre el teal de marca: un último vuelo traza el arco punteado y
// aparecen logo, tagline, el CTA de la web y la URL. Los últimos frames quedan
// quietos.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { HiArrowRight } from 'react-icons/hi';
import Plane from '../../../../src/apps/public/components/heroScroll/Plane';
import { BRAND } from '../../data/example';
import { isPortrait } from '../../formats';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../theme/fonts';
import { C } from '../../theme/palette';
import { draw, easeInOut, prog, quad, quadAngle, rise, type Pt } from '../anim';
import { FADE, OUTRO } from '../timing';

export const OutroScene: React.FC = () => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const portrait = isPortrait(W, H);

  const A: Pt = { x: -120, y: H * (portrait ? 0.3 : 0.34) };
  const B: Pt = { x: W + 120, y: A.y };
  const Cc: Pt = { x: W / 2, y: H * (portrait ? 0.02 : -0.02) };
  const arcD = `M${A.x} ${A.y} Q${Cc.x} ${Cc.y} ${B.x} ${B.y}`;
  const t = prog(f, OUTRO.planeArc, easeInOut);
  const plane = quad(A, Cc, B, t);

  return (
    <AbsoluteFill style={{ opacity: prog(f, [0, FADE]), background: C.teal950 }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <mask id="sv-outro-arc" maskUnits="userSpaceOnUse">
            <path d={arcD} pathLength={1} fill="none" stroke="#fff" strokeWidth="20" style={draw(t)} />
          </mask>
        </defs>
        <path d={arcD} fill="none" stroke="#5EE08A" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.5 14" opacity="0.7" mask="url(#sv-outro-arc)" />
        {t > 0 && t < 1 && (
          <g transform={`translate(${plane.x} ${plane.y}) rotate(${quadAngle(A, Cc, B, t)}) scale(0.9)`}>
            {/* Sobre el teal, el avión va en claro */}
            <g style={{ filter: 'invert(1) brightness(1.6)' }}>
              <Plane />
            </g>
          </g>
        )}
      </svg>

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 44, paddingTop: portrait ? 160 : 140, textAlign: 'center' }}>
        <Img src={staticFile('brand/logo-horizontal-white.svg')} style={{ height: 92, width: 'auto', ...rise(prog(f, OUTRO.logoIn), 20) }} />
        <div
          style={{
            ...rise(prog(f, OUTRO.lineIn), 20),
            fontFamily: FONT_DISPLAY,
            fontSize: portrait ? 84 : 92,
            fontWeight: 600,
            letterSpacing: '-0.025em',
            lineHeight: 1.04,
            color: C.canvas,
          }}
        >
          {BRAND.tagline}
        </div>
        <div style={{ ...rise(prog(f, OUTRO.urlIn), 20), display: 'flex', flexDirection: portrait ? 'column' : 'row', alignItems: 'center', gap: portrait ? 26 : 34 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              padding: '22px 40px',
              borderRadius: 999,
              background: '#1F8A4C',
              color: '#fff',
              fontFamily: FONT_BODY,
              fontSize: 30,
              fontWeight: 600,
            }}
          >
            Calcula tu huella <HiArrowRight size={30} />
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 32, color: 'rgba(245, 248, 244, 0.8)' }}>{BRAND.url}</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
