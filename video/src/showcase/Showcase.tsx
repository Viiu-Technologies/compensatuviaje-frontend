// Video v2 (50 s): planeta → hero con la calculadora → cómo funciona →
// metodología (minijuego) → verificación y estándares → cierre.
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Intro, IntroPlanet } from '../scenes/Intro/Intro';
import { C } from '../theme/palette';
import { HeroScene } from './scenes/HeroScene';
import { HowItWorksScene } from './scenes/HowItWorksScene';
import { MethodScene } from './scenes/MethodScene';
import { OutroScene } from './scenes/OutroScene';
import { VerifyScene } from './scenes/VerifyScene';
import { DURATION, SHOW } from './timing';
import './showcase.css';

export const Showcase: React.FC = () => (
  <AbsoluteFill style={{ background: C.teal950 }}>
    <Sequence name="Planeta" durationInFrames={SHOW.intro.duration}>
      <IntroPlanet />
    </Sequence>
    <Sequence name="Hero + calculadora" from={SHOW.hero.from} durationInFrames={SHOW.hero.duration}>
      <HeroScene />
    </Sequence>
    {/* "Cada vuelo deja huella." va encima del cielo mientras se desvanece */}
    <Sequence name="Cada vuelo deja huella" durationInFrames={SHOW.intro.duration}>
      <Intro />
    </Sequence>
    <Sequence name="Cómo funciona" from={SHOW.howItWorks.from} durationInFrames={SHOW.howItWorks.duration}>
      <HowItWorksScene />
    </Sequence>
    <Sequence name="Metodología (minijuego)" from={SHOW.method.from} durationInFrames={SHOW.method.duration}>
      <MethodScene />
    </Sequence>
    <Sequence name="Verificación" from={SHOW.verify.from} durationInFrames={SHOW.verify.duration}>
      <VerifyScene />
    </Sequence>
    <Sequence name="Cierre" from={SHOW.outro.from} durationInFrames={DURATION - SHOW.outro.from}>
      <OutroScene />
    </Sequence>
  </AbsoluteFill>
);
