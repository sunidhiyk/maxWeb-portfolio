import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';

const HOT = 'a, button, [data-cursor]';

/**
 * Two-layer pointer: a fast dot and a lagging ring. The ring swells and turns
 * accent over anything interactive; `data-cursor="text"` + `data-cursor-label`
 * swaps the swell for a small uppercase label ("VIEW", "DRAG", …).
 *
 * Pointer devices only — touch keeps its native cursor.
 */
export default function Cursor() {
  const [enabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      !window.matchMedia('(hover: none)').matches &&
      !prefersReducedMotion()
  );

  const dotRef = useRef(null);
  const wrapRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useLayoutEffect(() => {
    if (!enabled) return undefined;
    const dot = dotRef.current;
    const wrap = wrapRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !wrap || !ring || !label) return undefined;

    document.body.classList.add('has-custom-cursor');

    let active = null;

    const ctx = gsap.context(() => {
      gsap.set([dot, wrap], { xPercent: -50, yPercent: -50, autoAlpha: 0 });

      const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
      const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
      const ringX = gsap.quickTo(wrap, 'x', { duration: 0.5, ease: 'power3.out' });
      const ringY = gsap.quickTo(wrap, 'y', { duration: 0.5, ease: 'power3.out' });

      let seen = false;

      const onMove = (e) => {
        if (!seen) {
          seen = true;
          // Jump both layers to the first known position so they don't fly in
          // from the top-left corner.
          gsap.set([dot, wrap], { x: e.clientX, y: e.clientY });
          gsap.to([dot, wrap], { autoAlpha: 1, duration: 0.25, ease: 'none' });
        }
        dotX(e.clientX);
        dotY(e.clientY);
        ringX(e.clientX);
        ringY(e.clientY);
      };

      const activate = (el) => {
        active = el;
        const labelText =
          el.getAttribute('data-cursor') === 'text'
            ? (el.getAttribute('data-cursor-label') || '').trim()
            : '';

        label.textContent = labelText;
        ring.classList.add('is-active');
        ring.classList.toggle('is-label', Boolean(labelText));

        gsap.to(ring, {
          scale: labelText ? 2.9 : 2.4,
          duration: 0.45,
          ease: 'expo.out',
        });
        gsap.to(label, { autoAlpha: labelText ? 1 : 0, duration: 0.25, ease: 'none' });
        gsap.to(dot, { opacity: 0, duration: 0.25, ease: 'none' });
      };

      const deactivate = () => {
        active = null;
        ring.classList.remove('is-active', 'is-label');
        gsap.to(ring, { scale: 1, duration: 0.45, ease: 'expo.out' });
        gsap.to(label, { autoAlpha: 0, duration: 0.2, ease: 'none' });
        gsap.to(dot, { opacity: 1, duration: 0.25, ease: 'none' });
      };

      // Delegated: one pair of listeners for the whole document, whatever the
      // other sections render.
      const onOver = (e) => {
        const hit = e.target instanceof Element ? e.target.closest(HOT) : null;
        if (!hit || hit === active) return;
        activate(hit);
      };

      const onOut = (e) => {
        if (!active) return;
        const to = e.relatedTarget;
        if (to instanceof Node && active.contains(to)) return;
        deactivate();
      };

      const onLeaveWindow = () => {
        gsap.to([dot, wrap], { autoAlpha: 0, duration: 0.2, ease: 'none' });
      };
      const onEnterWindow = () => {
        if (seen) gsap.to([dot, wrap], { autoAlpha: 1, duration: 0.2, ease: 'none' });
      };

      window.addEventListener('mousemove', onMove, { passive: true });
      document.addEventListener('mouseover', onOver, true);
      document.addEventListener('mouseout', onOut, true);
      document.addEventListener('mouseleave', onLeaveWindow);
      document.addEventListener('mouseenter', onEnterWindow);

      return () => {
        window.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseover', onOver, true);
        document.removeEventListener('mouseout', onOut, true);
        document.removeEventListener('mouseleave', onLeaveWindow);
        document.removeEventListener('mouseenter', onEnterWindow);
      };
    });

    return () => {
      document.body.classList.remove('has-custom-cursor');
      ctx.revert();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="cursor" aria-hidden="true">
      <span className="cursor-dot" ref={dotRef} />
      <span className="cursor-ring-wrap" ref={wrapRef}>
        <span className="cursor-ring" ref={ringRef} />
        <span className="cursor-label" ref={labelRef} />
      </span>
    </div>
  );
}
