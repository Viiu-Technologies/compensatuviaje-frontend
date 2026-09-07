import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Tree as EZTree, TreePreset } from '../../lib/ez-tree';
import { getScrollState } from '../../hooks/useScrollProgress';
import { isMobile } from '../../utils/deviceDetect';

/**
 * DistantTrees — real EZ-Tree silhouettes (not procedural cones/cylinders),
 * using the cheapest LOD (see generateLODs below) so dozens of instances stay
 * affordable while still reading as real trees, not geometric shapes.
 *
 * Previously scattered at radius 95-175, past ForestScene.tsx's far group —
 * but at that distance ForestFog (SceneManager.tsx) and the sky's horizon
 * haze (Skybox.tsx) hide them almost entirely, wasting the cheap geometry.
 * Now placed in a closer ring around the hero tree / near-tree area instead,
 * filling the gaps between the full-detail trees so the forest reads as
 * continuous close up rather than relying on a background band nobody sees.
 */
// These are the cheapest LOD (see generateLODs below), so the count can be
// well above the full-detail trees' — the reference demo backs its scene with
// 100 of them, and a sparse handful reads as "a few lonely trees" rather than
// a forest continuing into the mist.
// 70 -> 30 (desktop). Each of these is a separately generated EZ-Tree with
// its own geometry and draw call — not instanced — so the count is the single
// biggest lever on the frame time that made orbiting feel laggy.
const COUNT = isMobile() ? 14 : 30;
// Pulled in from 46-78 to bring these visibly closer to HERO_TREE, per
// request. 42 still clears the camera's maxDistance-40 orbit envelope
// (CameraController.tsx) so this band doesn't sweep into the shot mid-orbit.
const MIN_RADIUS = 90;
const MAX_RADIUS = 80;
const PRESET_NAMES = ['Oak Medium', 'Ash Custom', 'Pine Medium', 'Aspen Medium'];
const LEAF_TYPES: Record<string, string> = {
  'Oak Medium': 'oak',
  'Ash Custom': 'ash',
  'Pine Medium': 'pine',
  'Aspen Medium': 'aspen',
};

// Golden angle rather than an even 2π/count split, so the silhouettes don't
// line up as a visible ring at the edge of the fog (same reasoning as
// scatterTrees in ForestScene.tsx).
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function scatter(count: number) {
  const specs: { pos: [number, number, number]; scale: number; variant: number; rotY: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = i * GOLDEN_ANGLE;
    const radius = MIN_RADIUS + Math.sqrt((i + 0.5) / count) * (MAX_RADIUS - MIN_RADIUS);
    // Tree.tsx (the full-detail trees) multiplies its `scale` prop by 0.07 at
    // render time (see currentScale in Tree.tsx's useFrame) — this group
    // applies its scale directly with no such multiplier, so to land on the
    // same visible size the two conventions have to be reconciled here.
    // HERO_TREE (ForestScene.tsx) is scale 4.5, i.e. a visible size of
    // 4.5 * 0.07 = 0.315. Now that this band starts at radius 46 instead of
    // 12, these need to be taller than before or they read as a distant
    // miniature hedge — 0.20 down to 0.15 puts them at ~48-63% of the hero,
    // which at that distance still reads as full-size trees behind it.
    const t = (i + 0.5) / count;
    specs.push({
      pos: [Math.sin(angle) * radius, -1.5, Math.cos(angle) * radius],
      scale: 0.20 - t * 0.05 + ((i * 0.29) % 1) * 0.02,
      variant: i % PRESET_NAMES.length,
      rotY: ((i * 0.71) % 1) * Math.PI * 2,
    });
  }
  return specs;
}

export function DistantTrees() {
  const groupRef = useRef<THREE.Group>(null);
  const specs = useMemo(() => scatter(COUNT), []);

  const leafTextures = useLoader(
    THREE.TextureLoader,
    PRESET_NAMES.map((name) => `/textures/tree/leaves/${LEAF_TYPES[name]}.png`)
  );

  const trees = useMemo(() => {
    return specs.map((spec) => {
      const presetName = PRESET_NAMES[spec.variant];
      const texture = leafTextures[spec.variant];
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.premultiplyAlpha = true;

      const tree = new EZTree();
      const preset = TreePreset[presetName];
      if (preset) tree.options.copy(structuredClone(preset));
      tree.options.leaves.map = texture;

      // Skip the full-detail level entirely — generate only the cheapest
      // LOD (index 1 of defaultLODLevels) directly, so we're not paying for
      // full-detail geometry we'd immediately discard.
      tree.generateLODs([
        { distance: 0, detail: { sectionStride: 6, segmentFactor: 0.4, leafStride: 2, leafScale: 1.3 } },
      ]);

      return tree;
    });
  }, [specs, leafTextures]);

  useFrame((state) => {
    trees.forEach((tree) => tree.update(state.clock.elapsedTime));
    if (groupRef.current) groupRef.current.visible = getScrollState().forest > 0.1;
  });

  return (
    <group ref={groupRef}>
      {trees.map((tree, i) => (
        <group key={i} position={specs[i].pos} rotation={[0, specs[i].rotY, 0]} scale={specs[i].scale}>
          <primitive object={tree} />
        </group>
      ))}
    </group>
  );
}
