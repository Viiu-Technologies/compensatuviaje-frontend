/**
 * LeaningCardsFooterScene
 *
 * 3D brand object for the public footer's newsletter block.
 *
 * Design constraints this component is built around:
 *  - The footer background is --ctv-brand-deep (#073D3D) and the card albedo is #0A4247.
 *    Those are nearly the same colour, so the cards are separated from the background with
 *    LIGHT (rim + key + contact shadow), not by shifting the brand colour.
 *  - Transparent canvas: the footer's own background shows through, so the object reads as
 *    part of the footer rather than a pasted-in panel.
 *  - Interactive: a visitor can drag to look at it from another angle. It still idles on
 *    its own when untouched, and OrbitControls is scoped to this canvas only (autoRotate
 *    pauses on interaction, damping smooths hand-off back to idle).
 *  - The camera is framed from the object's own measured bounding SPHERE (not box), because
 *    the object keeps rotating (both the idle animation and user drag) -- framing off a
 *    single static-pose box would clip the model the instant it turns to a wider angle.
 *    This is what caused the corner-clipping in the first version.
 *  - Respects prefers-reduced-motion by holding a static pose instead of auto-rotating,
 *    though drag-to-look is still available since that motion is user-initiated.
 *  - Scroll-triggered spin: the first time the object scrolls INTO view while the user is
 *    scrolling DOWN, it does one quick full turn, then settles back into the normal idle
 *    sway. Scrolling back up into view (or re-entering after having already played it)
 *    does not replay it -- it's a one-shot entrance flourish, not a repeating loop.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Avoids a direct `three-stdlib` type import (a transitive dep of drei that isn't
// always resolvable on its own in every install) by deriving the ref type from the
// drei component itself.
type OrbitControlsImpl = React.ElementRef<typeof OrbitControls>;
import {
  createCompensaTuViajeLeaningBusinessCardsModel,
  createCompensaTuViajeLeaningBusinessCardsEnvironment,
} from './createLeaningCardsModel';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * Fires `onEnterScrollingDown` exactly once: the first time `elementRef` crosses into
 * view while the page is scrolling down. Ignores entries while scrolling up, and never
 * fires again after the first success (a scroll-triggered flourish should announce the
 * section once, not replay every time it re-enters view).
 */
function useSpinOnScrollIntoView(
  elementRef: React.RefObject<HTMLElement | null>,
  onEnterScrollingDown: () => void,
  disabled: boolean,
) {
  // Kept in a ref so the effect below never re-runs just because the parent passed a
  // freshly-created callback. Re-running it would reset `hasFiredRef` and let the
  // one-shot spin fire again and again.
  const callbackRef = useRef(onEnterScrollingDown);
  useEffect(() => {
    callbackRef.current = onEnterScrollingDown;
  }, [onEnterScrollingDown]);

  // Survives effect re-runs (StrictMode double-mounts, dependency churn) so "once" really
  // means once per page load rather than once per effect instance.
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (disabled) return;
    const element = elementRef.current;
    if (!element) return;

    let lastScrollY = window.scrollY;
    let scrollingDown = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      scrollingDown = currentScrollY > lastScrollY;
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        if (hasFiredRef.current) return;
        const entry = entries[0];
        if (entry.isIntersecting && scrollingDown) {
          hasFiredRef.current = true;
          callbackRef.current();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(element);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
    // `onEnterScrollingDown` is deliberately not a dependency -- it is read through
    // callbackRef so a new function identity each render cannot restart the observer.
  }, [elementRef, disabled]);
}

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const envTexture = createCompensaTuViajeLeaningBusinessCardsEnvironment(gl);
    scene.environment = envTexture;
    return () => {
      envTexture.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);
  return null;
}

/**
 * Lighting rig tuned for the footer, not the neutral look-dev rig.
 *
 * The look-dev lights assume a mid-grey studio. Here the object sits on the footer's own
 * deep green, so the job is separation: a cool rim behind the cards to draw a bright edge
 * against the background, a soft warm key for face readability, and a low fill so the
 * shadow side never crushes to black against an already-dark backdrop.
 */
function FooterLights() {
  return (
    <>
      <hemisphereLight args={['#dff5ee', '#04211f', 0.55]} />
      {/* Key: reads the printed face and the logo */}
      <directionalLight position={[-5, 7, 6]} intensity={1.9} color="#fff6ec" />
      {/* Rim: the separation light -- catches the top/side edges against the footer green */}
      <directionalLight position={[3.5, 5, -7]} intensity={2.6} color="#8ef2d0" />
      {/* Fill: keeps the shadowed underside from going black on a dark background */}
      <directionalLight position={[6, 1.5, 4]} intensity={0.5} color="#a8d8ff" />
    </>
  );
}

/**
 * Frames the camera from the object's bounding SPHERE while keeping the object large
 * inside the fixed footer canvas.
 */
function useSphereFramedCamera(model: THREE.Object3D, marginMultiplier: number) {
  const { camera, size } = useThree();
  useEffect(() => {
    const perspective = camera as THREE.PerspectiveCamera;
    const box = new THREE.Box3().setFromObject(model);
    if (box.isEmpty()) return;
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const fovRad = (perspective.fov * Math.PI) / 180;
    // Account for the canvas aspect ratio: a near-square container is the tight
    // dimension here, so frame off whichever axis (vertical/horizontal FOV) is smaller.
    const aspect = size.width / Math.max(1, size.height);
    const horizontalFovRad = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
    const limitingFov = Math.min(fovRad, horizontalFovRad);
    const distance = (sphere.radius * marginMultiplier) / Math.sin(limitingFov / 2);
    const direction = new THREE.Vector3(0.62, 0.42, 0.68).normalize();
    perspective.position.copy(sphere.center).addScaledVector(direction, distance);
    perspective.near = Math.max(0.01, distance - sphere.radius * 2);
    perspective.far = distance + sphere.radius * 4;
    perspective.lookAt(sphere.center);
    perspective.updateProjectionMatrix();
  }, [camera, model, size, marginMultiplier]);
}

const SPIN_DURATION_SECONDS = 0.85;

function Model({
  reducedMotion,
  controlsRef,
  spinRequested,
  onSpinDone,
}: {
  reducedMotion: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  spinRequested: boolean;
  onSpinDone: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  // Tracks an in-flight one-shot spin: null when idle, otherwise the r3f clock time it
  // started at. Progress is measured against that same clock (NOT performance.now(),
  // which has a different epoch -- mixing the two made every frame read as "past the
  // end", which is what produced the endless re-spinning).
  const spinStartRef = useRef<number | null>(null);
  // Latch: once the entrance spin has played, it never plays again for the life of the
  // component, no matter how the `spinRequested` prop changes afterwards.
  const spinConsumedRef = useRef(false);

  const model = useMemo(
    () => createCompensaTuViajeLeaningBusinessCardsModel({ qualityPriority: 'reference-fidelity' }),
    [],
  );

  useEffect(() => {
    // Recentre on the object's own bounds so rotation/orbit pivots the visual centre of
    // the pair rather than the scene origin (the cards are authored offset from it).
    const box = new THREE.Box3().setFromObject(model);
    const centre = box.getCenter(new THREE.Vector3());
    model.position.sub(centre);
  }, [model]);

  // The idle sway (and the one-shot spin) happen on the model itself, not the
  // camera/controls target, so they compose cleanly with user drag (OrbitControls)
  // without fighting each other.
  useFrame((state) => {
    if (!groupRef.current) return;
    const isDragging = controlsRef.current?.getAzimuthalAngle !== undefined
      && (controlsRef.current as unknown as { _isPointerDown?: boolean })._isPointerDown;

    // Start the entrance spin, once ever, from inside the frame loop so it is stamped
    // with the same clock that measures its progress.
    if (spinRequested && !spinConsumedRef.current && spinStartRef.current === null && !isDragging) {
      spinConsumedRef.current = true;
      spinStartRef.current = state.clock.elapsedTime;
    }

    if (spinStartRef.current !== null) {
      // A drag interrupting the entrance spin takes priority and cancels it outright --
      // finishing a programmatic turn underneath the user's own hand would fight them.
      if (isDragging) {
        spinStartRef.current = null;
        onSpinDone();
      } else {
        const elapsed = state.clock.elapsedTime - spinStartRef.current;
        const progress = Math.min(1, elapsed / SPIN_DURATION_SECONDS);
        // easeOutCubic: fast start, gentle settle -- reads as a deliberate flourish
        // rather than a mechanical linear spin.
        const eased = 1 - Math.pow(1 - progress, 3);
        // Full turn ending exactly back at the idle sway's value for this instant, so
        // handing control back to the sway below is seamless instead of snapping.
        const swayAtEnd = Math.sin(state.clock.elapsedTime * 0.18) * 0.22;
        groupRef.current.rotation.y = swayAtEnd + (1 - eased) * -Math.PI * 2;
        groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.13) * 0.06;
        if (progress >= 1) {
          spinStartRef.current = null;
          onSpinDone();
        }
        return;
      }
    }

    if (reducedMotion || isDragging) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.18) * 0.22;
    groupRef.current.rotation.x = Math.sin(t * 0.13) * 0.06;
  });

  // Keep the canvas dimensions unchanged while bringing the figure close to twice its
  // previous visual size.
  useSphereFramedCamera(model, 0.68);

  return (
    <group ref={groupRef} rotation={[0.1, -0.35, 0]}>
      <primitive object={model} />
    </group>
  );
}

const LeaningCardsFooterScene: React.FC = () => {
  const reducedMotion = usePrefersReducedMotion();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [spinRequested, setSpinRequested] = useState(false);

  useSpinOnScrollIntoView(
    containerRef,
    () => setSpinRequested(true),
    reducedMotion,
  );

  return (
    <div
      ref={containerRef}
      className="ft-cards3d"
      role="img"
      aria-label="Tarjetas de presentación 3D de CompensaTuViaje, arrastra para rotar"
    >
      <Canvas
        camera={{ position: [7, 5.5, 9], fov: 32 }}
        // alpha: the footer's own background shows through instead of a canvas-coloured box.
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        // Cap DPR so a retina display doesn't pay for a background decoration.
        dpr={[1, 1.75]}
      >
        <Environment />
        <FooterLights />
        <Model
          reducedMotion={reducedMotion}
          controlsRef={controlsRef}
          spinRequested={spinRequested}
          onSpinDone={() => setSpinRequested(false)}
        />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 1.7}
          rotateSpeed={0.6}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
};

export default LeaningCardsFooterScene;
