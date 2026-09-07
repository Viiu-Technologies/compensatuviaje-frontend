import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getScrollState } from '../hooks/useScrollProgress';

/**
 * Skybox — ported directly from the ez-tree reference demo
 * (test/trees-treejs/ez-tree/src/app/skybox.js + shaders/skybox.*).
 * A giant sphere with a vertical gradient (skyColorLow → skyColorHigh by
 * world-space Y direction) plus a painted sun disc, viewed from BackSide so
 * it wraps the whole scene like a real sky.
 *
 * Colors ease between a deep-space palette (near black, stars do the work)
 * and a forest daylight palette as `scroll.forest` goes 0 → 1, so the
 * transition matches the planet → forest section it's driven by.
 */
const vertexShader = `
  varying vec3 vPosition;
  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  varying vec3 vPosition;

  uniform vec3 uSunDirection;
  uniform vec3 uSunColor;
  uniform vec3 uSkyColorLow;
  uniform vec3 uSkyColorHigh;
  uniform float uSunSize;
  uniform float uTime;
  uniform float uCloudAmount;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  uniform float uFogHeight;
  uniform float uFogFalloff;

  // 3D simplex noise (Ashima/Stefan Gustavson), sampled directly on the
  // sky-dome direction vector — not on angular (azimuth/elevation)
  // coordinates. atan(z,x) wraps at ±180° with a hard jump from +π to -π,
  // which showed up as a visible seam in the cloud pattern across the sky.
  // 3D noise has no wrap-around seam to hit since it isn't parameterized by
  // an angle at all.
  vec4 permute4(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt4(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise3(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0);
    vec4 p = permute4(permute4(permute4(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt4(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vec3 direction = normalize(vPosition);

    float t = direction.y * 0.5 + 0.5;
    vec3 skyColor = mix(uSkyColorLow, uSkyColorHigh, t);

    float sunIntensity = pow(max(dot(direction, uSunDirection), 0.0), 1000.0 / uSunSize);
    vec3 sunColor = uSunColor * sunIntensity;

    // Clouds painted directly on the sky dome (not a separate horizontal
    // plane, which geometrically can only ever cover the area straight
    // overhead and never reaches the horizon), sampling 3D noise on the
    // direction vector itself — no angular UV, so no wrap-around seam.
    float elevation = asin(clamp(direction.y, -1.0, 1.0));
    vec3 windOffset = vec3(uTime / 60.0, 0.0, uTime / 90.0);
    // Higher frequencies (was *3/*6/*12) — the old scale painted a handful of
    // huge blotches covering much of the sky; smaller, more numerous cells
    // read as scattered clouds instead of a couple of dominant ones.
    vec3 p1 = direction * 7.0 + windOffset;
    vec3 p2 = direction * 14.0 + windOffset * 1.6;
    vec3 p3 = direction * 28.0 - windOffset * 2.2;
    float n = snoise3(p1) * 0.55 + snoise3(p2) * 0.3 + snoise3(p3) * 0.15;
    // Fade clouds out near the zenith/horizon extremes and only show them
    // in the upper sky, and skip entirely once behind the camera-facing
    // ground line (elevation < 0) to avoid painting clouds "underground".
    float elevationMask = smoothstep(-0.05, 0.25, elevation) * smoothstep(1.3, 0.7, elevation);
    // Narrower band (0.25-0.6, was 0.05-0.55) keeps clouds as small wisps
    // rather than covering most of the noise field.
    float cloud = smoothstep(0.25, 0.6, n) * elevationMask * uCloudAmount;

    // Blended at 0.55 (not 0.85) toward off-white rather than pure white —
    // soft and a little translucent instead of flat, high-contrast blobs.
    vec3 color = mix(skyColor + sunColor, vec3(0.97, 0.98, 1.0), cloud * 0.55);

    // Atmospheric fog on the dome itself.
    //
    // scene.fog only reaches materials that compile three's fog chunks, and
    // this is a hand-written ShaderMaterial — so the dome was the one surface
    // in the scene rendering completely un-fogged. Ground, grass and trees all
    // dissolved into uFogColor while the sky behind them stayed fully
    // saturated blue, and the boundary between the two was the line.
    //
    // Deliberately NOT the d = h/sin(e) ray-march through a uniform medium.
    // That treats the atmosphere as infinitely deep, so the optical depth
    // diverges at the horizon and saturates to solid fog across everything
    // below ~10° — a flat, fully-opaque band whose upper edge IS the line this
    // keeps producing. Real atmosphere has finite thickness, so haze tops out
    // instead of running away.
    //
    // Height-falloff form: haze decays exponentially with elevation above the
    // eye line, and is pinned flat at the eye line and below (elevation <= 0,
    // i.e. anywhere the dome is showing through past the ground plane's own
    // horizon) — matching FogExp2 on the terrain, which is also just "fully
    // saturated" once distance is large, not something that keeps intensifying
    // further down.
    //
    // Peak strength is EXACTLY 1.0, not uFogDensity*uFogHeight clamped to
    // ~0.96 — the previous version left a persistent few percent of raw sky
    // colour blended in even right at the horizon, and since the terrain
    // saturates to fogColor at 100%, that leftover tint was a constant colour
    // mismatch sitting right on the seam. uFogDensity still gates how far the
    // haze reaches (thin fog = the exp() falloff kicks in almost immediately
    // above the eye line; thick fog = it stays hazy well overhead), it just no
    // longer caps the horizon's own strength.
    // uFogFalloff is now a fixed rate in inverse radians — NOT divided by
    // fog density. Dividing by density was the bug: reach = density*uFogHeight
    // is clamped to a 0.05 floor, so whenever density was low (fog still
    // easing in early in the forest section, or just genuinely thin) reach
    // sat at that floor and uFogFalloff/reach exploded to ~200, collapsing
    // the whole exponential falloff into under a single degree — visually
    // identical to a hard step no matter how "gradual" the exponent looked on
    // paper. A fixed rate means the WIDTH of the transition band stays
    // constant; only its opacity (via uCloudAmount and the strength term
    // below) fades with density, so thin fog gives a faint-but-wide haze
    // instead of a strong-but-invisibly-thin one.
    // strength must reach exactly 1.0, not asymptotically approach it — any
    // residual short of 1.0 here (the previous 0.962 ceiling) leaves a
    // permanent trace of raw sky colour blended in even where haze is at its
    // own maximum (elevation <= 0), which is precisely the band the ground's
    // FogExp2 has already fully saturated to pure uFogColor. That constant
    // few-percent mismatch, not a sharp cutoff, was the line: smoothstep
    // saturates properly to 1.0 once uFogDensity clears a small threshold, so
    // as soon as the forest fog is doing anything meaningful at all, the
    // dome's horizon strength is fully pinned instead of forever approaching.
    float aboveEye = max(elevation, 0.0);
    float haze = exp(-aboveEye * uFogFalloff);
    float strength = smoothstep(0.0, 0.01, uFogDensity);
    color = mix(color, uFogColor, haze * strength * uCloudAmount);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const SPACE_SKY = { low: new THREE.Color(0x030712), high: new THREE.Color(0x000000) };
// Softer, less saturated, and lower-contrast than the reference demo's raw
// values — low is close to the ForestFog color (SceneManager.tsx) so the
// horizon blends into the mist instead of showing a hard seam, and high is
// only a little deeper than low instead of a bold saturated blue overhead.
// high pulled toward the low colour (less saturated/contrasty overhead blue),
// matching the softer, hazier zenith the reference demo has.
const FOREST_SKY = { low: new THREE.Color(0xc3dbf5), high: new THREE.Color(0x9ab8dd) };

const tmpLow = new THREE.Color();
const tmpHigh = new THREE.Color();

export function Skybox() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const sunDirection = useMemo(() => {
    const elevation = THREE.MathUtils.degToRad(30);
    const azimuth = THREE.MathUtils.degToRad(90);
    return new THREE.Vector3(
      Math.cos(elevation) * Math.sin(azimuth),
      Math.sin(elevation),
      Math.cos(elevation) * Math.cos(azimuth)
    ).normalize();
  }, []);

  const uniforms = useMemo(
    () => ({
      uSunDirection: { value: sunDirection },
      uSunColor: { value: new THREE.Color(0xffe5b0) },
      uSkyColorLow: { value: SPACE_SKY.low.clone() },
      uSkyColorHigh: { value: SPACE_SKY.high.clone() },
      uSunSize: { value: 1 },
      uTime: { value: 0 },
      uCloudAmount: { value: 0 },
      // Same colour the terrain's fog fades into (FOREST_SKY.low here ==
      // FOREST_FOG_COLOR in SceneManager.tsx) so the horizon haze band below
      // matches exactly instead of introducing a second, slightly different
      // shade of mist right where the two need to line up seamlessly.
      uFogColor: { value: SPACE_SKY.low.clone() },
      // Mirrors scene.fog's density (ForestFog in SceneManager.tsx), synced
      // every frame below so the dome's haze curve and the terrain's stay
      // identical even while the fog is still fading in.
      uFogDensity: { value: 0 },
      // Converts fog density into peak haze strength at the horizon. At the
      // forest's 0.026 density this gives ~0.96, so the sky right at the eye
      // line is essentially uFogColor — the same value the terrain fades to —
      // while staying just under 1.0 so the horizon keeps a trace of sky in it.
      uFogHeight: { value: 37 },
      // Fixed rate (inverse radians) for how fast haze thins with elevation —
      // NOT divided by fog density in the shader (see the fragment shader
      // comment: dividing by density collapsed the whole falloff into under
      // 1° whenever density was low, which looked identical to a hard edge).
      // 1.5 (was 2.5, originally 8) still leaves ~16% haze near the zenith
      // (70°) instead of clearing out by 40-50° — pushed lower specifically
      // to make up for lowering the ground's own FogExp2 density (see
      // SceneManager.tsx): with less haze low to the ground (so the enlarged
      // HERO_TREE's near neighbours read clearly), the sky needs to carry
      // more of the overall "hazy forest" feel on its own.
      uFogFalloff: { value: 1.5 },
    }),
    [sunDirection]
  );

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;

    // Recenter the dome on the camera every frame. The dome's fixed radius-50
    // sphere is centred on the world origin, but the camera roams up to 26
    // units away from it (see CameraController.tsx waypoints) — so the angle
    // from the world origin to, say, the visual horizon at the ground plane
    // drifts as the camera moves, decoupling the shader's elevation-based
    // horizon haze from where the ground actually fades into fog on screen.
    // Keeping the dome centred on the camera makes "elevation" always mean
    // "angle above the viewer's own eye line", matching the standard
    // sky-dome-follows-camera technique and keeping the haze band locked to
    // the real horizon regardless of camera position.
    if (meshRef.current) {
      meshRef.current.position.copy(state.camera.position);
    }

    const forest = THREE.MathUtils.clamp(getScrollState().forest, 0, 1);
    tmpLow.copy(SPACE_SKY.low).lerp(FOREST_SKY.low, forest);
    tmpHigh.copy(SPACE_SKY.high).lerp(FOREST_SKY.high, forest);

    material.uniforms.uSkyColorLow.value.copy(tmpLow);
    material.uniforms.uSkyColorHigh.value.copy(tmpHigh);
    material.uniforms.uFogColor.value.copy(tmpLow);

    // Read the real scene fog rather than duplicating its constants, so the
    // dome tracks it exactly — including while it eases in during the scroll.
    // If they drifted apart by even a little the horizon would show a seam
    // again, which is the whole failure mode this is fixing.
    //
    // The scene fog is linear THREE.Fog (SceneManager.tsx), which has no
    // `density` — it eases in by pulling `far` inward from 4000 toward its
    // real saturation distance (SceneManager.tsx's FOG_FAR). The shader still
    // wants a 0..1 "how much fog is there" figure, so derive one from how far
    // along that travel `far` currently is. Reading `density` here would
    // silently yield undefined and poison the uniform with NaN, blanking the
    // dome's haze entirely.
    //
    // Uses 3900 as the inverseLerp's far end (not SceneManager's exact
    // FOG_FAR) deliberately: uFogDensity only needs to clear the tiny 0.01
    // threshold that Skybox's own `strength = smoothstep(0.0, 0.01, ...)`
    // saturates at (see below) — it doesn't need to numerically match
    // FOG_FAR, just to keep moving as `far` closes in. That decouples the two
    // files so tuning FOG_FAR later can't silently desync this again.
    const sceneFog = state.scene.fog as THREE.Fog | null;
    material.uniforms.uFogDensity.value = sceneFog
      ? THREE.MathUtils.clamp(THREE.MathUtils.inverseLerp(4000, 3900, sceneFog.far), 0, 1) * 0.02
      : 0;
    material.uniforms.uSunSize.value = THREE.MathUtils.lerp(1, 3, forest);
    material.uniforms.uTime.value = state.clock.elapsedTime;
    // Clouds only make sense once the forest sky is showing — fades in the
    // same way the sun disc grows (also driven by `forest`), not present at
    // all during the planet/space scenes.
    material.uniforms.uCloudAmount.value = forest;
  });

  return (
    <mesh ref={meshRef} renderOrder={-1}>
      {/* Radius 400, not 50. The dome now recenters on the camera every frame
          (below), and BackSide only paints pixels where a camera ray actually
          hits the sphere — a ray grazing near the horizon travels much
          further than "straight up" before it reaches the shell. At radius 50
          those grazing rays ran past the sphere while still well short of
          where the 4000-unit ground plane (Ground.tsx) visually ends, so nothing
          was drawn there at all: the raw WebGL clear colour (or the page's
          own background, see index.css `body { background }`) showed through
          as a flat-coloured gap, which read as an even harder line than the
          colour-mismatch seam this was meant to fix. 400 comfortably clears
          every grazing angle the camera's frustum can produce. */}
      <sphereGeometry args={[400, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
