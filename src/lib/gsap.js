import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Use real elapsed time instead of GSAP's default lag smoothing. Without this,
// a page loaded in a background tab has requestAnimationFrame throttled to a
// few frames per second, and GSAP clamps each frame's delta to 33ms — the
// intro tween then advances at a fraction of wall-clock speed and the
// preloader appears stuck when the tab is finally focused.
gsap.ticker.lagSmoothing(0);

// Everything animates off the same easing vocabulary so the whole page
// feels like one system rather than a pile of separate effects.
export const EASE = {
  out: 'expo.out',
  inOut: 'power4.inOut',
  soft: 'power2.out',
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger };
