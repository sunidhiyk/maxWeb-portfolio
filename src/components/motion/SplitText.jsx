import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';

/**
 * Masked type reveal — each word (or character) sits inside an overflow-hidden
 * box and slides up from below the mask. This is the signature entrance used
 * for every heading on the page.
 */
export default function SplitText({
  children,
  as: Tag = 'span',
  by = 'word',
  className = '',
  stagger = 0.045,
  duration = 1.05,
  delay = 0,
  start = 'top 85%',
  trigger = 'scroll',
  ...rest
}) {
  const ref = useRef(null);
  const text = typeof children === 'string' ? children : String(children ?? '');

  const tokens = useMemo(() => {
    if (by === 'char') {
      return text.split(/(\s+)/).map((chunk) =>
        /\s/.test(chunk) ? [chunk] : chunk.split('')
      );
    }
    return text.split(/(\s+)/).filter((t) => t.length).map((t) => [t]);
  }, [text, by]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const inners = el.querySelectorAll('.split-i');
    if (!inners.length) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(inners, { yPercent: 0, opacity: 1 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const tween = gsap.fromTo(
        inners,
        { yPercent: 118, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration,
          delay,
          ease: 'expo.out',
          stagger,
          scrollTrigger:
            trigger === 'scroll'
              ? { trigger: el, start, once: true }
              : undefined,
        }
      );
      return () => tween.kill();
    }, el);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [tokens, stagger, duration, delay, start, trigger]);

  return (
    <Tag ref={ref} className={`split ${className}`} {...rest}>
      {tokens.map((group, gi) => (
        <span className="split-w" key={gi}>
          {group.map((token, ti) =>
            /^\s+$/.test(token) ? (
              <span key={ti}>&nbsp;</span>
            ) : (
              <span className="split-i" key={ti}>
                {token}
              </span>
            )
          )}
        </span>
      ))}
    </Tag>
  );
}
