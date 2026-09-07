import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { getScrollState } from '../../hooks/useScrollProgress';
import { isMobile } from '../../utils/deviceDetect';

/**
 * Rocks — ported from the ez-tree reference demo (test/trees-treejs/ez-tree/src/app/rocks.js).
 * Three rock variants (.glb, Draco-compressed) scattered as instanced meshes.
 * Fades in only in the forest section.
 */
const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';
const ROCK_MODELS = ['/models/rock1.glb', '/models/rock2.glb', '/models/rock3.glb'];
const INSTANCES_PER_TYPE = isMobile() ? 10 : 20;
// Scale is proportional to the forest's own size (see comment in Grass.tsx),
// but the scatter radius reaches out toward the fog like the grass field, so
// distant rocks fade into the mist instead of stopping at a visible edge.
// Pushed out to match the trees' new radius (up to 90, see ForestScene.tsx).
const MAX_RADIUS = isMobile() ? 45 : 65;

function scatter(count: number, maxRadius: number) {
  const out: { pos: THREE.Vector3; rotY: number; scale: THREE.Vector3 }[] = [];
  for (let i = 0; i < count; i++) {
    const r = 1.5 + Math.random() * maxRadius;
    const theta = Math.random() * 2 * Math.PI;
    const s = 0.45+ 0.45 * Math.random();
    out.push({
      pos: new THREE.Vector3(r * Math.cos(theta), -1.45, r * Math.sin(theta)),
      rotY: 2 * Math.PI * Math.random(),
      scale: new THREE.Vector3(s, s, s),
    });
  }
  return out;
}

function RockInstances({ url, count, maxRadius }: { url: string; count: number; maxRadius: number }) {
  const gltf = useGLTF(url, DRACO_DECODER_PATH);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const source = gltf.scene.children[0] as THREE.Mesh;
  const positions = useMemo(() => scatter(count, maxRadius), [count, maxRadius]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    positions.forEach(({ pos, rotY, scale }, i) => {
      dummy.position.copy(pos);
      dummy.rotation.set(0, rotY, 0);
      dummy.scale.copy(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.count = positions.length;
    mesh.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[source.geometry, source.material, count]}
      castShadow
    />
  );
}

export function Rocks() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) groupRef.current.visible = getScrollState().forest > 0.05;
  });

  return (
    <group ref={groupRef}>
      {ROCK_MODELS.map((url) => (
        <RockInstances key={url} url={url} count={INSTANCES_PER_TYPE} maxRadius={MAX_RADIUS} />
      ))}
    </group>
  );
}

ROCK_MODELS.forEach((url) => useGLTF.preload(url, DRACO_DECODER_PATH));
