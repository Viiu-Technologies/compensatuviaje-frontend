// Video 2 de LinkedIn: "Qué es CompensaTuViaje". 4:5 · 30 fps · 43 s.
//
// 0-7,6 s     el problema: la planilla de vuelos del equipo, sin medir ("¿?")
// 7,3-11 s    la marca y qué hace
// 11-19,5 s   paso 1, medir: la planilla sube y cada vuelo muestra su huella
// 19-27 s     paso 2, elegir un proyecto verificado (IA + una persona decide)
// 27-34 s     paso 3, recibir el certificado
// 34-37,5 s   resumen de los tres pasos
// 37-43 s     cierre con el llamado a la acción
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { LuArrowRight, LuCalendarCheck, LuCheck, LuDownload, LuDroplets, LuFileCheck, LuFileSpreadsheet, LuLeaf, LuRuler, LuSparkles, LuSun, LuTrees, LuUpload, LuUserCheck, LuUsers } from 'react-icons/lu';
import { backOut, bounceOut, prog, rise } from '../showcase/anim';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../theme/fonts';
import { C } from '../theme/palette';
import { CHOSEN, fmt, MONTH, PROJECTS, ROWS, TOTAL_KG } from './data';
import {
  CANVAS_BG,
  Closing,
  DAY_BG,
  FlightTable,
  GREEN,
  GREEN_ON_DARK,
  INK,
  INK_SOFT,
  Kicker,
  NIGHT_BG,
  ON_DARK,
  Scene,
  SIDE,
  StepHeader,
  Words,
} from './kit';

const SHOT = {
  hook: { from: 0, dur: 230 },
  brand: { from: 220, dur: 120 },
  measure: { from: 330, dur: 255 },
  choose: { from: 575, dur: 240 },
  certify: { from: 805, dur: 220 },
  recap: { from: 1015, dur: 110 },
  close: { from: 1115, dur: 175 },
} as const;

export const QUE_ES_DURATION = SHOT.close.from + SHOT.close.dur; // 1290

export const QueEs: React.FC = () => (
  <AbsoluteFill style={{ background: NIGHT_BG }}>
    <Scene name="Gancho: la planilla sin medir" {...SHOT.hook} bg={DAY_BG} fade={0}>
      <Hook />
    </Scene>
    <Scene name="Marca" {...SHOT.brand} bg={NIGHT_BG}>
      <Brand />
    </Scene>
    <Scene name="Paso 1: medir" {...SHOT.measure} bg={CANVAS_BG}>
      <Measure />
    </Scene>
    <Scene name="Paso 2: elegir proyecto" {...SHOT.choose} bg={CANVAS_BG}>
      <Choose />
    </Scene>
    <Scene name="Paso 3: certificado" {...SHOT.certify} bg={CANVAS_BG}>
      <Certify />
    </Scene>
    <Scene name="Resumen" {...SHOT.recap} bg={DAY_BG}>
      <Recap />
    </Scene>
    <Scene name="Cierre" {...SHOT.close} bg={NIGHT_BG}>
      <Closing line="Empieza midiendo los vuelos de tu equipo." cta="Calcula tu huella" />
    </Scene>
  </AbsoluteFill>
);

const TABLE_TOP = 470;

/** "Tu equipo vuela por trabajo." → "¿Sabes cuánto CO₂ dejan esos vuelos?" */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const first = 1 - prog(f, [96, 108]);
  const pulse = f > 120 ? 0.5 - 0.5 * Math.cos(((f - 120) / 30) * Math.PI * 2) : 0;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: SIDE, right: SIDE, top: 110, color: INK }}>
        <div style={{ opacity: first, filter: first < 1 ? `blur(${(1 - first) * 10}px)` : undefined }}>
          {/* Empieza "antes" del frame 0: la reproducción automática ya abre con texto */}
          <Words text="Tu equipo *vuela* por trabajo." start={-14} stagger={3} style={{ fontSize: 104 }} />
        </div>
        <div style={{ position: 'absolute', inset: 0 }}>
          <Words text="¿Sabes cuánto CO₂ *dejan esos vuelos?*" start={106} stagger={4} style={{ fontSize: 96 }} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: SIDE, right: SIDE, top: TABLE_TOP }}>
        <FlightTable rowT={ROWS.map((_, i) => prog(f, [-8 + i * 6, 14 + i * 6]))} kg={ROWS.map(() => null)} unknownPulse={pulse} />
      </div>
    </AbsoluteFill>
  );
};

const Brand: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 60, padding: `0 ${SIDE}px`, textAlign: 'center' }}>
      <Img src={staticFile('brand/logo-horizontal-white.svg')} style={{ height: 116, width: 'auto', ...rise(prog(f, [6, 32]), 20) }} />
      <Words
        text="Mide la huella de tus vuelos y *contribuye* a proyectos ambientales verificados."
        start={18}
        stagger={2}
        accent={GREEN_ON_DARK}
        style={{ fontSize: 68, color: ON_DARK, lineHeight: 1.12 }}
      />
    </AbsoluteFill>
  );
};

/** Paso 1: la planilla entra a la caja de carga y cada vuelo muestra su huella. */
const Measure: React.FC = () => {
  const f = useCurrentFrame();
  const { width: W } = useVideoConfig();

  const box = prog(f, [16, 34]) * (1 - prog(f, [98, 110]));
  const fly = prog(f, [36, 66], backOut(1.2));
  const landed = prog(f, [62, 72]);
  const loading = prog(f, [70, 96], (t) => t);
  const BOX_H = 440;
  const chip = {
    x: (1 - fly) * (W * 0.55) + fly * 0,
    y: (1 - fly) * -260 + fly * 40,
    r: (1 - fly) * 12,
  };

  const tableIn = prog(f, [100, 118]);
  const rowKg = ROWS.map((r, i) => {
    const t = prog(f, [116 + i * 9, 146 + i * 9], (x) => 1 - (1 - x) ** 3);
    return t > 0 ? r.kg * t : null;
  });
  const totalT = prog(f, [168, 186]);
  const total = TOTAL_KG * prog(f, [168, 204], (x) => 1 - (1 - x) ** 3);

  return (
    <AbsoluteFill>
      <StepHeader n={1} title="Mide" text="Ingresa un vuelo o sube la planilla con los vuelos de tu equipo." />

      {/* Caja de carga: textos de la vista "Manifiestos de vuelos" del panel de empresas */}
      {box > 0 && (
        <div
          style={{
            position: 'absolute',
            left: SIDE,
            right: SIDE,
            top: TABLE_TOP,
            height: BOX_H,
            borderRadius: 30,
            border: `4px dashed ${landed > 0.5 ? GREEN : '#B9CFC4'}`,
            background: landed > 0.5 ? C.brandSoft : '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            opacity: box,
            transform: `scale(${0.96 + 0.04 * box})`,
          }}
        >
          <span style={{ width: 120, height: 120, borderRadius: 999, background: C.brandSoft, display: 'grid', placeItems: 'center', opacity: 1 - landed }}>
            <LuUpload size={60} color={GREEN} />
          </span>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 46, fontWeight: 600, color: INK, opacity: 1 - landed }}>Sube tu planilla</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 26, color: INK_SOFT, opacity: 1 - landed }}>CSV, XLSX o XLS</div>

          {/* Archivo que vuela hasta la caja */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${chip.x}px, ${chip.y - 60 * landed}px) rotate(${chip.r}deg)`,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '22px 30px',
              borderRadius: 20,
              background: '#fff',
              boxShadow: '0 20px 40px -20px rgba(7, 61, 61, 0.45), 0 0 0 1px rgba(7, 61, 61, 0.08)',
              fontFamily: FONT_BODY,
              fontSize: 32,
              fontWeight: 600,
              color: INK,
              opacity: fly > 0 ? 1 : 0,
              whiteSpace: 'nowrap',
            }}
          >
            <LuFileSpreadsheet size={40} color={GREEN} />
            vuelos-{MONTH}.xlsx
          </div>

          {/* Procesando */}
          <div style={{ position: 'absolute', left: 120, right: 120, bottom: 110, opacity: landed, textAlign: 'center' }}>
            <div style={{ height: 14, borderRadius: 999, background: '#fff', overflow: 'hidden' }}>
              <div style={{ width: `${loading * 100}%`, height: '100%', background: GREEN }} />
            </div>
            <div style={{ marginTop: 18, fontFamily: FONT_MONO, fontSize: 24, color: INK_SOFT }}>Calculando con factores DEFRA 2025…</div>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', left: SIDE, right: SIDE, top: TABLE_TOP, opacity: tableIn, transform: `translateY(${(1 - tableIn) * 20}px)` }}>
        <FlightTable rowT={ROWS.map(() => 1)} kg={rowKg} totalT={totalT} total={total} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: SIDE,
          right: SIDE,
          top: 1168,
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
          fontFamily: FONT_MONO,
          fontSize: 25,
          color: INK_SOFT,
          ...rise(prog(f, [190, 210]), 10),
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <LuUsers size={28} color={GREEN} /> Sin nombres de personas
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <LuRuler size={28} color={GREEN} /> Factores DEFRA 2025
        </span>
      </div>
    </AbsoluteFill>
  );
};

const PROJECT_ICON = { trees: LuTrees, sun: LuSun, water: LuDroplets } as const;
const PROJECT_TINT = {
  trees: 'linear-gradient(160deg, #DDF3DA 0%, #B9E2C4 100%)',
  sun: 'linear-gradient(160deg, #FFF4D6 0%, #F6DFA0 100%)',
  water: 'linear-gradient(160deg, #DCEFF5 0%, #B5DCE8 100%)',
} as const;

const REVIEW = [
  { Icon: LuSparkles, text: 'Revisión con inteligencia artificial' },
  { Icon: LuUserCheck, text: 'Una persona del equipo decide' },
  { Icon: LuCalendarCheck, text: 'Evidencia nueva cada mes' },
];

/** Paso 2: tres proyectos (genéricos), se elige uno; debajo, cómo se revisan. */
const Choose: React.FC = () => {
  const f = useCurrentFrame();
  const pick = prog(f, [92, 106], backOut(1.6));
  return (
    <AbsoluteFill>
      <StepHeader n={2} title="Elige un proyecto" text="Proyectos ambientales verificados. Tú decides a cuál contribuir." />

      <div style={{ position: 'absolute', left: SIDE, right: SIDE, top: 470, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {PROJECTS.map((p, i) => {
          const Icon = PROJECT_ICON[p.key];
          const chosen = i === CHOSEN;
          const t = prog(f, [18 + i * 8, 42 + i * 8]);
          return (
            <div
              key={p.key}
              style={{
                position: 'relative',
                background: '#fff',
                borderRadius: 28,
                overflow: 'hidden',
                boxShadow: chosen
                  ? `0 0 0 ${5 * pick}px ${GREEN}, 0 30px 60px -30px rgba(7, 61, 61, 0.45)`
                  : '0 24px 50px -30px rgba(7, 61, 61, 0.35), 0 0 0 1px rgba(7, 61, 61, 0.06)',
                opacity: t * (chosen ? 1 : 1 - 0.45 * pick),
                transform: `translateY(${(1 - t) * 30 - (chosen ? 12 * pick : 0)}px)`,
              }}
            >
              <div style={{ height: 170, background: PROJECT_TINT[p.key], display: 'grid', placeItems: 'center' }}>
                <Icon size={84} color={INK} strokeWidth={1.6} />
              </div>
              <div style={{ padding: '22px 22px 26px' }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 600, lineHeight: 1.1, color: INK, minHeight: 70 }}>{p.name}</div>
                <div style={{ marginTop: 8, fontFamily: FONT_MONO, fontSize: 19, letterSpacing: '0.08em', textTransform: 'uppercase', color: INK_SOFT }}>{p.tag}</div>
                <div
                  style={{
                    marginTop: 18,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 999,
                    background: C.brandSoft,
                    fontFamily: FONT_BODY,
                    fontSize: 21,
                    fontWeight: 600,
                    color: C.accentContrast,
                  }}
                >
                  <LuCheck size={20} strokeWidth={3} /> Verificado
                </div>
              </div>
              {chosen && (
                <span
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 52,
                    height: 52,
                    borderRadius: 999,
                    background: GREEN,
                    display: 'grid',
                    placeItems: 'center',
                    transform: `scale(${pick})`,
                  }}
                >
                  <LuCheck size={32} color="#fff" strokeWidth={3} />
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', left: SIDE, right: SIDE, top: 922 }}>
        <Kicker style={rise(prog(f, [112, 132]))}>Así revisamos cada proyecto</Kicker>
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {REVIEW.map(({ Icon, text }, i) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 22, ...rise(prog(f, [122 + i * 14, 144 + i * 14]), 14) }}>
              <span style={{ width: 66, height: 66, borderRadius: 999, background: C.brandSoft, display: 'grid', placeItems: 'center', flex: 'none' }}>
                <Icon size={34} color={GREEN} />
              </span>
              <span style={{ fontFamily: FONT_BODY, fontSize: 36, fontWeight: 500, color: INK }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Paso 3: el certificado entra y recibe su sello. */
const Certify: React.FC = () => {
  const f = useCurrentFrame();
  const t = prog(f, [14, 44], backOut(1.3));
  const seal = prog(f, [78, 96], bounceOut);
  const fields = [
    ['Emitido a', 'Tu Empresa SpA'],
    ['Período', `${MONTH[0].toUpperCase()}${MONTH.slice(1)} 2026`],
    ['Proyecto', PROJECTS[CHOSEN].name],
    ['Metodología', 'DEFRA 2025'],
  ];
  return (
    <AbsoluteFill>
      <StepHeader n={3} title="Recibe tu certificado" text="Un certificado en PDF con tu contribución." />

      <div
        style={{
          position: 'absolute',
          left: 130,
          right: 130,
          top: 470,
          padding: '40px 48px 44px',
          borderRadius: 30,
          background: '#fff',
          boxShadow: '0 40px 80px -40px rgba(7, 61, 61, 0.5), 0 0 0 1px rgba(7, 61, 61, 0.06)',
          opacity: Math.min(1, t * 1.4),
          transform: `translateY(${(1 - t) * 60}px) rotate(${(1 - t) * -5}deg) scale(${0.92 + 0.08 * t})`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Img src={staticFile('brand/logo-horizontal.svg')} style={{ height: 52, width: 'auto' }} />
          <span
            style={{
              marginLeft: 'auto',
              padding: '8px 16px',
              borderRadius: 10,
              background: '#EEF5F1',
              fontFamily: FONT_MONO,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: INK_SOFT,
            }}
          >
            PDF
          </span>
        </div>
        <Kicker style={{ marginTop: 34, fontSize: 22 }}>Certificado de contribución climática</Kicker>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 104, fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1, color: C.accentContrast }}>
            {fmt.ton(TOTAL_KG / 1000)}
          </span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 500, color: INK_SOFT }}>t CO₂e</span>
        </div>
        <div style={{ height: 1, background: '#E3ECE7', margin: '32px 0 26px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 22, columnGap: 30 }}>
          {fields.map(([k, v], i) => (
            <div key={k} style={rise(prog(f, [40 + i * 6, 60 + i * 6]), 10)}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 19, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.inkMute }}>{k}</div>
              <div style={{ marginTop: 4, fontFamily: FONT_BODY, fontSize: 30, fontWeight: 600, color: INK }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Sello */}
        <div
          style={{
            position: 'absolute',
            right: -40,
            bottom: -48,
            width: 150,
            height: 150,
            borderRadius: 999,
            background: GREEN,
            border: '8px solid #fff',
            boxShadow: '0 16px 30px -12px rgba(7, 61, 61, 0.5)',
            display: 'grid',
            placeItems: 'center',
            transform: `scale(${seal}) rotate(${(1 - seal) * -30 - 8}deg)`,
          }}
        >
          <LuLeaf size={70} color="#fff" />
        </div>
      </div>

      <div style={{ position: 'absolute', left: SIDE, right: SIDE, top: 1170, display: 'flex', justifyContent: 'center', gap: 22 }}>
        {[
          { Icon: LuDownload, text: 'Descárgalo en PDF' },
          { Icon: LuUsers, text: 'Compártelo con tu equipo' },
        ].map(({ Icon, text }, i) => (
          <span
            key={text}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 26px',
              borderRadius: 999,
              background: '#fff',
              boxShadow: '0 0 0 1px rgba(7, 61, 61, 0.1)',
              fontFamily: FONT_BODY,
              fontSize: 28,
              fontWeight: 500,
              color: INK,
              ...rise(prog(f, [104 + i * 8, 124 + i * 8]), 12),
            }}
          >
            <Icon size={30} color={GREEN} /> {text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const STEPS = [
  { Icon: LuRuler, label: 'Mide' },
  { Icon: LuLeaf, label: 'Elige un proyecto' },
  { Icon: LuFileCheck, label: 'Recibe tu certificado' },
];

/** Los tres pasos juntos. */
const Recap: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: `0 ${SIDE}px`, gap: 90 }}>
      <Words text="Tres pasos, *un solo lugar.*" start={4} stagger={4} style={{ fontSize: 104, color: INK, textAlign: 'center' }} />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        {STEPS.map(({ Icon, label }, i) => {
          const t = prog(f, [14 + i * 12, 38 + i * 12], backOut(1.6));
          return (
            <React.Fragment key={label}>
              {i > 0 && (
                <span style={{ marginTop: 58, opacity: prog(f, [10 + i * 12, 26 + i * 12]) }}>
                  <LuArrowRight size={44} color={GREEN} />
                </span>
              )}
              <div style={{ width: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, textAlign: 'center' }}>
                <span
                  style={{
                    width: 160,
                    height: 160,
                    borderRadius: 999,
                    background: '#fff',
                    boxShadow: '0 24px 50px -24px rgba(7, 61, 61, 0.4)',
                    display: 'grid',
                    placeItems: 'center',
                    transform: `scale(${t})`,
                  }}
                >
                  <Icon size={70} color={GREEN} />
                </span>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 38, fontWeight: 600, lineHeight: 1.1, color: INK, ...rise(prog(f, [20 + i * 12, 40 + i * 12]), 12) }}>
                  {label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
