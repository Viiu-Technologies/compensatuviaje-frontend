import { useState, useEffect, useCallback } from 'react';

/**
 * Global scroll progress store — updated by GSAP ScrollTrigger in App.tsx
 * Components read from this to avoid per-component ScrollTrigger overhead
 */
interface ScrollState {
  /** Overall scroll progress 0-1 across the entire page */
  overall: number;
  /** Per-section progress: hero(0-1), transformation(0-1), forest(0-1), impact(0-1) */
  hero: number;
  transformation: number;
  forest: number;
  impact: number;
}

const defaultState: ScrollState = {
  overall: 0,
  hero: 1,
  transformation: 0,
  forest: 0,
  impact: 0,
};

// Singleton store
let _state: ScrollState = { ...defaultState };
const _listeners: Set<() => void> = new Set();

export function setScrollState(partial: Partial<ScrollState>) {
  _state = { ..._state, ...partial };
  _listeners.forEach((fn) => fn());
}

export function getScrollState(): ScrollState {
  return _state;
}

export function useScrollProgress(): ScrollState {
  const [state, setState] = useState<ScrollState>(_state);

  const handleUpdate = useCallback(() => {
    setState({ ..._state });
  }, []);

  useEffect(() => {
    _listeners.add(handleUpdate);
    return () => {
      _listeners.delete(handleUpdate);
    };
  }, [handleUpdate]);

  return state;
}
