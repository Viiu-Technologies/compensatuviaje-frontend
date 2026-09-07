import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { simplex2d } from '../../utils/simplexNoise';
import { getScrollState } from '../../hooks/useScrollProgress';
import { isMobile, prefersReducedMotion } from '../../utils/deviceDetect';
import { groundDirtAmount } from './Ground';

/**
 * Grass — ported from the ez-tree reference demo (test/trees-treejs/ez-tree/src/app/grass.js).
 * Thousands of instanced grass blades (from a .glb mesh) plus scattered
 * flowers, both swaying via a shared wind vertex-shader patch. Positions are
 * placed with simplex noise "patchiness" so grass clumps naturally instead
 * of spreading uniformly. Fades in only in the forest section.
 */
// The scatter RADIUS deliberately reaches well past the tree area and into
// where the ForestFog (SceneManager.tsx) turns opaque — the point is for fog
// to hide the edge of the grass field, not a visible circle cutoff.
//
// Where blades are actually kept, though, is no longer an independent noise
// field here — it used to be (via a local SCALE/PATCHINESS pair sampling
// simplex2d on its own), but that meant grass placement had no relationship
// to where the ground texture itself painted grass vs dirt (Ground.tsx runs
// its own separate noise). Blades could float over a dirt patch, or dirt
// could show bare in the middle of a grass zone, purely by coincidence. Now
// scatterPositions calls groundDirtAmount() (imported from Ground.tsx) at
// each candidate point and uses THAT to decide whether to keep it — see
// there for the shared mask.
// Sway amplitude, i.e. how far the blade tips lean. Cut from 0.3 — the blades
// were bending at an unnaturally wide angle for what should read as a light
// breeze, especially up close where the camera ends the scroll.
const WIND_STRENGTH = new THREE.Vector3(0.14, 0, 0.14);
// Slowed again from 0.4 — combined with the reduced amplitude above this
// reads as a slow, gentle drift rather than an agitated shimmer.
const WIND_FREQUENCY = 0.22;
const WIND_SCALE = 20.0;

// Doubled density — the field read as sparse/patchy up close. Radius pushed
// out to keep pace with the trees, which now spread out to radius 90 (see
// ForestScene.tsx) — the center-biased falloff in scatterPositions() still
// keeps density highest near the camera, so instance count doesn't need to
// grow as much as the radius did.
const INSTANCE_COUNT = isMobile() ? 9000 : 26000;
// Reaches past the real trees (radius 95, see ForestScene.tsx) so the edge of
// the grass field lands where fog has already hidden it, rather than showing
// a visible boundary between planted ground and bare ground.
const MAX_RADIUS = isMobile() ? 60 : 100;
const FLOWER_COUNT = isMobile() ? 10 : 22;

const windShaderChunk = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
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
`;

function appendWindShader(material: THREE.Material, instanced: boolean) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uWindStrength = { value: WIND_STRENGTH };
    shader.uniforms.uWindFrequency = { value: WIND_FREQUENCY };
    shader.uniforms.uWindScale = { value: WIND_SCALE };

    shader.vertexShader = `
      uniform float uTime;
      uniform vec3 uWindStrength;
      uniform float uWindFrequency;
      uniform float uWindScale;
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace('void main() {', `${windShaderChunk}\nvoid main() {`);

    const projectVertex = instanced
      ? `
        vec4 mvPosition = instanceMatrix * vec4(transformed, 1.0);
        float windOffset = 2.0 * 3.14 * simplex2d((modelMatrix * mvPosition).xz / uWindScale);
        vec3 windSway = position.y * uWindStrength *
        sin(uTime * uWindFrequency + windOffset) *
        cos(uTime * 1.4 * uWindFrequency + windOffset);

        mvPosition.xyz += windSway;
        mvPosition = modelViewMatrix * mvPosition;

        gl_Position = projectionMatrix * mvPosition;
        `
      : `
        vec4 mvPosition = vec4(transformed, 1.0);
        float windOffset = 2.0 * 3.14 * simplex2d((modelMatrix * mvPosition).xz / uWindScale);
        vec3 windSway = 0.2 * position.y * uWindStrength *
        sin(uTime * uWindFrequency + windOffset) *
        cos(uTime * 1.4 * uWindFrequency + windOffset);

        mvPosition.xyz += windSway;
        mvPosition = modelViewMatrix * mvPosition;

        gl_Position = projectionMatrix * mvPosition;
        `;

    shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', projectVertex);

    material.userData.shader = shader;
  };
}

function scatterPositions(count: number, maxRadius: number) {
  const positions: { p: THREE.Vector3; rotY: number; scale: number }[] = [];
  for (let i = 0; i < count; i++) {
    // Bias toward the center (sqrt would be uniform-by-area; a higher power
    // concentrates more blades close to the camera, matching how dense the
    // reference demo's grass reads up close) while still reaching maxRadius.
    const r = 0.3 + Math.pow(Math.random(), 1.8) * maxRadius;
    const theta = Math.random() * 2.0 * Math.PI;
    const p = new THREE.Vector3(r * Math.cos(theta), -1.5, r * Math.sin(theta));

    // dirt in [0,1]: sampled from the SAME noise field Ground.tsx's shader
    // paints dirt vs grass texture with, so blades are only kept where the
    // ground underneath them is actually textured green. Skipping with
    // probability `dirt` (rather than a hard dirt>threshold cutoff) means:
    // deep in a grass zone (dirt≈0) blades are kept almost every time, deep
    // in a dirt zone (dirt≈1, which groundDirtAmount saturates to well past
    // Ground.tsx's own ±0.1 smoothstep band) they're skipped almost every
    // time leaving that ground genuinely bare, and only right at the
    // boundary — where dirt is partway between 0 and 1 — does the coin flip
    // start thinning blades out gradually, which reads as a ragged, organic
    // edge that follows the noise field's own irregular shape rather than a
    // drawn line or a repeating cutout pattern.
    const dirt = groundDirtAmount(p.x, p.z, simplex2d);
    if (Math.random() < dirt) continue;

    positions.push({ p, rotY: 2 * Math.PI * Math.random(), scale: 1 });
  }
  return positions;
}

export function Grass() {
  const groupRef = useRef<THREE.Group>(null);
  const grassMeshRef = useRef<THREE.InstancedMesh>(null);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  const grassGltf = useGLTF('/models/grass.glb');
  const whiteFlowerGltf = useGLTF('/models/flower_white.glb');
  const blueFlowerGltf = useGLTF('/models/flower_blue.glb');
  const yellowFlowerGltf = useGLTF('/models/flower_yellow.glb');

  const grassSource = grassGltf.scene.children[0] as THREE.Mesh;

  const grassMaterial = useMemo(() => {
    const sourceMat = grassSource.material as THREE.MeshStandardMaterial;
    const mat = new THREE.MeshStandardMaterial({
      map: sourceMat.map,
      emissive: new THREE.Color(0x308040),
      emissiveIntensity: 0.05,
      transparent: false,
      alphaTest: 0.5,
      depthTest: true,
      depthWrite: true,
      metalness: 0.0,
      roughness: 1.0,
      side: THREE.DoubleSide,
      fog: true,
    });
    mat.color.multiplyScalar(0.6);
    appendWindShader(mat, true);
    return mat;
  }, [grassSource]);

  const grassInstances = useMemo(() => scatterPositions(INSTANCE_COUNT, MAX_RADIUS), []);

  useEffect(() => {
    const mesh = grassMeshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    grassInstances.forEach(({ p, rotY }, i) => {
      dummy.position.copy(p);
      dummy.rotation.set(0, rotY, 0);
      // Keep the tufts wider only slightly, but increase the vertical height so
      // the grass reads as taller, longer blades instead of a wider spread.
      dummy.scale.set(
        0.26 + 0.10 * Math.random(),
        0.40 + 0.64 * Math.random(),
        0.26 + 0.10 * Math.random()
      );
      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, new THREE.Color(0.25 + Math.random() * 0.1, 0.3 + Math.random() * 0.3, 0.1));
    });

    mesh.count = grassInstances.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [grassInstances]);

  const flowers = useMemo(() => {
    const sources = [whiteFlowerGltf, blueFlowerGltf, yellowFlowerGltf];
    const group = new THREE.Group();

    sources.forEach((gltf) => {
      const source = gltf.scene.children[0] as THREE.Object3D;
      source.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh && mesh.material) {
          const srcMat = mesh.material as THREE.MeshStandardMaterial;
          if (srcMat.map) {
            mesh.material = new THREE.MeshStandardMaterial({ map: srcMat.map, metalness: 0.0, roughness: 1.0, fog: true });
          }
          appendWindShader(mesh.material as THREE.Material, false);
        }
      });

      const positions = scatterPositions(FLOWER_COUNT, MAX_RADIUS * 0.8);
      positions.forEach(({ p, rotY }) => {
        const flower = source.clone();
        flower.position.copy(p);
        flower.rotation.set(0, rotY, 0);
        // Flowers should read as roughly half the height of the grass blades
        // around them (grass Y scale is ~0.18-0.28 above), not tower over
        // them — the raw demo scale (0.015-0.03) looked oversized here.
        const scale = 0.006 + 0.005 * Math.random();
        flower.scale.set(scale, scale, scale);
        group.add(flower);
      });
    });

    return group;
  }, [whiteFlowerGltf, blueFlowerGltf, yellowFlowerGltf]);

  useFrame((state) => {
    // Wind sway is a continuous, indefinite loop — frozen (blades/flowers
    // hold their rest pose) under reduced motion instead of swaying forever.
    if (!reducedMotion) {
      const t = state.clock.elapsedTime;
      const shader = (grassMaterial.userData as { shader?: { uniforms: { uTime: { value: number } } } }).shader;
      if (shader) shader.uniforms.uTime.value = t;

      flowers.traverse((o) => {
        const mesh = o as THREE.Mesh;
        const shaderData = mesh.material && (mesh.material as THREE.Material).userData?.shader;
        if (shaderData) shaderData.uniforms.uTime.value = t;
      });
    }

    if (groupRef.current) {
      groupRef.current.visible = getScrollState().forest > 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={grassMeshRef}
        args={[grassSource.geometry, grassMaterial, INSTANCE_COUNT]}
        castShadow
        receiveShadow
      />
      <primitive object={flowers} />
    </group>
  );
}

useGLTF.preload('/models/grass.glb');
useGLTF.preload('/models/flower_white.glb');
useGLTF.preload('/models/flower_blue.glb');
useGLTF.preload('/models/flower_yellow.glb');
