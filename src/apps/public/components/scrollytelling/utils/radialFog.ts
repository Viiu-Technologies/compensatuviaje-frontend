import * as THREE from 'three';

/**
 * Patches a material's onBeforeCompile to base three.js's built-in fog on
 * distance from the world origin (radius on the XZ plane) instead of
 * distance from the camera.
 *
 * Standard `scene.fog` uses `vFogDepth` = distance-to-camera, so zooming the
 * camera out moves the whole scene "into the fog" uniformly — there's no way
 * to keep a clear area around the world's own center while still fogging the
 * true horizon. This chunk requires the material's vertex shader to already
 * compute `vWorldPosition` (see Ground.tsx / Clouds.tsx for why the built-in
 * `worldpos_vertex` chunk can't be relied on) — call this AFTER that patch.
 */
export function useRadialFog(material: THREE.Material, worldPositionVarying = 'vWorldPosition') {
  const original = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    original?.(shader, renderer);

    shader.fragmentShader = shader.fragmentShader.replace(
      'float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );',
      `float radialFogDepth = length(${worldPositionVarying}.xz);
      float fogFactor = 1.0 - exp( - fogDensity * fogDensity * radialFogDepth * radialFogDepth );`
    );
  };
}
