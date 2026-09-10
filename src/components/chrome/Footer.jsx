import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';
import Reveal from '../motion/Reveal';

const EMAIL = 'maxweb596@gmail.com';

const SOCIAL = [
  { label: 'GitHub', href: '#' },
  { label: 'LinkedIn', href: '#' },
  { label: 'Instagram', href: '#' },
];

const INDEX = [
  { label: '01 About', href: '#about' },
  { label: '02 Selected Work', href: '#work' },
  { label: '03 Contact', href: '#contact' },
];

const formatTime = (d) =>
  [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');

export default function Footer() {
  const rootRef = useRef(null);
  const markRef = useRef(null);
  const [clock, setClock] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatTime(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);

  // The wordmark rises out of the masking band as the footer enters.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const mark = markRef.current;
    if (!root || !mark) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(mark, { yPercent: 0 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        mark,
        { yPercent: 65 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            // `bottom bottom` — the footer is the last thing on the page, so
            // its bottom edge meets the viewport bottom exactly at maximum
            // scroll; the reveal is therefore always reachable. An end keyed
            // to the footer's *top* (e.g. `top 40%`) is not: whenever the
            // footer is shorter than the distance that alignment demands, the
            // page runs out of scroll first and the wordmark is left stranded
            // mid-band, permanently cut in half.
            end: 'bottom bottom',
            scrub: 0.6,
          },
        }
      );
    }, root);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <footer className="footer" ref={rootRef}>
      <div className="footer-mark" aria-hidden="true">
        <span className="footer-mark-i" ref={markRef}>
          maxWeb
        </span>
      </div>

      <Reveal className="footer-meta u-shell" selector=".footer-col" y={28} stagger={0.08}>
        <div className="footer-col">
          <h2 className="u-micro u-micro--invert footer-col-h">Studio</h2>
          <ul className="footer-col-list">
            <li>
              <a className="footer-link" href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>
            </li>
            <li>
              <span className="footer-note">We build sweet digital experiences.</span>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h2 className="u-micro u-micro--invert footer-col-h">Social</h2>
          <ul className="footer-col-list">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a className="footer-link" href={s.href}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h2 className="u-micro u-micro--invert footer-col-h">Index</h2>
          <ul className="footer-col-list">
            {INDEX.map((s) => (
              <li key={s.href}>
                <a className="footer-link" href={s.href}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <div className="footer-base u-shell">
        <span className="u-micro u-micro--invert">© 2026 maxWeb. All rights reserved.</span>
        <span className="u-micro u-micro--invert footer-clock">
          <span className="sr-only">Local time </span>
          {clock}
        </span>
        <a className="u-micro u-micro--invert footer-top" href="#top">
          Back to top
        </a>
      </div>
    </footer>
  );
}
