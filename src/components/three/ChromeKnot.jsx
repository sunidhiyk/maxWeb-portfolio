import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';

/**
 * The polished torus knot that floats between the hero's type lines.
 *
 * Two nested objects keep the motion channels from fighting each other:
 *   - `groupRef` owns everything driven from outside (pointer lean, bob, scroll scale)
 *   - `meshRef`  owns the continuous self-rotation plus the scroll-driven extra spin
 *
 * Scroll progress arrives as a plain number on `scrollRef` (written by a
 * ScrollTrigger up in HeroCanvas) so scrolling never re-renders React.
 */
export default function ChromeKnot({
  scale = 0.46,
  scrollRef,
  reduced = false,
  tubularSegments = 220,
  radialSegments = 32,
}) {
  const groupRef = useRef(null);
  const meshRef = useRef(null);
  const spin = useRef({ x: 0.4, y: 0.6 });

  useFrame((state, delta) => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    if (!group || !mesh) return;

    if (reduced) {
      // One composed, motionless pose — rendered on demand, never animated.
      group.position.y = 0;
      group.rotation.set(0, 0, 0);
      group.scale.setScalar(scale);
      mesh.rotation.set(0.4, 0.6, 0);
      return;
    }

    // Clamp delta so a backgrounded tab doesn't fling the knot on return.
    const dt = Math.min(delta, 0.05);
    const progress = scrollRef?.current ?? 0;

    spin.current.x += dt * 0.16;
    spin.current.y += dt * 0.24;

    // Scrolling the hero away adds rotation on top of the idle spin.
    mesh.rotation.x = spin.current.x + progress * 1.6;
    mesh.rotation.y = spin.current.y + progress * 2.4;

    group.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.11;

    // Lean toward the cursor — damped, frame-rate independent, never a snap.
    group.rotation.y = MathUtils.damp(group.rotation.y, state.pointer.x * 0.34, 3, dt);
    group.rotation.x = MathUtils.damp(group.rotation.x, -state.pointer.y * 0.26, 3, dt);

    group.scale.setScalar(scale * (1 - progress * 0.22));
  });

  return (
    <group ref={groupRef} scale={scale}>
      <mesh ref={meshRef} rotation={[0.4, 0.6, 0]}>
        <torusKnotGeometry args={[1, 0.34, tubularSegments, radialSegments]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.05}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.6}
        />
      </mesh>
    </group>
  );
}
