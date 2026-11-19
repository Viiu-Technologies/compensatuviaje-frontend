import { useEffect, useState } from 'react';

/**
 * Texto de ejemplo para el placeholder de un cuadro de texto: escribe cada
 * frase letra a letra, la deja un momento y la borra antes de pasar a la
 * siguiente.
 *
 * - Solo corre mientras `active` (p. ej. cuadro vacío y sin conversación).
 * - Da dos vueltas y se detiene en `fallback`: no se queda moviéndose para
 *   siempre junto al resto de la página (WCAG 2.2.2).
 * - Con prefers-reduced-motion no escribe: muestra `fallback` fijo.
 */
const TYPE_MS = 38;
const ERASE_MS = 16;
const HOLD_MS = 1700;
const GAP_MS = 350;
const ROUNDS = 2;

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useTypewriterPlaceholder(phrases: string[], fallback: string, active: boolean): string {
  const [text, setText] = useState(fallback);

  useEffect(() => {
    if (!active || phrases.length === 0 || reducedMotion()) {
      setText(fallback);
      return;
    }
    let timer: number | undefined;
    let phrase = 0;
    let chars = 0;
    let erasing = false;
    let round = 0;

    const step = () => {
      const current = phrases[phrase];
      if (!erasing) {
        chars += 1;
        setText(current.slice(0, chars));
        if (chars < current.length) {
          timer = window.setTimeout(step, TYPE_MS);
        } else {
          erasing = true;
          timer = window.setTimeout(step, HOLD_MS);
        }
        return;
      }
      chars -= 1;
      setText(current.slice(0, Math.max(chars, 0)) || ' ');
      if (chars > 0) {
        timer = window.setTimeout(step, ERASE_MS);
        return;
      }
      erasing = false;
      phrase = (phrase + 1) % phrases.length;
      if (phrase === 0) round += 1;
      if (round >= ROUNDS) {
        setText(fallback);
        return;
      }
      timer = window.setTimeout(step, GAP_MS);
    };

    timer = window.setTimeout(step, 500);
    return () => window.clearTimeout(timer);
  }, [active, phrases, fallback]);

  return text;
}
