/* ============================================================================
   PartnersGuideArt.tsx — Ilustraciones y componentes de arte SVG para la
   página de Guía de Impact Partners (/aliados).
   Lenguaje visual: Duotono de marca (verde #08AE06 / teal #073D3D), trazos
   redondeados minimalistas, formas orgánicas (blobs) y la nube del logo como
   motivo recurrente.
   ========================================================================== */

type ArtProps = { className?: string };

const BRAND = 'var(--ctv-brand, #08AE06)';
const DEEP = 'var(--ctv-brand-deep, #073D3D)';
const BRIGHT = 'var(--ctv-brand-bright, #3ED32B)';

/* ── Hero: Red Global de Impact Partners ─────────────────────────────────── */
export const HeroPartnersNetworkArt = ({ className }: ArtProps) => (
  <svg viewBox="0 0 460 400" className={className} aria-hidden="true">
    <defs>
      <radialGradient id="hpnGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={BRAND} stopOpacity="0.28" />
        <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
      </radialGradient>
      <linearGradient id="hpnCardBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#044443" />
        <stop offset="100%" stopColor="#012120" />
      </linearGradient>
      <filter id="hpnDrop" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Resplandor ambiental de fondo */}
    <circle cx="230" cy="200" r="180" fill="url(#hpnGlow)" />

    {/* Anillos de órbita / Conexión de red */}
    <ellipse cx="230" cy="200" rx="190" ry="110" fill="none" stroke={BRAND} strokeOpacity="0.22" strokeWidth="1.5" strokeDasharray="6 6" transform="rotate(-15 230 200)" />
    <ellipse cx="230" cy="200" rx="160" ry="90" fill="none" stroke={DEEP} strokeOpacity="0.25" strokeWidth="1.5" transform="rotate(25 230 200)" />

    {/* Líneas conectoras a nodos periféricos */}
    <g stroke={BRAND} strokeWidth="1.8" strokeOpacity="0.45" strokeDasharray="3 3" fill="none">
      <path d="M 230 190 L 70 100" />
      <path d="M 230 190 L 390 90" />
      <path d="M 230 210 L 90 310" />
      <path d="M 230 210 L 380 300" />
    </g>

    {/* Nubes y Blobs de fondo */}
    <g fill={DEEP} opacity="0.4">
      <path d="M 180 80 Q 230 50 280 80 T 350 120 T 150 120 Z" />
    </g>

    {/* Tarjeta Núcleo Central (Nube del Logo Destacada) */}
    <g transform="translate(145 130)">
      <rect x="0" y="0" width="170" height="130" rx="24" fill="url(#hpnCardBg)" stroke={BRAND} strokeOpacity="0.5" strokeWidth="1.5" filter="url(#hpnDrop)" />
      {/* Nube del logo en el centro */}
      <g transform="translate(30 35) scale(0.85)">
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
      <text x="85" y="112" textAnchor="middle" fill={BRIGHT} fontSize="10" fontWeight="700" fontFamily="Outfit, sans-serif" letterSpacing="1.5">IMPACT PARTNER RED</text>
    </g>

    {/* Nodo 1: Bosque / Reforestación (Top Left) */}
    <g transform="translate(40 60)">
      <circle cx="30" cy="30" r="30" fill="url(#hpnCardBg)" stroke={BRAND} strokeWidth="1.5" />
      {/* Copa del árbol estilo EcoArt */}
      <g transform="translate(13 12) scale(0.6)">
        <rect x="20" y="32" width="8" height="20" rx="4" fill={BRIGHT} />
        <circle cx="12" cy="24" r="16" fill={BRAND} />
        <circle cx="24" cy="14" r="18" fill={BRAND} />
        <circle cx="36" cy="24" r="14" fill={BRAND} />
      </g>
      <circle cx="50" cy="10" r="5" fill={BRIGHT} />
    </g>

    {/* Nodo 2: Verificación KYB IA (Top Right) */}
    <g transform="translate(360 50)">
      <circle cx="30" cy="30" r="30" fill="url(#hpnCardBg)" stroke={BRAND} strokeWidth="1.5" />
      {/* Shield check */}
      <path d="M 22 20 C 22 20 30 16 30 16 C 30 16 38 20 38 20 C 38 32 30 38 30 38 C 30 38 22 32 22 20 Z" fill="none" stroke={BRIGHT} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 26 27 L 29 30 L 35 24" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="10" cy="48" r="4" fill={BRAND} />
    </g>

    {/* Nodo 3: Energía Renovable / Turbina (Bottom Left) */}
    <g transform="translate(60 270)">
      <circle cx="30" cy="30" r="30" fill="url(#hpnCardBg)" stroke={BRAND} strokeWidth="1.5" />
      {/* Asas de turbina */}
      <g transform="translate(15 15) scale(0.7)">
        <circle cx="21" cy="21" r="5" fill={BRIGHT} />
        <path d="M 21 16 C 16 5 26 5 21 16 Z" fill={BRAND} />
        <path d="M 21 26 C 26 37 16 37 21 26 Z" fill={BRAND} />
        <path d="M 26 21 C 37 26 37 16 26 21 Z" fill={BRAND} />
      </g>
    </g>

    {/* Nodo 4: Certificación ESG (Bottom Right) */}
    <g transform="translate(350 260)">
      <circle cx="32" cy="32" r="32" fill="url(#hpnCardBg)" stroke={BRAND} strokeWidth="1.5" />
      <circle cx="32" cy="32" r="20" fill={BRAND} opacity="0.2" />
      <path d="M 25 32 L 30 37 L 41 25" stroke={BRIGHT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Cinta de certificación */}
      <path d="M 24 44 L 20 54 L 28 50 L 36 54 L 32 44" fill={BRAND} />
    </g>

    {/* Destellos / Nodos de datos flotantes */}
    <g fill={BRIGHT}>
      <circle cx="130" cy="180" r="3.5" />
      <circle cx="330" cy="170" r="4" />
      <circle cx="210" cy="80" r="3" />
      <circle cx="260" cy="320" r="4.5" />
    </g>
  </svg>
);

/* ── Paso 01: Invitación por Correo ─────────────────────────────────────── */
export const Step1InvitationArt = ({ className }: ArtProps) => (
  <svg viewBox="0 0 260 200" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="s1Bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={BRAND} stopOpacity="0.15" />
        <stop offset="100%" stopColor={DEEP} stopOpacity="0.04" />
      </linearGradient>
      <linearGradient id="s1Env" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#EAF5F2" />
      </linearGradient>
    </defs>
    {/* Fondo orgánico */}
    <rect x="10" y="10" width="240" height="180" rx="20" fill="url(#s1Bg)" stroke={DEEP} strokeOpacity="0.08" strokeWidth="1" />
    
    {/* Sobre principal */}
    <g transform="translate(45 40)">
      {/* Sombra de carta */}
      <rect x="5" y="12" width="160" height="100" rx="14" fill={DEEP} opacity="0.12" />
      <rect x="0" y="0" width="170" height="110" rx="14" fill="url(#s1Env)" stroke={DEEP} strokeWidth="1.5" />
      
      {/* Solapa del sobre */}
      <path d="M 0 4 L 85 62 L 170 4" fill="none" stroke={DEEP} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M 0 110 L 60 55" stroke={DEEP} strokeWidth="1.2" strokeOpacity="0.4" />
      <path d="M 170 110 L 110 55" stroke={DEEP} strokeWidth="1.2" strokeOpacity="0.4" />

      {/* Sello con la nube de la marca */}
      <circle cx="85" cy="55" r="20" fill={BRAND} />
      <g transform="translate(68 43) scale(0.26)">
        <path d="M 26 42 L 116 42 Q 134 42 134 60.5 T 116 79 L 26 79 Q 8 79 8 60.5 T 26 42 Z" fill="#ffffff" />
        <circle cx="36" cy="56" r="18" fill="#ffffff" />
        <circle cx="64" cy="34" r="18" fill="#ffffff" />
      </g>
    </g>

    {/* Tarjeta de invitación saliendo flotando */}
    <g transform="translate(65 15)">
      <rect x="0" y="0" width="130" height="50" rx="10" fill={DEEP} stroke={BRAND} strokeWidth="1" />
      <rect x="12" y="14" width="60" height="6" rx="3" fill="#ffffff" opacity="0.9" />
      <rect x="12" y="26" width="85" height="5" rx="2.5" fill={BRAND} />
      <circle cx="108" cy="25" r="10" fill={BRAND} opacity="0.3" />
      <path d="M 104 25 L 107 28 L 113 22" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>

    {/* Partículas de destello */}
    <circle cx="35" cy="35" r="4" fill={BRAND} />
    <circle cx="225" cy="145" r="5" fill={BRIGHT} />
    <path d="M 215 45 L 225 45 M 220 40 L 220 50" stroke={BRAND} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/* ── Paso 02: Seguridad y Contraseña ────────────────────────────────────── */
export const Step2SecurityArt = ({ className }: ArtProps) => (
  <svg viewBox="0 0 260 200" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="s2Bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={BRAND} stopOpacity="0.12" />
        <stop offset="100%" stopColor={DEEP} stopOpacity="0.05" />
      </linearGradient>
      <linearGradient id="s2Shield" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={BRAND} />
        <stop offset="100%" stopColor={DEEP} />
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="240" height="180" rx="20" fill="url(#s2Bg)" stroke={DEEP} strokeOpacity="0.08" strokeWidth="1" />

    {/* Escudo protector */}
    <g transform="translate(75 25)">
      <path d="M 55 5 C 55 5 105 18 105 18 C 105 58 85 105 55 125 C 25 105 5 58 5 18 C 5 18 55 5 55 5 Z" fill="url(#s2Shield)" stroke="#ffffff" strokeWidth="2" />
      
      {/* Candado en el centro del escudo */}
      <rect x="36" y="52" width="38" height="34" rx="7" fill="#ffffff" />
      <path d="M 43 52 V 40 C 43 33 48 28 55 28 C 62 28 67 33 67 40 V 52" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="55" cy="67" r="4" fill={DEEP} />
      <path d="M 55 71 V 77" stroke={DEEP} strokeWidth="2.5" strokeLinecap="round" />
    </g>

    {/* Input de contraseña flotante */}
    <g transform="translate(45 130)">
      <rect x="0" y="0" width="170" height="38" rx="19" fill="#ffffff" stroke={BRAND} strokeWidth="1.5" />
      {/* Puntos de clave */}
      <circle cx="30" cy="19" r="4.5" fill={DEEP} />
      <circle cx="48" cy="19" r="4.5" fill={DEEP} />
      <circle cx="66" cy="19" r="4.5" fill={DEEP} />
      <circle cx="84" cy="19" r="4.5" fill={DEEP} />
      <circle cx="102" cy="19" r="4.5" fill={BRAND} />
      <circle cx="120" cy="19" r="4.5" fill={BRAND} />
      {/* Check verde de seguridad */}
      <circle cx="150" cy="19" r="10" fill={BRAND} />
      <path d="M 145 19 L 149 22 L 155 16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  </svg>
);

/* ── Paso 03: Onboarding y Datos Bancarios ─────────────────────────────── */
export const Step3OnboardingArt = ({ className }: ArtProps) => (
  <svg viewBox="0 0 260 200" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="s3Bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={BRAND} stopOpacity="0.14" />
        <stop offset="100%" stopColor={DEEP} stopOpacity="0.04" />
      </linearGradient>
      <linearGradient id="s3Card" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#073D3D" />
        <stop offset="100%" stopColor="#044443" />
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="240" height="180" rx="20" fill="url(#s3Bg)" stroke={DEEP} strokeOpacity="0.08" strokeWidth="1" />

    {/* Tarjeta de perfil de empresa */}
    <g transform="translate(30 30)">
      <rect x="0" y="0" width="130" height="135" rx="16" fill="#ffffff" stroke={DEEP} strokeOpacity="0.15" strokeWidth="1.5" />
      {/* Slot para logo */}
      <circle cx="40" cy="38" r="18" fill={BRAND} opacity="0.15" stroke={BRAND} strokeWidth="1.5" />
      <path d="M 32 38 Q 40 28 48 38" stroke={BRAND} strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="68" y="28" width="48" height="7" rx="3.5" fill={DEEP} />
      <rect x="68" y="41" width="32" height="5" rx="2.5" fill={DEEP} opacity="0.4" />

      {/* Inputs simulados */}
      <rect x="14" y="68" width="102" height="18" rx="6" fill="var(--ctv-canvas-2, #EDF4F1)" />
      <rect x="22" y="74" width="50" height="6" rx="3" fill={DEEP} opacity="0.5" />

      <rect x="14" y="96" width="102" height="18" rx="6" fill="var(--ctv-canvas-2, #EDF4F1)" />
      <rect x="22" y="102" width="65" height="6" rx="3" fill={BRAND} />
    </g>

    {/* Tarjeta bancaria inclinada / Conexión de pago */}
    <g transform="translate(125 75) rotate(-6)">
      <rect x="0" y="0" width="110" height="70" rx="12" fill="url(#s3Card)" stroke={BRAND} strokeWidth="1.2" />
      <rect x="12" y="14" width="20" height="14" rx="3" fill="#D4AF37" />
      <rect x="12" y="44" width="55" height="5" rx="2.5" fill="#ffffff" opacity="0.8" />
      <circle cx="90" cy="46" r="10" fill={BRAND} opacity="0.8" />
      <circle cx="82" cy="46" r="10" fill={BRIGHT} opacity="0.5" />
    </g>

    <circle cx="215" cy="45" r="5" fill={BRAND} />
  </svg>
);

/* ── Paso 04: Verificación Empresarial KYB ──────────────────────────────── */
export const Step4KybVerificationArt = ({ className }: ArtProps) => (
  <svg viewBox="0 0 260 200" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="s4Bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={BRAND} stopOpacity="0.15" />
        <stop offset="100%" stopColor={DEEP} stopOpacity="0.05" />
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="240" height="180" rx="20" fill="url(#s4Bg)" stroke={DEEP} strokeOpacity="0.08" strokeWidth="1" />

    {/* Documento de evaluación KYB */}
    <g transform="translate(45 25)">
      <rect x="0" y="0" width="120" height="145" rx="14" fill="#ffffff" stroke={DEEP} strokeWidth="1.5" />
      <rect x="16" y="18" width="50" height="8" rx="4" fill={DEEP} />
      <rect x="16" y="32" width="88" height="5" rx="2.5" fill={DEEP} opacity="0.3" />
      <rect x="16" y="42" width="70" height="5" rx="2.5" fill={DEEP} opacity="0.3" />

      {/* 4 Dimensiones de evaluación (Checklist de IA) */}
      {[
        { y: 58, text: 'Legal', color: BRAND },
        { y: 76, text: 'Financiero', color: BRAND },
        { y: 94, text: 'Técnico', color: BRAND },
        { y: 112, text: 'Referencias', color: BRAND },
      ].map((item, i) => (
        <g key={i} transform={`translate(16 ${item.y})`}>
          <circle cx="6" cy="6" r="6" fill={item.color} />
          <path d="M 3 6 L 5 8 L 9 4" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <rect x="18" y="3" width="55" height="5" rx="2.5" fill={DEEP} opacity="0.7" />
        </g>
      ))}
    </g>

    {/* Lente de Escaneo IA / Badge Platinum Tier */}
    <g transform="translate(135 60)">
      <rect x="0" y="0" width="95" height="75" rx="16" fill={DEEP} stroke={BRAND} strokeWidth="1.5" />
      <text x="47" y="24" textAnchor="middle" fill="#7BE96D" fontSize="8" fontWeight="700" fontFamily="Outfit, sans-serif" letterSpacing="1">VERIFICACIÓN IA</text>
      
      {/* Badge Tier Platinum */}
      <rect x="12" y="34" width="71" height="26" rx="13" fill={BRAND} />
      <text x="47" y="51" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800" fontFamily="Outfit, sans-serif" letterSpacing="1">PLATINUM</text>
    </g>

    {/* Rayo de escáner verde */}
    <line x1="35" y1="90" x2="175" y2="90" stroke={BRIGHT} strokeWidth="2" strokeDasharray="4 4" opacity="0.8" />
  </svg>
);

/* ── Paso 05: Creación de Proyectos ESG ─────────────────────────────────── */
export const Step5EsgProjectsArt = ({ className }: ArtProps) => (
  <svg viewBox="0 0 260 200" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="s5Bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={BRAND} stopOpacity="0.14" />
        <stop offset="100%" stopColor={DEEP} stopOpacity="0.04" />
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="240" height="180" rx="20" fill="url(#s5Bg)" stroke={DEEP} strokeOpacity="0.08" strokeWidth="1" />

    {/* Lienzo de Proyecto ESG */}
    <g transform="translate(30 30)">
      <rect x="0" y="0" width="200" height="135" rx="18" fill="#ffffff" stroke={DEEP} strokeWidth="1.5" />
      
      {/* Header del proyecto */}
      <rect x="16" y="16" width="80" height="8" rx="4" fill={DEEP} />
      <rect x="16" y="28" width="50" height="6" rx="3" fill={BRAND} />

      {/* Hub de tipos de proyecto ESG */}
      {/* 1. Reforestación */}
      <g transform="translate(16 48)">
        <rect x="0" y="0" width="52" height="65" rx="10" fill="var(--ctv-canvas-2, #EDF4F1)" stroke={BRAND} strokeWidth="1" />
        <circle cx="26" cy="24" r="14" fill={BRAND} opacity="0.2" />
        <path d="M 26 14 L 18 28 H 34 Z" fill={BRAND} />
        <rect x="24" y="28" width="4" height="8" fill={DEEP} />
        <rect x="10" y="46" width="32" height="4" rx="2" fill={DEEP} />
      </g>

      {/* 2. Energía Limpia */}
      <g transform="translate(74 48)">
        <rect x="0" y="0" width="52" height="65" rx="10" fill="var(--ctv-canvas-2, #EDF4F1)" stroke={DEEP} strokeOpacity="0.2" strokeWidth="1" />
        <circle cx="26" cy="24" r="14" fill={DEEP} opacity="0.1" />
        <path d="M 26 14 L 21 24 H 28 L 24 34 L 32 22 H 25 Z" fill={DEEP} />
        <rect x="10" y="46" width="32" height="4" rx="2" fill={DEEP} opacity="0.5" />
      </g>

      {/* 3. Conservación Marina */}
      <g transform="translate(132 48)">
        <rect x="0" y="0" width="52" height="65" rx="10" fill="var(--ctv-canvas-2, #EDF4F1)" stroke={DEEP} strokeOpacity="0.2" strokeWidth="1" />
        <circle cx="26" cy="24" r="14" fill={BRAND} opacity="0.1" />
        <path d="M 14 26 Q 20 20 26 26 T 38 26" stroke={BRAND} strokeWidth="2" strokeLinecap="round" fill="none" />
        <rect x="10" y="46" width="32" height="4" rx="2" fill={DEEP} opacity="0.5" />
      </g>
    </g>

    {/* Lápiz / Botón de Enviar a Revisión */}
    <g transform="translate(180 20)">
      <circle cx="22" cy="22" r="22" fill={BRAND} />
      <path d="M 14 22 L 20 28 L 30 16" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  </svg>
);

/* ── Paso 06: Certificación ESG Final ──────────────────────────────────── */
export const Step6EsgCertificationArt = ({ className }: ArtProps) => (
  <svg viewBox="0 0 260 200" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="s6Bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={BRAND} stopOpacity="0.16" />
        <stop offset="100%" stopColor={DEEP} stopOpacity="0.05" />
      </linearGradient>
      <linearGradient id="s6Cert" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#073D3D" />
        <stop offset="100%" stopColor="#012120" />
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="240" height="180" rx="20" fill="url(#s6Bg)" stroke={DEEP} strokeOpacity="0.08" strokeWidth="1" />

    {/* Certificado de Proyecto ESG */}
    <g transform="translate(35 25)">
      <rect x="0" y="0" width="135" height="145" rx="16" fill="url(#s6Cert)" stroke={BRAND} strokeWidth="1.5" />
      
      {/* Sello de Marca en el certificado */}
      <circle cx="67" cy="40" r="20" fill={BRAND} opacity="0.2" />
      <circle cx="67" cy="40" r="14" fill={BRAND} />
      <path d="M 61 40 L 65 44 L 73 36" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      <text x="67" y="74" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700" fontFamily="Outfit, sans-serif" letterSpacing="0.8">PROYECTO CERTIFICADO</text>
      <text x="67" y="88" textAnchor="middle" fill="#7BE96D" fontSize="7.5" fontFamily="Inter, sans-serif" letterSpacing="1.2">NIVEL PLATINO IMPACTO</text>

      {/* Línea de firma / Hash auditado */}
      <rect x="22" y="104" width="91" height="1" fill="#ffffff" opacity="0.2" />
      <rect x="35" y="114" width="65" height="5" rx="2.5" fill="#7BE96D" opacity="0.8" />
    </g>

    {/* Medalla / Cinta de Honor Flotante */}
    <g transform="translate(160 55)">
      {/* Roseta de la medalla */}
      <circle cx="35" cy="35" r="32" fill={BRAND} stroke="#ffffff" strokeWidth="2" />
      <circle cx="35" cy="35" r="24" fill={DEEP} />
      <text x="35" y="39" textAnchor="middle" fill={BRIGHT} fontSize="14" fontWeight="800" fontFamily="Outfit, sans-serif">ESG</text>
      
      {/* Cintas colgantes */}
      <path d="M 22 62 L 15 95 L 30 88 L 35 95 L 28 62 Z" fill={BRAND} />
      <path d="M 42 62 L 35 95 L 40 88 L 55 95 L 48 62 Z" fill={DEEP} />
    </g>

    {/* Destellos de éxito */}
    <circle cx="215" cy="30" r="4" fill={BRIGHT} />
    <circle cx="30" cy="160" r="5" fill={BRAND} />
  </svg>
);
