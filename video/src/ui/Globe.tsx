// Réplica de src/apps/public/components/hero3d/HeroGlobe.tsx para Remotion:
// mismo shader día/noche, misma atmósfera Fresnel y mismas texturas. Cambia lo
// que Remotion exige: la rotación sale de useCurrentFrame() (sin OrbitControls
// ni useFrame) y los arcos son estáticos (sin pulsos que recorran la ruta).
import React, { useEffect, useMemo, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { cancelRender, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import * as THREE from 'three';

const EARTH_RADIUS = 1.5;
const ARC_ALTITUDE = 0.32;
const AXIAL_TILT = (23.4 * Math.PI) / 180;
const SUN_DIRECTION = new THREE.Vector3(-2, 0.6, 1.4).normalize();

// Equivale al autoRotateSpeed 0.75 de OrbitControls, a la mitad: en video una
// rotación lenta se lee como "planeta", una rápida como "animación".
const ROTATION_PER_FRAME = 0.0013;

const HERO_ROUTES = [
  { from: [-33.45, -70.67], to: [40.42, -3.7], color: '#22d3ee' }, //  SCL → MAD
  { from: [-33.45, -70.67], to: [25.76, -80.19], color: '#10b981' }, // SCL → MIA
  { from: [-33.45, -70.67], to: [-12.05, -77.04], color: '#38bdf8' }, // SCL → LIM
  { from: [-34.6, -58.38], to: [-33.45, -70.67], color: '#22c55e' }, // BUE → SCL
  { from: [40.42, -3.7], to: [40.71, -74.01], color: '#818cf8' }, //   MAD → JFK
  { from: [-23.55, -46.63], to: [51.51, -0.13], color: '#34d399' }, // GRU → LHR
] as const;

const TEXTURES = ['textures/earth-daymap-2k.jpg', 'textures/earth-nightmap-2k.jpg', 'textures/earth-clouds-2k.jpg'];

// Una sola carga compartida por el globo de la intro y el del hero.
let texturesPromise: Promise<THREE.Texture[]> | null = null;
const loadTextures = () => {
  if (!texturesPromise) {
    const loader = new THREE.TextureLoader();
    texturesPromise = Promise.all(TEXTURES.map((src) => loader.loadAsync(staticFile(src))));
  }
  return texturesPromise;
};

const useEarthTextures = () => {
  const [textures, setTextures] = useState<THREE.Texture[] | null>(null);
  const [handle] = useState(() => delayRender('Cargando texturas del globo'));

  useEffect(() => {
    loadTextures()
      .then((t) => {
        setTextures(t);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [handle]);

  return textures;
};

function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function createArcCurve(from: readonly number[], to: readonly number[]) {
  const start = latLonToVec3(from[0], from[1], EARTH_RADIUS);
  const end = latLonToVec3(to[0], to[1], EARTH_RADIUS);
  const lift = (v: THREE.Vector3, alt: number) => v.normalize().multiplyScalar(EARTH_RADIUS + alt);
  const mid = lift(new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5), ARC_ALTITUDE);
  const c1 = lift(new THREE.Vector3().addVectors(start, mid).multiplyScalar(0.5), ARC_ALTITUDE * 0.82);
  const c2 = lift(new THREE.Vector3().addVectors(mid, end).multiplyScalar(0.5), ARC_ALTITUDE * 0.82);
  return new THREE.CubicBezierCurve3(start, c1, c2, end);
}

const EARTH_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
    vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
    vUv = uv;
  }
`;

const EARTH_FRAGMENT = /* glsl */ `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform sampler2D cloudsTexture;
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vec3 normal = normalize(vNormal);
    float sunOrientation = dot(sunDirection, normal);
    float dayMix = smoothstep(-0.25, 0.45, sunOrientation);
    vec3 dayColor = texture2D(dayTexture, vUv).rgb;
    vec3 nightColor = texture2D(nightTexture, vUv).rgb * 1.35;
    vec3 color = mix(nightColor, dayColor, dayMix);
    vec2 cloudsData = texture2D(cloudsTexture, vUv).rg;
    float cloudsMix = smoothstep(0.05, 0.95, cloudsData.g) * dayMix;
    color = mix(color, vec3(1.0), cloudsMix * 0.78);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const ATMO_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const ATMO_FRAGMENT = /* glsl */ `
  uniform vec3 colorAtmo;
  uniform vec3 colorEdge;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
    fresnel = pow(fresnel, 3.2);
    vec3 glowColor = mix(colorAtmo, colorEdge, fresnel * 0.5);
    gl_FragColor = vec4(glowColor, fresnel * 0.85);
  }
`;

const Earth: React.FC<{ textures: THREE.Texture[]; showRoutes: boolean; atmosphere: boolean }> = ({
  textures,
  showRoutes,
  atmosphere,
}) => {
  const [day, night, clouds] = textures;

  const earthMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          dayTexture: { value: day },
          nightTexture: { value: night },
          cloudsTexture: { value: clouds },
          sunDirection: { value: SUN_DIRECTION },
        },
        vertexShader: EARTH_VERTEX,
        fragmentShader: EARTH_FRAGMENT,
      }),
    [day, night, clouds],
  );

  const atmoMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          colorAtmo: { value: new THREE.Color(0x06b6d4) },
          colorEdge: { value: new THREE.Color(0x10b981) },
        },
        vertexShader: ATMO_VERTEX,
        fragmentShader: ATMO_FRAGMENT,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );

  const routes = useMemo(
    () =>
      showRoutes
        ? HERO_ROUTES.map((r) => {
            const geometry = new THREE.BufferGeometry().setFromPoints(createArcCurve(r.from, r.to).getPoints(60));
            const material = new THREE.LineBasicMaterial({
              color: r.color,
              transparent: true,
              opacity: 0.55,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            });
            return {
              line: new THREE.Line(geometry, material),
              origin: latLonToVec3(r.from[0], r.from[1], EARTH_RADIUS * 1.006),
              dest: latLonToVec3(r.to[0], r.to[1], EARTH_RADIUS * 1.006),
              color: r.color,
            };
          })
        : [],
    [showRoutes],
  );

  return (
    <group rotation-z={AXIAL_TILT}>
      <mesh material={earthMaterial}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      </mesh>
      {atmosphere ? (
        <mesh material={atmoMaterial}>
          <sphereGeometry args={[EARTH_RADIUS * 1.035, 48, 48]} />
        </mesh>
      ) : null}
      {routes.map((r, i) => (
        <group key={i}>
          <primitive object={r.line} />
          <mesh position={r.origin}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <meshBasicMaterial color={r.color} />
          </mesh>
          <mesh position={r.dest}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <meshBasicMaterial color={r.color} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

type GlobeCanvasProps = {
  width: number;
  height: number;
  /** Inclinación hacia la cámara (rad). Negativa = se ve más el hemisferio sur. */
  tiltX?: number;
  /** Rotación inicial (rad) para que Sudamérica quede de frente. */
  spin0?: number;
  /** Posición y escala de la Tierra dentro del canvas (para el "horizonte" de la intro). */
  position?: [number, number, number];
  scale?: number;
  camera?: { position: [number, number, number]; fov: number };
  showRoutes?: boolean;
  /** Halo Fresnel. Sobre fondo claro se ve como en la web; sobre el teal
      oscuro el blending aditivo lo vuelve un borde duro. */
  atmosphere?: boolean;
  dpr?: number;
};

export const GlobeCanvas: React.FC<GlobeCanvasProps> = ({
  width,
  height,
  tiltX = -0.4,
  spin0 = -0.35,
  position = [0, 0, 0],
  scale = 1,
  camera = { position: [0, 0, 3.8], fov: 48 },
  showRoutes = false,
  atmosphere = true,
  dpr = 1,
}) => {
  const frame = useCurrentFrame();
  const textures = useEarthTextures();

  // El canvas se monta cuando las texturas ya están: así el primer render de
  // WebGL ya tiene el planeta completo.
  if (!textures) return null;

  return (
    <ThreeCanvas width={width} height={height} camera={camera} dpr={dpr} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[-3, 2, 2]} intensity={1.2} />
      <group position={position} scale={scale} rotation-x={tiltX}>
        <group rotation-y={spin0 + frame * ROTATION_PER_FRAME}>
          <Earth textures={textures} showRoutes={showRoutes} atmosphere={atmosphere} />
        </group>
      </group>
    </ThreeCanvas>
  );
};
