import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { getLenis } from '../../lib/useSmoothScroll';
import { useIsMobile, useReducedMotion } from '../../lib/useIsMobile';

import SplitText from '../motion/SplitText';
import Reveal from '../motion/Reveal';
import Marquee from '../motion/Marquee';
import Magnetic from '../motion/Magnetic';

import projects from '../../data/projects';

const TOTAL = String(projects.length).padStart(2, '0');

// Marquee band copy. The phrase is repeated so the track is wide enough for
// Marquee's duplicate-and-wrap loop to have no visible seam.
const BAND_PHRASE = 'SELECTED WORK ✳ 2023—2026 ✳ MAXWEB ✳';
const BAND_REPEATS = [0, 1, 2, 3];

/**
 * One editorial project card. Identical markup in both layouts — the pinned
 * track and the mobile stack differ only in their wrapper and their motion.
 */
function ProjectCard({ project, eager }) {
  const { index, title, domain, blurb, scope, link, image, alt, year } = project;

  const mediaProps = link
    ? {
        href: link,
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `${title} — open ${domain} in a new tab`,
        'data-cursor': 'text',
        'data-cursor-label': 'VIEW',
      }
    : {};
  const MediaTag = link ? 'a' : 'div';

  return (
    <article className="work-panel">
      <span className="work-panel__index u-index" data-work-reveal aria-hidden="true">
        {index}
      </span>

      <MediaTag className="work-panel__media" data-work-reveal {...mediaProps}>
        <span className="work-panel__shift">
          <img
            className="work-panel__img"
            src={image}
            alt={alt}
            loading={eager ? undefined : 'lazy'}
            decoding={eager ? undefined : 'async'}
            draggable="false"
          />
        </span>
      </MediaTag>

      <div className="work-panel__body">
        <h3 className="work-panel__title" data-work-reveal>
          {title}
        </h3>

        <div className="work-panel__meta" data-work-reveal>
          <span className="u-micro">{domain}</span>
          <span className="u-micro work-panel__year">{year}</span>
        </div>

        <p className="work-panel__blurb" data-work-reveal>
          {blurb}
        </p>

        <p className="work-panel__scope" data-work-reveal>
          {scope.map((item, i) => (
            <React.Fragment key={item}>
              {i > 0 ? (
                <span className="work-panel__sep u-micro" aria-hidden="true">
                  ·
                </span>
              ) : null}
              <span className="u-micro">{item}</span>
            </React.Fragment>
          ))}
        </p>

        <p className="work-panel__foot" data-work-reveal>
          {link ? (
            <Magnetic strength={0.3}>
              <a
                className="work-panel__cta u-micro"
                href={link}
                target="_blank"
                rel="noopener noreferrer"
              >
                View project <span aria-hidden="true">↗</span>
              </a>
            </Magnetic>
          ) : (
            <span className="work-panel__cta work-panel__cta--static u-micro">
              Case study — Internal
            </span>
          )}
        </p>
      </div>
    </article>
  );
}

export default function Work() {
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const fillRef = useRef(null);
  const counterRef = useRef(null);

  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  // Below the breakpoint — or when motion is unwelcome — the slideshow
  // becomes a plain vertical stack of the same cards.
  const stacked = isMobile || reduced;

  useLayoutEffect(() => {
    if (stacked) return undefined;

    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return undefined;

    const mm = gsap.matchMedia();

    // The query is the real gate: matchMedia builds and reverts the pin as the
    // viewport crosses the breakpoint, so nothing leaks on resize.
    mm.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
      const panels = gsap.utils.toArray('.work-panel', track);
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      const scrollTween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          pin: true,
          start: 'top top',
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          end: () => '+=' + distance(),
          onUpdate: (self) => {
            // Written straight to the DOM — this fires every frame and has no
            // business re-rendering React.
            if (fillRef.current) {
              fillRef.current.style.transform = `scaleX(${self.progress})`;
            }
            const counter = counterRef.current;
            if (!counter || panels.length < 2) return;
            const n = Math.round(self.progress * (panels.length - 1)) + 1;
            const next = String(n).padStart(2, '0');
            if (counter.textContent !== next) counter.textContent = next;
          },
        },
      });

      panels.forEach((panel) => {
        const bits = panel.querySelectorAll('[data-work-reveal]');
        const shift = panel.querySelector('.work-panel__shift');

        // containerAnimation is what makes per-panel triggers fire off the
        // panel's *horizontal* position inside the translated track.
        if (bits.length) {
          gsap.fromTo(
            bits,
            { yPercent: 55, autoAlpha: 0 },
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.9,
              ease: 'expo.out',
              stagger: 0.07,
              scrollTrigger: {
                trigger: panel,
                containerAnimation: scrollTween,
                start: 'left 92%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }

        if (shift) {
          gsap.fromTo(
            shift,
            { xPercent: -5 },
            {
              xPercent: 5,
              ease: 'none',
              scrollTrigger: {
                trigger: panel,
                containerAnimation: scrollTween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            }
          );
        }
      });

      // Tabbing into an off-screen panel would otherwise make the browser
      // scroll the clipped stage and shear the whole layout.
      const onFocusIn = (event) => {
        stage.scrollLeft = 0;
        stage.scrollTop = 0;

        const target = event.target;
        if (!target || typeof target.getBoundingClientRect !== 'function') return;

        const rect = target.getBoundingClientRect();
        if (rect.left >= 0 && rect.right <= window.innerWidth) return;

        const panel = target.closest('.work-panel');
        const i = panels.indexOf(panel);
        const st = scrollTween.scrollTrigger;
        if (i < 0 || !st) return;

        const ratio = panels.length > 1 ? i / (panels.length - 1) : 0;
        const y = st.start + (st.end - st.start) * ratio;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { duration: 0.7 });
        else window.scrollTo({ top: y });
      };

      stage.addEventListener('focusin', onFocusIn);
      return () => stage.removeEventListener('focusin', onFocusIn);
    });

    return () => mm.revert();
  }, [stacked]);

  return (
    <section id="work" className="section work" aria-labelledby="work-title">
      <div className="u-shell">
        <div className="section-head">
          <SplitText as="h2" id="work-title" className="u-display">
            SELECTED WORK
          </SplitText>
          <span className="u-micro">02 / WORK</span>
        </div>
      </div>

      {stacked ? (
        <div className="u-shell">
          <div className="work-stack">
            {projects.map((project, i) => (
              <Reveal key={project.index} className="work-stack__item" y={48}>
                <ProjectCard project={project} eager={i === 0} />
              </Reveal>
            ))}
          </div>
        </div>
      ) : (
        <div className="work-stage" ref={stageRef}>
          <div className="work-track" ref={trackRef}>
            {projects.map((project, i) => (
              <ProjectCard key={project.index} project={project} eager={i === 0} />
            ))}
          </div>

          <div className="work-meter" aria-hidden="true">
            <span className="work-meter__rail">
              <span className="work-meter__fill" ref={fillRef} />
            </span>
            <span className="work-meter__count u-micro">
              <span ref={counterRef}>01</span>
              <span className="work-meter__dash"> — </span>
              {TOTAL}
            </span>
          </div>
        </div>
      )}

      <div className="work-band" aria-hidden="true">
        <Marquee speed={85}>
          {BAND_REPEATS.map((n) => (
            <span className="work-band__item" key={n}>
              {BAND_PHRASE}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
