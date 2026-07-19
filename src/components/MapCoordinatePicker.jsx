import { useMemo, useRef, useState } from 'react';
import { listStaticMaps } from '../data/staticMaps.js';

/**
 * DEV TOOL — Map Coordinate Picker.
 *
 * Mount anywhere during development to trace the board paths over every premium
 * background. Pick a curriculum map from the dropdown (Science / Reading / History,
 * all grades & stages), then click along the trail in the artwork. Each click
 * records an { x, y } as a PERCENTAGE of the board (the same 0–100 space
 * MapComponent uses) so the result pastes straight into `src/data/staticMaps.js`.
 *
 * The preview is a massive ~80vw showstopper locked to each image's NATIVE aspect
 * ratio, so the art is shown fully — never compressed or clipped. Coordinates are
 * aggregated into a copy-pasteable block labeled with the current map.
 *
 * Not wired into the app by default — import it into a route/screen when needed.
 */
export default function MapCoordinatePicker() {
  const maps = useMemo(() => listStaticMaps(), []);
  const [key, setKey] = useState(maps[0] ? mapKey(maps[0]) : '');
  const [pointsByKey, setPointsByKey] = useState({});
  const boardRef = useRef(null);

  const active = maps.find((m) => mapKey(m) === key) ?? maps[0];
  const points = pointsByKey[key] ?? [];

  const json = useMemo(
    () =>
      `// ${active?.label ?? ''} — ${points.length} nodes\n[\n` +
      points.map((p) => `  { x: ${p.x}, y: ${p.y} },`).join('\n') +
      '\n]',
    [active, points],
  );

  function setPoints(updater) {
    setPointsByKey((prev) => ({ ...prev, [key]: updater(prev[key] ?? []) }));
  }

  function handleClick(e) {
    const rect = boardRef.current.getBoundingClientRect();
    const x = +(((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
    const y = +(((e.clientY - rect.top) / rect.height) * 100).toFixed(1);
    setPoints((prev) => {
      const next = [...prev, { x, y }];
      console.log(`[MapPicker] ${active?.label} node ${next.length}`, { x, y });
      console.log('[MapPicker]\n' + JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="mx-auto w-full max-w-[80vw] space-y-3 p-4 font-mono text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="rounded border-2 border-black px-2 py-1 font-bold"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        >
          {maps.map((m) => (
            <option key={mapKey(m)} value={mapKey(m)}>
              {m.label} ({m.count} nodes)
            </option>
          ))}
        </select>
        <button
          type="button"
          className="rounded border-2 border-black bg-yellow-300 px-2 py-1 font-bold"
          onClick={() => setPoints((p) => p.slice(0, -1))}
        >
          Undo
        </button>
        <button
          type="button"
          className="rounded border-2 border-black bg-red-300 px-2 py-1 font-bold"
          onClick={() => setPoints(() => [])}
        >
          Clear
        </button>
        <span className="ml-auto font-bold">
          {active?.label} · {points.length} nodes
        </span>
      </div>

      {/* Massive board preview, locked to the image's native aspect ratio. */}
      <div
        ref={boardRef}
        onClick={handleClick}
        className="relative mx-auto w-full cursor-crosshair overflow-hidden rounded-[28px] border-4 border-black bg-black"
        style={{ aspectRatio: active?.aspect ?? '1 / 1' }}
      >
        {active?.image && (
          <img src={active.image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-fill" />
        )}
        {points.map((p, i) => (
          <div
            key={i}
            className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-black bg-lime-300 text-[9px] font-black shadow-[2px_2px_0_rgba(0,0,0,0.8)]"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <textarea
        readOnly
        className="h-48 w-full rounded border-2 border-black p-2"
        value={json}
        onFocus={(e) => e.target.select()}
      />
    </div>
  );
}

function mapKey(m) {
  return `${m.realm}-${m.grade}-${m.stage}`;
}