import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getScrollState } from '../hooks/useScrollProgress';
import { getParticleCount, prefersReducedMotion } from '../utils/deviceDetect';

/**
 * CO₂ particles that transform from gray (emissions) to green (compensation)
 * This is one of the most visually impactful transitions
 */
export function CO2Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = getParticleCount(250);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  // Particle data
  const { positions, velocities, startPositions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const startPos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Start scattered around the planet area
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.8 + Math.random() * 0.8;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      startPos[i * 3] = x;
      startPos[i * 3 + 1] = y;
      startPos[i * 3 + 2] = z;

      // Random velocities for organic movement
      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    return { positions: pos, velocities: vel, startPositions: startPos };
  }, [count]);

  // Particle sprite
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.4)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Color that transitions from gray to green
  const colorRef = useRef(new THREE.Color('#9CA3AF'));

  useFrame((state) => {
    if (!pointsRef.current) return;

    // Read directly from singleton — no React re-render lag
    const scroll = getScrollState();
    const time = state.clock.elapsedTime;
    const transProgress = scroll.transformation;
    const forestProgress = scroll.forest;
    const combinedProgress = Math.min(1, transProgress + forestProgress);

    // Interpolate color: gray → amber → green
    const grayColor = new THREE.Color('#9CA3AF');
    const amberColor = new THREE.Color('#F59E0B');
    const greenColor = new THREE.Color('#22C55E');

    if (combinedProgress < 0.5) {
      colorRef.current.lerpColors(grayColor, amberColor, combinedProgress * 2);
    } else {
      colorRef.current.lerpColors(amberColor, greenColor, (combinedProgress - 0.5) * 2);
    }

    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.color.copy(colorRef.current);

    // Animate positions — continuous organic drift with no user action
    // driving it, so it's skipped under reduced motion (particles hold
    // still at whatever position they last reached; the colour transition
    // above still tracks scroll normally).
    if (!reducedMotion) {
      const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        if (forestProgress > 0.3) {
          // In forest scene: particles move upward (like ascending from trees)
          posArray[i3] = startPositions[i3] * 0.5 + Math.sin(time * 0.5 + i) * 0.3;
          posArray[i3 + 1] =
            -1 + ((time * 0.2 + i * 0.1) % 3) + Math.sin(time + i * 0.3) * 0.1;
          posArray[i3 + 2] = startPositions[i3 + 2] * 0.5 + Math.cos(time * 0.4 + i) * 0.3;
        } else {
          // Around planet: organic drifting
          posArray[i3] += velocities[i3] + Math.sin(time * 0.3 + i * 0.7) * 0.001;
          posArray[i3 + 1] += velocities[i3 + 1] + Math.cos(time * 0.2 + i * 0.5) * 0.001;
          posArray[i3 + 2] += velocities[i3 + 2] + Math.sin(time * 0.4 + i * 0.3) * 0.001;

          // Spread out during transformation
          if (transProgress > 0) {
            const spread = transProgress * 0.02;
            const dir = new THREE.Vector3(
              posArray[i3],
              posArray[i3 + 1],
              posArray[i3 + 2]
            ).normalize();
            posArray[i3] += dir.x * spread;
            posArray[i3 + 1] += dir.y * spread;
            posArray[i3 + 2] += dir.z * spread;
          }
        }
      }

      posAttr.needsUpdate = true;
    }

    // Size/opacity ramp up through the CO2 → compensation transition, but
    // stay subtle once in the forest — a background detail (particles
    // quietly rising from the trees), not bright sparks competing with the
    // scenery like the reference demo never has to contend with.
    if (forestProgress > 0.3) {
      material.size = 0.03;
      material.opacity = 0.25;
    } else {
      material.size = THREE.MathUtils.lerp(0.04, 0.08, combinedProgress);
      material.opacity = THREE.MathUtils.lerp(0.4, 0.7, combinedProgress);
    }
  });

  return (
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
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#9CA3AF"
      />
    </points>
  );
}
