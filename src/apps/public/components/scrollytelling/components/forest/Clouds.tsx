import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getScrollState } from '../../hooks/useScrollProgress';

const PLANE_SIZE = 700;

/**
 * Clouds — ported from the ez-tree reference demo (test/trees-treejs/ez-tree/src/app/clouds.js).
 * A single huge plane above the scene, with a MeshBasicMaterial whose shader
 * is patched (onBeforeCompile) to paint procedural simplex-noise clouds that
 * drift over time. Fades in only in the forest section.
 */
export function Clouds() {
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef<THREE.WebGLProgramParametersWithUniforms | null>(null);

  const material = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.9,
      fog: true,
      depthWrite: false,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };

      shader.vertexShader = `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        ${shader.vertexShader}
      `;

      shader.fragmentShader = `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        ${shader.fragmentShader}
      `;

      // Don't rely on three's own `worldPosition` var from the
      // worldpos_vertex chunk — it's only declared there when
      // USE_ENVMAP/USE_SHADOWMAP/etc are active (see Ground.tsx for the
      // same issue), which silently failed this shader's compile and
      // dropped the whole cloud plane. Compute our own instead.
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         vUv = uv;
         vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `vec3 permute(vec3 x) {
          return mod(((x * 34.0) + 1.0) * x, 289.0);
        }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
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
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {`
      );

      // The reference demo divides alpha by distance-from-world-origin,
      // tuned for its 2000x2000 plane where that distance varies hugely
      // across the surface. Our plane is only 90x90 (to fit inside the
      // Skybox sphere, radius 50) so that distance barely changes across
      // it — the divide collapsed to a near-constant, painting the whole
      // plane as a solid opaque panel instead of dispersed clouds.
      //
      // vUv only sweeps 0→1 across the whole 90-unit plane, so low
      // frequencies (the demo's *5.0/*10.0) produced just 1-2 noise cells
      // total — reading as one giant blob covering most of the plane.
      //
      // A 2-octave sum with a narrow smoothstep (0.55-0.85) read as hard
      // geometric blobs with crisp edges, not soft clouds — each octave's
      // cell boundary showed through cleanly. Summing 4 octaves (classic fbm,
      // each half the amplitude/double the frequency of the last) breaks up
      // that cell structure, and a much wider smoothstep turns the sharp
      // cutoff into a gradual, wispy falloff at the cloud edges.
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        vec2 uv1 = vUv * 6.0 + vec2(uTime / 45.0, 0.0);
        vec2 uv2 = vUv * 12.0 + vec2(uTime / 30.0, uTime / 60.0);
        vec2 uv3 = vUv * 24.0 - vec2(uTime / 20.0, 0.0);
        vec2 uv4 = vUv * 48.0 + vec2(0.0, uTime / 15.0);
        float n = snoise(uv1) * 0.5
                + snoise(uv2) * 0.25
                + snoise(uv3) * 0.125
                + snoise(uv4) * 0.0625;
        float cloud = smoothstep(0.05, 0.55, n);
        diffuseColor = vec4(1.0, 1.0, 1.0, cloud * opacity);
        `
      );

      shaderRef.current = shader;
    };

    return mat;
  }, []);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (meshRef.current) {
      const forest = getScrollState().forest;
      meshRef.current.visible = forest > 0.05;
      // Follow the camera on X/Z (not Y — stays at a fixed cloud altitude)
      // for the same reason the Skybox dome now does: this plane was fixed
      // at the world origin, sized to just fit inside the OLD radius-50 dome.
      // Since the dome grew to radius 400 and started following the camera,
      // this 90x90 panel became a small, sharp-edged rectangle of clouds
      // floating in an otherwise much bigger sky — its straight geometric
      // edges were plainly visible against the backdrop instead of the
      // painted, fading cloud texture reaching to the horizon.
      meshRef.current.position.x = state.camera.position.x;
      meshRef.current.position.z = state.camera.position.z;
    }
  });

  return (
    <mesh
      ref={meshRef}
      material={material}
      position={[0, 30, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      {/* Large enough to always fill the visible sky out to the horizon now
          that the dome (Skybox.tsx) is radius 400 and camera-centred — a
          fixed 90x90 panel left its straight edges exposed once the sky
          around it grew much bigger than the cloud plane itself. */}
      <planeGeometry args={[PLANE_SIZE, PLANE_SIZE]} />
    </mesh>
  );
}
