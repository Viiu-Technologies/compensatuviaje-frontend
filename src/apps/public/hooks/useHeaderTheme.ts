import { useEffect, useSyncExternalStore } from 'react';
import { ScrollTrigger } from './useGsapReveal';

/**
 * Tema del header según lo que tiene debajo. Las secciones oscuras (la escena
 * final del hero) avisan con setHeaderTheme('dark') y el header cambia a texto
 * claro. Sin nadie que avise, el header es claro.
 */
export type HeaderTheme = 'light' | 'dark';

/** Alto del header fijo (--lq-header-h en Header.css). */
export const HEADER_HEIGHT = 68;

let current: HeaderTheme = 'light';
const listeners = new Set<() => void>();

export const setHeaderTheme = (theme: HeaderTheme) => {
  if (theme === current) return;
  current = theme;
  listeners.forEach((notify) => notify());
};

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => listeners.delete(notify);
};

export const useHeaderTheme = () => useSyncExternalStore(subscribe, () => current, () => 'light' as HeaderTheme);

/**
 * Pone el header en su versión oscura mientras está encima de `ref` (una
 * sección con fondo oscuro). Va aparte de las animaciones de entrada: también
 * funciona con prefers-reduced-motion.
 */
export function useDarkHeaderOver(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let active = false;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: `top top+=${HEADER_HEIGHT}`,
      end: `bottom top+=${HEADER_HEIGHT}`,
      onToggle: (self) => {
        active = self.isActive;
        setHeaderTheme(active ? 'dark' : 'light');
      },
    });
    return () => {
      trigger.kill();
      if (active) setHeaderTheme('light');
    };
  }, [ref]);
}
