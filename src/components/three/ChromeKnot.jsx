import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector2, Vector3 } from 'three';
import { useHeroBackdrop } from './useHeroBackdrop';

const VERTEX = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vViewPos;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

/**
 * Screen-space refraction.
 *
 * The backdrop texture lines up with the canvas one-to-one, so the fragment's
 * own `gl_FragCoord` is the lookup into "what is directly behind me". Pushing
 * that lookup along the surface normal is the whole trick: the type behind the
 * mesh gets dragged around the curve of the tube, hardest at grazing angles,
 * which is what makes a solid ribbon read as a transparent one.
 *
 * Colour is deliberately handled in sRGB throughout — the texture is uploaded
 * with NoColorSpace and this shader writes straight to the framebuffer without
 * an encoding step. That makes the surface colour behind the knot match the
 * page's own `--bg` exactly, which matters far more here than physically
 * linear specular maths: a half-shade mismatch would draw the knot's
 * silhouette as a visible plate over the page.
 */
const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D uBackdrop;
  uniform vec2 uResolution;
  uniform float uBend;
  uniform float uAberration;
  uniform float uMirror;
  uniform float uRefract;
  uniform vec3 uSurface;

  varying vec3 vNormalV;
  varying vec3 vViewPos;

  vec3 backdrop(vec2 uv) {
    return texture2D(uBackdrop, clamp(uv, vec2(0.001), vec2(0.999))).rgb;
  }

  void main() {
    vec3 N = normalize(vNormalV);
    vec3 V = normalize(-vViewPos);
    float facing = clamp(dot(N, V), 0.0, 1.0);
    float grazing = 1.0 - facing;
    float fres = pow(grazing, 2.6);

    // gl_FragCoord counts up from the bottom; the backdrop is drawn top-down.
    vec2 uv = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uResolution;

    // --- refraction: the type behind the mesh, bent ---------------------
    // The offset is driven by how far the surface has turned away from the
    // eye, so it falls to nothing face-on — the type reads straight through
    // and the knot all but disappears — and climbs steeply around the curve
    // of the tube, where it drags the glyphs into a ribbon. A constant offset
    // instead just stamped a dark shape over the letters.
    vec2 bend = N.xy * uBend * pow(grazing, 1.8);

    // Three taps, per-channel, so a letter edge arrives as a graded swirl
    // with a prismatic fringe rather than a hard black band.
    vec3 refr = vec3(
      backdrop(uv + bend * (0.45 + uAberration * 0.5)).r,
      backdrop(uv + bend * 0.45).g,
      backdrop(uv + bend * (0.45 - uAberration * 0.5)).b
    ) * 0.5;
    refr += vec3(
      backdrop(uv + bend * (1.0 + uAberration)).r,
      backdrop(uv + bend).g,
      backdrop(uv + bend * (1.0 - uAberration)).b
    ) * 0.31;
    refr += vec3(
      backdrop(uv + bend * (1.9 + uAberration * 1.6)).r,
      backdrop(uv + bend * 1.9).g,
      backdrop(uv + bend * (1.9 - uAberration * 1.6)).b
    ) * 0.19;

    // --- the chrome shell ----------------------------------------------
    vec3 R = reflect(-V, N);

    // The page's own black type, mirrored back off the surface. This is what
    // supplies the hard light/dark marbling a polished metal has; refraction
    // alone averages out to smoke.
    vec2 mirrorUv = R.xy * uMirror;
    vec3 mirror = vec3(
      backdrop(uv + mirrorUv * (1.0 + uAberration)).r,
      backdrop(uv + mirrorUv).g,
      backdrop(uv + mirrorUv * (1.0 - uAberration)).b
    );

    // A one-line studio: bright overhead, dim below. It gives the tube light
    // of its own, so the form still reads where the page behind is flat.
    float up = clamp(R.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 env = mix(vec3(0.07), vec3(1.0), smoothstep(0.22, 0.92, up));
    vec3 shell = mirror * 0.42 + env * 0.58;

    // Glass at the centre of the tube, metal around its rim. The floor is not
    // zero on purpose: over an empty stretch of page there is nothing for the
    // refraction to bend, and without a little metal underneath it the knot
    // flattens into a white mass — most visible on a narrow viewport, where
    // the type covers far less of the canvas.
    vec3 col = mix(refr, shell, 0.28 + fres * 0.62);

    // Tight highlights only — a broad one blows the whole knot out to white.
    float spec = pow(max(dot(R, normalize(vec3(0.3, 0.8, 0.5))), 0.0), 140.0);
    float glint = pow(max(dot(R, normalize(vec3(-0.65, -0.1, 0.75))), 0.0), 60.0);
    col += vec3(1.0) * (spec * 0.55 + glint * 0.18);

    // Pink at half strength. The fringe is additive and the page behind it is
    // now black, so it carries much further than it did over a light canvas —
    // at full value it stops reading as a fringe and the tube looks lit from
    // inside.
    col += vec3(0.50, 0.15, 0.33) * pow(grazing, 8.0); // brand pink fringe (#FF4BA7)

    // A thin darkening right at the silhouette: without it the tube dissolves
    // into the page wherever the type behind happens to be light, and the knot
    // stops reading as one continuous object.
    col *= 1.0 - smoothstep(0.8, 1.0, grazing) * 0.35;

    // The taps average toward mid-grey; the page is pure black type on
    // near-white, so the contrast has to be pushed back out.
    col = clamp((col - 0.5) * 1.22 + 0.5, 0.0, 1.0);

    // Until the backdrop has been painted there is nothing to refract, so fall
    // back to plain chrome rather than sampling a blank texture as black.
    vec3 plain = mix(uSurface * 1.03, vec3(1.0), fres * 0.5) + vec3(spec + glint * 0.5);
    col = mix(plain, col, uRefract);

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`;

function surfaceColor() {
  if (typeof document === 'undefined') return new Vector3(0.0, 0.0, 0.0);
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  const hex = /^#([0-9a-f]{6})$/i.exec(raw);
  if (!hex) return new Vector3(0.0, 0.0, 0.0);
  const n = parseInt(hex[1], 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/**
 * The glass torus knot that floats between the hero's type lines.
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
  bend = 0.2,
}) {
  const groupRef = useRef(null);
  const meshRef = useRef(null);
  const spin = useRef({ x: 0.4, y: 0.6 });

  const gl = useThree((s) => s.gl);
  const [backdrop, backdropReady] = useHeroBackdrop(true);

  // Held as a plain object and handed to `shaderMaterial` once: every write
  // below goes through `mesh.material.uniforms`, so nothing here is re-created
  // per frame and React never re-renders because of a uniform change.
  const uniforms = useMemo(
    () => ({
      uBackdrop: { value: null },
      uResolution: { value: new Vector2(1, 1) },
      uBend: { value: bend },
      uAberration: { value: 0.12 },
      uMirror: { value: 0.22 },
      uRefract: { value: 0 },
      uSurface: { value: surfaceColor() },
    }),
    [bend]
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    if (!group || !mesh) return;

    const u = mesh.material.uniforms;
    const progress = scrollRef?.current ?? 0;

    gl.getDrawingBufferSize(u.uResolution.value);
    u.uBackdrop.value = backdrop;
    u.uBend.value = bend;
    // The hero scrolls as a whole, so the type stays behind the knot on the way
    // out — only the per-line parallax shifts it, by well under a glyph. Kept
    // at full strength: fading to flat chrome instead read as a pale ghost.
    u.uRefract.value = backdropReady && backdrop ? 1 : 0;

    if (reduced) {
      // One composed, motionless pose — rendered on demand, never animated.
      group.position.set(0, 0, 0);
      group.rotation.set(0, 0, 0);
      group.scale.setScalar(scale);
      mesh.rotation.set(0.4, 0.6, 0);
      return;
    }

    // Clamp delta so a backgrounded tab doesn't fling the knot on return.
    const dt = Math.min(delta, 0.05);

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
        <shaderMaterial
          vertexShader={VERTEX}
          fragmentShader={FRAGMENT}
          uniforms={uniforms}
        />
      </mesh>
    </group>
  );
}
