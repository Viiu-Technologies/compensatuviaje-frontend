import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
type OrbitControlsImpl = any;
import { getScrollState } from '../hooks/useScrollProgress';

/**
 * Cinematic camera flight driven by overall scroll progress, combined with
 * free mouse orbit/zoom (OrbitControls) around whatever waypoint the scroll
 * has currently reached — planet or forest.
 *
 * Waypoints (camera position + orbit target), scroll 0 → 1:
 * 0.00  far establishing shot of the planet
 * 0.25  fast dolly-in, close to the surface
 * 0.50  orbit around the side as CO₂ → compensation transforms
 * 0.75  dive down past the planet toward the forest floor
 * 1.00  low panoramic sweep through the forest canopy
 *
 * While the user drags/zooms with the mouse, the auto-flight pauses so it
 * doesn't fight OrbitControls. Scrolling again smoothly resumes the flight
 * from wherever the camera currently is.
 */
const waypoints = [
  { p: 0.0, pos: new THREE.Vector3(0, 0.4, 9.5), look: new THREE.Vector3(0, 0, 0) },
  { p: 0.25, pos: new THREE.Vector3(2.2, 0.8, 3.2), look: new THREE.Vector3(0, 0.2, 0) },
  { p: 0.5, pos: new THREE.Vector3(-3.4, 0.6, 2.6), look: new THREE.Vector3(0, 0, 0) },
  { p: 0.75, pos: new THREE.Vector3(-4.0, 3.0, 14.0), look: new THREE.Vector3(0, 2.5, 0) },
  // Framed like the reference demo (ez-tree src/app/scene.js), whose camera
  // sits at (100, 20, 0) looking at (0, 25, 0) — i.e. aimed slightly UPWARD,
  // toward the canopy and horizon. Ours previously looked DOWN at y=-1, which
  // filled two thirds of the frame with stretched, fisheye-looking ground.
  // y raised 4.5 -> 7.0 and z pulled back 26 -> 32 for a higher, further-back
  // final shot; look.y raised to match so the hero tree's canopy stays
  // centred instead of sinking toward the bottom of the frame.
  { p: 1.0, pos: new THREE.Vector3(3.0, 1.0, 20.0), look: new THREE.Vector3(0, 10.5, 0) },
];

const tmpPos = new THREE.Vector3();
const tmpLook = new THREE.Vector3();

// How long after the user stops interacting before auto-flight resumes
const RESUME_DELAY = 0.6;

// Forest ground sits at y = -1.5 (see ForestScene.tsx) — keep the camera
// from ever diving below it, whether via the auto-flight or manual orbit.
const MIN_CAMERA_Y = -1.3;

// Polar angle limits, matching the reference ez-tree demo (scene.js):
// in the forest, keep the camera near the horizon so it can't tip into the
// sky or under the ground plane. In the planet/space scenes, allow a full
// free orbit — there's no ground to clip through.
const FOREST_MIN_POLAR = Math.PI / 2 - 0.35;
const FOREST_MAX_POLAR = Math.PI / 2 + 0.4;

// Touch-primary devices (phones/tablets) start with rotate disabled — it's
// only enabled once a two-finger gesture is detected. Mouse-primary devices
// start enabled, since a single mouse drag is unambiguous (no scroll conflict).
const isTouchPrimary =
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

export function CameraController() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [userActive, setUserActive] = useState(false);
  const idleTimer = useRef(0);
  const lastScrollP = useRef(getScrollState().overall);

  // The canvas covers the full viewport. OrbitControls (three-stdlib) drives
  // itself via Pointer Events (not Touch Events) and forcibly sets
  // `touchAction: none` on the canvas when it mounts — both of which would
  // otherwise swallow one-finger scrolling entirely. Only let OrbitControls
  // react to: wheel + Ctrl/Cmd held (desktop zoom), or a 2nd finger down
  // (pinch/twist on mobile). A plain wheel or one-finger touch is left for
  // the browser to handle as normal page scroll.
  useEffect(() => {
    const el = gl.domElement;
    let activeTouches = 0;

    const onWheel = (e: WheelEvent) => {
      const controls = controlsRef.current;
      if (!controls) return;
      controls.enableZoom = e.ctrlKey || e.metaKey;
      if (controls.enableZoom) e.preventDefault();
    };

    const onPointerDown = (e: PointerEvent) => {
      const controls = controlsRef.current;
      if (!controls || e.pointerType !== 'touch') return;
      activeTouches++;
      const twoFinger = activeTouches >= 2;
      controls.enableRotate = twoFinger;
      controls.enableZoom = twoFinger;
      // Restore native scrolling for a single finger — OrbitControls forces
      // touchAction to "none" on connect, which blocks page scroll outright.
      el.style.touchAction = twoFinger ? 'none' : 'pan-y';
      if (!twoFinger) e.stopImmediatePropagation();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && activeTouches < 2) e.stopImmediatePropagation();
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      activeTouches = Math.max(0, activeTouches - 1);
      if (activeTouches < 2) el.style.touchAction = 'pan-y';
    };

    // Capture phase so this decides enableZoom/enableRotate — and can block
    // propagation — before OrbitControls' own (bubble-phase) listeners run.
    el.addEventListener('wheel', onWheel, { passive: false, capture: true });
    el.addEventListener('pointerdown', onPointerDown, { capture: true });
    el.addEventListener('pointermove', onPointerMove, { capture: true });
    el.addEventListener('pointerup', onPointerUp, { capture: true });
    el.addEventListener('pointercancel', onPointerUp, { capture: true });
    return () => {
      el.removeEventListener('wheel', onWheel, { capture: true });
      el.removeEventListener('pointerdown', onPointerDown, { capture: true });
      el.removeEventListener('pointermove', onPointerMove, { capture: true });
      el.removeEventListener('pointerup', onPointerUp, { capture: true });
      el.removeEventListener('pointercancel', onPointerUp, { capture: true });
    };
  }, [gl]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const scroll = getScrollState();
    const p = THREE.MathUtils.clamp(scroll.overall, 0, 1);
    const scrollMoved = Math.abs(p - lastScrollP.current) > 0.0005;
    lastScrollP.current = p;

    // Scrolling always takes priority and cancels any pending "user is idle" resume
    if (scrollMoved) {
      idleTimer.current = 0;
      if (userActive) setUserActive(false);
    }

    if (!userActive) {
      let i = 0;
      while (i < waypoints.length - 2 && p > waypoints[i + 1].p) i++;
      const a = waypoints[i];
      const b = waypoints[i + 1];
      const t = THREE.MathUtils.smoothstep(p, a.p, b.p);

      tmpPos.lerpVectors(a.pos, b.pos, t);
      tmpLook.lerpVectors(a.look, b.look, t);

      // Resume smoothly after the user releases the mouse, rather than snapping
      idleTimer.current += delta;
      const resumeStrength = scrollMoved
        ? 0.06
        : THREE.MathUtils.clamp(idleTimer.current / RESUME_DELAY, 0, 1) * 0.06;

      camera.position.lerp(tmpPos, resumeStrength);
      controls.target.lerp(tmpLook, resumeStrength);
    }

    // Tighten the orbit's polar range as the forest comes in, so manual
    // orbiting can't tip the camera into the sky or under the ground —
    // matching the reference demo's fixed minPolarAngle/maxPolarAngle.
    const forestAmount = THREE.MathUtils.clamp(scroll.forest, 0, 1);
    controls.minPolarAngle = THREE.MathUtils.lerp(0, FOREST_MIN_POLAR, forestAmount);
    controls.maxPolarAngle = THREE.MathUtils.lerp(Math.PI, FOREST_MAX_POLAR, forestAmount);

    controls.update();

    // Never let auto-flight or manual orbit put the camera below the ground.
    if (camera.position.y < MIN_CAMERA_Y) {
      camera.position.y = MIN_CAMERA_Y;
      controls.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      camera={camera}
      domElement={gl.domElement}
      enablePan={false}
      enableZoom={false}
      enableRotate={!isTouchPrimary}
      enableDamping
      dampingFactor={0.08}
      minDistance={1.8}
      // Raised from 14 — the forest now spans up to radius 90 (see
      // ForestScene.tsx), so the old limit couldn't zoom out far enough to
      // see the clearing the final waypoint is meant to reveal.
      maxDistance={40}
      onStart={() => setUserActive(true)}
    />
  );
}
