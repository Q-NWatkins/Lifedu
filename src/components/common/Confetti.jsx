import { useEffect, useMemo } from 'react';

const COLORS = ['#f43f5e', '#fbbf24', '#4ade80', '#3b82f6', '#a855f7', '#22d3ee', '#fb923c'];

/**
 * Lightweight, dependency-free confetti burst. Renders ~36 falling pieces and
 * calls `onDone` after the animation completes so the parent can unmount it.
 */
export default function Confetti({ pieces = 36, duration = 1300, onDone }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        color: COLORS[i % COLORS.length],
        delay: `${Math.random() * 0.3}s`,
        dur: `${duration / 1000 + Math.random() * 0.5}s`,
        size: 6 + Math.round(Math.random() * 6),
        rounded: Math.random() > 0.5,
      })),
    [pieces, duration],
  );

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), duration + 600);
    return () => clearTimeout(t);
  }, [duration, onDone]);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden" aria-hidden="true">
      {bits.map((b) => (
        <span
          key={b.id}
          className={`animate-confetti absolute top-0 ${b.rounded ? 'rounded-full' : 'rounded-[2px]'}`}
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            background: b.color,
            animationDelay: b.delay,
            animationDuration: b.dur,
          }}
        />
      ))}
    </div>
  );
}
