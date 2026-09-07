import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Tree as EZTree, TreePreset } from '../lib/ez-tree';
import { prefersReducedMotion } from '../utils/deviceDetect';

interface TreeProps {
  position: [number, number, number];
  scale?: number;
  growthProgress: number;
  variant?: number;
  /** Far-ring trees skip shadow casting — already small and fog-obscured,
   *  so this halves the shadow-casting tree count for a real GPU saving. */
  castShadow?: boolean;
}

const PRESET_NAMES = [
  'Oak Medium',
  'Ash Custom',
  'Pine Medium',
  'Aspen Medium',
  'Bush 1',
];

const LEAF_TYPES: Record<string, string> = {
  'Oak Medium': 'oak',
  'Ash Custom': 'ash',
  'Pine Medium': 'pine',
  'Aspen Medium': 'aspen',
  'Bush 1': 'oak',
};

/**
 * 3D Tree rendered using procedural ez-tree library
 * Supports Oak, Ash, Pine, Aspen and Bush presets with animated leaves wind
 */
export function Tree({ position, scale = 1, growthProgress, variant = 0, castShadow = true }: TreeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  const presetName = PRESET_NAMES[variant % PRESET_NAMES.length];
  const leafType = LEAF_TYPES[presetName] || 'oak';

  // Load leaf and bark textures. bark.type in the preset JSON (e.g.
  // "Bark001") is only an informational label — ez-tree's TreeOptions
  // leaves bark.maps null and expects the host app to resolve + assign the
  // actual textures (see comment in lib/ez-tree/options.js).
  const [leafTexture, barkColor, barkNormal, barkRoughness] = useLoader(THREE.TextureLoader, [
    `/textures/tree/leaves/${leafType}.png`,
    '/textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_Color.jpg',
    '/textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_NormalGL.jpg',
    '/textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_Roughness.jpg',
  ]);

  const ezTreeObject = useMemo(() => {
    leafTexture.colorSpace = THREE.SRGBColorSpace;
    leafTexture.premultiplyAlpha = true;
    barkColor.colorSpace = THREE.SRGBColorSpace;

    const tree = new EZTree();
    const preset = TreePreset[presetName];
    if (preset) {
      tree.options.copy(structuredClone(preset));
    }
    tree.options.leaves.map = leafTexture;
    tree.options.bark.maps.color = barkColor;
    tree.options.bark.maps.normal = barkNormal;
    tree.options.bark.maps.roughness = barkRoughness;
    tree.generate();

    // Without these the sun's castShadow (ForestScene.tsx) produces nothing
    // on the trees — the demo sets both on every tree it adds. Far-ring
    // trees still receive shadow (from the hero/near trees and themselves)
    // but skip casting one of their own — see the castShadow prop comment.
    tree.castShadow = castShadow;
    tree.receiveShadow = true;
    tree.traverse((o: THREE.Object3D) => {
      o.castShadow = castShadow;
      o.receiveShadow = true;
    });

    return tree;
  }, [presetName, leafTexture, barkColor, barkNormal, barkRoughness, castShadow]);

  const lastScale = useRef(-1);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Growth from ground animated via scroll progress
    const clampedGrowth = Math.max(0, Math.min(1, growthProgress));
    const eased = 1 - Math.pow(1 - clampedGrowth, 3);
    const currentScale = scale * 0.08 * eased;

    // Only touch the transform when it actually changed. Once growth finishes
    // this value is constant, and writing it every frame on every tree marks
    // each one's world matrix dirty for three.js to recompute — pure waste
    // across a forest of them.
    if (currentScale !== lastScale.current) {
      lastScale.current = currentScale;
      groupRef.current.scale.set(currentScale, currentScale, currentScale);
    }

    // Wind animation on leaves — skipped under reduced motion, since this is
    // a continuous, indefinite loop with no user action driving it.
    if (ezTreeObject && !reducedMotion) {
      ezTreeObject.update(state.clock.elapsedTime);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <primitive object={ezTreeObject} />
    </group>
  );
}
