import React, { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';

/**
 * Generic on-enter reveal for blocks that aren't type: images, cards, rules.
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  y = 40,
  opacity = 0,
  scale = 1,
  duration = 1.1,
  delay = 0,
  stagger = 0,
  selector,
  start = 'top 88%',
  className = '',
  ...rest
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const targets = selector ? el.querySelectorAll(selector) : [el];
    if (!targets.length) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(targets, { y: 0, opacity: 1, scale: 1 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { y, opacity, scale },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration,
          delay,
          stagger,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start, once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [y, opacity, scale, duration, delay, stagger, selector, start]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
