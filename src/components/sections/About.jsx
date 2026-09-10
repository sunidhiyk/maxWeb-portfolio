import React, { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';
import { useIsMobile } from '../../lib/useIsMobile';

import SplitText from '../motion/SplitText';
import Reveal from '../motion/Reveal';
import Parallax from '../motion/Parallax';
import Marquee from '../motion/Marquee';

const STATEMENT =
  'maxWeb is a small studio building fast, considered websites and products. ' +
  'We take the whole thing — the design, the engineering, the details nobody ' +
  "notices until they're missing — and we make it feel effortless on the " +
  'other side of the screen.';

// Emphasis is authored, not random: these three words light up in accent.
const ACCENT_WORDS = new Set(['fast', 'considered', 'effortless']);

const WORDS = STATEMENT.split(' ').map((word) => ({
  word,
  accent: ACCENT_WORDS.has(word.replace(/[^A-Za-z']/g, '').toLowerCase()),
}));

const CAPABILITIES = [
  {
    n: '01',
    title: 'Web Design',
    desc: 'Interface, identity and art direction, drawn for the screen it lives on.',
  },
  {
    n: '02',
    title: 'Development',
    desc: 'React, Next.js and TypeScript, built to load fast and stay maintainable.',
  },
  {
    n: '03',
    title: 'Experience',
    desc: 'Motion, interaction and the small moments that make a site feel alive.',
  },
  {
    n: '04',
    title: 'Strategy',
    desc: 'Content architecture and positioning, so the work lands where it should.',
  },
];

const STACK = [
  'React',
  'Next.js',
  'TypeScript',
  'Tailwind CSS',
  'Node.js',
  'GSAP',
  'Three.js',
  'Figma',
  'Vite',
  'WordPress',
];

export default function About() {
  const statementRef = useRef(null);
  const isMobile = useIsMobile();

  useLayoutEffect(() => {
    const el = statementRef.current;
    if (!el) return undefined;

    const words = el.querySelectorAll('.about-word');
    if (!words.length) return undefined;

    // GSAP can't tween a var(), so the literals are read off the cascade once.
    const cs = getComputedStyle(el);
    const ink = cs.getPropertyValue('--ink').trim() || '#081910';
    const accent = cs.getPropertyValue('--accent').trim() || '#c81e13';
    const litColor = (i, target) =>
      target.hasAttribute('data-accent') ? accent : ink;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(words, { color: litColor });
        return;
      }

      gsap.to(words, {
        color: litColor,
        stagger: 0.35,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 72%',
          end: 'bottom 55%',
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="u-shell">
        <div className="section-head">
          <SplitText as="h2" id="about-title" className="u-display">
            ABOUT THE STUDIO
          </SplitText>
          <span className="u-micro">01 / About</span>
        </div>

        <div className="about-statement-wrap">
          {!isMobile && (
            <Parallax speed={0.2} className="about-numeral" aria-hidden="true">
              (01)
            </Parallax>
          )}

          <p className="about-statement" ref={statementRef}>
            {WORDS.map(({ word, accent }, i) => (
              <React.Fragment key={`${word}-${i}`}>
                {i > 0 ? ' ' : null}
                <span className="about-word" data-accent={accent ? '' : undefined}>
                  {word}
                </span>
              </React.Fragment>
            ))}
          </p>
        </div>

        <div className="about-caps">
          <p className="u-micro about-caps-label">What we do</p>

          <Reveal as="ul" className="about-caps-list" selector=".cap-row" stagger={0.08}>
            {CAPABILITIES.map(({ n, title, desc }) => (
              <li className="cap-row" key={n}>
                <span className="cap-num" aria-hidden="true">
                  ({n})
                </span>
                <h3 className="cap-title">{title}</h3>
                <p className="cap-desc">{desc}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </div>

      <div className="about-ticker">
        <Marquee speed={45}>
          {STACK.map((tech) => (
            <React.Fragment key={tech}>
              <span className="about-tick u-micro">{tech}</span>
              <span className="about-tick-sep u-micro" aria-hidden="true">
                ·
              </span>
            </React.Fragment>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
