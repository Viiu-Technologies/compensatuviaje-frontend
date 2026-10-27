import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { Camera, useCameraShot } from './camera/Camera';
import { buildShots, PLACEHOLDER_LAYOUT } from './camera/shots';
import { useFormFill } from './scenes/Calculator/Calculator';
import { CompensateCaption, useCompensateView } from './scenes/Compensate/Compensate';
import { Intro, INTRO_DURATION, IntroPlanet, useLandingEntry } from './scenes/Intro/Intro';
import { Outro, OUTRO_TEXT_FROM, useOutroFrame } from './scenes/Outro/Outro';
import { ResultCaption, useResultView } from './scenes/Result/Result';
import { C } from './theme/palette';
import { CAMERA, DURATION, SCENES, T, type Range } from './timing';
import { Caption } from './ui/Caption';
import { HeroTexture } from './ui/Hero';
import { Stage, STAGE_WIDTH, type StageLayout } from './ui/Stage';

const length = ([start, end]: Range) => end - start;

// Lienzo claro "infinito" detrás de la landing: así los bordes del escenario
// nunca se ven hasta que el outro lo convierte en pantalla. Lleva la misma
// cuadrícula y el mismo grano que el hero; el desfase es múltiplo de 45 px
// (celda de la cuadrícula) y de 180 px (tesela del grano), así casan sin corte.
const PLANE_OFFSET = 6120;
const CanvasPlane: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: 'absolute',
      left: -PLANE_OFFSET,
      top: -PLANE_OFFSET,
      width: STAGE_WIDTH + PLANE_OFFSET * 2,
      height: 16000,
      background: C.canvas,
      opacity,
    }}
  >
    <HeroTexture id="planeGrid" />
  </div>
);

export const LaunchVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // La cámara necesita el layout real de la landing: se bloquea el render
  // hasta que el escenario se mide (con las fuentes ya cargadas).
  const [layout, setLayout] = useState<StageLayout | null>(null);
  const [handle] = useState(() => delayRender('Midiendo la landing'));
  useEffect(() => {
    if (layout) continueRender(handle);
  }, [layout, handle]);
  const onMeasured = useCallback((l: StageLayout) => setLayout(l), []);

  const shots = useMemo(() => buildShots(layout ?? PLACEHOLDER_LAYOUT, width, height), [layout, width, height]);
  const cameraShot = useCameraShot(shots.landing, [
    { range: CAMERA.m1ZoomForm, to: shots.form },
    { range: CAMERA.m2ZoomResult, to: shots.result },
    { range: CAMERA.m3ZoomOut, to: shots.outro },
  ]);

  const entry = useLandingEntry(frame);
  const framed = useOutroFrame(frame);
  const shot = { ...cameraShot, scale: cameraShot.scale * entry.scale };

  const view = {
    form: useFormFill(frame),
    impact: { ...useResultView(frame), ...useCompensateView(frame) },
  };

  return (
    <AbsoluteFill style={{ background: C.teal950 }}>
      <Sequence name="Planeta (intro)" durationInFrames={INTRO_DURATION}>
        <IntroPlanet />
      </Sequence>

      <Camera
        shot={shot}
        blur={entry.blur}
        opacity={entry.opacity}
        backdrop={<CanvasPlane opacity={entry.plane * (1 - framed)} />}
      >
        <Stage view={view} framed={framed} onMeasured={onMeasured} />
      </Camera>

      {/* Escenas. La landing de arriba es continua; estas secuencias llevan
          lo que va encima de ella y sirven de marcas en la línea de tiempo. */}
      <Sequence name="0-3s Intro" durationInFrames={INTRO_DURATION}>
        <Intro />
      </Sequence>
      <Sequence name="3-7s Landing" from={SCENES.landing.from} durationInFrames={SCENES.landing.duration} layout="none" />
      <Sequence name="Mídela en segundos" from={T.landingCaption[0]} durationInFrames={length(T.landingCaption)}>
        <Caption text="Mídela en segundos." />
      </Sequence>
      <Sequence
        name="7-15s Calculadora"
        from={SCENES.calculator.from}
        durationInFrames={SCENES.calculator.duration}
        layout="none"
      />
      <Sequence name="15-21s Resultado" from={SCENES.result.from} durationInFrames={SCENES.result.duration} layout="none" />
      <Sequence name="Factores DEFRA" from={T.resultCaption[0]} durationInFrames={length(T.resultCaption)}>
        <ResultCaption />
      </Sequence>
      <Sequence
        name="21-26s Compensar"
        from={SCENES.compensate.from}
        durationInFrames={SCENES.compensate.duration}
        layout="none"
      />
      <Sequence name="Compénsala con un clic" from={T.compensateCaption[0]} durationInFrames={length(T.compensateCaption)}>
        <CompensateCaption />
      </Sequence>
      <Sequence name="26-30s Outro" from={OUTRO_TEXT_FROM} durationInFrames={DURATION - OUTRO_TEXT_FROM}>
        <Outro />
      </Sequence>

      {/* Hueco para la música de fondo (0-30 s). Para activarla:
          pnpm exec remotion add @remotion/media, deja el archivo en
          public/music.mp3 y descomenta:
          <Audio src={staticFile('music.mp3')} volume={0.6} />  (import { Audio } from '@remotion/media') */}
      <Sequence name="Música (pendiente)" durationInFrames={DURATION} layout="none" />
    </AbsoluteFill>
  );
};
