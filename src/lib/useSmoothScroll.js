import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap';

let lenisInstance = null;

export const getLenis = () => lenisInstance;

/**
 * Drives Lenis off the GSAP ticker so smooth scrolling and every
 * ScrollTrigger on the page share a single clock — without this they drift
 * and pinned sections judder.
 */
export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return undefined;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      autoRaf: false,
    });
    lenisInstance = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    // A throw inside a ticker callback can stop GSAP re-requesting frames,
    // which kills every animation on the page for good. Never let Lenis take
    // the ticker down with it.
    const update = (time) => {
      try {
        lenis.raf(time * 1000);
      } catch {
        /* a dropped frame is survivable; a dead ticker is not */
      }
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Anchor links have to go through Lenis, otherwise native smooth-scroll
    // fights the virtual scroller.
    const onAnchorClick = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    };
    document.addEventListener('click', onAnchorClick);

    ScrollTrigger.refresh();

    return () => {
      document.removeEventListener('click', onAnchorClick);
      gsap.ticker.remove(update);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [enabled]);
}

export function stopScroll() {
  lenisInstance?.stop();
}

export function startScroll() {
  lenisInstance?.start();
}
