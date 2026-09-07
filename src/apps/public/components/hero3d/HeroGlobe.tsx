import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { HiGlobeAlt, HiSparkles } from 'react-icons/hi';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import './HeroGlobe.css';

const EARTH_RADIUS = 1.5;
const ARC_ALTITUDE = 0.32;
const axialTilt = (23.4 * Math.PI) / 180;
const sunDirection = new THREE.Vector3(-2, 0.6, 1.4).normalize();

// Rutas aéreas clave representativas de Compensatuviaje (con foco en Sudamérica y conexión global)
const HERO_ROUTES = [
  {
    id: 'scl-mad',
    from: { name: 'Santiago', lat: -33.45, lon: -70.67 },
    to: { name: 'Madrid', lat: 40.42, lon: -3.7 },
    color: '#22d3ee',
  },
  {
    id: 'scl-mia',
    from: { name: 'Santiago', lat: -33.45, lon: -70.67 },
    to: { name: 'Miami', lat: 25.76, lon: -80.19 },
    color: '#10b981',
  },
  {
    id: 'scl-lim',
    from: { name: 'Santiago', lat: -33.45, lon: -70.67 },
    to: { name: 'Lima', lat: -12.05, lon: -77.04 },
    color: '#38bdf8',
  },
  {
    id: 'bue-scl',
    from: { name: 'Buenos Aires', lat: -34.60, lon: -58.38 },
    to: { name: 'Santiago', lat: -33.45, lon: -70.67 },
    color: '#22c55e',
  },
  {
    id: 'mad-jfk',
    from: { name: 'Madrid', lat: 40.42, lon: -3.7 },
    to: { name: 'New York', lat: 40.71, lon: -74.01 },
    color: '#818cf8',
  },
  {
    id: 'gru-lhr',
    from: { name: 'São Paulo', lat: -23.55, lon: -46.63 },
    to: { name: 'London', lat: 51.51, lon: -0.13 },
    color: '#34d399',
  },
];

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

function createArcCurve(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  radius: number,
  altitude: number = ARC_ALTITUDE
): THREE.CubicBezierCurve3 {
  const start = latLonToVec3(startLat, startLon, radius);
  const end = latLonToVec3(endLat, endLon, radius);
  const mid = new THREE.Vector3()
    .addVectors(start, end)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(radius + altitude);

  const control1 = new THREE.Vector3()
    .addVectors(start, mid)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(radius + altitude * 0.82);

  const control2 = new THREE.Vector3()
    .addVectors(mid, end)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(radius + altitude * 0.82);

  return new THREE.CubicBezierCurve3(start, control1, control2, end);
}

/**
 * Esfera de la Tierra con sombreado dinámico día/noche y atmósfera Fresnel
 */
function EarthMesh() {
  const earthRef = useRef<THREE.Mesh>(null);

  const [dayTexture, nightTexture, cloudsTexture] = useLoader(
    THREE.TextureLoader,
    [
      '/textures/earth-daymap-4k.jpg',
      '/textures/earth-nightmap-4k.jpg',
      '/textures/earth-clouds-4k.jpg',
    ]
  );

  const earthMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        cloudsTexture: { value: cloudsTexture },
        sunDirection: { value: sunDirection },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewMatrix * modelPosition;
          vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
          vUv = uv;
          vPosition = modelPosition.xyz;
        }
      `,
      fragmentShader: `
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
          float dayMix = smoothstep(-0.25, 0.45, sunOrientation);

          vec3 dayColor = texture2D(dayTexture, vUv).rgb;
          vec3 nightColor = texture2D(nightTexture, vUv).rgb * 1.35;

          vec3 color = mix(nightColor, dayColor, dayMix);

          // Nubes con brillo y sombreado suave
          vec2 cloudsData = texture2D(cloudsTexture, vUv).rg;
          float cloudsMix = smoothstep(0.05, 0.95, cloudsData.g) * dayMix;
          color = mix(color, vec3(1.0), cloudsMix * 0.78);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, [dayTexture, nightTexture, cloudsTexture]);

  const atmoMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        colorAtmo: { value: new THREE.Color(0x06b6d4) },
        colorEdge: { value: new THREE.Color(0x10b981) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vPosition = mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
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
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  return (
    <group rotation-z={axialTilt}>
      <mesh ref={earthRef} material={earthMaterial}>
        <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
      </mesh>
      <mesh material={atmoMaterial}>
        <sphereGeometry args={[EARTH_RADIUS * 1.035, 32, 32]} />
      </mesh>
    </group>
  );
}

/**
 * Renderiza los arcos de vuelos con aviones y pulsos luminosos
 */
function HeroFlightRoutes() {
  const routesData = useMemo(() => {
    return HERO_ROUTES.map((route) => {
      const curve = createArcCurve(
        route.from.lat,
        route.from.lon,
        route.to.lat,
        route.to.lon,
        EARTH_RADIUS,
        ARC_ALTITUDE
      );
      const originPos = latLonToVec3(route.from.lat, route.from.lon, EARTH_RADIUS * 1.006);
      const destPos = latLonToVec3(route.to.lat, route.to.lon, EARTH_RADIUS * 1.006);
      const points = curve.getPoints(60);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      return {
        ...route,
        curve,
        originPos,
        destPos,
        geometry,
      };
    });
  }, []);

  return (
    <group rotation-z={axialTilt}>
      {routesData.map((route, i) => (
        <SingleRoute key={route.id} route={route} index={i} />
      ))}
    </group>
  );
}

function SingleRoute({
  route,
  index,
}: {
  route: any;
  index: number;
}) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const progress = useRef((index * 0.18) % 1);

  useFrame((_, delta) => {
    progress.current = (progress.current + delta * 0.08) % 1;
    if (pulseRef.current) {
      const pos = route.curve.getPoint(progress.current);
      pulseRef.current.position.copy(pos);
    }
  });

  const lineObj = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: route.color,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return new THREE.Line(route.geometry, mat);
  }, [route.geometry, route.color]);

  return (
    <group>
      {/* Línea del arco 3D */}
      <primitive object={lineObj} />

      {/* Nodo de origen */}
      <mesh position={route.originPos}>
        <sphereGeometry args={[0.024, 8, 8]} />
        <meshBasicMaterial color={route.color} />
      </mesh>

      {/* Nodo de destino */}
      <mesh position={route.destPos}>
        <sphereGeometry args={[0.024, 8, 8]} />
        <meshBasicMaterial color={route.color} />
      </mesh>

      {/* Pulso de luz que recorre el trayecto */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.038, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/**
 * Placeholder estilizado mientras se descargan las texturas
 */
function GlobeFallback() {
  return (
    <div className="hero-globe-fallback" aria-hidden="true">
      <div className="hgf-sphere">
        <div className="hgf-glow" />
        <div className="hgf-grid" />
        <div className="hgf-loader-badge">
          <HiSparkles className="hgf-loader-icon" />
          <span>Cargando Telemetría 3D...</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente principal HeroGlobe:
 * Contenedor autónomo, pausado por visibilidad y optimizado para 60 FPS
 */
export const HeroGlobe: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Pausar el render loop cuando el usuario scrollea hacia abajo
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="hero-globe-wrap">
      {/* Halo y resplandor decorativo de fondo */}
      <div className="hero-globe-halo" aria-hidden="true" />

      {/* Badge flotante interactivo de telemetría */}
      <div className="hero-globe-badge">
        <span className="hero-globe-badge__dot" />
        <HiGlobeAlt className="hero-globe-badge__icon" />
        <span>Monitoreo Global de Rutas Aéreas · Tiempo Real</span>
      </div>

      <div className="hero-globe-canvas-box">
        <Suspense fallback={<GlobeFallback />}>
          <Canvas
            camera={{ position: [0, 0, 3.8], fov: 48 }}
            dpr={[1, 1.5]}
            frameloop={isVisible ? 'always' : 'never'}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              alpha: true,
            }}
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[-3, 2, 2]} intensity={1.2} />

            <EarthMesh />
            <HeroFlightRoutes />

            {/* Rotación automática suave y posibilidad de arrastrar con el mouse.
                La rotación continua se desactiva si el sistema pide movimiento
                reducido: el arrastre manual sigue disponible. */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate={!prefersReducedMotion}
              autoRotateSpeed={0.75}
              rotateSpeed={0.65}
              dampingFactor={0.05}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Chip informativo inferior */}
      <div className="hero-globe-caption">
        <span className="hero-globe-caption__route">SCL ✈ MAD</span>
        <span className="hero-globe-caption__sep">·</span>
        <span className="hero-globe-caption__val">1.84 t CO₂e neutralizadas</span>
      </div>
    </div>
  );
};

export default HeroGlobe;
