import React, { useCallback, useEffect, useState } from 'react';
import { useSmoothScroll } from './lib/useSmoothScroll';
import { ScrollTrigger } from './lib/gsap';

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
