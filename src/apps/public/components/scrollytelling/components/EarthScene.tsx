import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { getScrollState } from '../hooks/useScrollProgress';
import { prefersReducedMotion } from '../utils/deviceDetect';

const sunDirection = new THREE.Vector3(-2, 0.5, 1.5).normalize();
const axialTilt = (23.4 * Math.PI) / 180;

/**
 * 3D Earth using 4K textures & custom day/night/cloud shaders
 * Uses getScrollState() directly in useFrame for real-time scroll sync
 */
export function EarthScene() {
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  // Load 4K Earth textures from public directory
  const [dayTexture, nightTexture, cloudsTexture] = useLoader(
    THREE.TextureLoader,
    [
      '/textures/earth-daymap-4k.jpg',
      '/textures/earth-nightmap-4k.jpg',
      '/textures/earth-clouds-4k.jpg',
    ]
  );

  // Custom Earth Day/Night Shader Material
  const earthShaderMaterial = useMemo(() => {
    const uniforms = {
      dayTexture: { value: dayTexture },
      nightTexture: { value: nightTexture },
      cloudsTexture: { value: cloudsTexture },
      sunDirection: { value: sunDirection },
    };

    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewMatrix * modelPosition;

        vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

        vUv = uv;
        vNormal = modelNormal;
        vPosition = modelPosition.xyz;
      }
    `;

    const fragmentShader = `
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform sampler2D cloudsTexture;
      uniform vec3 sunDirection;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vec3 normal = normalize(vNormal);

        float sunOrientation = dot(sunDirection, normal);
        float dayMix = smoothstep(-0.25, 0.5, sunOrientation);

        vec3 dayColor = texture2D(dayTexture, vUv).rgb;
        vec3 nightColor = texture2D(nightTexture, vUv).rgb;
        nightColor *= 1.3;

        vec3 color = mix(nightColor, dayColor, dayMix);

        vec2 specularCloudsColor = texture2D(cloudsTexture, vUv).rg;
        float cloudsMix = smoothstep(0.0, 1.0, specularCloudsColor.g);
        cloudsMix *= dayMix;

        color = mix(color, vec3(1.0), cloudsMix * 0.85);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });
  }, [dayTexture, nightTexture, cloudsTexture]);

  // Fresnel Atmosphere Shader Material
  const atmosphereMaterial = useMemo(() => {
    const uniforms = {
      color1: { value: new THREE.Color(0x0088ff) },
      color2: { value: new THREE.Color(0x000000) },
      fresnelBias: { value: 0.1 },
      fresnelScale: { value: 1.0 },
      fresnelPower: { value: 4.0 },
    };

    const vertexShader = `
      uniform float fresnelBias;
      uniform float fresnelScale;
      uniform float fresnelPower;
      varying float vReflectionFactor;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
        vec3 I = worldPosition.xyz - cameraPosition;

        vReflectionFactor = fresnelBias + fresnelScale * pow(1.0 + dot(normalize(I), worldNormal), fresnelPower);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform vec3 color1;
      uniform vec3 color2;
      varying float vReflectionFactor;

      void main() {
        float f = clamp(vReflectionFactor, 0.0, 1.0);
        gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  useFrame((_, delta) => {
    // Read scroll state directly — not from React useState snapshot
    const scroll = getScrollState();

    if (!earthMeshRef.current || !groupRef.current) return;

    // Slow rotation as transformation progresses — continuous and
    // indefinite, so it's skipped under reduced motion (the planet just
    // holds its current orientation instead of spinning forever).
    if (!reducedMotion) {
      const rotSpeed = THREE.MathUtils.lerp(0.08, 0.015, scroll.transformation);
      earthMeshRef.current.rotation.y += delta * rotSpeed;
    }

    // Scale down planet as forest grows in — shrinks to near-zero well
    // before the visibility cutoff below, so hiding it doesn't pop.
    const targetScale = THREE.MathUtils.lerp(1, 0, Math.min(1, scroll.forest / 0.35));
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.05)
    );

    // Fade out planet completely early in the forest — it was staying
    // visible until forest > 0.95, so it kept looming huge (with its blue
    // atmosphere ring) over the forest ground/trees for almost the entire
    // section, reading as a giant rectangle/circle floating in the sky.
    groupRef.current.visible = scroll.forest < 0.35;
  });

  return (
    <group ref={groupRef}>
      <group rotation-z={axialTilt}>
        <mesh ref={earthMeshRef} material={earthShaderMaterial}>
          <icosahedronGeometry args={[1.5, 64]} />
        </mesh>
        <mesh material={atmosphereMaterial}>
          <icosahedronGeometry args={[1.53, 32]} />
        </mesh>
      </group>
    </group>
  );
}
