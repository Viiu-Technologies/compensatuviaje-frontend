import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Tree as EZTree, TreePreset } from '../scrollytelling/lib/ez-tree';
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

    tree.castShadow = castShadow;
    tree.receiveShadow = true;
    tree.traverse((o: THREE.Object3D) => {
      o.castShadow = castShadow;
      o.receiveShadow = true;
    });
    return tree;
  }, [presetName, leafType, leafTexture, barkColor, barkNormal, barkRoughness, castShadow]);

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
 * Componente principal del Canvas 3D del Bosque
 */
export const ForestCanvas: React.FC<ForestCanvasProps> = ({
  isVisible,
  timeOfDay,
  species,
}) => {
  const atmo = ATMOSPHERE[timeOfDay];

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
      <Suspense fallback={<ForestFallback />}>
        <Canvas
          camera={{ position: [0, 4.5, 17], fov: 45 }}
          dpr={[1, 1.5]}
          frameloop={isVisible ? 'always' : 'never'}
          shadows
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl, scene }) => {
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

          {/* Controles de Cámara Suaves e Intuitivos */}
          <OrbitControls
            target={[0, 3.2, 0]}
            enableZoom={true}
            minDistance={7}
            maxDistance={28}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2 - 0.05}
            autoRotate={true}
            autoRotateSpeed={0.4}
            dampingFactor={0.05}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default ForestCanvas;
