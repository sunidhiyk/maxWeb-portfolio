import { useEffect, useMemo, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { CanvasTexture, LinearFilter, NoColorSpace } from 'three';

const NOTHING_PAINTED = 0;
const PAINTED = 1;
/** The 2D canvas changed size, so the GPU-side allocation is the wrong shape. */
const REALLOCATED = 2;

/** Cap on the texture's long edge — beyond this the extra detail is invisible
 *  once the mesh has smeared it, and the upload cost stops being free. */
const MAX_EDGE = 2048;

function token(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/**
 * Repaints an approximation of what sits *behind* the canvas — the page surface
 * plus the three colossal hero lines — into a 2D canvas that matches the WebGL
 * canvas pixel for pixel.
 *
 * WebGL can only refract what is inside its own scene, and the hero's type is
 * DOM text. Rather than move the type into the scene (which would hand the
 * headline's legibility to the GPU) the type is *reproduced* here, off-screen,
 * purely as something for the knot to bend. It is never displayed directly: it
 * is only ever read through the mesh, distorted, so sub-pixel differences from
 * the real text are not perceivable — while the real DOM text stays the thing
 * the page actually shows and a screen reader actually reads.
 */
function paintBackdrop(target, host) {
  const rect = host.getBoundingClientRect();
  if (rect.width < 4 || rect.height < 4) return NOTHING_PAINTED;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const scale = Math.min(dpr, MAX_EDGE / Math.max(rect.width, rect.height));
  const w = Math.max(4, Math.round(rect.width * scale));
  const h = Math.max(4, Math.round(rect.height * scale));
  const resized = target.width !== w || target.height !== h;
  target.width = w;
  target.height = h;

  const ctx = target.getContext('2d');
  if (!ctx) return NOTHING_PAINTED;

  ctx.setTransform(scale, 0, 0, scale, 0, 0); // from here on, work in CSS pixels
  ctx.fillStyle = token('--bg', '#e9e9e7');
  ctx.fillRect(0, 0, rect.width, rect.height);

  ctx.fillStyle = token('--ink', '#111111');
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  let painted = false;

  document.querySelectorAll('.hero-line').forEach((line) => {
    const glyphs = line.firstElementChild; // .hero-line-i
    if (!glyphs) return;
    const text = (glyphs.textContent || '').trim();
    if (!text) return;

    // Measure the mask, not the inner span: the span carries the intro's
    // translate, so its own rect is 130% off during the reveal. The mask is
    // untransformed at rest, and the span exactly fills its content box.
    const box = line.getBoundingClientRect();
    const maskStyle = getComputedStyle(line);
    const padTop = parseFloat(maskStyle.paddingTop) || 0;
    const padLeft = parseFloat(maskStyle.paddingLeft) || 0;

    const style = getComputedStyle(glyphs);
    const size = parseFloat(style.fontSize) || 0;
    if (!size) return;

    ctx.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing;
    }

    // Re-derive the CSS baseline: half-leading above the font's own ascent,
    // inside the line box the mask's padding is hiding.
    const metrics = ctx.measureText(text);
    const ascent = metrics.fontBoundingBoxAscent ?? size * 0.8;
    const descent = metrics.fontBoundingBoxDescent ?? size * 0.2;
    const lineBox = box.height - padTop * 2;
    const baseline = box.top + padTop + (lineBox - (ascent + descent)) / 2 + ascent;

    ctx.fillText(text, box.left + padLeft - rect.left, baseline - rect.top);
    painted = true;
  });

  return painted ? (resized ? REALLOCATED : PAINTED) : NOTHING_PAINTED;
}

/**
 * Keeps a CanvasTexture of the hero's backdrop in sync with the DOM.
 * Returns `[texture, ready]` — `ready` stays false until the type has actually
 * been drawn, so the material can fall back to plain chrome until then.
 */
export function useHeroBackdrop(active = true) {
  const invalidate = useThree((s) => s.invalidate);
  const domElement = useThree((s) => s.gl.domElement);
  const size = useThree((s) => s.size);
  const [ready, setReady] = useState(false);

  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const tex = new CanvasTexture(document.createElement('canvas'));
    tex.flipY = false; // the 2D canvas is drawn top-down, like the DOM
    tex.colorSpace = NoColorSpace; // straight passthrough — see ChromeKnot
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    tex.generateMipmaps = false;
    return tex;
  }, []);

  useEffect(() => () => texture?.dispose(), [texture]);

  useEffect(() => {
    if (!texture || !active || !domElement) return undefined;
    const host = domElement.parentElement ?? domElement;

    let raf = 0;
    let live = true;
    const redraw = () => {
      if (!live) return;
      const result = paintBackdrop(texture.image, host);
      if (result === NOTHING_PAINTED) return;
      // A CanvasTexture whose canvas has been resized cannot be re-uploaded in
      // place: three copies the new pixels into the allocation made for the old
      // size and the driver rejects the call outright (GL_INVALID_VALUE on
      // glCopySubTexture), leaving the sampler on whatever was there first —
      // for us the blank 300x150 canvas every <canvas> starts life as, which
      // read as solid black through the mesh. Dropping the texture forces a
      // fresh allocation at the new size.
      if (result === REALLOCATED) texture.dispose();
      texture.needsUpdate = true;
      setReady(true);
      invalidate(); // matters in `demand` mode, where nothing else asks for a frame
    };
    const schedule = () => {
      if (!live) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(redraw);
    };

    schedule();

    // Web fonts land after first paint and move every glyph; the fluid type
    // scale moves them again on any resize. `fonts.ready` can settle after
    // this effect is torn down, hence the `live` guard rather than a bare call.
    document.fonts?.ready?.then(schedule).catch(() => {});
    const timers = [500, 1600].map((ms) => window.setTimeout(schedule, ms));
    window.addEventListener('resize', schedule);

    return () => {
      live = false;
      cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      window.removeEventListener('resize', schedule);
    };
  }, [active, texture, invalidate, domElement, size.width, size.height]);

  return [texture, ready];
}
