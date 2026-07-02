/* ============================================================================
   EcoArt — Ilustraciones SVG propias del landing.
   Lenguaje visual: trazos redondeados minimalistas, paleta de marca
   (verde #08AE06 / teal #073D3D), y la nube del logo como motivo recurrente.
   Todos aceptan className y heredan tamaño del contenedor.
   ========================================================================== */

type ArtProps = { className?: string };

const BRAND = 'var(--ctv-brand, #08AE06)';
const DEEP = 'var(--ctv-brand-deep, #073D3D)';

/* ── Nube de marca (mark del logo, reutilizable como sello) ─────────────── */
export const BrandCloud = ({ className, fill = BRAND }: ArtProps & { fill?: string }) => (
  <svg viewBox="0 0 132 88" className={className} aria-hidden="true">
    <defs>
      <mask id="ctvCloudCut">
        <rect width="132" height="88" fill="white" />
        <circle cx="52" cy="60" r="10" fill="black" />
        <circle cx="65" cy="49" r="12" fill="black" />
        <circle cx="79" cy="58" r="9" fill="black" />
        <rect x="49" y="53" width="36" height="16" rx="8" fill="black" />
        <path d="M 78 58 C 94 62 102 54 124 46" stroke="black" strokeWidth="5" fill="none" strokeLinecap="round" />
      </mask>
    </defs>
    <g fill={fill} mask="url(#ctvCloudCut)">
      <circle cx="36" cy="56" r="24" />
      <circle cx="64" cy="34" r="24" />
      <circle cx="95" cy="42" r="13" />
      <circle cx="104" cy="64" r="15" />
      <rect x="26" y="42" width="90" height="37" rx="18.5" />
    </g>
  </svg>
);

/* ── Campo de blobs orgánicos (patrón de las tarjetas corporativas) ─────── */
export const BlobField = ({ className, tone = 'rgba(7, 61, 61, 0.03)' }: ArtProps & { tone?: string }) => (
  <svg viewBox="0 0 1200 640" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.85 }}>
    <defs>
      <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--ctv-brand)" stopOpacity="0.08" />
        <stop offset="100%" stopColor="var(--ctv-brand-deep)" stopOpacity="0.03" />
      </linearGradient>
    </defs>
    {/* Soft organic blobs */}
    <g fill="url(#blobGrad)">
      <path d="M 150 100 Q 300 50 450 150 T 750 100 T 1050 200 L 1200 640 L 0 640 Z" />
      <circle cx="150" cy="180" r="120" opacity="0.6" filter="blur(40px)" />
      <circle cx="850" cy="280" r="180" opacity="0.4" filter="blur(60px)" />
    </g>
    {/* Tech grid connection lines (sutiles) */}
    <g stroke="var(--ctv-brand-deep)" strokeWidth="0.8" strokeOpacity="0.06" fill="none">
      <path d="M 100 100 L 250 220 H 400 L 500 350" />
      <path d="M 800 150 L 950 250 H 1100" />
      <path d="M 300 500 L 450 420 L 600 480" />
      <path d="M 700 480 L 820 400 H 980" />
    </g>
    {/* Connected nodes */}
    <g fill="var(--ctv-brand)" opacity="0.2">
      <circle cx="250" cy="220" r="4.5" />
      <circle cx="400" cy="220" r="3.5" />
      <circle cx="950" cy="250" r="4.5" />
      <circle cx="450" cy="420" r="4" />
      <circle cx="820" cy="400" r="4" />
    </g>
  </svg>
);

/* ── Planeta conectado — Tierra + red de nodos de datos ─────────────────── */
export const PlanetNetwork = ({ className }: ArtProps) => (
  <svg viewBox="0 0 420 420" className={className} aria-hidden="true">
    <defs>
      <radialGradient id="pnGlow" cx="50%" cy="42%" r="60%">
        <stop offset="0%" stopColor={BRAND} stopOpacity="0.22" />
        <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
      </radialGradient>
      <linearGradient id="pnSphere" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0E9E5C" />
        <stop offset="100%" stopColor={DEEP} />
      </linearGradient>
    </defs>
    <circle cx="210" cy="210" r="200" fill="url(#pnGlow)" />
    {/* órbitas */}
    <ellipse cx="210" cy="210" rx="164" ry="164" fill="none" stroke={DEEP} strokeOpacity="0.14" strokeWidth="1" />
    <ellipse cx="210" cy="210" rx="196" ry="120" fill="none" stroke={DEEP} strokeOpacity="0.10" strokeWidth="1" transform="rotate(-18 210 210)" />
    {/* planeta */}
    <circle cx="210" cy="210" r="108" fill="url(#pnSphere)" />
    {/* continentes estilizados (blobs de marca) */}
    <g fill={BRAND} opacity="0.85">
      <path d="M150 180 C150 162 172 154 188 162 C196 146 226 148 232 166 C252 162 264 180 254 194 C260 210 240 224 222 216 C212 230 182 226 176 210 C158 212 144 196 150 180 Z" />
      <path d="M212 262 C212 252 224 246 234 250 C240 240 258 242 262 254 C274 252 280 264 272 272 C276 282 262 290 252 284 C246 292 228 290 226 280 C216 280 208 270 212 262 Z" />
    </g>
    {/* meridianos sutiles */}
    <path d="M210 102 a108 108 0 0 1 0 216 a54 108 0 0 0 0 -216 Z" fill="#ffffff" opacity="0.05" />
    {/* nodos de datos conectados */}
    <g stroke={BRAND} strokeWidth="1.4" strokeOpacity="0.55" fill="none">
      <path d="M210 46 C 260 60 300 90 322 132" />
      <path d="M46 210 C 60 160 92 118 136 94" />
      <path d="M374 210 C 366 262 336 306 292 330" />
    </g>
    <g fill={BRAND}>
      <circle cx="210" cy="46" r="6" />
      <circle cx="46" cy="210" r="5" />
      <circle cx="374" cy="210" r="6" />
      <circle cx="322" cy="132" r="4" />
      <circle cx="136" cy="94" r="4" />
      <circle cx="292" cy="330" r="4" />
    </g>
    <g fill="#ffffff">
      <circle cx="210" cy="46" r="2.4" />
      <circle cx="374" cy="210" r="2.4" />
      <circle cx="46" cy="210" r="2" />
    </g>
  </svg>
);

/* ── Bosque minimalista — copas nube (eco del logo) sobre colinas ───────── */
export const ForestScene = ({ className }: ArtProps) => (
  <svg viewBox="0 0 480 360" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="fsSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EAF7EC" />
        <stop offset="100%" stopColor="#D8EEE4" />
      </linearGradient>
      <linearGradient id="fsHill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0E9E5C" />
        <stop offset="100%" stopColor="#0B6B4C" />
      </linearGradient>
    </defs>
    <rect width="480" height="360" rx="24" fill="url(#fsSky)" />
    <circle cx="392" cy="72" r="34" fill={BRAND} opacity="0.25" />
    <circle cx="392" cy="72" r="22" fill={BRAND} opacity="0.5" />
    {/* colinas */}
    <path d="M0 268 C 90 218 180 244 250 258 C 330 274 410 240 480 258 L480 336 A24 24 0 0 1 456 360 L24 360 A24 24 0 0 1 0 336 Z" fill="url(#fsHill)" />
    <path d="M0 300 C 110 264 220 292 320 296 C 390 298 440 284 480 292 L480 336 A24 24 0 0 1 456 360 L24 360 A24 24 0 0 1 0 336 Z" fill={DEEP} opacity="0.9" />
    {/* árboles copa-nube */}
    {[
      { x: 96, y: 226, s: 1 },
      { x: 208, y: 210, s: 1.35 },
      { x: 330, y: 232, s: 0.85 },
    ].map(({ x, y, s }, i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
        <rect x="-4" y="18" width="8" height="42" rx="4" fill={DEEP} />
        <g fill={i === 1 ? BRAND : '#0E9E5C'}>
          <circle cx="-22" cy="6" r="20" />
          <circle cx="2" cy="-12" r="24" />
          <circle cx="26" cy="4" r="18" />
          <rect x="-34" y="0" width="72" height="26" rx="13" />
        </g>
        <circle cx="6" cy="2" r="8" fill="#ffffff" opacity="0.35" />
      </g>
    ))}
    {/* aves */}
    <g stroke={DEEP} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.6">
      <path d="M120 96 q 8 -8 16 0 q 8 -8 16 0" />
      <path d="M180 120 q 6 -6 12 0 q 6 -6 12 0" />
    </g>
  </svg>
);

/* ── Hoja-circuito — naturaleza + IA/datos ──────────────────────────────── */
export const LeafCircuit = ({ className }: ArtProps) => (
  <svg viewBox="0 0 220 220" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="lcLeaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={BRAND} />
        <stop offset="100%" stopColor="#0B8A4A" />
      </linearGradient>
    </defs>
    <path
      d="M110 24 C 168 44 196 96 188 156 C 182 196 150 204 118 196 C 60 182 32 128 44 68 C 48 48 66 36 86 32 C 94 30 102 26 110 24 Z"
      fill="url(#lcLeaf)"
    />
    {/* venas como pistas de circuito */}
    <g stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.9">
      <path d="M112 178 C 108 140 110 100 122 62" />
      <path d="M116 130 L 84 108" />
      <path d="M112 156 L 148 138" />
      <path d="M120 96 L 152 84" />
      <path d="M114 118 L 92 132" />
    </g>
    <g fill="#ffffff">
      <circle cx="122" cy="62" r="5" />
      <circle cx="84" cy="108" r="4.4" />
      <circle cx="148" cy="138" r="4.4" />
      <circle cx="152" cy="84" r="4.4" />
      <circle cx="92" cy="132" r="3.6" />
    </g>
    <circle cx="122" cy="62" r="2.2" fill={BRAND} />
  </svg>
);

/* ── Huella de carbono → hoja (compensación) ────────────────────────────── */
export const FootprintLeaf = ({ className }: ArtProps) => (
  <svg viewBox="0 0 220 220" className={className} aria-hidden="true">
    {/* huella */}
    <g fill={DEEP} opacity="0.9">
      <path d="M74 132 C 58 132 48 116 52 96 C 56 74 74 62 92 68 C 108 74 114 94 108 114 C 103 130 88 132 74 132 Z" />
      <ellipse cx="52" cy="58" rx="9" ry="12" transform="rotate(-18 52 58)" />
      <ellipse cx="74" cy="46" rx="9" ry="13" transform="rotate(-8 74 46)" />
      <ellipse cx="97" cy="44" rx="8" ry="12" transform="rotate(4 97 44)" />
      <ellipse cx="117" cy="52" rx="7" ry="10" transform="rotate(16 117 52)" />
      <ellipse cx="72" cy="148" rx="26" ry="14" />
    </g>
    {/* flecha de compensación */}
    <path d="M118 118 C 148 108 158 130 150 152" stroke={BRAND} strokeWidth="4" strokeLinecap="round" fill="none" strokeDasharray="1 9" />
    {/* hoja */}
    <path d="M158 208 C 132 196 124 168 136 146 C 148 126 176 120 196 130 C 200 156 194 184 176 200 C 170 205 164 208 158 208 Z" fill={BRAND} />
    <path d="M160 196 C 158 176 164 156 178 142" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" fill="none" />
  </svg>
);

/* ── Molécula CO₂ capturada ─────────────────────────────────────────────── */
export const Co2Capture = ({ className }: ArtProps) => (
  <svg viewBox="0 0 220 220" className={className} aria-hidden="true">
    <g stroke={DEEP} strokeWidth="3" fill="none" opacity="0.5">
      <path d="M76 84 L 104 100" />
      <path d="M144 84 L 116 100" />
    </g>
    <circle cx="110" cy="108" r="22" fill={DEEP} />
    <circle cx="64" cy="76" r="15" fill={BRAND} />
    <circle cx="156" cy="76" r="15" fill={BRAND} />
    <text x="110" y="113" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif">C</text>
    <text x="64" y="81" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif">O</text>
    <text x="156" y="81" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif">O</text>
    {/* flechas hacia abajo — captura */}
    <g stroke={BRAND} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M84 148 L 84 172 M 74 164 L 84 174 L 94 164" />
      <path d="M136 148 L 136 172 M 126 164 L 136 174 L 146 164" />
    </g>
    <path d="M56 196 Q 110 178 164 196" stroke={BRAND} strokeWidth="5" strokeLinecap="round" fill="none" />
  </svg>
);

/* ── Gráfico de impacto — emisiones a la baja ───────────────────────────── */
export const ImpactChart = ({ className }: ArtProps) => (
  <svg viewBox="0 0 220 220" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="icArea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={BRAND} stopOpacity="0.35" />
        <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
      </linearGradient>
    </defs>
    <g stroke={DEEP} strokeOpacity="0.14" strokeWidth="1.4">
      <path d="M36 60 H 196" /> <path d="M36 104 H 196" /> <path d="M36 148 H 196" />
    </g>
    <path d="M36 64 C 76 76 96 116 128 138 C 152 154 176 162 196 166 L 196 192 L 36 192 Z" fill="url(#icArea)" />
    <path d="M36 64 C 76 76 96 116 128 138 C 152 154 176 162 196 166" stroke={BRAND} strokeWidth="4.5" strokeLinecap="round" fill="none" />
    <circle cx="196" cy="166" r="7" fill={BRAND} />
    <circle cx="196" cy="166" r="3" fill="#fff" />
    {/* hojita al final de la curva */}
    <path d="M196 150 C 190 140 192 128 202 122 C 212 128 214 140 208 150 C 205 154 199 154 196 150 Z" fill={BRAND} />
    <path d="M36 40 L 36 192 L 196 192" stroke={DEEP} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.65" />
  </svg>
);

/* ── Energía limpia — turbina + sol ─────────────────────────────────────── */
export const CleanEnergy = ({ className }: ArtProps) => (
  <svg viewBox="0 0 220 220" className={className} aria-hidden="true">
    <circle cx="168" cy="52" r="22" fill={BRAND} opacity="0.28" />
    <circle cx="168" cy="52" r="13" fill={BRAND} />
    <g fill={DEEP}>
      <rect x="104" y="108" width="9" height="84" rx="4.5" />
      <circle cx="108.5" cy="104" r="9" />
    </g>
    <g fill={BRAND}>
      <path d="M108 100 C 96 78 96 52 110 34 C 116 52 116 80 112 100 Z" />
      <path d="M104 108 C 80 110 58 122 48 140 C 68 140 92 128 104 114 Z" transform="rotate(8 104 108)" />
      <path d="M114 108 C 138 112 158 126 166 146 C 145 144 122 130 113 114 Z" />
    </g>
    <path d="M40 196 Q 110 180 180 196" stroke={DEEP} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />
    <path d="M64 190 C 60 182 64 174 72 172 C 78 178 78 188 72 192 Z" fill={BRAND} />
  </svg>
);

/* ── Certificado verificado (reemplaza el JPG genérico de NFT) ──────────── */
export const CertificateArt = ({ className }: ArtProps) => (
  <svg viewBox="0 0 380 460" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="caBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#044443" />
        <stop offset="100%" stopColor="#012120" />
      </linearGradient>
      <linearGradient id="caShine" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
        <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="360" height="440" rx="28" fill="url(#caBg)" />
    <rect x="10" y="10" width="360" height="440" rx="28" fill="url(#caShine)" />
    <rect x="10.75" y="10.75" width="358.5" height="438.5" rx="27" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1.5" />
    {/* blobs patrón de marca */}
    <g fill="#ffffff" opacity="0.045">
      <path d="M40 90 C 40 60 80 46 112 58 C 130 32 186 40 196 70 C 232 64 254 96 238 124 C 252 152 220 180 188 168 C 174 194 122 192 108 164 C 72 172 40 130 40 90 Z" />
      <circle cx="310" cy="330" r="70" />
      <circle cx="70" cy="360" r="40" />
    </g>
    {/* nube del logo como sello */}
    <g transform="translate(124 64) scale(1.0)">
      <g fill={BRAND}>
        <circle cx="36" cy="56" r="24" />
        <circle cx="64" cy="34" r="24" />
        <circle cx="95" cy="42" r="13" />
        <circle cx="104" cy="64" r="15" />
        <rect x="26" y="42" width="90" height="37" rx="18.5" />
      </g>
      <g fill="#044443">
        <circle cx="52" cy="60" r="10" />
        <circle cx="65" cy="49" r="12" />
        <circle cx="79" cy="58" r="9" />
        <rect x="49" y="53" width="36" height="16" rx="8" />
      </g>
    </g>
    <text x="190" y="196" textAnchor="middle" fill="#ffffff" fontSize="17" fontWeight="600" fontFamily="Montserrat, sans-serif" letterSpacing="0.5">Certificado de Compensación</text>
    <text x="190" y="220" textAnchor="middle" fill="#8FBDB9" fontSize="11.5" fontFamily="Inter, sans-serif" letterSpacing="2.5">CO₂ · VERIFICADO EN BLOCKCHAIN</text>
    {/* métricas */}
    <g fontFamily="Inter, sans-serif">
      <rect x="46" y="248" width="130" height="76" rx="14" fill="#ffffff" fillOpacity="0.06" stroke="#ffffff" strokeOpacity="0.1" />
      <text x="111" y="280" textAnchor="middle" fill={BRAND} fontSize="24" fontWeight="700">2.4 t</text>
      <text x="111" y="304" textAnchor="middle" fill="#8FBDB9" fontSize="10" letterSpacing="1.5">CO₂ COMPENSADO</text>
      <rect x="204" y="248" width="130" height="76" rx="14" fill="#ffffff" fillOpacity="0.06" stroke="#ffffff" strokeOpacity="0.1" />
      <text x="269" y="280" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="700">#8412</text>
      <text x="269" y="304" textAnchor="middle" fill="#8FBDB9" fontSize="10" letterSpacing="1.5">TOKEN ERC-721</text>
    </g>
    {/* firma qr-dots */}
    <g fill="#ffffff" opacity="0.7">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((c) =>
        [0, 1, 2].map((r) => (
          ((c * 7 + r * 13) % 3) !== 0
            ? <rect key={`${c}-${r}`} x={46 + c * 13} y={358 + r * 13} width="8" height="8" rx="2" />
            : null
        )),
      )}
    </g>
    <text x="334" y="392" textAnchor="end" fill="#8FBDB9" fontSize="10.5" fontFamily="Inter, sans-serif" letterSpacing="1">CERT-2026-SCL-0001</text>
    {/* check verificado */}
    <circle cx="306" cy="372" r="17" fill={BRAND} />
    <path d="M298 372 L 304 378 L 315 366" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const TechGrid = ({ className, opacity = 0.05 }: ArtProps & { opacity?: number }) => (
  <svg
    width="100%"
    height="100%"
    className={className}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
  >
    <defs>
      <pattern id="gridPattern" width="45" height="45" patternUnits="userSpaceOnUse">
        <path d="M 45 0 L 0 0 0 45" fill="none" stroke="currentColor" strokeWidth="1" />
      </pattern>
      <radialGradient id="gridMask" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <mask id="gridFade">
        <circle cx="50%" cy="50%" r="50%" fill="url(#gridMask)" />
      </mask>
    </defs>
    <rect width="100%" height="100%" fill="url(#gridPattern)" opacity={opacity} color="var(--ctv-brand-deep)" />
  </svg>
);
