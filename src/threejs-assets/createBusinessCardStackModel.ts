import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type ProceduralModelOptions = {
  wireframe?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  textureSize?: number;
  textureAnisotropy?: number;
  qualityPriority?: 'reference-fidelity' | 'balanced';
};

export type ProceduralModelRuntime = {
  nodes: Record<string, THREE.Object3D>;
  meshes: Record<string, THREE.Mesh>;
  sockets: Record<string, THREE.Object3D>;
  colliders: Record<string, unknown>;
  destructionGroups: Record<string, THREE.Object3D[]>;
};

type SculptMaterialSpec = Record<string, any>;

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function readLayerNumber(value: unknown, keys: string[], fallback: number): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of keys) {
      if (typeof record[key] === 'number') return record[key] as number;
    }
  }
  return fallback;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = /^#[0-9a-f]{3}$/i.test(hex)
    ? '#' + hex.slice(1).split('').map((part) => part + part).join('')
    : hex;
  const value = /^#[0-9a-f]{6}$/i.test(normalized) ? Number.parseInt(normalized.slice(1), 16) : 0x8a7a5f;
  return [clampAlbedoChannel((value >> 16) & 255), clampAlbedoChannel((value >> 8) & 255), clampAlbedoChannel(value & 255)];
}

function materialPalette(spec: SculptMaterialSpec): string[] {
  const palette = spec.colorVariation?.palette;
  if (Array.isArray(palette) && palette.length > 0) return palette.filter((value) => typeof value === 'string');
  const secondary = spec.albedo?.secondary;
  const colors = [spec.baseColor ?? spec.color ?? spec.albedo?.dominant, ...(Array.isArray(secondary) ? secondary : [])];
  return colors.filter((value): value is string => typeof value === 'string' && value.startsWith('#'));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampAlbedoChannel(value: number): number {
  return Math.max(30, Math.min(240, Math.round(value)));
}

function clampPbrF0(value: number): number {
  return Math.max(0.02, Math.min(1, value));
}

function clampPbrIor(value: number): number {
  return Math.max(1, Math.min(2.5, value));
}

function clampPbrMetalness(value: number): number {
  return value >= 0.5 ? 1 : 0;
}

function clampedAlbedoColor(spec: SculptMaterialSpec): THREE.Color {
  const source = typeof spec.baseColor === 'string' ? spec.baseColor : '#8A7A5F';
  // setStyle with an explicit SRGBColorSpace, NOT the numeric constructor.
  //
  // `new THREE.Color(r, g, b)` treats its arguments as LINEAR working-space components,
  // while an authored `baseColor` hex is sRGB. Feeding one to the other skipped the
  // transfer function and lifted every dark albedo: #2e2a28, authored as a near-black
  // vinyl, rendered at roughly sRGB 0.46 — a mid grey. The error is largest exactly where
  // it matters most, because the transfer curve is steepest near black.
  return new THREE.Color().setStyle(source, THREE.SRGBColorSpace);
}

function smoothCurve(value: number): number {
  return value * value * (3 - 2 * value);
}

function periodicHash(x: number, y: number, seed: number, periodX: number, periodY: number): number {
  const wrappedX = ((x % periodX) + periodX) % periodX;
  const wrappedY = ((y % periodY) + periodY) % periodY;
  let value = Math.imul(wrappedX + seed * 17, 374761393) ^ Math.imul(wrappedY + seed * 31, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function periodicValueNoise(u: number, v: number, seed: number, periodX: number, periodY: number): number {
  const x = u * periodX;
  const y = v * periodY;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothCurve(x - x0);
  const ty = smoothCurve(y - y0);
  const a = periodicHash(x0, y0, seed, periodX, periodY);
  const b = periodicHash(x0 + 1, y0, seed, periodX, periodY);
  const c = periodicHash(x0, y0 + 1, seed, periodX, periodY);
  const d = periodicHash(x0 + 1, y0 + 1, seed, periodX, periodY);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, tx), THREE.MathUtils.lerp(c, d, tx), ty);
}

type SurfaceBand = {
  frequency: number;
  amplitude: number;
  stretchX: number;
  stretchY: number;
  ridge: boolean;
};

function surfaceBands(spec: SculptMaterialSpec): SurfaceBand[] {
  const source = Array.isArray(spec.surfaceFrequencyBands) ? spec.surfaceFrequencyBands : [];
  const parsed = source.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return [];
    const band = item as Record<string, unknown>;
    const frequency = typeof band.frequency === 'number' ? band.frequency : 0;
    const amplitude = typeof band.amplitude === 'number' ? band.amplitude : 0;
    if (frequency <= 0 || amplitude <= 0) return [];
    const stretch = Array.isArray(band.stretch) ? band.stretch : [1, 1];
    const description = `${String(band.pattern ?? '')} ${String(band.role ?? '')}`.toLowerCase();
    return [{
      frequency,
      amplitude,
      stretchX: typeof stretch[0] === 'number' ? Math.max(0.1, stretch[0]) : 1,
      stretchY: typeof stretch[1] === 'number' ? Math.max(0.1, stretch[1]) : 1,
      ridge: /(ridge|groove|grain|fiber|striated|crack)/.test(description),
    }];
  });
  return parsed.length > 0 ? parsed : [
    { frequency: 2, amplitude: 0.42, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 12, amplitude: 0.22, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 56, amplitude: 0.08, stretchX: 1, stretchY: 1, ridge: false },
  ];
}

function sampleSurface(u: number, v: number, bands: SurfaceBand[], seed: number): number {
  let value = 0;
  let weight = 0;
  for (let index = 0; index < bands.length; index += 1) {
    const band = bands[index];
    const periodX = Math.max(1, Math.round(band.frequency * band.stretchX));
    const periodY = Math.max(1, Math.round(band.frequency * band.stretchY));
    let sample = periodicValueNoise(u, v, seed + index * 1013, periodX, periodY);
    if (band.ridge) sample = 1 - Math.abs(sample * 2 - 1);
    value += sample * band.amplitude;
    weight += band.amplitude;
  }
  return weight > 0 ? clamp01(value / weight) : 0.5;
}

function mixPalette(colors: [number, number, number][], value: number): [number, number, number] {
  if (colors.length === 1) return colors[0];
  const scaled = clamp01(value) * (colors.length - 1);
  const index = Math.min(colors.length - 2, Math.floor(scaled));
  const mix = scaled - index;
  const a = colors[index];
  const b = colors[index + 1];
  return [
    Math.round(THREE.MathUtils.lerp(a[0], b[0], mix)),
    Math.round(THREE.MathUtils.lerp(a[1], b[1], mix)),
    Math.round(THREE.MathUtils.lerp(a[2], b[2], mix)),
  ];
}

type ColorGradientStop = { offset: number; color: string };
type ColorGradientSpec = {
  type: 'linear' | 'radial';
  axis: [number, number];
  stops: ColorGradientStop[];
};

function parseRgba(value: string): [number, number, number] {
  const match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(value);
  if (!match) return [138, 122, 95];
  return [clampAlbedoChannel(Number(match[1])), clampAlbedoChannel(Number(match[2])), clampAlbedoChannel(Number(match[3]))];
}

// Analytical per-pixel gradient sample. The extraction schema's colorGradient carries
// exact rgba(...) stop colors (see extract_part_color_recipe.py), so this samples the
// same trend directly in JS math rather than round-tripping through a Canvas 2D
// createLinearGradient/createRadialGradient object — same visual result, and it composes
// directly with the existing noise/height-correlated colorVariation blend below.
function sampleColorGradient(gradient: ColorGradientSpec, u: number, v: number): [number, number, number] {
  const stops = gradient.stops.length >= 2 ? gradient.stops : [{ offset: 0, color: 'rgba(138,122,95,1)' }, { offset: 1, color: 'rgba(138,122,95,1)' }];
  let t: number;
  if (gradient.type === 'radial') {
    const [cx, cy] = gradient.axis;
    const dx = u - cx;
    const dy = v - cy;
    const maxRadius = Math.max(0.001, Math.hypot(Math.max(cx, 1 - cx), Math.max(cy, 1 - cy)));
    t = clamp01(Math.hypot(dx, dy) / maxRadius);
  } else {
    const [ax, ay] = gradient.axis;
    const projection = (u - 0.5) * ax + (v - 0.5) * ay;
    const maxProjection = 0.5 * (Math.abs(ax) + Math.abs(ay)) || 0.5;
    t = clamp01(projection / maxProjection + 0.5);
  }
  const scaled = t * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.max(0, Math.floor(scaled)));
  const mix = scaled - index;
  const a = parseRgba(stops[index].color);
  const b = parseRgba(stops[index + 1].color);
  return [
    THREE.MathUtils.lerp(a[0], b[0], mix),
    THREE.MathUtils.lerp(a[1], b[1], mix),
    THREE.MathUtils.lerp(a[2], b[2], mix),
  ];
}

function writePixel(data: Uint8ClampedArray, offset: number, red: number, green: number, blue: number): void {
  data[offset] = Math.max(0, Math.min(255, Math.round(red)));
  data[offset + 1] = Math.max(0, Math.min(255, Math.round(green)));
  data[offset + 2] = Math.max(0, Math.min(255, Math.round(blue)));
  data[offset + 3] = 255;
}

function makeCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function createMapTexture(
  canvas: HTMLCanvasElement,
  colorSpace: THREE.ColorSpace,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  const projection = spec.textureProjection && typeof spec.textureProjection === 'object' ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [2, 2];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === 'number' ? repeat[0] : 2,
    typeof repeat[1] === 'number' ? repeat[1] : 2,
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  texture.needsUpdate = true;
  return texture;
}

type ProceduralTextureSet = {
  albedo: THREE.Texture;
  roughness: THREE.Texture;
  height: THREE.Texture;
  normal: THREE.Texture;
  ao: THREE.Texture;
  source: 'reference-pixel-extraction' | 'procedural';
};

function referenceMapUrl(spec: SculptMaterialSpec, channel: string): string | null {
  const reference = spec.referencePbr;
  if (!reference || typeof reference !== 'object') return null;
  if (reference.usable === false) return null;
  const confidence = typeof reference.confidence === 'number'
    ? reference.confidence
    : (typeof reference.estimatedFidelity === 'number' ? reference.estimatedFidelity : 0);
  const threshold = typeof reference.targetThreshold === 'number' ? reference.targetThreshold : 0.7;
  if (confidence < threshold) return null;
  const maps = reference.maps;
  if (!maps || typeof maps !== 'object') return null;
  const map = (maps as Record<string, unknown>)[channel];
  if (!map || typeof map !== 'object') return null;
  const record = map as Record<string, unknown>;
  const url = typeof record.url === 'string' && record.url.trim() ? record.url : record.path;
  return typeof url === 'string' && url.trim() ? url : null;
}

function createLoadedMapTexture(
  url: string,
  colorSpace: THREE.ColorSpace,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): THREE.Texture {
  const texture = new THREE.TextureLoader().load(url);
  const projection = spec.textureProjection && typeof spec.textureProjection === 'object' ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [1, 1];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === 'number' ? repeat[0] : 1,
    typeof repeat[1] === 'number' ? repeat[1] : 1,
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  texture.needsUpdate = true;
  return texture;
}

function makeReferenceTextureSet(spec: SculptMaterialSpec, options: ProceduralModelOptions): ProceduralTextureSet | null {
  const albedo = referenceMapUrl(spec, 'albedo');
  const roughness = referenceMapUrl(spec, 'roughness');
  const height = referenceMapUrl(spec, 'height');
  const normal = referenceMapUrl(spec, 'normal');
  const ao = referenceMapUrl(spec, 'ao');
  if (!albedo || !roughness || !height || !normal || !ao) return null;
  return {
    albedo: createLoadedMapTexture(albedo, THREE.SRGBColorSpace, spec, options),
    roughness: createLoadedMapTexture(roughness, THREE.NoColorSpace, spec, options),
    height: createLoadedMapTexture(height, THREE.NoColorSpace, spec, options),
    normal: createLoadedMapTexture(normal, THREE.NoColorSpace, spec, options),
    ao: createLoadedMapTexture(ao, THREE.NoColorSpace, spec, options),
    source: 'reference-pixel-extraction',
  };
}

function makeProceduralTextureSet(
  id: string,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): ProceduralTextureSet | null {
  if (typeof document === 'undefined') return null;
  const qualityFirst = (options.qualityPriority ?? 'reference-fidelity') === 'reference-fidelity';
  const requested = options.textureSize ?? spec.textureResolution;
  const requestedSize = typeof requested === 'number' && Number.isFinite(requested)
    ? requested
    : (qualityFirst ? 1024 : 512);
  const size = Math.max(256, Math.min(2048, 2 ** Math.round(Math.log2(requestedSize))));
  const canvases = {
    albedo: makeCanvas(size),
    roughness: makeCanvas(size),
    height: makeCanvas(size),
    normal: makeCanvas(size),
    ao: makeCanvas(size),
  };
  const contexts = {
    albedo: canvases.albedo.getContext('2d'),
    roughness: canvases.roughness.getContext('2d'),
    height: canvases.height.getContext('2d'),
    normal: canvases.normal.getContext('2d'),
    ao: canvases.ao.getContext('2d'),
  };
  if (!contexts.albedo || !contexts.roughness || !contexts.height || !contexts.normal || !contexts.ao) return null;
  const images = {
    albedo: contexts.albedo.createImageData(size, size),
    roughness: contexts.roughness.createImageData(size, size),
    height: contexts.height.createImageData(size, size),
    normal: contexts.normal.createImageData(size, size),
    ao: contexts.ao.createImageData(size, size),
  };
  const seed = hashString(id);
  const bands = surfaceBands(spec);
  const heightField = new Float32Array(size * size);
  const roughnessField = new Float32Array(size * size);
  const palette = materialPalette(spec);
  const fallback = typeof spec.baseColor === 'string' ? spec.baseColor : '#8A7A5F';
  const colors = (palette.length >= 2 ? palette : [fallback, '#6E614B', '#A08F70']).map(hexToRgb);
  const baseRoughness = clamp01(readLayerNumber(spec.roughness, ['base'], 0.76));
  const roughnessVariation = clamp01(readLayerNumber(spec.roughness, ['variation'], 0.18));
  const colorAmplitude = clamp01(readLayerNumber(spec.colorVariation, ['amplitude', 'variation'], 0.18));
  const heightCorrelation = clamp01(readLayerNumber(spec.colorVariation, ['heightCorrelation'], 0.3));
  const colorGradient: ColorGradientSpec | undefined = spec.colorGradient;
  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const index = y * size + x;
      const height = sampleSurface(u, v, bands, seed + 101);
      const roughNoise = sampleSurface(u, v, bands, seed + 7001);
      const colorNoise = sampleSurface(u, v, bands, seed + 15013);
      heightField[index] = height;
      roughnessField[index] = clamp01(baseRoughness + (roughNoise - 0.5) * roughnessVariation * 2);
      let color: [number, number, number];
      if (colorGradient) {
        // Evidence-derived spatial gradient (Plan 1.3 Workstream C) takes priority
        // over the noise-based palette blend below — it is a measured trend, not a guess.
        color = sampleColorGradient(colorGradient, u, v);
      } else {
        const paletteValue = clamp01(
          0.5 + (colorNoise - 0.5) * colorAmplitude * 2 + (height - 0.5) * heightCorrelation
        );
        color = mixPalette(colors, paletteValue);
      }
      writePixel(images.albedo.data, index * 4, color[0], color[1], color[2]);
    }
  }
  const normalStrength = Math.max(0.05, readLayerNumber(spec.normal, ['strength', 'amplitude'], 0.35));
  const aoStrength = clamp01(readLayerNumber(spec.ambientOcclusion, ['cavityStrength', 'strength'], 0.35));
  for (let y = 0; y < size; y += 1) {
    const up = ((y - 1 + size) % size) * size;
    const down = ((y + 1) % size) * size;
    for (let x = 0; x < size; x += 1) {
      const left = (x - 1 + size) % size;
      const right = (x + 1) % size;
      const index = y * size + x;
      const center = heightField[index];
      const dx = (heightField[y * size + right] - heightField[y * size + left]) * normalStrength * 6;
      const dy = (heightField[down + x] - heightField[up + x]) * normalStrength * 6;
      const inverseLength = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const normalX = -dx * inverseLength;
      const normalY = -dy * inverseLength;
      const normalZ = inverseLength;
      const neighborAverage = (
        heightField[y * size + left] + heightField[y * size + right]
        + heightField[up + x] + heightField[down + x]
      ) * 0.25;
      const cavity = Math.max(0, neighborAverage - center);
      const ao = clamp01(1 - aoStrength * (cavity * 12 + (1 - center) * 0.16));
      const offset = index * 4;
      const heightByte = center * 255;
      const roughnessByte = roughnessField[index] * 255;
      writePixel(images.height.data, offset, heightByte, heightByte, heightByte);
      writePixel(images.roughness.data, offset, roughnessByte, roughnessByte, roughnessByte);
      writePixel(
        images.normal.data, offset,
        (normalX * 0.5 + 0.5) * 255,
        (normalY * 0.5 + 0.5) * 255,
        (normalZ * 0.5 + 0.5) * 255,
      );
      writePixel(images.ao.data, offset, ao * 255, ao * 255, ao * 255);
    }
  }
  contexts.albedo.putImageData(images.albedo, 0, 0);
  contexts.roughness.putImageData(images.roughness, 0, 0);
  contexts.height.putImageData(images.height, 0, 0);
  contexts.normal.putImageData(images.normal, 0, 0);
  contexts.ao.putImageData(images.ao, 0, 0);
  return {
    albedo: createMapTexture(canvases.albedo, THREE.SRGBColorSpace, spec, options),
    roughness: createMapTexture(canvases.roughness, THREE.NoColorSpace, spec, options),
    height: createMapTexture(canvases.height, THREE.NoColorSpace, spec, options),
    normal: createMapTexture(canvases.normal, THREE.NoColorSpace, spec, options),
    ao: createMapTexture(canvases.ao, THREE.NoColorSpace, spec, options),
    source: 'procedural',
  };
}

function createSculptMaterial(id: string, spec: SculptMaterialSpec, options: ProceduralModelOptions, denseComponent = false): THREE.MeshPhysicalMaterial {
  // A material that declares -- with evidence -- that its subject carries no texture
  // detail gets NO texture set. Synthesising one anyway is not a harmless default: the
  // branch below then forces color to white and roughness to 1 and reads both from the
  // generated maps, so the authored albedo and the reference-derived roughness are both
  // discarded, and the model gains mottling the reference does not have. Measured on the
  // tuxedo cat, whose black fur rendered as speckled grey-and-white from a palette that
  // only ever described two flat regions.
  const textureless = (spec.textureless as { declared?: boolean } | undefined)?.declared === true;
  const textures = textureless
    ? null
    : makeReferenceTextureSet(spec, options) ?? makeProceduralTextureSet(id, spec, options);
  const material = new THREE.MeshPhysicalMaterial({
    color: textures ? 0xffffff : clampedAlbedoColor(spec),
    roughness: textures ? 1 : clamp01(readLayerNumber(spec.roughness, ['base'], 0.76)),
    metalness: clampPbrMetalness(readLayerNumber(spec.metalness, ['base'], 0.0)),
    clearcoat: clamp01(readLayerNumber(spec.clearcoat, ['base', 'amount'], 0)),
    clearcoatRoughness: clamp01(readLayerNumber(spec.clearcoatRoughness, ['base'], 0.25)),
    transmission: clamp01(readLayerNumber(spec.transmission, ['base', 'amount'], 0)),
    ior: clampPbrIor(readLayerNumber(spec.ior, ['base', 'value'], 1.5)),
    thickness: Math.max(0, readLayerNumber(spec.thickness, ['base', 'amount'], 0)),
    attenuationDistance: Math.max(0.001, readLayerNumber(spec.attenuationDistance, ['base', 'value'], Infinity)),
    attenuationColor: new THREE.Color(typeof spec.attenuationColor === 'string' ? spec.attenuationColor : '#ffffff'),
    sheen: clamp01(readLayerNumber(spec.sheen, ['base', 'amount'], 0)),
    sheenColor: new THREE.Color(typeof spec.sheenColor === 'string' ? spec.sheenColor : '#ffffff'),
    sheenRoughness: clamp01(readLayerNumber(spec.sheenRoughness, ['base'], 1.0)),
    iridescence: clamp01(readLayerNumber(spec.iridescence, ['base', 'amount'], 0)),
    iridescenceIOR: clampPbrIor(readLayerNumber(spec.iridescenceIOR, ['base', 'value'], 1.3)),
    anisotropy: clamp01(readLayerNumber(spec.anisotropy, ['base', 'amount'], 0)),
    anisotropyRotation: readLayerNumber(spec.anisotropy, ['rotation'], 0),
    specularIntensity: clampPbrF0(readLayerNumber(spec.specularF0 ?? spec.f0 ?? spec.specularIntensity, ['base', 'value'], 1.0)),
    specularColor: new THREE.Color(typeof spec.specularColor === 'string' ? spec.specularColor : '#ffffff'),
    emissive: new THREE.Color(typeof spec.emissive === 'string' ? spec.emissive : '#000000'),
    emissiveIntensity: Math.max(0, readLayerNumber(spec.emissiveIntensity, ['base'], 1.0)),
    opacity: clamp01(readLayerNumber(spec.opacity, ['base'], 1)),
    transparent: readLayerNumber(spec.transmission, ['base', 'amount'], 0) > 0 || readLayerNumber(spec.opacity, ['base'], 1) < 1,
    alphaTest: Math.max(0, readLayerNumber(spec.alpha, ['cutoff', 'alphaTest'], 0)),
    wireframe: options.wireframe ?? false,
    side: spec.doubleSided === true ? THREE.DoubleSide : THREE.FrontSide,
    flatShading: spec.flatShading === true,
  });
  if (textures) {
    material.map = textures.albedo;
    material.roughnessMap = textures.roughness;
    material.normalMap = textures.normal;
    material.normalScale.setScalar(Math.max(0.05, readLayerNumber(spec.normal, ['strength', 'amplitude'], 0.35)));
    material.aoMap = textures.ao;
    material.aoMap.channel = 0;
    material.aoMapIntensity = readLayerNumber(spec.ambientOcclusion, ['cavityStrength', 'strength'], 0.35);
    const denseMesh = denseComponent || spec.denseMesh === true || spec.geometryDensity === 'dense' || spec.topologyClass === 'dense';
    const bumpScale = Math.max(0, readLayerNumber(spec.bump, ['amplitude', 'strength'], 0));
    const effectiveBumpScale = denseMesh ? Math.max(0.05, bumpScale) : bumpScale;
    if (effectiveBumpScale > 0) {
      material.bumpMap = textures.height;
      material.bumpScale = effectiveBumpScale;
    }
    const displacementScale = Math.max(0, readLayerNumber(spec.displacement, ['amplitude', 'strength'], 0));
    const effectiveDisplacementScale = denseMesh ? Math.max(0.005, displacementScale) : displacementScale;
    if (effectiveDisplacementScale > 0) {
      material.displacementMap = textures.height;
      material.displacementScale = effectiveDisplacementScale;
      material.displacementBias = -effectiveDisplacementScale * 0.5;
    }
  }
  material.envMapIntensity = readLayerNumber(spec, ['envMapIntensity'], 0.8);
  material.userData.sculptMaterial = spec;
  material.userData.proceduralMapsIndependent = true;
  material.userData.pbrConstraints = { albedoRange: [30, 240], binaryMetalness: true, f0Range: [0.02, 1], iorRange: [1, 2.5] };
  material.userData.pbrTextureSource = textures?.source ?? 'flat-fallback';
  material.userData.referencePbr = spec.referencePbr ?? null;
  material.userData.referenceMaterialId = spec.referenceMaterialId ?? spec.materialReference?.profileId ?? null;
  material.userData.materialEvidence = spec.materialEvidence ?? null;
  material.userData.validationViews = spec.materialReference?.validationViews ?? [];
  material.needsUpdate = true;
  return material;
}

type AttachmentEndpoint = {
  start: THREE.Vector3;
  midpoint: THREE.Vector3;
  quaternion: THREE.Quaternion;
  length: number;
  baseRadius: number;
  endRadius: number;
};

function readVector3(value: unknown, fallback: [number, number, number]): THREE.Vector3 {
  if (Array.isArray(value) && value.length === 3 && value.every((item) => typeof item === 'number')) {
    return new THREE.Vector3(value[0], value[1], value[2]);
  }
  return new THREE.Vector3(fallback[0], fallback[1], fallback[2]);
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function makeAttachmentEndpoint(attachment: unknown): AttachmentEndpoint | null {
  if (!attachment || typeof attachment !== 'object') return null;
  const record = attachment as Record<string, unknown>;
  const start = readVector3(record.localStart, [0, 0, 0]);
  const end = readVector3(record.localEnd, [0, 1, 0]);
  const delta = end.clone().sub(start);
  const length = delta.length();
  if (length <= 0.0001) return null;
  const direction = delta.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  const baseRadius = Math.max(0.005, readNumber(record.baseRadius, 0.06));
  const endRadius = Math.max(0.003, readNumber(record.endRadius, baseRadius * 0.55));
  return {
    start,
    midpoint: delta.multiplyScalar(0.5),
    quaternion,
    length,
    baseRadius,
    endRadius,
  };
}

// --- Hand-authored geometry helpers -----------------------------------------------------
// The generator's box branch only fires when a component has a two-point `attachment`
// (localStart/localEnd) — it treats that case as a tube/connector. A flat, dimensioned
// plate like a business card has no such attachment, so the generator fell back to an
// un-scaled 1x1x1 BoxGeometry for all three card components. Replacing that fallback here
// with real dimensioned geometry (object-sculpt-spec.json componentTree[].dimensions),
// matching the spec's documented topologyIntent: a rounded-rect box via ExtrudeGeometry
// rather than a plain BoxGeometry, so the small corner radius reads correctly in silhouette.
function createCardGeometry(widthCm: number, heightCm: number, depthCm: number, cornerRadiusCm: number): THREE.ExtrudeGeometry {
  const halfW = widthCm / 2;
  const halfD = depthCm / 2;
  const r = Math.min(cornerRadiusCm, halfW, halfD);
  const shape = new THREE.Shape();
  shape.moveTo(-halfW + r, -halfD);
  shape.lineTo(halfW - r, -halfD);
  shape.absarc(halfW - r, -halfD + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(halfW, halfD - r);
  shape.absarc(halfW - r, halfD - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-halfW + r, halfD);
  shape.absarc(-halfW + r, halfD - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-halfW, -halfD + r);
  shape.absarc(-halfW + r, -halfD + r, r, Math.PI, Math.PI * 1.5, false);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: heightCm,
    bevelEnabled: false,
    curveSegments: 8,
    steps: 1,
  });
  // ExtrudeGeometry extrudes along +Z from the shape's XY plane; rotate so the extrusion
  // (card thickness) lies along local +Y instead, and the printed face lies in the XZ
  // plane facing +Y (matching coordinateFrame.front = card printed face).
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -heightCm / 2, 0);

  // Planar front/back-face UVs (0..1 across the card face) per
  // componentTree[].geometryDescriptor.uvStrategy: remap X/Z into a 0..1 UV so the
  // projected brand texture (materials.cardFront) lands correctly on the top face.
  // Planar UV for the printed face. After rotateX(-PI/2) the printed face points at +Y,
  // and looking down that normal the local +Z axis runs toward the viewer -- the opposite
  // of the texture's V direction. Mapping V straight from Z therefore mirrors the artwork
  // (the wordmark rendered back-to-front). Flipping V restores readable text.
  const uv = geometry.getAttribute('uv') as THREE.BufferAttribute;
  const position = geometry.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const z = position.getZ(i);
    uv.setXY(i, (x + halfW) / widthCm, 1 - (z + halfD) / depthCm);
  }
  uv.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

// Generated from ObjectSculptSpec target: CompensaTuViaje Business Card Stack
// Sculpt build pass: blockout
// This factory is intentionally pass-gated. Finish browser screenshot review before unlocking deeper passes.
export function createCompensaTuViajeBusinessCardStackModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = "CompensaTuViaje Business Card Stack";
  root.userData.reconstructionEvidence = {"itemFamily": null, "subtype": null, "componentAdapter": null, "route": null, "exactnessTier": null, "referenceCamera": {"solved": true, "fovDegrees": 35.0, "aspect": 1.7778, "orientation": {"yaw": -18.0, "pitch": -32.0, "roll": -8.0}, "positionHint": [0.0, 2.2, 3.4], "note": "High-angle 3/4 product-mockup shot looking down onto the card group. Values are a starting point (solve_camera_pose.py confidence 0.35) to be refined by overlay review against public/images/brand/new-brand/targetas-compensa.jpeg during the blockout pass. Front-face brand art is instead handled by direct planar UV texturing (see materials.cardFront), which does not depend on this camera being exact."}, "approximationNotes": []};
  root.userData.materialPipeline = {};
  root.userData.materialReferenceRegistry = null;

  const materialMap: Record<string, THREE.Material> = {};
  materialMap["cardFront"] = createSculptMaterial(
    "cardFront",
    {"id": "cardFront", "name": "Card front face -- projected brand art on textured paper", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#0E4A44", "color": "#0E4A44", "albedo": {"dominant": "#0E4A44", "secondary": ["#12615A", "#0A3B36", "#FFFFFF"], "samplingNotes": "Dominant deep teal (#0E4A44) base with a lighter teal (#12615A) organic blob-pattern region (~6-8% higher value, soft-edged) and the white (#FFFFFF) cloud-icon + wordmark lockup. Reproduced by projecting a de-lit, perspective-rectified crop of viewEvidence.front-card-logo onto a standard planar UV (0..1 across the card face) rather than by procedural pattern synthesis, per user decision -- the projected image IS the albedo map for this material."}, "colorVariation": {"palette": ["#0E4A44", "#12615A", "#0A3B36", "#FFFFFF"], "pattern": "photo-projected", "amplitude": 0.0, "heightCorrelation": 0.0}, "textureResolution": 2048, "textureProjection": {"mode": "projected-uv-bake", "repeat": [1.0, 1.0], "anisotropy": 8, "texelDensityIntent": "One projected texture instance covers exactly one card face at 1:1, reused (not re-projected per-instance) across deck top sheet, back loose card, and front loose card since the printed art is identical on every card.", "projectionSource": {"referenceImageCrop": "front-card-logo", "delitImage": "delit-full.png", "rectificationNote": "Crop must be perspective-corrected (the card in the source photo is rotated/foreshortened) to a fronto-parallel rectangle matching the card's real aspect ratio (1.585:1) before use as a UV texture -- either via a manual 4-point homography crop in an image tool, or by treating the existing near-frontal view as good enough given its low rotation angle and documenting the residual distortion as a known limitation.", "bakeDescriptorRef": "projection-descriptor.json"}}, "surfaceFrequencyBands": [{"id": "macro", "frequency": 1.0, "amplitude": 0.08, "role": "printed blob-pattern region vs base albedo value breakup (captured in the projected texture itself)"}, {"id": "meso", "frequency": 40.0, "amplitude": 0.05, "role": "visible textured-paper fiber grain, moderate scale"}, {"id": "micro", "frequency": 180.0, "amplitude": 0.02, "role": "fine paper tooth breaking up specular highlights under grazing light"}], "roughness": {"base": 0.8, "variation": 0.08, "map": "independent-procedural-field", "localResponse": "slightly lower roughness (~0.72) on the printed white ink regions (logo/wordmark) vs the uncoated paper base (~0.82-0.85), matching the subtle sheen difference between ink and stock visible in the reference"}, "metalness": {"base": 0.0, "variation": 0.0}, "normal": {"pattern": "derived-from-independent-height-field", "strength": 0.25, "scale": 60.0, "space": "tangent"}, "bump": {"pattern": "fine-paper-grain", "amplitude": 0.015, "scale": 40.0}, "displacement": {"pattern": "none", "amplitude": 0.0, "scale": 1.0, "silhouetteAffects": false}, "ambientOcclusion": {"cavityStrength": 0.1, "contactShadowBias": 0.2, "notes": "Minimal -- the front face is nearly flat; AO mainly matters at the card's own edge bevel and at inter-card contact shadows in the group composition."}, "wear": {"edgeWear": 0.0, "scratches": [], "chips": []}, "dirt": {"amount": 0.0, "cavityBias": 0.0, "color": "#2F2A22"}, "localOverrides": [{"id": "logo-lockup", "region": "upper-middle horizontal band, ~55%-85% of card width, ~30%-60% of card height (normalized UV)", "effect": "flat matte white (#FFFFFF) ink region, roughness ~0.72, carried entirely by the projected texture -- no separate geometry or decal mesh", "evidenceRef": "front-card-logo"}, {"id": "blob-pattern", "region": "diagonal band across the lower-left to upper-right of the card, organic rounded silhouette", "effect": "tonal-only value shift (~+6-8%) at the same hue as the base albedo, carried entirely by the projected texture", "evidenceRef": "full-object"}], "shaderNotes": ["MeshPhysicalMaterial chosen over MeshStandardMaterial to allow a subtle clearcoat=0.05 for the faint print-ink sheen difference without affecting the matte paper base.", "Albedo map IS the de-lit projected reference crop (sRGB color space) -- do not also drive roughness or normal from this same texture; those stay procedural/independent per the anti-shallow-spec rule.", "Load the projected texture with THREE.SRGBColorSpace (see localSpecSearch: core.shader-mapping-srgb-linear-color-space-assignment) since it is a photographed color image, not a data map.", "finishClass/clearcoat/envMapIntensity were corrected after analyze_texture.py auto-applied an incorrect painted-metal heuristic (misread the high-contrast white logo-on-teal crop as a specular highlight); this is matte uncoated paper, confirmed by direct visual inspection in image_analysis layers 5-6."], "notes": "Shared by deck top sheet, looseCardBack, and looseCardFront front faces -- one material instance, reused via MeshBasicMaterial-compatible UV mapping on each card's front-face geometry group.", "finishClass": "matte-uncoated-paper-with-flat-ink-print", "texturePalette": ["#0A3C3B", "#0A4241", "#0B4242", "#1D4E4E", "#043B3A"], "proceduralTexture": "none", "clearcoat": {"base": 0.0, "variation": 0.0}, "clearcoatRoughness": {"base": 0.4, "variation": 0.05}, "transmission": {"base": 0.0, "variation": 0.0}, "ior": {"base": 1.5, "value": 1.5}, "envMapIntensity": 0.04, "referencePbr": {"usable": true, "confidence": 0.751, "estimatedFidelity": 0.751, "maps": {"albedo": {"url": "/material-evidence/cardfront_albedo.png", "path": "/material-evidence/cardfront_albedo.png"}, "roughness": {"url": "/material-evidence/cardfront_roughness.png", "path": "/material-evidence/cardfront_roughness.png"}, "height": {"url": "/material-evidence/cardfront_height.png", "path": "/material-evidence/cardfront_height.png"}, "normal": {"url": "/material-evidence/cardfront_normal.png", "path": "/material-evidence/cardfront_normal.png"}, "ao": {"url": "/material-evidence/cardfront_ao.png", "path": "/material-evidence/cardfront_ao.png"}}, "note": "Extracted from detail-inventory/zone-r1c1.png via extract_pbr_evidence.py. roughnessBase=0.741 closely matches the manually-corrected observed value of 0.8, validating correction of a mis-applied painted-metal heuristic from analyze_texture.py."}},
    options
  );
  materialMap["cardBack"] = createSculptMaterial(
    "cardBack",
    {"id": "cardBack", "name": "Card back face -- plain uncoated stock", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "baseColor": "#0E4A44", "color": "#0E4A44", "albedo": {"dominant": "#0E4A44", "secondary": ["#0A3B36"], "samplingNotes": "Inferred solid brand-teal albedo (no print), per assumptions -- back face is never visible in the reference."}, "colorVariation": {"palette": ["#0E4A44", "#0A3B36"], "pattern": "mottled", "amplitude": 0.04, "heightCorrelation": 0.1}, "textureResolution": 1024, "textureProjection": {"mode": "procedural", "repeat": [1.0, 1.0], "anisotropy": 4, "texelDensityIntent": "Low-frequency procedural paper grain only; no printed content."}, "surfaceFrequencyBands": [{"id": "macro", "frequency": 1.0, "amplitude": 0.02, "role": "flat solid color, negligible breakup"}, {"id": "meso", "frequency": 40.0, "amplitude": 0.05, "role": "same paper fiber grain as front face"}, {"id": "micro", "frequency": 180.0, "amplitude": 0.02, "role": "fine paper tooth"}], "roughness": {"base": 0.82, "variation": 0.06, "map": "independent-procedural-field", "localResponse": "uniform, uncoated stock roughness"}, "metalness": {"base": 0.0, "variation": 0.0}, "normal": {"pattern": "derived-from-independent-height-field", "strength": 0.25, "scale": 60.0, "space": "tangent"}, "bump": {"pattern": "fine-paper-grain", "amplitude": 0.015, "scale": 40.0}, "displacement": {"pattern": "none", "amplitude": 0.0, "scale": 1.0, "silhouetteAffects": false}, "ambientOcclusion": {"cavityStrength": 0.1, "contactShadowBias": 0.2, "notes": "Minimal, flat face."}, "wear": {"edgeWear": 0.0, "scratches": [], "chips": []}, "dirt": {"amount": 0.0, "cavityBias": 0.0, "color": "#2F2A22"}, "localOverrides": [], "shaderNotes": ["Shares the paper-grain bump/normal parameters with cardFront for consistency (same physical stock, only the print differs).", "qualityTier=utility: this material is inferred (cardBack, never observed) or optional scene dressing (backdrop, not part of the core deliverable) -- exempt from the reference-fidelity referencePbr/texture-channel bar per lookDevTargets rules; see assumptions[] and risks[] for the documented limitation."], "notes": "Inferred material (assumptions[]); low confidence by construction since never directly observed.", "qualityTier": "utility"},
    options
  );
  materialMap["cardEdge"] = createSculptMaterial(
    "cardEdge",
    {"id": "cardEdge", "name": "Card edge bevel -- near-black cut-paper edge", "type": "standard", "shaderModel": "MeshStandardMaterial", "baseColor": "#0A0F0E", "color": "#0A0F0E", "albedo": {"dominant": "#0A0F0E", "secondary": ["#141B19"], "samplingNotes": "Near-black, very slightly teal-tinted edge band observed on every card corner crop (front-card-edge, back-card-edge, deck-edge-profile) -- consistent across all three macro instances, distinct from both face materials."}, "colorVariation": {"palette": ["#0A0F0E", "#141B19"], "pattern": "mottled", "amplitude": 0.06, "heightCorrelation": 0.2}, "textureResolution": 1024, "textureProjection": {"mode": "procedural", "repeat": [4.0, 1.0], "anisotropy": 2, "texelDensityIntent": "Thin band, low texel budget justified."}, "surfaceFrequencyBands": [{"id": "macro", "frequency": 1.0, "amplitude": 0.05, "role": "flat dark edge color"}, {"id": "meso", "frequency": 20.0, "amplitude": 0.06, "role": "cut-paper fiber striation along the edge"}, {"id": "micro", "frequency": 90.0, "amplitude": 0.02, "role": "fine grazing-light breakup"}], "roughness": {"base": 0.7, "variation": 0.1, "map": "independent-procedural-field", "localResponse": "uniform"}, "metalness": {"base": 0.0, "variation": 0.0}, "normal": {"pattern": "derived-from-independent-height-field", "strength": 0.2, "scale": 30.0, "space": "tangent"}, "bump": {"pattern": "cut-edge-striation", "amplitude": 0.01, "scale": 20.0}, "displacement": {"pattern": "none", "amplitude": 0.0, "scale": 1.0, "silhouetteAffects": false}, "ambientOcclusion": {"cavityStrength": 0.4, "contactShadowBias": 0.5, "notes": "Edge reads darker partly from occlusion between stacked/overlapping sheets; boost cavity strength here vs the flat faces."}, "wear": {"edgeWear": 0.0, "scratches": [], "chips": []}, "dirt": {"amount": 0.0, "cavityBias": 0.0, "color": "#050807"}, "localOverrides": [], "shaderNotes": ["Applied to the thin side faces of every card BoxGeometry (the extruded thickness faces), distinct from the top/bottom face materials."], "notes": "Shared by deck (all sheet edges, instanced), looseCardBack, and looseCardFront.", "referencePbr": {"usable": true, "confidence": 0.751, "estimatedFidelity": 0.751, "maps": {"albedo": {"url": "/material-evidence/cardedge_albedo.png", "path": "/material-evidence/cardedge_albedo.png"}, "roughness": {"url": "/material-evidence/cardedge_roughness.png", "path": "/material-evidence/cardedge_roughness.png"}, "height": {"url": "/material-evidence/cardedge_height.png", "path": "/material-evidence/cardedge_height.png"}, "normal": {"url": "/material-evidence/cardedge_normal.png", "path": "/material-evidence/cardedge_normal.png"}, "ao": {"url": "/material-evidence/cardedge_ao.png", "path": "/material-evidence/cardedge_ao.png"}}, "note": "Extracted from detail-inventory/zone-r1c2.png via extract_pbr_evidence.py. roughnessBase=0.707 close to the specified 0.7 value."}},
    options
  );
  materialMap["backdrop"] = createSculptMaterial(
    "backdrop",
    {"id": "backdrop", "name": "Scene backdrop -- infinite teal ground plane", "type": "standard", "shaderModel": "MeshStandardMaterial", "baseColor": "#093B36", "color": "#093B36", "albedo": {"dominant": "#093B36", "secondary": ["#0C4C45"], "samplingNotes": "Optional environment dressing, not part of the core deliverable object -- see assumptions[]."}, "colorVariation": {"palette": ["#093B36", "#0C4C45"], "pattern": "gradient", "amplitude": 0.08, "heightCorrelation": 0.0}, "textureResolution": 1024, "textureProjection": {"mode": "procedural", "repeat": [1.0, 1.0], "anisotropy": 4, "texelDensityIntent": "Large flat plane, low texel density acceptable."}, "surfaceFrequencyBands": [{"id": "macro", "frequency": 0.5, "amplitude": 0.08, "role": "soft directional lighting gradient"}, {"id": "meso", "frequency": 10.0, "amplitude": 0.02, "role": "faint paper-adjacent texture noise"}, {"id": "micro", "frequency": 60.0, "amplitude": 0.01, "role": "negligible"}], "roughness": {"base": 0.9, "variation": 0.05, "map": "independent-procedural-field", "localResponse": "uniform"}, "metalness": {"base": 0.0, "variation": 0.0}, "normal": {"pattern": "none", "strength": 0.0, "scale": 1.0, "space": "tangent"}, "bump": {"pattern": "none", "amplitude": 0.0, "scale": 1.0}, "displacement": {"pattern": "none", "amplitude": 0.0, "scale": 1.0, "silhouetteAffects": false}, "ambientOcclusion": {"cavityStrength": 0.0, "contactShadowBias": 0.3, "notes": "Contact shadow under the card group only."}, "wear": {"edgeWear": 0.0, "scratches": [], "chips": []}, "dirt": {"amount": 0.0, "cavityBias": 0.0, "color": "#000000"}, "localOverrides": [], "shaderNotes": ["Optional -- omit entirely for a standalone-prop use case (transparent/no background).", "qualityTier=utility: this material is inferred (cardBack, never observed) or optional scene dressing (backdrop, not part of the core deliverable) -- exempt from the reference-fidelity referencePbr/texture-channel bar per lookDevTargets rules; see assumptions[] and risks[] for the documented limitation."], "notes": "Not gated by the object's own quality contract; include only if a full scene recreation is requested downstream.", "qualityTier": "utility"},
    options
  );

  const nodes: Record<string, THREE.Object3D> = { root };
  const meshes: Record<string, THREE.Mesh> = {};
  const sockets: Record<string, THREE.Object3D> = {};
  const colliders: Record<string, unknown> = {};
  const destructionGroups: Record<string, THREE.Object3D[]> = {};

  const endpoint_deckSheet_0 = makeAttachmentEndpoint(null);
  const node_deckSheet_0 = new THREE.Group();
  node_deckSheet_0.name = "Stacked card deck (repetition source)__pivot";
  node_deckSheet_0.scale.set(1, 1, 1);
  if (endpoint_deckSheet_0) {
    node_deckSheet_0.position.copy(endpoint_deckSheet_0.start);
    node_deckSheet_0.rotation.set(0.0, 12.0, -2.0);
  } else {
    node_deckSheet_0.position.set(-2.4, 0.54, -0.8);
    node_deckSheet_0.rotation.set(0.0, 12.0, -2.0);
  }
  node_deckSheet_0.userData.sculptComponent = {"id": "deckSheet", "name": "Stacked card deck (repetition source)", "level": "macro", "role": "body", "importance": 0.9, "confidence": 0.7, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Single rigid rounded-rect plate with flat faces -- textbook BoxGeometry (or ExtrudeGeometry with a rounded-rect profile for the corner radius), decision-tree rule 4.", "geometryDescriptor": {"topologyIntent": "thin rounded-rect box, corner radius via ExtrudeGeometry rounded-rect shape rather than BoxGeometry+bevelSegments for correct silhouette at grazing angles", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.15, "segments": 2}, "deformationStack": [], "uvStrategy": "planar-front-face-uv-0-to-1, remaining faces use tiled/procedural uv", "normalStrategy": "flat per-face normals with a shared smoothing group only across the small corner-radius chamfer"}, "parent": null, "attachment": null, "dimensions": {"width": 8.56, "height": 0.06, "depth": 5.4, "units": "cm", "confidence": 0.6}, "transform": {"position": [-2.4, 0.54, -0.8], "rotation": [0, 12, -2], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "movable-prop", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": false}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Non-colliding source mesh; instances are visual-only within the deck's own collider."}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "deck-sheet", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1.0, "debrisMaterial": "cardFront"}}, "material": "cardFront", "materialLayers": ["cardFront", "cardBack", "cardEdge"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "corner-radius", "description": "Uniform small rounded corner (~0.15cm radius scaled), the only curvature on the plate.", "evidenceRef": "full-object"}, {"id": "deck-spine-striation", "description": "Visible individual sheet lines along the deck instances leading edge, produced by repetitionSystems.deckSheets planarJitter.", "evidenceRef": "deck-edge-profile"}], "surfaceDetail": {"macroRoughness": 0.8, "microRoughness": 0.15, "bumpAmplitude": 0.015, "normalPattern": "fine-paper-grain", "displacementPattern": "none", "occlusionPattern": "edge-bevel-contact-shadow", "edgeWearPattern": "none", "notes": ""}, "evidenceRefs": ["front-card-logo", "front-card-edge"], "details": [], "fidelityTier": "material", "colorMaterialRecipe": {"dominantAlbedo": "rgba(14, 74, 68, 1.0)", "secondaryAlbedo": "rgba(255, 255, 255, 1.0)", "materialClass": "unknown", "materialClassConfidence": 0.85, "note": "Front face = materials.cardFront (projected teal+white brand art); back face = materials.cardBack (solid teal); side faces = materials.cardEdge (near-black). This is now the sole deck-representing component (the deck/root organizational wrappers were folded in since the generator always emits a mesh per componentTree entry)."}};
  node_deckSheet_0.userData.actionProfile = {"animationRole": "movable-prop", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": false}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Non-colliding source mesh; instances are visual-only within the deck's own collider."}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "deck-sheet", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1.0, "debrisMaterial": "cardFront"}};
  (nodes["root"] ?? root).add(node_deckSheet_0);
  nodes["deckSheet"] = node_deckSheet_0;
  // repetitionSystems.deckSheets: 18 stacked sheet instances (object-sculpt-spec.json).
  // The generator does not implement repetitionSystems, so the instancing is hand-authored
  // here: an InstancedMesh of the same dimensioned card geometry, stacked along local +Y
  // (the card's thickness axis) with a tiny per-instance planar jitter on X/Z so the deck's
  // leading edge reads as discrete sheets (deck-edge-profile evidence) rather than one solid
  // block. Only the topmost instance is meant to show the projected brand texture in a full
  // render pass -- this blockout pass uses one shared material across all instances since
  // InstancedMesh cannot vary materials per-instance without a second draw call.
  const DECK_SHEET_COUNT = 18;
  const DECK_SHEET_THICKNESS_CM = 0.06;
  const deckSheetGeometry = createCardGeometry(8.56, DECK_SHEET_THICKNESS_CM, 5.4, 0.15);
  const mesh_deckSheet_0 = new THREE.InstancedMesh(
    deckSheetGeometry,
    materialMap["cardFront"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 }),
    DECK_SHEET_COUNT,
  );
  mesh_deckSheet_0.name = "Stacked card deck (repetition source)";
  {
    const instanceMatrix = new THREE.Matrix4();
    const instancePosition = new THREE.Vector3();
    const instanceQuaternion = new THREE.Quaternion();
    const instanceScale = new THREE.Vector3(1, 1, 1);
    // Deterministic pseudo-random jitter (seeded) so re-renders are stable, per
    // repetitionSystems.deckSheets.perInstanceVariation in the spec.
    let jitterSeed = 1337;
    const nextJitter = (amplitude: number) => {
      jitterSeed = (jitterSeed * 1103515245 + 12345) & 0x7fffffff;
      return ((jitterSeed / 0x7fffffff) * 2 - 1) * amplitude;
    };
    for (let i = 0; i < DECK_SHEET_COUNT; i += 1) {
      instancePosition.set(
        nextJitter(0.008),
        i * DECK_SHEET_THICKNESS_CM,
        nextJitter(0.008),
      );
      instanceQuaternion.setFromEuler(new THREE.Euler(0, THREE.MathUtils.degToRad(nextJitter(0.15)), 0));
      instanceMatrix.compose(instancePosition, instanceQuaternion, instanceScale);
      mesh_deckSheet_0.setMatrixAt(i, instanceMatrix);
    }
    mesh_deckSheet_0.instanceMatrix.needsUpdate = true;
  }
  mesh_deckSheet_0.castShadow = options.castShadow ?? true;
  mesh_deckSheet_0.receiveShadow = options.receiveShadow ?? true;
  mesh_deckSheet_0.userData.sculptComponent = {"id": "deckSheet", "name": "Stacked card deck (repetition source)", "level": "macro", "role": "body", "importance": 0.9, "confidence": 0.7, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Single rigid rounded-rect plate with flat faces -- textbook BoxGeometry (or ExtrudeGeometry with a rounded-rect profile for the corner radius), decision-tree rule 4.", "geometryDescriptor": {"topologyIntent": "thin rounded-rect box, corner radius via ExtrudeGeometry rounded-rect shape rather than BoxGeometry+bevelSegments for correct silhouette at grazing angles", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.15, "segments": 2}, "deformationStack": [], "uvStrategy": "planar-front-face-uv-0-to-1, remaining faces use tiled/procedural uv", "normalStrategy": "flat per-face normals with a shared smoothing group only across the small corner-radius chamfer"}, "parent": null, "attachment": null, "dimensions": {"width": 8.56, "height": 0.06, "depth": 5.4, "units": "cm", "confidence": 0.6}, "transform": {"position": [-2.4, 0.54, -0.8], "rotation": [0, 12, -2], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "movable-prop", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": false}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Non-colliding source mesh; instances are visual-only within the deck's own collider."}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "deck-sheet", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1.0, "debrisMaterial": "cardFront"}}, "material": "cardFront", "materialLayers": ["cardFront", "cardBack", "cardEdge"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "corner-radius", "description": "Uniform small rounded corner (~0.15cm radius scaled), the only curvature on the plate.", "evidenceRef": "full-object"}, {"id": "deck-spine-striation", "description": "Visible individual sheet lines along the deck instances leading edge, produced by repetitionSystems.deckSheets planarJitter.", "evidenceRef": "deck-edge-profile"}], "surfaceDetail": {"macroRoughness": 0.8, "microRoughness": 0.15, "bumpAmplitude": 0.015, "normalPattern": "fine-paper-grain", "displacementPattern": "none", "occlusionPattern": "edge-bevel-contact-shadow", "edgeWearPattern": "none", "notes": ""}, "evidenceRefs": ["front-card-logo", "front-card-edge"], "details": [], "fidelityTier": "material", "colorMaterialRecipe": {"dominantAlbedo": "rgba(14, 74, 68, 1.0)", "secondaryAlbedo": "rgba(255, 255, 255, 1.0)", "materialClass": "unknown", "materialClassConfidence": 0.85, "note": "Front face = materials.cardFront (projected teal+white brand art); back face = materials.cardBack (solid teal); side faces = materials.cardEdge (near-black). This is now the sole deck-representing component (the deck/root organizational wrappers were folded in since the generator always emits a mesh per componentTree entry)."}};
  node_deckSheet_0.add(mesh_deckSheet_0);
  meshes["deckSheet"] = mesh_deckSheet_0;
  colliders["deckSheet"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Non-colliding source mesh; instances are visual-only within the deck's own collider."};
  destructionGroups["deck-sheet"] ??= [];
  destructionGroups["deck-sheet"].push(node_deckSheet_0);

  const endpoint_looseCardBack_1 = makeAttachmentEndpoint(null);
  const node_looseCardBack_1 = new THREE.Group();
  node_looseCardBack_1.name = "Loose card (rear, partially occluded)__pivot";
  node_looseCardBack_1.scale.set(1, 1, 1);
  if (endpoint_looseCardBack_1) {
    node_looseCardBack_1.position.copy(endpoint_looseCardBack_1.start);
    node_looseCardBack_1.rotation.set(0.0, -15.0, 3.0);
  } else {
    node_looseCardBack_1.position.set(0.6, 0.62, 0.9);
    node_looseCardBack_1.rotation.set(0.0, -15.0, 3.0);
  }
  node_looseCardBack_1.userData.sculptComponent = {"id": "looseCardBack", "name": "Loose card (rear, partially occluded)", "level": "macro", "role": "body", "importance": 0.85, "confidence": 0.7, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Same as deckSheet -- single rigid rounded-rect plate.", "geometryDescriptor": {"topologyIntent": "thin rounded-rect box, corner radius via ExtrudeGeometry rounded-rect shape", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.15, "segments": 2}, "deformationStack": [], "uvStrategy": "planar-front-face-uv-0-to-1, remaining faces use tiled/procedural uv", "normalStrategy": "flat per-face normals with a shared smoothing group only across the small corner-radius chamfer"}, "parent": null, "attachment": {"parentSocket": "scene.origin", "localStart": [0, 0, 0], "localEnd": [0, 0, 0], "contactType": "resting-on-deck-corner", "embedDepth": 0.0, "overlap": 0.02, "gapTolerance": 0.02}, "dimensions": {"width": 8.56, "height": 0.06, "depth": 5.4, "units": "cm", "confidence": 0.65}, "transform": {"position": [0.6, 0.62, 0.9], "rotation": [0, -15, 3], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "movable-prop", "pivot": {"mode": "base-center", "localPosition": [0, -0.03, 0], "axis": [0, 1, 0], "confidence": 0.65}, "transformChannels": {"translate": true, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": false}, "sockets": [{"id": "back-card-top", "localPosition": [0, 0.03, 0], "note": "Socket looseCardFront rests against."}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": ""}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "loose-card-back", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1.0, "debrisMaterial": "cardFront"}}, "material": "cardFront", "materialLayers": ["cardFront", "cardBack", "cardEdge"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "corner-radius", "description": "Uniform small rounded corner, matches deckSheet.", "evidenceRef": "full-object"}, {"id": "occlusion-note", "description": "Roughly 60% of this card's face is occluded by looseCardFront in the reference camera; the full front-face texture should still be authored (visible on turntable review from other angles) even though only a partial crescent is visible in the primary view.", "evidenceRef": "full-object"}], "surfaceDetail": {"macroRoughness": 0.8, "microRoughness": 0.15, "bumpAmplitude": 0.015, "normalPattern": "fine-paper-grain", "displacementPattern": "none", "occlusionPattern": "edge-bevel-contact-shadow-plus-overlap-shadow-from-front-card", "edgeWearPattern": "none", "notes": ""}, "evidenceRefs": ["full-object", "back-card-edge"], "details": [], "fidelityTier": "material", "colorMaterialRecipe": {"dominantAlbedo": "rgba(14, 74, 68, 1.0)", "secondaryAlbedo": "rgba(255, 255, 255, 1.0)", "materialClass": "unknown", "materialClassConfidence": 0.85, "note": "Same three-material split as deckSheet."}};
  node_looseCardBack_1.userData.actionProfile = {"animationRole": "movable-prop", "pivot": {"mode": "base-center", "localPosition": [0, -0.03, 0], "axis": [0, 1, 0], "confidence": 0.65}, "transformChannels": {"translate": true, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": false}, "sockets": [{"id": "back-card-top", "localPosition": [0, 0.03, 0], "note": "Socket looseCardFront rests against."}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": ""}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "loose-card-back", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1.0, "debrisMaterial": "cardFront"}};
  (nodes["root"] ?? root).add(node_looseCardBack_1);
  nodes["looseCardBack"] = node_looseCardBack_1;
  const mesh_looseCardBack_1 = new THREE.Mesh(
    createCardGeometry(8.56, 0.06, 5.4, 0.15),
    materialMap["cardFront"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_looseCardBack_1.name = "Loose card (rear, partially occluded)";
  mesh_looseCardBack_1.castShadow = options.castShadow ?? true;
  mesh_looseCardBack_1.receiveShadow = options.receiveShadow ?? true;
  mesh_looseCardBack_1.userData.sculptComponent = {"id": "looseCardBack", "name": "Loose card (rear, partially occluded)", "level": "macro", "role": "body", "importance": 0.85, "confidence": 0.7, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Same as deckSheet -- single rigid rounded-rect plate.", "geometryDescriptor": {"topologyIntent": "thin rounded-rect box, corner radius via ExtrudeGeometry rounded-rect shape", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.15, "segments": 2}, "deformationStack": [], "uvStrategy": "planar-front-face-uv-0-to-1, remaining faces use tiled/procedural uv", "normalStrategy": "flat per-face normals with a shared smoothing group only across the small corner-radius chamfer"}, "parent": null, "attachment": {"parentSocket": "scene.origin", "localStart": [0, 0, 0], "localEnd": [0, 0, 0], "contactType": "resting-on-deck-corner", "embedDepth": 0.0, "overlap": 0.02, "gapTolerance": 0.02}, "dimensions": {"width": 8.56, "height": 0.06, "depth": 5.4, "units": "cm", "confidence": 0.65}, "transform": {"position": [0.6, 0.62, 0.9], "rotation": [0, -15, 3], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "movable-prop", "pivot": {"mode": "base-center", "localPosition": [0, -0.03, 0], "axis": [0, 1, 0], "confidence": 0.65}, "transformChannels": {"translate": true, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": false}, "sockets": [{"id": "back-card-top", "localPosition": [0, 0.03, 0], "note": "Socket looseCardFront rests against."}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": ""}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "loose-card-back", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1.0, "debrisMaterial": "cardFront"}}, "material": "cardFront", "materialLayers": ["cardFront", "cardBack", "cardEdge"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "corner-radius", "description": "Uniform small rounded corner, matches deckSheet.", "evidenceRef": "full-object"}, {"id": "occlusion-note", "description": "Roughly 60% of this card's face is occluded by looseCardFront in the reference camera; the full front-face texture should still be authored (visible on turntable review from other angles) even though only a partial crescent is visible in the primary view.", "evidenceRef": "full-object"}], "surfaceDetail": {"macroRoughness": 0.8, "microRoughness": 0.15, "bumpAmplitude": 0.015, "normalPattern": "fine-paper-grain", "displacementPattern": "none", "occlusionPattern": "edge-bevel-contact-shadow-plus-overlap-shadow-from-front-card", "edgeWearPattern": "none", "notes": ""}, "evidenceRefs": ["full-object", "back-card-edge"], "details": [], "fidelityTier": "material", "colorMaterialRecipe": {"dominantAlbedo": "rgba(14, 74, 68, 1.0)", "secondaryAlbedo": "rgba(255, 255, 255, 1.0)", "materialClass": "unknown", "materialClassConfidence": 0.85, "note": "Same three-material split as deckSheet."}};
  node_looseCardBack_1.add(mesh_looseCardBack_1);
  meshes["looseCardBack"] = mesh_looseCardBack_1;
  colliders["looseCardBack"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": ""};
  destructionGroups["loose-card-back"] ??= [];
  destructionGroups["loose-card-back"].push(node_looseCardBack_1);
  const socket_looseCardBack_back_card_top_0 = new THREE.Object3D();
  socket_looseCardBack_back_card_top_0.name = "back-card-top";
  socket_looseCardBack_back_card_top_0.position.set(0.0, 0.03, 0.0);
  socket_looseCardBack_back_card_top_0.rotation.set(0, 0, 0);
  socket_looseCardBack_back_card_top_0.userData.socket = {"id": "back-card-top", "localPosition": [0, 0.03, 0], "note": "Socket looseCardFront rests against."};
  node_looseCardBack_1.add(socket_looseCardBack_back_card_top_0);
  sockets["looseCardBack:back-card-top"] = socket_looseCardBack_back_card_top_0;

  const endpoint_looseCardFront_2 = makeAttachmentEndpoint(null);
  const node_looseCardFront_2 = new THREE.Group();
  node_looseCardFront_2.name = "Loose card (front, topmost, camera-nearest)__pivot";
  node_looseCardFront_2.scale.set(1, 1, 1);
  if (endpoint_looseCardFront_2) {
    node_looseCardFront_2.position.copy(endpoint_looseCardFront_2.start);
    node_looseCardFront_2.rotation.set(0.0, -22.0, -4.0);
  } else {
    node_looseCardFront_2.position.set(1.6, 0.72, -0.3);
    node_looseCardFront_2.rotation.set(0.0, -22.0, -4.0);
  }
  node_looseCardFront_2.userData.sculptComponent = {"id": "looseCardFront", "name": "Loose card (front, topmost, camera-nearest)", "level": "macro", "role": "body", "importance": 1.0, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Same as deckSheet -- single rigid rounded-rect plate. This is the highest-confidence, least-occluded, least-distorted instance and the primary source for the front-face texture crop.", "geometryDescriptor": {"topologyIntent": "thin rounded-rect box, corner radius via ExtrudeGeometry rounded-rect shape", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.15, "segments": 2}, "deformationStack": [], "uvStrategy": "planar-front-face-uv-0-to-1, remaining faces use tiled/procedural uv", "normalStrategy": "flat per-face normals with a shared smoothing group only across the small corner-radius chamfer"}, "parent": null, "attachment": {"parentSocket": "looseCardBack.top-face", "localStart": [0, 0, 0], "localEnd": [0, 0, 0], "contactType": "overlap", "embedDepth": 0.0, "overlap": 0.02, "gapTolerance": 0.03}, "dimensions": {"width": 8.56, "height": 0.06, "depth": 5.4, "units": "cm", "confidence": 0.7}, "transform": {"position": [1.6, 0.72, -0.3], "rotation": [0, -22, -4], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "movable-prop", "pivot": {"mode": "base-center", "localPosition": [0, -0.03, 0], "axis": [0, 1, 0], "confidence": 0.7}, "transformChannels": {"translate": true, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": false}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": ""}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "loose-card-front", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1.0, "debrisMaterial": "cardFront"}}, "material": "cardFront", "materialLayers": ["cardFront", "cardBack", "cardEdge"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "corner-radius", "description": "Uniform small rounded corner, matches deckSheet.", "evidenceRef": "full-object"}, {"id": "full-logo-lockup", "description": "This is the instance where the full cloud-icon + wordmark lockup is unoccluded and least distorted -- primary evidence source for materials.cardFront's projected texture crop.", "evidenceRef": "front-card-logo"}], "surfaceDetail": {"macroRoughness": 0.8, "microRoughness": 0.15, "bumpAmplitude": 0.015, "normalPattern": "fine-paper-grain", "displacementPattern": "none", "occlusionPattern": "edge-bevel-contact-shadow-cast-onto-back-card", "edgeWearPattern": "none", "notes": ""}, "evidenceRefs": ["full-object", "front-card-logo", "front-card-edge"], "details": [], "fidelityTier": "material", "colorMaterialRecipe": {"dominantAlbedo": "rgba(14, 74, 68, 1.0)", "secondaryAlbedo": "rgba(255, 255, 255, 1.0)", "materialClass": "unknown", "materialClassConfidence": 0.85, "note": "Same three-material split as deckSheet; this instance is the primary logo-visibility reference."}};
  node_looseCardFront_2.userData.actionProfile = {"animationRole": "movable-prop", "pivot": {"mode": "base-center", "localPosition": [0, -0.03, 0], "axis": [0, 1, 0], "confidence": 0.7}, "transformChannels": {"translate": true, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": false}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": ""}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "loose-card-front", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1.0, "debrisMaterial": "cardFront"}};
  (nodes["root"] ?? root).add(node_looseCardFront_2);
  nodes["looseCardFront"] = node_looseCardFront_2;
  const mesh_looseCardFront_2 = new THREE.Mesh(
    createCardGeometry(8.56, 0.06, 5.4, 0.15),
    materialMap["cardFront"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_looseCardFront_2.name = "Loose card (front, topmost, camera-nearest)";
  mesh_looseCardFront_2.castShadow = options.castShadow ?? true;
  mesh_looseCardFront_2.receiveShadow = options.receiveShadow ?? true;
  mesh_looseCardFront_2.userData.sculptComponent = {"id": "looseCardFront", "name": "Loose card (front, topmost, camera-nearest)", "level": "macro", "role": "body", "importance": 1.0, "confidence": 0.9, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Same as deckSheet -- single rigid rounded-rect plate. This is the highest-confidence, least-occluded, least-distorted instance and the primary source for the front-face texture crop.", "geometryDescriptor": {"topologyIntent": "thin rounded-rect box, corner radius via ExtrudeGeometry rounded-rect shape", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.15, "segments": 2}, "deformationStack": [], "uvStrategy": "planar-front-face-uv-0-to-1, remaining faces use tiled/procedural uv", "normalStrategy": "flat per-face normals with a shared smoothing group only across the small corner-radius chamfer"}, "parent": null, "attachment": {"parentSocket": "looseCardBack.top-face", "localStart": [0, 0, 0], "localEnd": [0, 0, 0], "contactType": "overlap", "embedDepth": 0.0, "overlap": 0.02, "gapTolerance": 0.03}, "dimensions": {"width": 8.56, "height": 0.06, "depth": 5.4, "units": "cm", "confidence": 0.7}, "transform": {"position": [1.6, 0.72, -0.3], "rotation": [0, -22, -4], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "movable-prop", "pivot": {"mode": "base-center", "localPosition": [0, -0.03, 0], "axis": [0, 1, 0], "confidence": 0.7}, "transformChannels": {"translate": true, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": false}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": ""}, "constraints": [], "destruction": {"breakable": true, "fractureGroup": "loose-card-front", "seamRefs": [], "detachableFragments": [], "breakImpulse": 1.0, "debrisMaterial": "cardFront"}}, "material": "cardFront", "materialLayers": ["cardFront", "cardBack", "cardEdge"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "corner-radius", "description": "Uniform small rounded corner, matches deckSheet.", "evidenceRef": "full-object"}, {"id": "full-logo-lockup", "description": "This is the instance where the full cloud-icon + wordmark lockup is unoccluded and least distorted -- primary evidence source for materials.cardFront's projected texture crop.", "evidenceRef": "front-card-logo"}], "surfaceDetail": {"macroRoughness": 0.8, "microRoughness": 0.15, "bumpAmplitude": 0.015, "normalPattern": "fine-paper-grain", "displacementPattern": "none", "occlusionPattern": "edge-bevel-contact-shadow-cast-onto-back-card", "edgeWearPattern": "none", "notes": ""}, "evidenceRefs": ["full-object", "front-card-logo", "front-card-edge"], "details": [], "fidelityTier": "material", "colorMaterialRecipe": {"dominantAlbedo": "rgba(14, 74, 68, 1.0)", "secondaryAlbedo": "rgba(255, 255, 255, 1.0)", "materialClass": "unknown", "materialClassConfidence": 0.85, "note": "Same three-material split as deckSheet; this instance is the primary logo-visibility reference."}};
  node_looseCardFront_2.add(mesh_looseCardFront_2);
  meshes["looseCardFront"] = mesh_looseCardFront_2;
  colliders["looseCardFront"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": ""};
  destructionGroups["loose-card-front"] ??= [];
  destructionGroups["loose-card-front"].push(node_looseCardFront_2);

  root.userData.sculptRuntime = { nodes, meshes, sockets, colliders, destructionGroups } satisfies ProceduralModelRuntime;
  root.userData.lookDevTargets = {"qualityPriority": "reference-fidelity", "materialPass": {"albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": {"requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": true, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "single-image extraction is reference-derived inference, not exact photogrammetry"}, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"]}, "lightingPass": {"requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"], "exposureNote": "Reference reads as a moderately low-key exposure (dark teal dominates the value range); tone mapping should preserve the white logo/wordmark highlight without blowing it out while keeping shadow regions from crushing to pure black.", "toneMapping": "ACESFilmic, moderate exposure (~1.0), matches the reference photo value range", "background": "materials.backdrop (optional) or transparent for standalone-prop use", "contactShadow": "Soft contact shadow under the deck and under looseCardBack/looseCardFront where they rest on/overlap each other, matching the soft shadow visible beneath looseCardFront in the reference."}, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."]};
  root.userData.actionReadiness = {
    note: 'Use root.userData.sculptRuntime.nodes for transforms, sockets for attachments, colliders for physics proxies, and destructionGroups for breakable sets.',
  };
  return root;
}

export function createCompensaTuViajeBusinessCardStackLookDevLights(
  mode: 'neutral' | 'grazing' | 'reference' = 'neutral',
): THREE.Group {
  const lights = new THREE.Group();
  lights.name = "CompensaTuViaje Business Card Stack look-dev lights";
  const hemi = new THREE.HemisphereLight(
    mode === 'reference' ? 0xfff0d6 : 0xf2f4ff,
    0x363b42,
    mode === 'grazing' ? 0.28 : mode === 'reference' ? 0.72 : 0.85,
  );
  lights.add(hemi);
  const key = new THREE.DirectionalLight(
    mode === 'reference' ? 0xffcf8a : 0xfff4e8,
    mode === 'grazing' ? 4.2 : mode === 'reference' ? 2.6 : 2.15,
  );
  if (mode === 'grazing') key.position.set(7.5, 1.1, 4.0);
  else if (mode === 'reference') key.position.set(-4.5, 7.5, 5.0);
  else key.position.set(-4.0, 6.0, 5.5);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.018;
  key.shadow.radius = 7;
  key.shadow.blurSamples = 24;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -2.6;
  key.shadow.camera.right = 2.6;
  key.shadow.camera.top = 2.6;
  key.shadow.camera.bottom = -2.6;
  key.shadow.camera.updateProjectionMatrix();
  lights.add(key);
  const fill = new THREE.DirectionalLight(0xa8c4ff, mode === 'grazing' ? 0.12 : 0.42);
  fill.position.set(4.0, 3.0, 3.5);
  lights.add(fill);
  const rim = new THREE.DirectionalLight(0xfff1c4, mode === 'grazing' ? 0.28 : 0.85);
  rim.position.set(0.5, 4.5, -6.0);
  lights.add(rim);
  lights.userData.reviewMode = mode;
  lights.userData.lightingFromPhoto = [{"role": "key", "direction": "upper-left, roughly 45deg above and to the left of the card group", "colorTemperature": "neutral-cool, close to the scene teal hue (colored bounce/ambient, not a pure white key)", "intensity": "moderate -- soft-edged highlight on the deck top face and looseCardFront, no hard specular hotspot", "evidenceRef": "full-object"}, {"role": "fill", "direction": "broad, low-contrast ambient fill from the backdrop itself (bounce light off the large teal ground plane)", "colorTemperature": "matches backdrop teal", "intensity": "low, keeps shadow regions (deck spine, card overlap gap) from going fully black", "evidenceRef": "full-object"}, {"role": "rim-or-environment", "direction": "none observed as a distinct rim light -- the composition relies on key+fill only, no separate backlight/rim edge highlight visible on any card silhouette", "colorTemperature": "n/a", "intensity": "n/a", "evidenceRef": "full-object"}, {"role": "exposure-and-tonemapping", "exposure": "Moderately low-key exposure (~1.0), matches the dark-teal-dominant value range of the reference photo.", "toneMapping": "ACESFilmic -- preserves the white logo/wordmark highlight without blowing it out while keeping shadow regions from crushing to pure black.", "background": "materials.backdrop (optional) or transparent for standalone-prop use.", "contactShadow": "Soft contact shadow / ambient occlusion under the deck and under looseCardBack/looseCardFront where they rest on or overlap each other, matching the soft ground shadow visible beneath looseCardFront in the reference.", "evidenceRef": "full-object"}];
  lights.userData.lookDevTargets = {"qualityPriority": "reference-fidelity", "materialPass": {"albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": {"requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": true, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "single-image extraction is reference-derived inference, not exact photogrammetry"}, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"]}, "lightingPass": {"requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"], "exposureNote": "Reference reads as a moderately low-key exposure (dark teal dominates the value range); tone mapping should preserve the white logo/wordmark highlight without blowing it out while keeping shadow regions from crushing to pure black.", "toneMapping": "ACESFilmic, moderate exposure (~1.0), matches the reference photo value range", "background": "materials.backdrop (optional) or transparent for standalone-prop use", "contactShadow": "Soft contact shadow under the deck and under looseCardBack/looseCardFront where they rest on/overlap each other, matching the soft shadow visible beneath looseCardFront in the reference."}, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."]};
  return lights;
}

// PBR materials (clearcoat/iridescence/transmission/anisotropy) need an environment
// map to visually behave as intended — call this once per renderer and assign the
// result to scene.environment before rendering. No external HDR asset required.
export function createCompensaTuViajeBusinessCardStackEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return texture;
}

// Plan 1.3 §3.2 — auto-framing by bounding box. The Divine Eye can only compare a
// render to the reference if the object is FRAMED consistently (an object framed
// differently scores as wrong even when its shape is right). This positions the camera
// deterministically from the object's bounding box so it fills the frame at a stable
// margin, and sets near/far to the object scale. Call after adding the model to the
// scene, and again on resize (after updating camera.aspect).
export function frameCompensaTuViajeBusinessCardStackCamera(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  options: { margin?: number; azimuthDeg?: number; elevationDeg?: number } = {},
): void {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const margin = options.margin ?? 1.15;
  const maxDim = Math.max(size.x, size.y, size.z) * margin;
  const fov = (camera.fov * Math.PI) / 180;
  // distance so the largest object dimension fits vertically in the frame
  const distance = (maxDim / 2) / Math.tan(fov / 2);
  const az = ((options.azimuthDeg ?? 0) * Math.PI) / 180;
  const el = ((options.elevationDeg ?? 0) * Math.PI) / 180;
  const dir = new THREE.Vector3(
    Math.sin(az) * Math.cos(el),
    Math.sin(el),
    Math.cos(az) * Math.cos(el),
  );
  camera.position.copy(center).addScaledVector(dir, distance);
  camera.near = Math.max(0.01, distance - maxDim);
  camera.far = distance + maxDim * 2;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}

// Plan 1.3 §3.2c — PRESENTATION composer (DOF + bloom). CRITICAL (R-POSTFX): this is
// for the showcase/hero render ONLY. The Divine Eye's EVALUATION render MUST use a
// plain renderer with NO composer — bloom blows highlights and DOF blurs edges, which
// would corrupt the deterministic IoU/DCD/edge/blowout signals. Enable dof/bloom ONLY
// when the reference photo actually exhibits them (detect_reference_effects.py authorizes).
export function createCompensaTuViajeBusinessCardStackPresentationComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: { dof?: boolean; bloom?: boolean; bloomStrength?: number; dofFocus?: number; dofAperture?: number } = {},
): EffectComposer {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  if (options.dof) {
    composer.addPass(new BokehPass(scene, camera, {
      focus: options.dofFocus ?? 10.0,
      aperture: options.dofAperture ?? 0.0002,
      maxblur: 0.01,
    }));
  }
  if (options.bloom) {
    const size = new THREE.Vector2();
    renderer.getSize(size);
    composer.addPass(new UnrealBloomPass(size, options.bloomStrength ?? 0.4, 0.4, 0.85));
  }
  return composer;
}

export function configureCompensaTuViajeBusinessCardStackRenderer(renderer: THREE.WebGLRenderer): void {
  // Load-bearing for view-dependent finishes (anodized / Doppler): without ACES + sRGB
  // the environment reflection reads flat/washed instead of a believable metal response.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
}

export function createCompensaTuViajeBusinessCardStackInspectControls(
  camera: THREE.Camera,
  domElement: HTMLElement,
): OrbitControls {
  // View-dependent finishes only read correctly once the user orbits — their color
  // comes from the environment reflection, not albedo, so free rotation matters here.
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.minDistance = 1.0;
  controls.maxDistance = 8.0;
  controls.autoRotate = false;
  return controls;
}
