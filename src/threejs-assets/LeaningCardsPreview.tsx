// Dev-only preview page for the img2threejs blockout pass review.
// Not part of the app's user-facing routes -- mounted temporarily to capture
// the browser render screenshot required by the sculptPipeline blockout gate.
import React, { useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  createCompensaTuViajeLeaningBusinessCardsModel,
  createCompensaTuViajeLeaningBusinessCardsLookDevLights,
  createCompensaTuViajeLeaningBusinessCardsEnvironment,
} from './createLeaningCardsModel';

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const envTexture = createCompensaTuViajeLeaningBusinessCardsEnvironment(gl);
    scene.environment = envTexture;
    return () => {
      envTexture.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);
  return null;
}

function Model() {
  const model = useMemo(
    () => createCompensaTuViajeLeaningBusinessCardsModel({ qualityPriority: 'reference-fidelity' }),
    [],
  );
  const lights = useMemo(
    () => createCompensaTuViajeLeaningBusinessCardsLookDevLights('neutral'),
    [],
  );
  return (
    <>
      <primitive object={model} />
      <primitive object={lights} />
    </>
  );
}

export default function LeaningCardsPreview() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      <Canvas
        camera={{ position: [6, 5, 8], fov: 35 }}
        gl={{ preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
      >
        <color attach="background" args={['#1a1a1a']} />
        <Environment />
        <Model />
        <OrbitControls target={[0, 1, 0]} />
        <axesHelper args={[5]} />
        <gridHelper args={[20, 20]} />
      </Canvas>
    </div>
  );
}
