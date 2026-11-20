import React, { useEffect, useRef } from 'react';

interface Spore {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  phase: number;
  freq: number;
  maxAlpha: number;
  hue: 'emerald' | 'mint' | 'warm';
  driftAmp: number;
}

interface WaterRipple {
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  phase: number;
  speed: number;
  maxAlpha: number;
}

const SPORE_COLORS: Record<Spore['hue'], [number, number, number]> = {
  emerald: [118, 228, 108],
  mint: [176, 245, 168],
  warm: [224, 250, 200],
};

/**
 * Capa atmosférica en Canvas 2D para el registro inmersivo:
 * - Esporas bioluminiscentes que ascienden suavemente en la copa del bosque.
 * - Bruma sutil en la línea del lago y reflejos vivos sobre el agua oscura.
 * - Reacción sutil al puntero en escritorio y pausa automática con
 *   prefers-reduced-motion o cuando la pestaña queda oculta.
 */
const LivingForestCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let rafId = 0;
    let pointerX = 0;
    let pointerY = 0;
    let smoothPx = 0;
    let smoothPy = 0;

    const spores: Spore[] = [];
    const ripples: WaterRipple[] = [];

    const seedScene = () => {
      spores.length = 0;
      ripples.length = 0;

      const stageWidth = Math.min(width, Math.max(420, height * 0.62));
      const stageLeft = (width - stageWidth) * 0.5;
      const count = width < 640 ? 10 : 14;
      const hues: Spore['hue'][] = ['emerald', 'mint', 'warm'];

      for (let i = 0; i < count; i++) {
        // Concentradas alrededor de la copa iluminada del árbol (33% a 68% de alto),
        // evitando invadir el área superior del titular.
        const centeredBias = (Math.random() + Math.random()) * 0.5;
        spores.push({
          x: stageLeft + (0.08 + centeredBias * 0.84) * stageWidth,
          y: height * (0.33 + Math.random() * 0.35),
          radius: 1.0 + Math.random() * 1.9,
          vx: (Math.random() - 0.5) * 0.14,
          vy: -(0.07 + Math.random() * 0.16),
          phase: Math.random() * Math.PI * 2,
          freq: 0.0007 + Math.random() * 0.0012,
          maxAlpha: 0.28 + Math.random() * 0.48,
          hue: hues[i % hues.length],
          driftAmp: 0.14 + Math.random() * 0.28,
        });
      }

      // Ondas luminosas muy tenues sobre el reflejo del árbol en el agua (69% a 92%)
      for (let i = 0; i < 14; i++) {
        const t = i / 13;
        ripples.push({
          xRatio: 0.5 + (Math.random() - 0.5) * (0.22 - t * 0.08),
          yRatio: 0.70 + t * 0.21,
          widthRatio: 0.09 + (1 - Math.abs(t - 0.4)) * 0.16 + Math.random() * 0.06,
          phase: Math.random() * Math.PI * 2,
          speed: 0.0005 + Math.random() * 0.0007,
          maxAlpha: 0.045 + (1 - t * 0.5) * 0.065,
        });
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedScene();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointerX = (e.clientX / Math.max(1, width) - 0.5) * 2;
      pointerY = (e.clientY / Math.max(1, height) - 0.5) * 2;
    };

    const renderFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      smoothPx += (pointerX - smoothPx) * 0.04;
      smoothPy += (pointerY - smoothPy) * 0.04;

      const stageWidth = Math.min(width, Math.max(420, height * 0.62));
      const stageLeft = (width - stageWidth) * 0.5;
      const waterlineY = height * 0.688;

      // 1. Bruma sutil en la línea del agua (separa el tronco de su reflejo)
      const mistShift = Math.sin(time * 0.00022) * 18;
      const mistGrad = ctx.createRadialGradient(
        width * 0.5 + mistShift,
        waterlineY,
        stageWidth * 0.05,
        width * 0.5 + mistShift,
        waterlineY,
        stageWidth * 0.62,
      );
      mistGrad.addColorStop(0, 'rgba(147, 220, 136, 0.08)');
      mistGrad.addColorStop(0.55, 'rgba(42, 118, 72, 0.035)');
      mistGrad.addColorStop(1, 'rgba(2, 10, 7, 0)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, waterlineY - 38, width, 76);

      // 2. Micro-ondulaciones de luz reflejada en el agua oscura
      ctx.save();
      for (const r of ripples) {
        const wave = Math.sin(time * r.speed + r.phase);
        const alpha = r.maxAlpha * (0.45 + 0.55 * (wave * 0.5 + 0.5));
        const cx = stageLeft + r.xRatio * stageWidth + wave * 9 - smoothPx * 5;
        const cy = r.yRatio * height;
        const rw = r.widthRatio * stageWidth;

        const grad = ctx.createLinearGradient(cx - rw * 0.5, cy, cx + rw * 0.5, cy);
        grad.addColorStop(0, 'rgba(84, 184, 86, 0)');
        grad.addColorStop(0.5, `rgba(136, 226, 126, ${alpha.toFixed(3)})`);
        grad.addColorStop(1, 'rgba(84, 184, 86, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(cx - rw * 0.5, cy, rw, 1.35);
      }
      ctx.restore();

      // 3. Luciérnagas nítidas y sutiles alrededor de la copa del árbol
      for (const s of spores) {
        if (!reducedMotion) {
          s.x += s.vx + Math.sin(time * 0.0006 + s.phase) * s.driftAmp + smoothPx * 0.08;
          s.y += s.vy + smoothPy * 0.04;

          if (s.y < height * 0.33) {
            s.y = height * (0.64 + Math.random() * 0.04);
            const centeredBias = (Math.random() + Math.random()) * 0.5;
            s.x = stageLeft + (0.1 + centeredBias * 0.8) * stageWidth;
          }
          if (s.x < stageLeft - 20) s.x = stageLeft + stageWidth + 15;
          if (s.x > stageLeft + stageWidth + 20) s.x = stageLeft - 15;
        }

        const pulse = 0.35 + 0.65 * ((Math.sin(time * s.freq + s.phase) + 1) * 0.5);
        const alpha = s.maxAlpha * pulse;
        const [r, g, b] = SPORE_COLORS[s.hue];

        // Pasada 1: halo esmeralda ceñido
        const haloRadius = s.radius * 2.4;
        const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, haloRadius);
        halo.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${(alpha * 0.32).toFixed(3)})`);
        halo.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(s.x, s.y, haloRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pasada 2: núcleo puntual luminoso de clorofila
        const coreRadius = Math.max(0.75, s.radius * 0.55);
        ctx.fillStyle = `rgba(242, 255, 236, ${Math.min(1, alpha * 1.25).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, coreRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    resize();

    if (reducedMotion) {
      renderFrame(0);
      window.addEventListener('resize', resize);
      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    const loop = (time: number) => {
      if (!document.hidden) {
        renderFrame(time);
      }
      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};

export default LivingForestCanvas;
