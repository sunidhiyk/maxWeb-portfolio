import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';

/**
 * Full-viewport intro curtain: two oversized words slide in from opposite
 * sides while a counter and a hairline progress rule run 0 -> 100, then the
 * whole panel lifts away.
 *
 * `onComplete` fires at the START of the exit tween, not the end, so the hero
 * intro plays underneath the curtain while it is still lifting.
 */
export default function Preloader({ onComplete }) {
  const rootRef = useRef(null);
  const countRef = useRef(null);
  const barRef = useRef(null);
  const [done, setDone] = useState(false);

  // Keeps the timeline from closing over a stale callback across re-renders.
  // Assigned in an effect rather than during render — writing to a ref while
  // rendering is unsafe under concurrent rendering.
  const cbRef = useRef(onComplete);
  useEffect(() => {
    cbRef.current = onComplete;
  }, [onComplete]);

  useLayoutEffect(() => {
    if (done) return undefined;
    const el = rootRef.current;
    if (!el) return undefined;

    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      cbRef.current?.();
    };

    const ctx = gsap.context(() => {
      const counter = countRef.current;
      const bar = barRef.current;

      if (prefersReducedMotion()) {
        if (counter) counter.textContent = '100';
        gsap.set(bar, { scaleX: 1 });
        gsap.to(el, {
          autoAlpha: 0,
          duration: 0.4,
          ease: 'none',
          onStart: fire,
          onComplete: () => setDone(true),
        });
        return;
      }

      // Counter is driven off a proxy object and written straight to the DOM —
      // React state per frame would re-render the whole tree 60x a second.
      const proxy = { v: 0 };
      const RUN = 2.05; // counter/progress duration
      const EXIT = 2.4; // curtain starts lifting here

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      tl.fromTo(
        '.pl-line',
        { yPercent: 130, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.06 },
        0
      )
        .fromTo(
          '.pl-word--a',
          { xPercent: -118, opacity: 0 },
          { xPercent: 0, opacity: 1, duration: 1.25 },
          0.05
        )
        .fromTo(
          '.pl-word--b',
          { xPercent: 118, opacity: 0 },
          { xPercent: 0, opacity: 1, duration: 1.25 },
          0.16
        )
        .to(
          proxy,
          {
            v: 100,
            duration: RUN,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (counter) counter.textContent = String(Math.round(proxy.v));
            },
          },
          0.2
        )
        .fromTo(
          bar,
          { scaleX: 0 },
          { scaleX: 1, duration: RUN, ease: 'power2.inOut' },
          0.2
        )
        // Words drift up slightly ahead of the panel so the exit reads layered.
        .to(
          '.pl-word',
          { yPercent: -22, opacity: 0, duration: 1, ease: 'power4.inOut', stagger: 0.07 },
          EXIT - 0.14
        )
        .to(
          '.pl-line',
          { opacity: 0, duration: 0.5, ease: 'none' },
          EXIT - 0.14
        )
        .to(
          el,
          {
            yPercent: -100,
            duration: 1,
            ease: 'power4.inOut',
            onStart: fire,
            onComplete: () => setDone(true),
          },
          EXIT
        );
    }, el);

    return () => ctx.revert();
  }, [done]);

  if (done) return null;

  return (
    <div className="pl" ref={rootRef} aria-hidden="true">
      <span className="sr-only" role="status">
        Loading
      </span>

      <div className="pl-top">
        <span className="pl-line u-micro u-micro--invert">maxWeb</span>
        <span className="pl-line u-micro u-micro--invert">Digital Experiences</span>
      </div>

      <div className="pl-stage">
        <span className="pl-word pl-word--a">Max</span>
        <span className="pl-word pl-word--b">Web</span>
      </div>

      <div className="pl-bottom">
        <span className="pl-line u-micro u-micro--invert">Loading Experience</span>
        <span className="pl-count" ref={countRef}>
          0
        </span>
      </div>

      <span className="pl-bar" ref={barRef} />
    </div>
  );
}
