import { Suspense, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScrollProgress, getScrollState } from '../hooks/useScrollProgress';
import { Tree } from './Tree';
import { Ground } from './forest/Ground';
import { Grass } from './forest/Grass';
import { Rocks } from './forest/Rocks';
import { DistantTrees } from './forest/DistantTrees';
import { getNearTreeCount, getFarTreeCount } from '../utils/deviceDetect';
import * as THREE from 'three';

interface TreeSpec {
  pos: [number, number, number];
  scale: number;
  variant: number;
}

// Golden-angle (vogel) spiral placement, using fixed index math instead of
// Math.random() so positions stay stable across re-renders without a stored
// seed. Spacing the angle by the golden angle — rather than dividing a full
// turn evenly by `count` — avoids the artificial look of trees sitting on a
// ring at matching distances, and the sqrt on the radius spreads them evenly
// by AREA so the space between camera and treeline fills in too.
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function scatterTrees(count: number, minRadius: number, maxRadius: number, minScale: number, maxScale: number, variantOffset = 0, center: [number, number] = [0, 0]): TreeSpec[] {
  const positions: TreeSpec[] = [];
  for (let i = 0; i < count; i++) {
    const angle = i * GOLDEN_ANGLE;
    const t = Math.sqrt((i + 0.5) / count);
    const radius = minRadius + t * (maxRadius - minRadius);
    positions.push({
      pos: [center[0] + Math.sin(angle) * radius, -1.5, center[1] + Math.cos(angle) * radius],
      scale: minScale + ((i * 0.23) % 1) * (maxScale - minScale),
      variant: i + variantOffset,
    });
  }
  return positions;
}

// Uniform ring, evenly spaced by angle (not the golden-angle spiral above),
// specifically for the trees meant to visibly encircle HERO_TREE — the
// spiral spreads by area and looks natural for a large, loosely-scattered
// forest, but for a small ring of "framing" trees around one focal tree it
// reads as lopsided (denser on one side) rather than a deliberate surround.
function ringAroundPoint(count: number, radius: number, scale: number, variantOffset: number, center: [number, number]): TreeSpec[] {
  const positions: TreeSpec[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    positions.push({
      pos: [center[0] + Math.sin(angle) * radius, -1.5, center[1] + Math.cos(angle) * radius],
      scale,
      variant: i + variantOffset,
    });
  }
  return positions;
}

// Fixed placement for the single large "hero" tree — like the reference
// demo, which renders one prominent, thick tree by itself near the camera
// in addition to its background forest. Kept out of ringPositions() (whose
// index-based math would otherwise place same-size trees evenly around a
// circle) so exactly one tree can be deliberately larger and off-center.
//
// Scale raised 2.6 -> 4.5, as large as the final waypoint's framing allows.
// The scroll ends with the camera at (4, 4.5, 26) looking at (0, 5.5, 0) (see
// CameraController.tsx) — roughly 27.5 units from HERO_TREE at (0.8,-1.5,-1.2)
// — and at FOV 60 that distance frames a ~32-unit-tall shot, so the hero can
// grow substantially and still read as the single dominant tree filling most
// of the final frame instead of a mid-sized tree lost among its neighbours.
const HERO_TREE: TreeSpec = { pos: [0.8, -1.5, -1.2], scale: 4.5, variant: 0 };

/**
 * Forest compensation scene — 3D EZ-Tree procedural forest
 * Uses getScrollState() in useFrame for real-time opacity/position sync
 * Does NOT return null (avoids unmounting on hide — uses group.visible instead)
 *
 * Trees are split into three groups so the forest reads with real depth and
 * a focal point instead of one dense clump of same-size, evenly-spaced trees:
 *  - hero: one large, thick tree close to camera (HERO_TREE above)
 *  - near ring: a handful of medium trees around it
 *  - far ring: more, smaller trees further out, softened by ForestFog
 */
export function ForestScene() {
  const groupRef = useRef<THREE.Group>(null);
  const nearCount = getNearTreeCount();
  const farCount = getFarTreeCount();
  const treeCount = nearCount + farCount + 1;

  // A uniform ring centred on HERO_TREE itself (not the world origin), so the
  // near trees visibly encircle it from every side rather than clustering
  // toward whichever direction the golden-angle spiral happened to favour.
  //
  // Radius 44, not 22. The camera settles ~26 units from HERO_TREE but
  // OrbitControls lets the user pull back to maxDistance 40
  // (CameraController.tsx), so a ring at 22 sat *inside* the orbit envelope:
  // its trees swung between the lens and the hero as the view rotated. 44
  // clears the entire envelope, so the ring always stays behind the hero no
  // matter where the orbit is.
  //
  // Scale: Tree.tsx multiplies this value by 0.07 (see currentScale there).
  // HERO_TREE's visible size is 4.5 * 0.07 = 0.315; at double the previous
  // distance the ring needs to be taller to hold the same presence, so 2.2
  // (~49% of the hero) replaces the old 1.3.
  const nearTrees = useMemo(
    () => ringAroundPoint(nearCount, 40, 4.2, 0, [HERO_TREE.pos[0], HERO_TREE.pos[2]]),
    [nearCount]
  );
  // Pulled in from 40-118 to 26-70, matching the request to bring the
  // surrounding trees closer to the hero overall — 26 still clears the
  // camera's ~40-unit max orbit distance (CameraController.tsx), so this
  // group never sweeps into the shot during a manual orbit.
  const farTrees = useMemo(
    () => scatterTrees(farCount, 26, 70, 1.6, 2.1, nearCount),
    [farCount, nearCount]
  );
  const treePositions = useMemo(
    () => [HERO_TREE, ...nearTrees, ...farTrees],
    [nearTrees, farTrees]
  );

  // Scroll progress state for React renders (tree growth, ground opacity)
  const scroll = useScrollProgress();
  const forestProgress = scroll.forest;
  const visible = forestProgress > 0.02 || scroll.transformation > 0.5;

  // useFrame for real-time group visibility via getScrollState()
  useFrame(() => {
    if (!groupRef.current) return;
    const s = getScrollState();
    groupRef.current.visible = s.forest > 0.02 || s.transformation > 0.5;
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* Real ground (grass/dirt shader), instanced grass blades + flowers,
          and scattered rocks — ported from the ez-tree reference demo
          instead of the earlier flat placeholder discs. Clouds are painted
          directly on the Skybox sky dome (see Skybox.tsx) rather than a
          separate plane here, since a plane can only ever cover the area
          straight overhead and never reaches the horizon. */}
      <Suspense fallback={null}>
        <Ground />
        <Grass />
        <Rocks />
      </Suspense>

      {/* Cheap silhouette trees beyond the real ones — fog dissolves them
          into the mist, giving the illusion the forest keeps going. */}
      <DistantTrees />

      {/* Trees with staggered growth. treePositions is [hero, ...nearTrees,
          ...farTrees] (built above) — index 0 is the hero, 1..nearCount are
          the near ring, everything after that is the far ring, which skips
          shadow casting (see Tree.tsx castShadow prop). */}
      {treePositions.map((tree, i) => {
        const delay = i / treeCount;
        const adjustedProgress = Math.max(0, (forestProgress - delay * 0.3) / 0.7);
        return (
          <Tree
            key={i}
            position={tree.pos}
            scale={tree.scale}
            growthProgress={adjustedProgress}
            variant={tree.variant}
            castShadow={i <= nearCount}
          />
        );
      })}

      {/* Sun, matching the reference demo (ez-tree src/app/skybox.js): one
          strong warm directional light (intensity 5) casting shadows, plus a
          soft ambient fill — no coloured point lights, which tinted our
          scene unnaturally and washed out the sun's own direction. Aimed to
          agree with the Skybox's painted sun (elevation 30°, azimuth 90°). */}
      {/* Shadow frustum tightened from 200x200 to 110x110. The fog
          (SceneManager.tsx) has already dissolved everything past ~70-90
          units, so half the old frustum was spending shadow-map resolution
          on trees nobody can see — and every tree inside it gets re-rendered
          into the depth map each frame. The smaller box also means the same
          1024² map covers a ~3x smaller area, so shadows near the hero tree
          come out sharper, not just cheaper. */}
      <directionalLight
        position={[50, 100, 50]}
        color="#ffe5b0"
        intensity={forestProgress * 5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
        shadow-normalBias={0.2}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
        shadow-camera-far={220}
      />
      <ambientLight intensity={forestProgress * 0.4} />
    </group>
  );
}
