import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { getParticleCount, prefersReducedMotion } from '../utils/deviceDetect';
import { getScrollState } from '../hooks/useScrollProgress';

/**
 * Starfield & Nebula background inspired by git-terra-treejs
 */
export function Stars() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const count = getParticleCount(1800);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 20 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      sz[i] = Math.random() * 1.6 + 0.3;
    }

    return [pos, sz];
  }, [count]);

  // Load star circle & nebula radial gradient from public
  const [circleTexture, radGradTexture] = useLoader(THREE.TextureLoader, [
    '/circle.png',
    '/rad-grad.png',
  ]);

  useFrame((state) => {
    if (pointsRef.current && !reducedMotion) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.003;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.002) * 0.02;
    }
    if (groupRef.current) {
      // Hide once the forest has properly taken over — otherwise these
      // space-scene stars keep showing through the sky/fog in the forest.
      groupRef.current.visible = getScrollState().forest < 0.1;
    }
  });

  // Soft background nebula glow sprites
  const nebulaSprites = useMemo(() => {
    const group = new THREE.Group();
    const numSprites = 6;
    for (let i = 0; i < numSprites; i++) {
      const angle = (i / numSprites) * Math.PI * 2;
      const mat = new THREE.SpriteMaterial({
        map: radGradTexture,
        color: new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.6, 0.25),
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(mat);
      const radius = 8 + Math.random() * 4;
      sprite.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        -12 + Math.random() * 2
      );
      const scale = 20 + Math.random() * 10;
      sprite.scale.set(scale, scale, 1);
      group.add(sprite);
    }
    return group;
  }, [radGradTexture]);

  return (
    <group ref={groupRef}>
      {/* Background Nebula Sprites */}
      <primitive object={nebulaSprites} />

      {/* Stars Points */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={count}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          map={circleTexture}
          size={0.18}
          sizeAttenuation
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#dbeafe"
        />
      </points>
    </group>
  );
}
