import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createArcCurve, latLonToVector3, FLIGHT_ROUTES } from '../utils/geoUtils';
import { getRouteCount, prefersReducedMotion } from '../utils/deviceDetect';
import { getScrollState } from '../hooks/useScrollProgress';

const EARTH_RADIUS = 1.5;
const ARC_ALTITUDE = 0.35;

/**
 * Flight routes rendered as glowing arcs with pulse rings around the Earth
 * Uses getScrollState() in useFrame for real-time scroll sync
 */
export function FlightRoutes() {
  const groupRef = useRef<THREE.Group>(null);
  const routeCount = getRouteCount();
  const routes = FLIGHT_ROUTES.slice(0, routeCount);

  const curves = useMemo(() => {
    return routes.map((route) =>
      createArcCurve(
        route.from.lat,
        route.from.lon,
        route.to.lat,
        route.to.lon,
        EARTH_RADIUS,
        ARC_ALTITUDE
      )
    );
  }, [routes]);

  // useFrame to update group visibility in real-time
  useFrame(() => {
    if (!groupRef.current) return;
    const scroll = getScrollState();
    const opacity = Math.max(0, 1 - scroll.transformation * 2);
    groupRef.current.visible = opacity > 0.01;
  });

  return (
    <group ref={groupRef}>
      {curves.map((curve, i) => (
        <RouteArc
          key={routes[i].id}
          route={routes[i]}
          curve={curve}
          color={routes[i].color}
          index={i}
        />
      ))}
    </group>
  );
}

function RouteArc({
  route,
  curve,
  color,
  index,
}: {
  route: typeof FLIGHT_ROUTES[0];
  curve: THREE.CubicBezierCurve3;
  color: string;
  index: number;
}) {
  const lineRef = useRef<THREE.Line>(null);
  const aircraftRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const originRingRef = useRef<THREE.Mesh>(null);
  const destRingRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const progressRef = useRef(0);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  const originPos = useMemo(
    () => latLonToVector3(route.from.lat, route.from.lon, EARTH_RADIUS * 1.005),
    [route]
  );
  const destPos = useMemo(
    () => latLonToVector3(route.to.lat, route.to.lon, EARTH_RADIUS * 1.005),
    [route]
  );

  const trailCount = 30;
  const trailPositions = useMemo(() => new Float32Array(trailCount * 3), [trailCount]);

  const lineGeometry = useMemo(() => {
    const points = curve.getPoints(80);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [curve]);

  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
    gradient.addColorStop(0.5, 'rgba(156,163,175,0.4)');
    gradient.addColorStop(1, 'rgba(156,163,175,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state, delta) => {
    // Read directly from singleton — no React re-render lag
    const scroll = getScrollState();
    const opacity = Math.max(0, 1 - scroll.transformation * 2);

    // Continuous, indefinite flight along the arc — held in place under
    // reduced motion instead of looping forever.
    if (!reducedMotion) {
      const speed = THREE.MathUtils.lerp(0.05, 0.005, scroll.transformation);
      progressRef.current = (progressRef.current + delta * speed) % 1;
    }

    const t = progressRef.current;
    const offset = index * 0.2;
    const adjustedT = (t + offset) % 1;

    // Update line opacity
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = opacity * 0.5;
    }

    // Aircraft position & orientation
    if (aircraftRef.current) {
      const pos = curve.getPoint(adjustedT);
      aircraftRef.current.position.copy(pos);
      const tangent = curve.getTangent(adjustedT);
      const lookTarget = pos.clone().add(tangent);
      aircraftRef.current.lookAt(lookTarget);
      const mat = aircraftRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = opacity;
    }

    // Glowing energy pulse
    if (pulseRef.current) {
      const pulseT = (adjustedT + 0.05) % 1;
      const pulsePos = curve.getPoint(pulseT);
      pulseRef.current.position.copy(pulsePos);
      const scale = 0.03 + Math.sin(state.clock.elapsedTime * 8 + index) * 0.01;
      pulseRef.current.scale.setScalar(scale);
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = opacity * 0.9;
    }

    // Endpoint pulsing rings
    if (originRingRef.current && destRingRef.current) {
      const ringScale = 0.04 + Math.sin(state.clock.elapsedTime * 3 + index) * 0.015;
      originRingRef.current.scale.setScalar(ringScale);
      destRingRef.current.scale.setScalar(ringScale);
      const oMat = originRingRef.current.material as THREE.MeshBasicMaterial;
      const dMat = destRingRef.current.material as THREE.MeshBasicMaterial;
      oMat.opacity = opacity * 0.8;
      dMat.opacity = opacity * 0.8;
    }

    // Trail particles
    if (trailRef.current) {
      const posAttr = trailRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = trailCount - 1; i > 0; i--) {
        trailPositions[i * 3] = trailPositions[(i - 1) * 3];
        trailPositions[i * 3 + 1] = trailPositions[(i - 1) * 3 + 1];
        trailPositions[i * 3 + 2] = trailPositions[(i - 1) * 3 + 2];
      }
      if (aircraftRef.current) {
        const p = aircraftRef.current.position;
        trailPositions[0] = p.x + (Math.random() - 0.5) * 0.02;
        trailPositions[1] = p.y + (Math.random() - 0.5) * 0.02;
        trailPositions[2] = p.z + (Math.random() - 0.5) * 0.02;
      }
      posAttr.array = trailPositions;
      posAttr.needsUpdate = true;
      const mat = trailRef.current.material as THREE.PointsMaterial;
      mat.opacity = opacity * 0.6;
    }
  });

  return (
    <group>
      {/* Route line */}
      <line ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </line>

      {/* Origin & Destination rings */}
      <mesh ref={originRingRef} position={originPos}>
        <ringGeometry args={[0.5, 1, 16]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>

      <mesh ref={destRingRef} position={destPos}>
        <ringGeometry args={[0.5, 1, 16]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>

      {/* Aircraft cone */}
      <mesh ref={aircraftRef} scale={[0.03, 0.03, 0.07]}>
        <coneGeometry args={[1, 3, 4]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#22d3ee"
          emissiveIntensity={0.6}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Leading pulse */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>

      {/* CO₂ trail */}
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={trailCount}
            array={trailPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          map={particleTexture}
          size={0.05}
          sizeAttenuation
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#9CA3AF"
        />
      </points>
    </group>
  );
}
