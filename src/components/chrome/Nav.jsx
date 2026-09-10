import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';
import { stopScroll, startScroll } from '../../lib/useSmoothScroll';
import { useIsMobile } from '../../lib/useIsMobile';
import Magnetic from '../motion/Magnetic';

const LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

export default function Nav({ ready = false }) {
  const isMobile = useIsMobile();
  const [menuRequested, setOpen] = useState(false);
  // Derived rather than synced: crossing back to desktop closes the overlay
  // on its own, and every effect keyed on `open` unwinds with it.
  const open = menuRequested && isMobile;
  const [scrolled, setScrolled] = useState(false);

  const headerRef = useRef(null);
  const barRef = useRef(null);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const tlRef = useRef(null);

  /* ---- bar gains a wash + hairline once past the fold ---- */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 80,
        end: 'max',
        onToggle: (self) => setScrolled(self.isActive),
      });
    });
    return () => ctx.revert();
  }, []);

  /* ---- bar drops into place only once the intro has handed over ---- */
  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el || !ready || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: -28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, delay: 0.2, ease: 'expo.out' }
      );
    }, el);
    return () => ctx.revert();
  }, [ready]);

  /* ---- mobile overlay timeline, built once per breakpoint ---- */
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!isMobile || !panel) return undefined;

    const reduced = prefersReducedMotion();
    const dWipe = reduced ? 0.001 : 0.8;
    const dLine = reduced ? 0.001 : 0.9;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      tl.fromTo(
        panel,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: dWipe, ease: 'power4.inOut' },
        0
      )
        .fromTo(
          '.nav-ov-line',
          { yPercent: 118 },
          { yPercent: 0, duration: dLine, stagger: reduced ? 0 : 0.07, ease: 'expo.out' },
          reduced ? 0 : 0.2
        )
        .fromTo(
          '.nav-ov-meta',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: reduced ? 0.001 : 0.6, stagger: reduced ? 0 : 0.06, ease: 'expo.out' },
          reduced ? 0 : 0.5
        )
        .eventCallback('onReverseComplete', () => {
          gsap.set(panel, { visibility: 'hidden' });
        });

      tlRef.current = tl;
    }, panel);

    return () => {
      tlRef.current = null;
      ctx.revert();
    };
  }, [isMobile]);

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (open) tl.play();
    else tl.reverse();
  }, [open]);

  /* ---- scroll lock + escape while the overlay is up ---- */
  useEffect(() => {
    if (!open) return undefined;

    stopScroll();
    document.body.classList.add('is-locked');

    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
      startScroll();
    };
  }, [open]);

  const openMenu = useCallback(() => {
    const panel = panelRef.current;
    if (panel) gsap.set(panel, { visibility: 'visible' });
    setOpen(true);
    // Focus lands inside the panel so keyboard users are not left behind it.
    window.requestAnimationFrame(() => {
      panel?.querySelector('.nav-ov-link')?.focus();
    });
  }, []);

  // Focus always comes back to the toggle so nothing is left focused inside a
  // panel that is about to be aria-hidden.
  const closeMenu = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  const toggleMenu = useCallback(() => {
    if (open) closeMenu();
    else openMenu();
  }, [open, openMenu, closeMenu]);

  const headerClass = [
    'nav',
    ready ? 'is-in' : '',
    scrolled ? 'is-scrolled' : '',
    open ? 'is-menu-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClass} ref={headerRef}>
      <div className="nav-bar" ref={barRef}>
        <a className="nav-mark" href="#top" aria-label="maxWeb — back to top">
          mW
        </a>

        {!isMobile && (
          <nav className="nav-links" aria-label="Primary">
            {LINKS.map((l) => (
              <Magnetic key={l.href} strength={0.2}>
                <a className="nav-link" href={l.href}>
                  {l.label}
                </a>
              </Magnetic>
            ))}
          </nav>
        )}

        {isMobile && (
          <button
            type="button"
            className="nav-burger"
            ref={toggleRef}
            onClick={toggleMenu}
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span className="nav-burger-bar" />
            <span className="nav-burger-bar" />
          </button>
        )}
      </div>

      {isMobile && (
        <div className="nav-overlay" id="nav-menu" ref={panelRef} aria-hidden={!open}>
          <nav className="nav-ov-inner" aria-label="Mobile">
            <ul className="nav-ov-list">
              {LINKS.map((l, i) => (
                <li className="nav-ov-item" key={l.href}>
                  <a className="nav-ov-link" href={l.href} onClick={closeMenu}>
                    <span className="nav-ov-mask">
                      <span className="nav-ov-line">{l.label}</span>
                    </span>
                  </a>
                  <span className="nav-ov-idx u-micro u-micro--invert">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </li>
              ))}
            </ul>

            <div className="nav-ov-foot">
              <span className="nav-ov-meta u-micro u-micro--invert">Get in touch</span>
              <a className="nav-ov-meta nav-ov-mail" href="mailto:maxweb596@gmail.com">
                maxweb596@gmail.com
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
