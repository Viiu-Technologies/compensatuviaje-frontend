import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { WebGLBoundary, isLowPowerDevice } from '../hero3d/WebGLBoundary';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Tree as EZTree, TreePreset } from './ez-tree';
import { HiSparkles } from 'react-icons/hi';

export type TimeOfDay = 'morning' | 'sunset';
export type TreeSpecies = 'alerce' | 'roble';

interface ForestCanvasProps {
  isVisible: boolean;
  timeOfDay: TimeOfDay;
  species: TreeSpecies;
}

// Configuración de iluminación y niebla según momento del día
const ATMOSPHERE = {
  morning: {
    fogColor: '#cbe7d8',
    fogDensity: 0.032,
    skyColor: '#d6f0e4',
    sunPosition: [12, 14, 10] as [number, number, number],
    sunColor: '#fff8e7',
    sunIntensity: 1.8,
    ambientColor: '#a7d8be',
    ambientIntensity: 0.65,
    groundTint: '#3f6244',
  },
  sunset: {
    fogColor: '#e8c49e',
    fogDensity: 0.028,
    skyColor: '#f7d8b8',
    sunPosition: [-16, 8, -12] as [number, number, number],
    sunColor: '#ff9a47',
    sunIntensity: 2.2,
    ambientColor: '#8a4b38',
    ambientIntensity: 0.55,
    groundTint: '#4a3328',
  },
};

/**
 * Marca el shadow map para que se redibuje en el próximo frame.
 *
 * Las sombras son estáticas: el sol y los árboles no se mueven, y el viento
 * de EZTree vive en el shader de color de las hojas (la pasada de sombras usa
 * el material de profundidad por defecto, sin balanceo). Por eso el renderer
 * corre con shadowMap.autoUpdate = false y solo se recalcula cuando cambia lo
 * que proyecta o lo que ilumina.
 */
function useShadowRefresh(deps: React.DependencyList) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    gl.shadowMap.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, ...deps]);
}

/**
 * Recalcula las sombras cuando cambia la posición del sol (momento del día).
 */
function SunShadowSync({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  useShadowRefresh([timeOfDay]);
  return null;
}

/**
 * Árbol 3D procedural basado en EZTree
 */
function NativeTree({
  position,
  scale = 1,
  presetName = 'Oak Medium',
  leafType = 'oak',
  castShadow = true,
}: {
  position: [number, number, number];
  scale?: number;
  presetName?: string;
  leafType?: string;
  castShadow?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const [leafTexture, barkColor, barkNormal, barkRoughness] = useLoader(THREE.TextureLoader, [
    `/textures/tree/leaves/${leafType}.png`,
    '/textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_Color.jpg',
    '/textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_NormalGL.jpg',
    '/textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_Roughness.jpg',
  ]);

  const treeObject = useMemo(() => {
    leafTexture.colorSpace = THREE.SRGBColorSpace;
    leafTexture.premultiplyAlpha = true;
    barkColor.colorSpace = THREE.SRGBColorSpace;

    const tree = new EZTree();
    const preset = TreePreset[presetName] || TreePreset['Oak Medium'];
    if (preset) {
      tree.options.copy(structuredClone(preset));
    }
    tree.options.leaves.map = leafTexture;
    tree.options.bark.maps.color = barkColor;
    tree.options.bark.maps.normal = barkNormal;
    tree.options.bark.maps.roughness = barkRoughness;
    tree.generate();

    // Solo el árbol que proyecta sombra la recibe (autosombreado). En los
    // acompañantes, recibirla costaba una consulta al shadow map por cada
    // fragmento de hoja, con mucho sobredibujado y casi sin efecto visible.
    tree.castShadow = castShadow;
    tree.receiveShadow = castShadow;
    tree.traverse((o: THREE.Object3D) => {
      o.castShadow = castShadow;
      o.receiveShadow = castShadow;
    });
    return tree;
  }, [presetName, leafType, leafTexture, barkColor, barkNormal, barkRoughness, castShadow]);

  // El shadow map no se recalcula solo (ver onCreated): se pide uno nuevo
  // cuando este árbol entra en la escena.
  useShadowRefresh([treeObject]);

  // Animación del viento en las hojas provista por el método nativo de EZTree
  useFrame((state) => {
    if (treeObject) {
      treeObject.update(state.clock.elapsedTime);
    }
  });

  const treeScale = scale * 0.08;

  return (
    <group ref={groupRef} position={position} scale={[treeScale, treeScale, treeScale]}>
      <primitive object={treeObject} />
    </group>
  );
}

/**
 * Suelo texturizado del bosque
 */
function ForestGround({ groundTint }: { groundTint: string }) {
  const [grassTex, dirtTex] = useLoader(THREE.TextureLoader, [
    '/textures/ground/grass.jpg',
    '/textures/ground/dirt_color.jpg',
  ]);

  useMemo(() => {
    [grassTex, dirtTex].forEach((t) => {
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(40, 40);
      t.colorSpace = THREE.SRGBColorSpace;
    });
  }, [grassTex, dirtTex]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[180, 180]} />
      <meshStandardMaterial
        map={grassTex}
        roughness={0.9}
        metalness={0.05}
        color={groundTint}
      />
    </mesh>
  );
}

/**
 * Placeholder estilizado mientras se cargan los modelos de árboles y texturas
 */
function ForestFallback() {
  return (
    <div className="forest-canvas-fallback" aria-hidden="true">
      <div className="fcf-indicator">
        <HiSparkles className="fcf-icon" />
        <span>Sintonizando Ecosistema 3D en Tiempo Real...</span>
      </div>
    </div>
  );
}

/**
 * Fallback estático (sin 3D) cuando WebGL no está disponible o el Canvas falla
 */
function ForestStaticFallback() {
  return (
    <div className="forest-canvas-fallback" role="img" aria-label="Vista del bosque no disponible">
      <div className="fcf-indicator">
        <HiSparkles className="fcf-icon fcf-icon--static" />
        <span>Vista 3D no disponible en este dispositivo</span>
      </div>
    </div>
  );
}

/**
 * Componente principal del Canvas 3D del Bosque
 */
export const ForestCanvas: React.FC<ForestCanvasProps> = ({
  isVisible,
  timeOfDay,
  species,
}) => {
  const atmo = ATMOSPHERE[timeOfDay];
  // En táctil / pantallas chicas se reduce el costo de render (dpr y GPU)
  const [lowPower] = useState(isLowPowerDevice);

  // Configuración de presets según la especie elegida
  const heroPreset = species === 'alerce' ? 'Pine Medium' : 'Oak Medium';
  const heroLeaf = species === 'alerce' ? 'pine' : 'oak';

  // Árboles acompañantes de fondo
  const companionTrees = useMemo(() => {
    return [
      { pos: [-6, 0, -5] as [number, number, number], scale: 1.8, preset: 'Ash Custom', leaf: 'ash' },
      { pos: [7, 0, -7] as [number, number, number], scale: 2.1, preset: 'Oak Medium', leaf: 'oak' },
      { pos: [-10, 0, 4] as [number, number, number], scale: 1.6, preset: 'Pine Medium', leaf: 'pine' },
      { pos: [11, 0, 3] as [number, number, number], scale: 1.9, preset: 'Aspen Medium', leaf: 'aspen' },
      { pos: [0, 0, -12] as [number, number, number], scale: 2.4, preset: 'Oak Medium', leaf: 'oak' },
    ];
  }, []);

  return (
    <div className="forest-canvas-container">
      <WebGLBoundary fallback={<ForestStaticFallback />}>
      <Suspense fallback={<ForestFallback />}>
        <Canvas
          camera={{ position: [0, 4.5, 17], fov: 45 }}
          dpr={lowPower ? [1, 1] : [1, 1.25]}
          frameloop={isVisible ? 'always' : 'never'}
          // 'percentage' (PCF) es lo que three ya usaba: en three 0.184
          // PCFSoftShadowMap está deprecado y cae a PCF con un warning.
          shadows="percentage"
          gl={{
            // Sin MSAA: las hojas usan alpha test, que el antialiasing por
            // multisample no suaviza, y el costo en una escena con tanto
            // sobredibujado era alto.
            antialias: false,
            powerPreference: lowPower ? 'default' : 'high-performance',
          }}
          onCreated={({ gl, scene }) => {
            // Sombras estáticas: se redibujan bajo demanda (useShadowRefresh)
            // en vez de en cada frame.
            gl.shadowMap.autoUpdate = false;
            gl.shadowMap.needsUpdate = true;
            gl.toneMapping = THREE.NeutralToneMapping;
            gl.toneMappingExposure = 1.6;
            scene.fog = new THREE.FogExp2(atmo.fogColor, atmo.fogDensity);
          }}
        >
          {/* Atmósfera e Iluminación */}
          <color attach="background" args={[atmo.skyColor]} />
          <ambientLight color={atmo.ambientColor} intensity={atmo.ambientIntensity} />
          <directionalLight
            position={atmo.sunPosition}
            intensity={atmo.sunIntensity}
            color={atmo.sunColor}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={1}
            shadow-camera-far={45}
            shadow-camera-left={-12}
            shadow-camera-right={12}
            shadow-camera-top={12}
            shadow-camera-bottom={-12}
            shadow-bias={-0.0008}
          />
          <SunShadowSync timeOfDay={timeOfDay} />

          {/* Suelo del ecosistema */}
          <ForestGround groundTint={atmo.groundTint} />

          {/* Árbol Principal Hero (Alerce / Roble protagonista) */}
          <NativeTree
            key={`${species}-${heroPreset}`}
            position={[0, 0, 0]}
            scale={2.7}
            presetName={heroPreset}
            leafType={heroLeaf}
            castShadow={true}
          />

          {/* Árboles Acompañantes en el Bosque */}
          {companionTrees.map((t, idx) => (
            <NativeTree
              key={idx}
              position={t.pos}
              scale={t.scale}
              presetName={t.preset}
              leafType={t.leaf}
              castShadow={false}
            />
          ))}

          {/* Controles de Cámara Suaves e Intuitivos. Sin zoom: con la rueda
              activa, el canvas (~600px de alto) capturaba el scroll y la
              página dejaba de bajar al pasar el mouse por encima. */}
          <OrbitControls
            target={[0, 3.2, 0]}
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2 - 0.05}
            autoRotate={true}
            autoRotateSpeed={0.4}
            dampingFactor={0.05}
          />
        </Canvas>
      </Suspense>
      </WebGLBoundary>
    </div>
  );
};

export default ForestCanvas;
