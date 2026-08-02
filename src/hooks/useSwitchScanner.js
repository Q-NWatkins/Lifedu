import { useEffect, useRef, useState } from 'react';

/**
 * Single-switch auto-scanner for motor accessibility.
 *
 * When `enabled`, cycles an active highlight index (0 → 1 → … → count-1 → 0)
 * every `speedMs`. A global Space / Enter keypress "activates" whichever item is
 * currently highlighted by calling `onSelect(index)`. Returns the active index
 * (or -1 when disabled) so the UI can render the highlight ring.
 *
 * @param {Object}   opts
 * @param {boolean}  opts.enabled
 * @param {number}   opts.count           number of scannable items
 * @param {number}   [opts.speedMs=1500]  ms per item
 * @param {(i:number)=>void} opts.onSelect
 */
export function useSwitchScanner({ enabled, count, speedMs = 1500, onSelect }) {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const selectRef = useRef(onSelect);

  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!enabled || !count || count <= 0) return undefined;

    setIndex(0);
    indexRef.current = 0;

    const id = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % count;
        indexRef.current = next;
        return next;
      });
    }, Math.max(400, speedMs));

    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        selectRef.current?.(indexRef.current);
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      clearInterval(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [enabled, count, speedMs]);

  return enabled ? index : -1;
}