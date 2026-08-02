import { useState } from 'react';
import {
  ACCESSIBILITY_DEFAULTS,
  loadAccommodations,
  saveAccommodations,
} from '../../context/AccessibilityContext.jsx';
import { neuBtn } from '../../styles/neubrutalism.js';

const FONT_OPTIONS = [
  { value: 'default', label: 'Standard' },
  { value: 'lexend', label: 'Lexend (Highly Legible)' },
  { value: 'open-dyslexic', label: 'OpenDyslexic' },
];

const VISUAL_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'high-contrast', label: 'High Contrast (Black/Yellow)' },
  { value: 'warm-tint', label: 'Soft Warm Pastel Tint' },
];

const SCAN_SPEEDS = [
  { value: 1000, label: '1.0s' },
  { value: 1500, label: '1.5s' },
  { value: 2000, label: '2.0s' },
];

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 border-black bg-white px-3 py-2 text-black">
      <span>
        <span className="block text-sm font-black">{label}</span>
        {hint && <span className="block text-[11px] font-semibold text-black/60">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full border-2 border-black transition-colors ${
          checked ? 'bg-green-400' : 'bg-stone-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full border-2 border-black bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

/**
 * Teacher "IEP / Accommodations" drawer for a single student. Loads that
 * student's saved profile, lets the teacher tune TTS, typography, visual tint,
 * and switch access, then persists it — applied whenever that student logs in.
 */
export default function AccommodationsModal({ student, onClose }) {
  const [settings, setSettings] = useState(() =>
    student?.id ? loadAccommodations(student.id) : { ...ACCESSIBILITY_DEFAULTS },
  );
  const [saved, setSaved] = useState(false);

  const set = (key, value) => {
    setSaved(false);
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (student?.id) saveAccommodations(student.id, settings);
    setSaved(true);
  };

  return (
    <div
      className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Accommodations for ${student?.name ?? 'student'}`}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border-4 border-cyan-400/70 bg-indigo-950 p-6 text-cyan-50 shadow-[inset_0_0_24px_rgba(34,211,238,0.35),0_8px_0_rgba(0,0,0,0.4)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">⚙️ IEP / Accommodations</h2>
            <p className="text-xs font-semibold opacity-70">{student?.name ?? 'Student'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-0.5 text-lg font-black text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* 🔊 Text-to-Speech */}
        <section className="mt-4">
          <h3 className="text-sm font-black">🔊 Text-to-Speech</h3>
          <div className="mt-2 space-y-2">
            <Toggle
              label="Enable Speech Controls"
              hint="Show 🔊 speaker buttons on questions & answers"
              checked={settings.ttsEnabled}
              onChange={(v) => set('ttsEnabled', v)}
            />
            <Toggle
              label="Auto-Read Questions"
              hint="Speak each question aloud when it opens"
              checked={settings.ttsAutoRead}
              onChange={(v) => set('ttsAutoRead', v)}
            />
          </div>
        </section>

        {/* 🔤 Typography & Dyslexia support */}
        <section className="mt-4">
          <h3 className="text-sm font-black">🔤 Typography & Dyslexia Support</h3>
          <label className="mt-2 block">
            <span className="text-[11px] font-bold uppercase tracking-wide opacity-70">Font choice</span>
            <select
              value={settings.fontStyle}
              onChange={(e) => set('fontStyle', e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black"
            >
              {FONT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </section>

        {/* 🎨 Visual stress tint */}
        <section className="mt-4">
          <h3 className="text-sm font-black">🎨 Visual Stress Tint</h3>
          <label className="mt-2 block">
            <span className="text-[11px] font-bold uppercase tracking-wide opacity-70">Visual mode</span>
            <select
              value={settings.visualMode}
              onChange={(e) => set('visualMode', e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black"
            >
              {VISUAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </section>

        {/* 🕹️ Switch device access */}
        <section className="mt-4">
          <h3 className="text-sm font-black">🕹️ Switch Device Access (Motor Support)</h3>
          <div className="mt-2 space-y-2">
            <Toggle
              label="Enable Switch Access"
              hint="Auto-scan answers; Space/Enter selects the highlighted one"
              checked={settings.switchAccess}
              onChange={(v) => set('switchAccess', v)}
            />
            {settings.switchAccess && (
              <div className="rounded-xl border-2 border-black bg-white px-3 py-2 text-black">
                <span className="text-[11px] font-bold uppercase tracking-wide text-black/60">
                  Scan speed
                </span>
                <div className="mt-1 flex gap-2">
                  {SCAN_SPEEDS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => set('switchScanSpeedMs', s.value)}
                      className={`flex-1 rounded-lg border-2 border-black px-2 py-1 text-xs font-black ${
                        settings.switchScanSpeedMs === s.value
                          ? 'bg-cyan-400 text-cyan-950'
                          : 'bg-stone-100 text-black hover:bg-stone-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className={`${neuBtn} flex-1 bg-green-400 px-4 py-2.5 text-sm text-black hover:bg-green-300`}
          >
            {saved ? '✅ Saved!' : 'Save Accommodations'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`${neuBtn} bg-white px-4 py-2.5 text-sm text-black hover:bg-stone-100`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}