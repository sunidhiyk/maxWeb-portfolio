# maxWeb — studio portfolio

The site for **maxWeb**, a digital studio building fast, considered websites and products.

Light-editorial visual system: off-white canvas, near-black ink, violet accent, oversized
Inter Tight display type — carried by smooth scrolling, scroll-linked animation and a WebGL hero.

## Stack

| | |
| --- | --- |
| Framework | React 19 + Vite 7 |
| Styling | Plain CSS, custom-property design tokens |
| Motion | GSAP 3 + ScrollTrigger |
| Smooth scroll | Lenis, driven off the GSAP ticker |
| 3D | three.js + React Three Fiber + drei |
| Forms | Formspree |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build
npm run lint
```

> React is pinned to `19.2.3`. React Three Fiber 9 declares a peer range of `>=19 <19.3`, so an
> unpinned `^19.2.0` resolves to 19.3 and breaks installation.

## Project layout

```
src/
  App.jsx                  page composition + intro gating
  lib/
    gsap.js                GSAP + ScrollTrigger registration, shared easings
    useSmoothScroll.js     Lenis instance bound to the GSAP ticker
    useIsMobile.js         media-query hooks (breakpoint, reduced motion)
  components/
    motion/                shared animation primitives
      SplitText.jsx        masked per-word/char type reveal
      Reveal.jsx           fade + rise for blocks
      Parallax.jsx         scroll-linked drift
      Marquee.jsx          velocity-reactive infinite ticker
      Magnetic.jsx         cursor-attracted controls
    chrome/                preloader, nav, custom cursor, footer
    sections/              hero, about, work, contact
    three/                 WebGL hero scene
  data/projects.js         selected work
  styles/
    tokens.css             the design system — colour, type scale, motion
    base.css               reset + global rules, imports every other sheet
    <section>.css          one stylesheet per section
```

## Conventions

- **Never hardcode a colour or size** — everything comes from `tokens.css`.
- **Every GSAP animation** lives inside `gsap.context()` in a `useLayoutEffect` and is reverted on
  cleanup. React StrictMode double-mounts in development; anything else leaks ScrollTriggers.
- **`prefers-reduced-motion` is honoured everywhere** — reduced-motion users get the final composed
  state with no scrubbing, looping or autoplay.
- Anchor navigation goes through Lenis (`useSmoothScroll` intercepts `a[href^="#"]`), because native
  smooth scrolling fights the virtual scroller.
