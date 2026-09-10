import React, { useCallback, useEffect, useState } from 'react';
import { useSmoothScroll } from './lib/useSmoothScroll';
import { ScrollTrigger, tickerFrame, watchTickerStall } from './lib/gsap';

import Preloader from './components/chrome/Preloader';
import Nav from './components/chrome/Nav';
import Cursor from './components/chrome/Cursor';
import Footer from './components/chrome/Footer';

import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Work from './components/sections/Work';
import Contact from './components/sections/Contact';

export default function App() {
  const [ready, setReady] = useState(false);

  // Page is frozen behind the preloader so nothing scrolls mid-intro.
  useEffect(() => {
    document.body.classList.toggle('is-locked', !ready);
  }, [ready]);

  // Sections mount at their real height only once the intro is done.
  useEffect(() => {
    if (!ready) return undefined;
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 240);
    return () => window.clearTimeout(id);
  }, [ready]);

  // Safety net: nothing about the intro is essential, so never let a stalled
  // or errored preloader leave the page locked and unscrollable.
  useEffect(() => {
    if (ready) return undefined;
    const id = window.setTimeout(() => setReady(true), 6000);
    return () => window.clearTimeout(id);
  }, [ready]);

  // If GSAP's ticker never starts, every entrance animation is stuck holding
  // its targets hidden. Compose the page flat instead of showing a broken one.
  useEffect(() => {
    const root = document.documentElement;
    let unbindVisibility = () => {};

    const stop = watchTickerStall(() => {
      root.classList.add('motion-stalled');
      setReady(true);

      // The usual cause is a tab that loaded in the background. If the ticker
      // starts once the tab is actually looked at, hand motion back rather
      // than leaving the page flat for the rest of its life.
      const onVisible = () => {
        if (document.visibilityState !== 'visible') return;
        const frame = tickerFrame();
        window.setTimeout(() => {
          if (tickerFrame() > frame) {
            root.classList.remove('motion-stalled');
            unbindVisibility();
          }
        }, 400);
      };

      document.addEventListener('visibilitychange', onVisible);
      unbindVisibility = () =>
        document.removeEventListener('visibilitychange', onVisible);
    });

    return () => {
      stop();
      unbindVisibility();
    };
  }, []);

  useSmoothScroll(ready);

  const handleIntroDone = useCallback(() => setReady(true), []);

  return (
    <>
      <Preloader onComplete={handleIntroDone} />
      <Cursor />
      <Nav ready={ready} />

      <main id="top">
        <Hero ready={ready} />
        <About />
        <Work />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
