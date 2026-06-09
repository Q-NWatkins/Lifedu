import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

/**
 * Centralized Background Music (BGM) engine.
 *
 * A registry of looping HTML5 Audio nodes (one per gameplay screen state) is
 * created once and kept alive for the app's lifetime. `switchTrack(key)` runs a
 * smooth 300ms cross-fade: the outgoing track fades to 0, pauses, and rewinds;
 * the incoming track fades up to the global `bgmVolume`.
 *
 * Track URLs are local public-asset placeholders — drop your own royalty-free
 * loops into `public/audio/`. Missing files fail silently.
 */
const TRACK_SOURCES = {
  hub: '/audio/hub_theme.mp3', // Quest Map & Power Stats
  backpack: '/audio/backpack_theme.mp3', // My Backpack view
  gameboard: '/audio/gameboard_theme.mp3', // active realm maps
  sideBoss: '/audio/sideboss_theme.mp3', // side-boss card fights
  finalBoss: '/audio/finalboss_theme.mp3', // final boss arena
};

const VOLUME_KEY = 'wit-bgm-volume';
const FADE_MS = 300;
const TICK_MS = 30;

const clamp01 = (v) => Math.min(1, Math.max(0, Number(v) || 0));

function loadVolume() {
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    if (raw != null) return clamp01(raw);
  } catch {
    // ignore
  }
  return 0.6;
}

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [bgmVolume, setBgmVolume] = useState(loadVolume);
  const [currentTrack, setCurrentTrack] = useState(null);

  const tracksRef = useRef(null);
  const currentKeyRef = useRef(null);
  const fadeRef = useRef(null);
  const volumeRef = useRef(bgmVolume);

  useEffect(() => {
    volumeRef.current = bgmVolume;
  }, [bgmVolume]);

  // ── Track registry: build the Audio nodes once ────────────────────────────
  useEffect(() => {
    const registry = {};
    for (const [key, src] of Object.entries(TRACK_SOURCES)) {
      const audio = new Audio(src);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      registry[key] = audio;
    }
    tracksRef.current = registry;

    return () => {
      if (fadeRef.current) clearInterval(fadeRef.current);
      Object.values(registry).forEach((a) => {
        a.pause();
        a.src = '';
      });
    };
  }, []);

  // ── Smooth cross-fade switcher ────────────────────────────────────────────
  const switchTrack = useCallback((newTrackKey) => {
    const tracks = tracksRef.current;
    if (!tracks) return;

    const fromKey = currentKeyRef.current;
    if (fromKey === newTrackKey) {
      // Already on this track — make sure it's actually playing.
      const same = newTrackKey ? tracks[newTrackKey] : null;
      same?.play?.().catch(() => {});
      return;
    }

    if (fadeRef.current) clearInterval(fadeRef.current);

    const outgoing = fromKey ? tracks[fromKey] : null;
    const incoming = newTrackKey ? tracks[newTrackKey] : null;
    const targetVol = volumeRef.current;

    currentKeyRef.current = newTrackKey ?? null;
    setCurrentTrack(newTrackKey ?? null);

    if (incoming) {
      incoming.volume = 0;
      incoming.play?.().catch(() => {});
    }

    const outStart = outgoing ? outgoing.volume : 0;
    let elapsed = 0;

    fadeRef.current = setInterval(() => {
      elapsed += TICK_MS;
      const t = Math.min(1, elapsed / FADE_MS);

      if (outgoing) outgoing.volume = clamp01(outStart * (1 - t));
      if (incoming) incoming.volume = clamp01(targetVol * t);

      if (t >= 1) {
        clearInterval(fadeRef.current);
        fadeRef.current = null;
        if (outgoing) {
          outgoing.pause();
          outgoing.currentTime = 0; // reset outgoing playback position
        }
        if (incoming) incoming.volume = targetVol;
      }
    }, TICK_MS);
  }, []);

  // ── Global volume control ─────────────────────────────────────────────────
  const updateVolume = useCallback((newValue) => {
    const vol = clamp01(newValue);
    volumeRef.current = vol;
    setBgmVolume(vol);
    try {
      localStorage.setItem(VOLUME_KEY, String(vol));
    } catch {
      // ignore
    }
    // Apply across all registered elements at once (only the active one is audible).
    const tracks = tracksRef.current;
    if (!tracks) return;
    for (const key of Object.keys(tracks)) {
      tracks[key].volume = key === currentKeyRef.current ? vol : 0;
    }
  }, []);

  // ── One-shot sound snippet helper ─────────────────────────────────────────
  const playSfx = useCallback((src) => {
    if (!src) return;
    try {
      const sfx = new Audio(src);
      sfx.volume = volumeRef.current;
      sfx.play?.().catch(() => {});
    } catch {
      // ignore
    }
  }, []);

  // Browser autoplay policies block audio until the first user gesture.
  useEffect(() => {
    const unlock = () => {
      const tracks = tracksRef.current;
      const key = currentKeyRef.current;
      if (tracks && key) tracks[key].play?.().catch(() => {});
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const value = useMemo(
    () => ({
      bgmVolume,
      currentTrack,
      switchTrack,
      // Alias: same smooth cross-fade switcher, friendlier verb for callers.
      playTrack: switchTrack,
      updateVolume,
      playSfx,
    }),
    [bgmVolume, currentTrack, switchTrack, updateVolume, playSfx],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useGameAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useGameAudio must be used within AudioProvider');
  return ctx;
}