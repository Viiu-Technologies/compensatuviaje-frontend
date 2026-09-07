import { Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EarthScene } from './EarthScene';
import { Stars } from './Stars';
import { FlightRoutes } from './FlightRoutes';
import { CO2Particles } from './CO2Particles';
import { ForestScene } from './ForestScene';
import { CameraController } from './CameraController';
import { Skybox } from './Skybox';
import { getScrollState } from '../hooks/useScrollProgress';

// Matches the skybox's forest horizon color (Skybox.tsx FOREST_SKY.low)
// so distant trees fade into the backdrop, exactly like the reference
// ez-tree demo (scene.fog 0x94b9f8 ≈ skyColorLow 0x6fa2ef).
const FOREST_FOG_COLOR = 0xc3dbf5;

// Nothing closer than this is fogged at all. The ring of trees framing
// HERO_TREE sits at radius 44 (ForestScene.tsx), and the camera orbits ~26
// units out, so the ring can be up to ~70 units away at the far side of the
// orbit — 50 clears that entirely, leaving the hero and its immediate
// neighbours completely crisp.
const FOG_NEAR = 50;
// Full fog saturation distance. Grass.tsx scatters blades out to radius 100
// and Rocks.tsx to 65 — past those radii the ground plane is bare dirt with
// nothing planted on it, so fog needs to be fully opaque well before 100 or
// that bare ring shows through sharp and unmistakably bare. 120 (was 200)
// saturates just past the grass's own edge, so the last bit of bare ground is
// already solid fog colour rather than a visible naked patch. Still well
// inside where the ground plane's own alpha fade finishes (Ground.tsx, ~220),
// so the terrain is fully fog-coloured before it starts dissolving — the hard
// horizon line doesn't come back.
const FOG_FAR = 120;

/**
 * Linear fog that fades in only once the scroll enters the forest section —
 * gives the background trees atmospheric depth instead of a hard, flat
 * cutoff, and stays off during the planet/space scenes.
 *
 * Linear THREE.Fog, not FogExp2. FogExp2 starts accumulating haze immediately
 * at the camera, so with the near ring now at radius 44 it was veiling those
 * trees ~47% no matter how low the density went — and lowering density enough
 * to clear them left the far distance under-fogged (only ~76% at 150u), which
 * brings back the horizon seam. Linear fog takes an explicit near plane, so
 * the trees around the hero can sit at exactly zero fog while the distance
 * still saturates fully.
 */
function ForestFog() {
  const { scene } = useThree();

  useFrame(() => {
    const forest = getScrollState().forest;
    if (forest > 0.01) {
      if (!scene.fog || !(scene.fog as THREE.Fog).isFog) {
        scene.fog = new THREE.Fog(FOREST_FOG_COLOR, FOG_NEAR, FOG_FAR);
      }
      const fog = scene.fog as THREE.Fog;
      const t = Math.min(1, forest * 1.5);
      // Ease the fog in by pulling `far` in from effectively-infinite rather
      // than by ramping a density: at t=0 far is huge so nothing is fogged,
      // and it closes to FOG_FAR as the forest section arrives. `near` stays
      // fixed so the trees around the hero are never touched at any point in
      // the scroll.
      fog.near = FOG_NEAR;
      fog.far = THREE.MathUtils.lerp(4000, FOG_FAR, t);
    } else if (scene.fog) {
      scene.fog = null;
    }
  });

  return null;
}

/**
 * Orchestrates all 3D scenes within the R3F Canvas with React Suspense
 */
export function SceneManager() {
  return (
    <>
      {/* Camera */}
      <CameraController />

      {/* Sky gradient + sun, replaces the flat CSS canvas background */}
      <Skybox />

      <ForestFog />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-3, -1, -3]} intensity={0.5} color="#38bdf8" />
      <pointLight position={[2, 2, 4]} intensity={0.5} color="#fef3c7" />

      {/* Suspense wrapped 3D models & textures */}
      <Suspense fallback={null}>
        {/* Background stars & nebula */}
        <Stars />

        {/* Planet Earth */}
        <EarthScene />

        {/* Flight routes with aircraft and trails */}
        <FlightRoutes />

        {/* CO₂ / compensation particles */}
        <CO2Particles />

        {/* 3D Forest compensation scene */}
        <ForestScene />
      </Suspense>
    </>
  );
}
