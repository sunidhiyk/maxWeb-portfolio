import React, { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';

/**
 * Infinite ticker whose speed and direction bend with scroll velocity —
 * the trick that makes a marquee feel attached to the page instead of
 * looping on its own timer.
 */
export default function Marquee({
  children,
  speed = 60,
  direction = 1,
  reactive = true,
  className = '',
}) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const half = track.scrollWidth / 2;
    if (!half) return undefined;

    if (prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      const tween = gsap.to(track, {
        x: direction > 0 ? -half : 0,
        duration: half / speed,
        ease: 'none',
        repeat: -1,
        modifiers: {
          x: (x) => `${gsap.utils.wrap(-half, 0, parseFloat(x))}px`,
        },
      });
      if (direction < 0) tween.reverse().timeScale(-1);

      if (!reactive) return;

      const st = ScrollTrigger.create({
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-4, 4, self.getVelocity() / 320);
          gsap.to(tween, {
            timeScale: direction * (1 + Math.abs(v) * 0.9),
            duration: 0.4,
            overwrite: true,
          });
          gsap.to(track, {
            skewX: gsap.utils.clamp(-8, 8, -v * 1.5),
            duration: 0.5,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        },
      });
      return () => st.kill();
    }, wrapRef);

    return () => ctx.revert();
  }, [speed, direction, reactive, children]);

  return (
    <div ref={wrapRef} className={`marquee ${className}`}>
      <div ref={trackRef} className="marquee-track">
        <div className="marquee-group">{children}</div>
        <div className="marquee-group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
