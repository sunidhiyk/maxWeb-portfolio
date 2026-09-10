import React, { lazy, Suspense, useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';
// three.js + R3F is ~1MB of the bundle. Splitting it out lets the type —
// which is the actual content of the hero — paint without waiting on WebGL.
const HeroCanvas = lazy(() => import('../three/HeroCanvas'));

/**
 * Full-viewport type stage. Three colossal lines are positioned separately so
 * the 3D knot can sit *between* them: lines 1 and 3 paint above the canvas,
 * line 2 paints below it. The <h1> itself stays z-index:auto on purpose — if it
 * became a stacking context the lines could no longer interleave with the canvas.
 */
export default function Hero({ ready = false }) {
  const rootRef = useRef(null);

  // Intro — fires once the preloader curtain starts lifting.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      // Pre-animation state, set synchronously so nothing flashes composed.
      gsap.set('.hero-line-i', { yPercent: 110 });
      gsap.set('.hero-stage', { opacity: 0, scale: 0.82 });
      gsap.set('.hero-meta-item', { opacity: 0, y: 18 });

      if (!ready) return;

      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .to('.hero-line-i', { yPercent: 0, duration: 1.2, stagger: 0.09 }, 0)
        .to('.hero-stage', { opacity: 1, scale: 1, duration: 1.6 }, 0.4)
        .to('.hero-meta-item', { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 1.05);
    }, root);

    return () => ctx.revert();
  }, [ready]);

  // Scroll-out — the three lines leave at different rates and the stage dims.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
        .to('.hero-line--1', { yPercent: -64, opacity: 0, duration: 1 }, 0)
        .to('.hero-line--2', { yPercent: -36, opacity: 0.12, duration: 1 }, 0)
        .to('.hero-line--3', { yPercent: -14, opacity: 0.45, duration: 1 }, 0)
        .to('.hero-meta', { opacity: 0, duration: 0.35 }, 0)
        .to(root, { opacity: 0.68, duration: 1 }, 0);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="hero" id="hero">
      <h1 className="hero-title">
        <span className="sr-only">Digital Crafted Experiences</span>

        <span className="hero-line hero-line--1" aria-hidden="true">
          <span className="hero-line-i">Digital</span>
        </span>
        <span className="hero-line hero-line--2" aria-hidden="true">
          <span className="hero-line-i">Crafted</span>
        </span>
        <span className="hero-line hero-line--3" aria-hidden="true">
          <span className="hero-line-i">Experiences</span>
        </span>
      </h1>

      <div className="hero-stage" aria-hidden="true">
        <Suspense fallback={null}>
          <HeroCanvas />
        </Suspense>
      </div>

      <div className="hero-meta">
        <span className="hero-meta-item u-micro">maxWeb</span>

        <span className="hero-meta-item hero-scroll u-micro">
          <span>Scroll to explore</span>
          <span className="hero-scroll-rule" aria-hidden="true" />
        </span>
      </div>
    </section>
  );
}
