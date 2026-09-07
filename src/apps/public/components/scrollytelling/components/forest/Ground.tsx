import { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { getScrollState } from '../../hooks/useScrollProgress';

/**
 * Ground — ported from the ez-tree reference demo (test/trees-treejs/ez-tree/src/app/ground.js).
 * A large plane with a MeshStandardMaterial patched (onBeforeCompile) to blend
 * grass/dirt textures based on simplex noise (patchiness), plus a dirt normal
 * map for surface detail. Fades in only in the forest section.
 */
// Lower = smaller/finer dirt patches. At 40 a single noise cell spanned ~40
// world units, giving huge camouflage-like beige blotches; the demo's dirt
// reads as thin trails between the grass, so the cell size needs to be a
// fraction of the visible area rather than most of it.
// Exported so Grass.tsx can sample the exact same dirt/grass mask when
// deciding where to scatter blades, flowers and low vegetation — without a
// shared source of truth, the ground texture and the planted vegetation each
// pick their own idea of where "green" is, and blades end up floating over
// dirt patches (or dirt shows through bare inside grass zones) with no
// relation between the two.
export const NOISE_SCALE = 9;
// s = smoothstep(PATCHINESS - 0.1, PATCHINESS + 0.1, noise) picks dirt when
// s is near 1 — with PATCHINESS at 0.45 (near the middle of the 0-1 noise
// range), roughly half the ground fell on the dirt side, overwhelming the
// grass. Raised close to 1 so dirt only shows through in the rare noise
// peaks, matching the mostly-green reference ground.
// 0.88 pushed nearly all the ground to grass, losing the brown/green mix that
// gives the reference demo its depth. Back toward the middle so dirt shows
// through regularly — but with NOISE_SCALE at 9 (not the old 40) those dirt
// areas read as fine trails between grass rather than huge beige blotches.
export const PATCHINESS = 0.58;

// s in [0,1]: 0 = pure grass texture, 1 = pure dirt texture — same smoothstep
// band the Ground.tsx fragment shader uses (`s = smoothstep(PATCHINESS-0.1,
// PATCHINESS+0.1, n)`), reimplemented on the CPU so Grass.tsx can test
// "is this world-space point on dirt or grass" with the identical noise field
// the ground was actually painted with, not an unrelated one.
export function groundDirtAmount(worldX: number, worldZ: number, simplex2d: (v: THREE.Vector2) => number): number {
  const n = 0.5 + 0.5 * simplex2d(new THREE.Vector2(worldX / NOISE_SCALE, worldZ / NOISE_SCALE));
  const t = THREE.MathUtils.clamp((n - (PATCHINESS - 0.1)) / 0.2, 0, 1);
  return t * t * (3 - 2 * t);
}

export function Ground() {
  const meshRef = useRef<THREE.Mesh>(null);

  const [grassTexture, dirtTexture, dirtNormal] = useLoader(THREE.TextureLoader, [
    '/textures/ground/grass.jpg',
    '/textures/ground/dirt_color.jpg',
    '/textures/ground/dirt_normal.jpg',
  ]);

  const material = useMemo(() => {
    [grassTexture, dirtTexture].forEach((tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
    });
    dirtNormal.wrapS = THREE.RepeatWrapping;
    dirtNormal.wrapT = THREE.RepeatWrapping;

    const mat = new THREE.MeshStandardMaterial({
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.01,
      normalMap: dirtNormal,
      metalness: 0.0,
      roughness: 1.0,
      // Needed for the distance-fade alpha below. FogExp2 can only tint this
      // plane's colour, never hide its edge — a flat plane's silhouette
      // against the sky is a perfectly straight geometric line no matter what
      // colour it's painted, so colour-matching the sky never removed the
      // line, only what showed through it (confirmed by forcing the sky to
      // solid magenta: the same razor-straight edge was still there against
      // flat magenta). Fading alpha to 0 well before the plane's actual rim
      // is the only way to make the silhouette itself disappear.
      transparent: true,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uNoiseScale = { value: NOISE_SCALE };
      shader.uniforms.uPatchiness = { value: PATCHINESS };
      shader.uniforms.uGrassTexture = { value: grassTexture };
      shader.uniforms.uDirtTexture = { value: dirtTexture };
      // Distance at which the ground has fully faded out — comfortably past
      // where FogExp2 (SceneManager.tsx, density ~0.026) has already
      // saturated the surface to solid fog colour, so the alpha fade starts
      // only after the colour is already uniform and finishes well inside
      // the plane's real 2000-unit edge.
      shader.uniforms.uFadeDistance = { value: 220 };

      shader.vertexShader = `
        varying vec3 vWorldPosition;
        ${shader.vertexShader}
      `;

      shader.fragmentShader = `
        varying vec3 vWorldPosition;
        uniform float uNoiseScale;
        uniform float uPatchiness;
        uniform sampler2D uGrassTexture;
        uniform sampler2D uDirtTexture;
        uniform float uFadeDistance;
        ${shader.fragmentShader}
      `;

      // Don't rely on three's own `worldPosition` var from the
      // worldpos_vertex chunk — in three.js 0.184 that chunk only declares
      // it when USE_ENVMAP/DISTANCE/USE_SHADOWMAP/USE_TRANSMISSION/spot
      // shadows are active (see node_modules/three/.../worldpos_vertex.glsl.js),
      // none of which this material enables. Referencing it unconditionally
      // caused a vertex shader compile failure that silently dropped the
      // whole ground mesh. Compute our own instead, right after <begin_vertex>.
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
          vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

        float simplex2d(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
          m = m * m;
          m = m * m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
          vec3 g;
          g.x = a0.x * x0.x + h.x * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        vec2 uv = vec2(vWorldPosition.x, vWorldPosition.z);
        vec3 grassColor = texture2D(uGrassTexture, uv / 30.0).rgb;
        vec3 dirtColor = texture2D(uDirtTexture, uv / 30.0).rgb;

        float n = 0.5 + 0.5 * simplex2d(uv / uNoiseScale);
        float s = smoothstep(uPatchiness - 0.1, uPatchiness + 0.1, n);

        vec4 sampledDiffuseColor = vec4(mix(grassColor, dirtColor, s), 1.0);
        diffuseColor *= sampledDiffuseColor;
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <normal_fragment_maps>',
        `
        vec3 mapN = texture2D(normalMap, uv / 30.0).xyz * 2.0 - 1.0;
        mapN.xy *= normalScale;
        normal = normalize(tbn * mapN);
        `
      );

      // Fog is left as three.js's standard distance-from-camera FogExp2 (see
      // ForestFog in SceneManager.tsx) — the same as every other forest
      // material (Grass.tsx, Rocks.tsx, trees) — so the ground doesn't look
      // out of sync with what's standing on it.
      //
      // Fade the plane's own alpha to 0 with distance, on top of the colour
      // fog above. A flat plane's silhouette against whatever is behind it
      // (sky, clear colour) is a dead straight geometric line no matter what
      // colour both sides are painted — confirmed by forcing the sky to solid
      // magenta and seeing the exact same hard edge. Only making the surface
      // itself disappear (alpha, not colour) removes the line; the fade
      // starts past where FogExp2 has already saturated the colour, so there
      // is no visible seam between "solid coloured" and "fading".
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        float camDist = distance(vWorldPosition, cameraPosition);
        float edgeAlpha = 1.0 - smoothstep(uFadeDistance * 0.6, uFadeDistance, camDist);
        gl_FragColor.a *= edgeAlpha;
        #include <dithering_fragment>
        `
      );
    };

    return mat;
  }, [grassTexture, dirtTexture, dirtNormal]);

  useFrame(() => {
    if (!meshRef.current) return;
    const forest = getScrollState().forest;
    meshRef.current.visible = forest > 0.02;
  });

  return (
    <mesh
      ref={meshRef}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.5, 0]}
      receiveShadow
    >
      {/* 4000 units, not 500. FogExp2 can only tint geometry, never hide its
          edge — at 500 the plane's rim sat 250 units out, where the fog has
          already saturated to pure FOREST_FOG_COLOR, so the frame showed a
          razor-sharp horizontal line: saturated fog below, open sky above.
          Pushing the rim far past the fog's saturation distance (~250) means
          the plane always fills the lower frame and the eye never reaches its
          edge, so the only transition left is the sky/fog colour blend. */}
      <planeGeometry args={[4000, 4000]} />
    </mesh>
  );
}
