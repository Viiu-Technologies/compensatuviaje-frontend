import React from 'react';

let webglSupport: boolean | null = null;

/**
 * Detecta si el navegador puede crear un contexto WebGL.
 * Seguro en SSR (devuelve true para no bloquear el render del servidor) y
 * cacheado: el contexto de prueba se crea una sola vez.
 */
export function hasWebGL(): boolean {
  if (typeof document === 'undefined') return true;
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    webglSupport = !!gl;
    // Libera el contexto de prueba para no gastar uno de los pocos disponibles.
    (gl as WebGLRenderingContext | null)
      ?.getExtension('WEBGL_lose_context')
      ?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/**
 * Pantallas táctiles o pequeñas: se usa para bajar el costo de GPU/CPU
 * (sin antialias, dpr 1, potencia por defecto). Seguro en SSR.
 */
export function isLowPowerDevice(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(max-width: 768px)').matches
  );
}

interface WebGLBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface WebGLBoundaryState {
  failed: boolean;
}

/**
 * Error boundary para los Canvas 3D: si WebGL no está disponible o el Canvas
 * lanza un error, se muestra un fallback estático en vez de dejar la página
 * en blanco. No expone el texto del error al usuario.
 */
export class WebGLBoundary extends React.Component<WebGLBoundaryProps, WebGLBoundaryState> {
  state: WebGLBoundaryState = { failed: false };

  static getDerivedStateFromError(): WebGLBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) console.warn('[WebGLBoundary]', error);
  }

  render() {
    if (this.state.failed || !hasWebGL()) return this.props.fallback;
    return this.props.children;
  }
}

export default WebGLBoundary;
