import { useEffect, useRef, useState } from 'react';
import { SHEET_SPEC } from '../../config/avatars.js';

/**
 * Animated sprite-sheet hero renderer.
 *
 * Drives a single 46×46 frame out of the shared 8×6 sheet via CSS
 * `background-position`, stepped by `requestAnimationFrame`. Continuously loops
 * the Row-1 idle animation; whenever `attackNonce` increments it plays the
 * Row-4 attack once, then smoothly returns to idle.
 *
 * Reused by the Quest Map token (idle only) and Boss Battle (idle + attack).
 *
 * @param {string} sheet        Full sprite-sheet URL (null → renders nothing).
 * @param {number} [size=64]    Rendered square size in px (frame is scaled to fit).
 * @param {number} [attackNonce=0] Bump this to trigger a one-shot attack animation.
 * @param {string} [className]  Extra classes (e.g. drop-shadow / bob wrapper).
 * @param {string} [alt]        Accessible label.
 */
export default function AnimatedAvatar({
  sheet,
  size = 64,
  action = 'idle',
  attackNonce = 0,
  className = '',
  alt = 'Hero',
}) {
  const { frameW, frameH, sheetW, sheetH, animations } = SHEET_SPEC;
  const scale = size / frameW;

  const [{ row, col }, setFrame] = useState({ row: animations.idle.row, col: 0 });
  const stateRef = useRef({ anim: 'idle', frame: 0, last: 0 });
  const baseActionRef = useRef(action);
  const rafRef = useRef(null);

  // Switch the base loop (idle <-> walk) immediately, unless mid-attack.
  useEffect(() => {
    baseActionRef.current = animations[action] ? action : 'idle';
    if (stateRef.current.anim !== 'attack') {
      stateRef.current.anim = baseActionRef.current;
      stateRef.current.frame = 0;
    }
  }, [action, animations]);

  // Trigger the one-shot attack when the nonce changes (skip the initial 0).
  useEffect(() => {
    if (attackNonce > 0) {
      stateRef.current.anim = 'attack';
      stateRef.current.frame = 0;
      stateRef.current.last = 0;
    }
  }, [attackNonce]);

  useEffect(() => {
    if (!sheet) return undefined;
    let mounted = true;

    const tick = (t) => {
      const s = stateRef.current;
      const cfg = animations[s.anim] ?? animations.idle;
      if (t - s.last >= 1000 / cfg.fps) {
        s.last = t;
        s.frame += 1;
        if (s.frame >= cfg.frames) {
          if (cfg.loop) {
            s.frame = 0;
          } else {
            // Non-looping (attack) finished — return to the base loop.
            s.anim = baseActionRef.current;
            s.frame = 0;
          }
        }
        const active = animations[s.anim] ?? animations.idle;
        if (mounted) setFrame({ row: active.row, col: s.frame });
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sheet, animations]);

  if (!sheet) return null;

  return (
    <div
      role="img"
      aria-label={alt}
      className={className}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${sheet})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${sheetW * scale}px ${sheetH * scale}px`,
        backgroundPosition: `-${col * frameW * scale}px -${row * frameH * scale}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
}