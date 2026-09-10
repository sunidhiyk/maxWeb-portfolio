import React, {
  Component,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import ChromeKnot from './ChromeKnot';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';
import { useIsMobile } from '../../lib/useIsMobile';

/** Keeps a broken WebGL context (or a failed HDRI fetch) from taking the page down. */
class SafeBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

function detectWebGL() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * In `demand` mode (reduced motion) nothing schedules frames, so the scene would
 * stay blank until the studio HDRI resolves. Nudge it for a short while, then stop.
 */
function DemandNudge({ active }) {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (!active) return undefined;
    let raf = 0;
    let frames = 0;
    const tick = () => {
      invalidate();
      frames += 1;
      if (frames < 120) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [active, invalidate]);

  return null;
}

export default function HeroCanvas() {
  const wrapRef = useRef(null);
  const scrollRef = useRef(0);
  const mobile = useIsMobile();
  const [visible, setVisible] = useState(true);
  const [supported] = useState(detectWebGL);

  const reduced = prefersReducedMotion();

  // A WebGL loop that keeps running once the hero is off-screen starves the
  // rest of the page, so pause the renderer entirely when it isn't in view.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;

    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [supported]);

  // Scroll progress lands on a ref, never in state — useFrame reads it directly.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el || reduced) return undefined;
    const trigger = el.closest('.hero') ?? el;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          scrollRef.current = self.progress;
        },
        onRefresh: (self) => {
          scrollRef.current = self.progress;
        },
      });
    }, el);

    return () => {
      ctx.revert();
      scrollRef.current = 0;
    };
  }, [reduced, supported]);

  if (!supported) return null;

  const frameloop = reduced ? 'demand' : visible ? 'always' : 'never';

  return (
    <div ref={wrapRef} className="hero-canvas">
      <SafeBoundary>
        <Canvas
          dpr={mobile ? [1, 1.5] : [1, 2]}
          camera={{ position: [0, 0, 5], fov: 35 }}
          gl={{ antialias: true, alpha: true }}
          frameloop={frameloop}
          fallback={null}
          // The canvas is pointer-events:none, so pointer state has to come
          // from the document instead of the canvas element itself.
          eventSource={typeof document !== 'undefined' ? document.documentElement : undefined}
          eventPrefix="client"
        >
          <ambientLight intensity={0.35} />
          <directionalLight position={[4, 5, 5]} intensity={2.4} />
          <directionalLight position={[-5, -2, 3]} intensity={1.1} />

          {/* The environment is built in-scene from emissive planes rather than
              loaded from a preset HDRI. drei's presets fetch from a third-party
              CDN, which suspends this whole subtree until the network answers —
              and leaves the hero empty if it never does. Rendering the rig
              locally removes that dependency and gives direct control over the
              reflections: bright bars against a dark surround are what read as
              polished chrome on the mesh. */}
          <Environment resolution={256} frames={1}>
            <color attach="background" args={['#0a0a0a']} />
            {/* broad key from above — the soft white sweep across the top */}
            <Lightformer form="rect" intensity={5} color="#ffffff" scale={[12, 4]} position={[0, 5, -6]} target={[0, 0, 0]} />
            {/* hard specular strips — these become the bright highlight bands */}
            <Lightformer form="rect" intensity={9} color="#ffffff" scale={[1.2, 9]} position={[-5, 1, -2]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={7} color="#ffffff" scale={[1.2, 9]} position={[5, -1, -2]} target={[0, 0, 0]} />
            {/* faint accent bounce, so the chrome picks up a trace of brand violet */}
            <Lightformer form="circle" intensity={3} color="#7671ff" scale={[4, 4]} position={[3, 4, 3]} target={[0, 0, 0]} />
            {/* rim from behind to separate the silhouette from the page */}
            <Lightformer form="rect" intensity={4} color="#ffffff" scale={[8, 2]} position={[0, -4, 4]} target={[0, 0, 0]} />
          </Environment>

          <Suspense fallback={null}>
            <ChromeKnot
              scale={mobile ? 0.34 : 0.46}
              scrollRef={scrollRef}
              reduced={reduced}
              tubularSegments={mobile ? 128 : 220}
              radialSegments={mobile ? 20 : 32}
            />
          </Suspense>

          <DemandNudge active={reduced} />
        </Canvas>
      </SafeBoundary>
    </div>
  );
}
