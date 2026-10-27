import React from 'react';
import { Composition, Folder } from 'remotion';
import { FORMATS } from './formats';
import { LaunchVideo } from './LaunchVideo';
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
  </>
);
