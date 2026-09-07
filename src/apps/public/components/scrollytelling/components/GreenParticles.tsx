import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getParticleCount } from '../utils/deviceDetect';

/**
 * Green particles ascending from the forest floor
 * Uses group.visible instead of returning null to avoid geometry remounting
 */
export function GreenParticles({ visible }: { visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const count = getParticleCount(150);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = Math.random() * 4 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, [count]);

  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(74,222,128,0.9)');
    gradient.addColorStop(0.4, 'rgba(34,197,94,0.4)');
    gradient.addColorStop(1, 'rgba(34,197,94,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Toggle visibility via group — keeps geometry alive in GPU memory
    groupRef.current.visible = visible;

    if (!visible || !pointsRef.current) return;

    const time = state.clock.elapsedTime;
    const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3 + 1] += 0.005 + Math.sin(time + i) * 0.002;
      arr[i3]     += Math.sin(time * 0.5 + i * 0.8) * 0.002;
      arr[i3 + 2] += Math.cos(time * 0.3 + i * 0.6) * 0.002;

      if (arr[i3 + 1] > 4) {
        arr[i3 + 1] = -1;
        arr[i3]     = (Math.random() - 0.5) * 6;
        arr[i3 + 2] = (Math.random() - 0.5) * 6;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <group ref={groupRef} visible={false}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          map={particleTexture}
          size={0.12}
          sizeAttenuation
          transparent
          opacity={0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#22C55E"
        />
      </points>
    </group>
  );
}
