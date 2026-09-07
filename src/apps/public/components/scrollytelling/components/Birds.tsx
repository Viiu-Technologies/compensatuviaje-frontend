import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Simplified birds flying through the forest scene
 */
export function Birds({ visible }: { visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  const birdData = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      offset: i * 1.5,
      speed: 0.3 + (i * 0.17 % 0.2),
      radius: 2 + (i * 0.53 % 1.5),
      height: 1.5 + (i * 0.71 % 1.5),
      phase: (i * 1.618) % (Math.PI * 2),
    }));
  }, []);

  useFrame(() => {
    if (groupRef.current) groupRef.current.visible = visible;
  });

  return (
    <group ref={groupRef} visible={false}>
      {birdData.map((data, i) => (
        <Bird key={i} {...data} />
      ))}
    </group>
  );
}

function Bird({
  offset,
  speed,
  radius,
  height,
  phase,
}: {
  offset: number;
  speed: number;
  radius: number;
  height: number;
  phase: number;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    // Circular flight path
    const t = time * speed + phase;
    meshRef.current.position.x = Math.sin(t) * radius;
    meshRef.current.position.y = height + Math.sin(t * 2) * 0.3;
    meshRef.current.position.z = Math.cos(t) * radius;

    // Face movement direction
    const nextX = Math.sin(t + 0.01) * radius;
    const nextZ = Math.cos(t + 0.01) * radius;
    meshRef.current.lookAt(nextX, meshRef.current.position.y, nextZ);

    // Wing flapping
    if (leftWingRef.current && rightWingRef.current) {
      const flap = Math.sin(time * 6 + offset) * 0.5;
      leftWingRef.current.rotation.z = flap;
      rightWingRef.current.rotation.z = -flap;
    }
  });

  return (
    <group ref={meshRef} scale={[0.04, 0.04, 0.04]}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[1, 4, 4]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.7} />
      </mesh>

      {/* Left wing */}
      <mesh ref={leftWingRef} position={[-0.5, 0.2, 0]}>
        <planeGeometry args={[2.5, 0.6]} />
        <meshStandardMaterial
          color="#2a2a3e"
          side={THREE.DoubleSide}
          roughness={0.6}
        />
      </mesh>

      {/* Right wing */}
      <mesh ref={rightWingRef} position={[0.5, 0.2, 0]}>
        <planeGeometry args={[2.5, 0.6]} />
        <meshStandardMaterial
          color="#2a2a3e"
          side={THREE.DoubleSide}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
}
