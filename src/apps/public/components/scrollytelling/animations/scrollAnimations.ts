import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setScrollState } from '../hooks/useScrollProgress';

gsap.registerPlugin(ScrollTrigger);

let activeTriggers: ScrollTrigger[] = [];

/**
 * Initialize GSAP ScrollTrigger timeline for 3D visual harmony between Planet & Forest
 */
export function initScrollAnimations() {
  destroyScrollAnimations();

  // Section 1: Planet Earth
  const st1 = ScrollTrigger.create({
    trigger: '#section-planet',
    start: 'top top',
    end: 'bottom top',
    scrub: 0.5,
    onUpdate: (self) => {
      setScrollState({
        hero: 1 - self.progress,
        overall: self.progress * 0.25,
      });
    },
  });

  // Section 2: CO2 Emission to Compensation Particle Transformation
  const st2 = ScrollTrigger.create({
    trigger: '#section-transition',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 0.5,
    onUpdate: (self) => {
      setScrollState({
        transformation: self.progress,
        overall: 0.25 + self.progress * 0.25,
      });
    },
  });

  // Section 3: 3D Forest Growth (EZ-Tree)
  const st3 = ScrollTrigger.create({
    trigger: '#section-forest',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 0.5,
    onUpdate: (self) => {
      setScrollState({
        forest: self.progress,
        overall: 0.5 + self.progress * 0.25,
      });
    },
  });

  // Section 4: Harmony View
  const st4 = ScrollTrigger.create({
    trigger: '#section-harmony',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 0.5,
    onUpdate: (self) => {
      setScrollState({
        impact: self.progress,
        overall: 0.75 + self.progress * 0.25,
      });
    },
  });

  activeTriggers = [st1, st2, st3, st4];
}

export function destroyScrollAnimations() {
  activeTriggers.forEach((st) => st.kill());
  activeTriggers = [];
}

export function refreshScrollAnimations() {
  ScrollTrigger.refresh();
}
