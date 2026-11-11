import React from 'react';
import { Composition, Folder } from 'remotion';
import { FORMATS } from './formats';
import { LaunchVideo } from './LaunchVideo';
import { QUE_ES_DURATION, QueEs } from './linkedin/QueEs';
import { TEASER_DURATION, Teaser } from './linkedin/Teaser';
import { Showcase } from './showcase/Showcase';
import { DURATION as SHOWCASE_DURATION, FPS as SHOWCASE_FPS } from './showcase/timing';
import { DURATION, FPS } from './timing';
import './theme/fonts';

export const RemotionRoot: React.FC = () => (
  <>
    {/* Video actual (v2, 50 s): hero, calculadora, cómo funciona, metodología y verificación. */}
    {FORMATS.map((f) => (
      <Composition
        key={f.id}
        id={f.id}
        component={Showcase}
        durationInFrames={SHOWCASE_DURATION}
        fps={SHOWCASE_FPS}
        width={f.width}
        height={f.height}
      />
    ))}
    {/* Primera versión (30 s, landing anterior). Se conserva para comparar. */}
    <Folder name="v1">
      {FORMATS.map((f) => (
        <Composition
          key={f.id}
          id={`v1-${f.id}`}
          component={LaunchVideo}
          durationInFrames={DURATION}
          fps={FPS}
          width={f.width}
          height={f.height}
        />
      ))}
    </Folder>
    {/* Plan de LinkedIn: un video por pieza, solo en 4:5 (feed). */}
    <Folder name="LinkedIn">
      <Composition id="LI-1-Teaser" component={Teaser} durationInFrames={TEASER_DURATION} fps={30} width={1080} height={1350} defaultProps={{ ending: 'soon' as const }} />
      <Composition id="LI-1-Teaser-URL" component={Teaser} durationInFrames={TEASER_DURATION} fps={30} width={1080} height={1350} defaultProps={{ ending: 'live' as const }} />
      <Composition id="LI-2-Que-es" component={QueEs} durationInFrames={QUE_ES_DURATION} fps={30} width={1080} height={1350} />
    </Folder>
  </>
);
