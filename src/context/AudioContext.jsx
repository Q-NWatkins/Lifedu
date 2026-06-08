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
 * Centralized background-music engine with a tiny cross-fade state machine.
 *
 * Two looping HTML5 Audio nodes (exploration + combat) are kept alive for the
 * app's lifetime. Switching `mode` eases the outgoing track's gain to 0 and the
 * incoming track's gain to the master `volume`, giving a smooth cross-fade.
 *
 * Track URLs are royalty-free placeholders — drop your own loops into
 * `public/audio/` (or point these at a CDN). Missing files fail silently.
 */
const TRACKS = {
  exploration: '/audio/exploration-loop.mp3', // upbeat adventurous fantasy loop
  combat: '/audio/combat-loop.mp3', // intense driving dark rhythm
};

const VOLUME_KEY = 'wit-audio-volume';
const FADE_STEP = 0.05; // gain change per tick
const FADE_MS = 60;

const clamp01 = (v) => Math.min(1, Math.max(0, v));

function loadVolume() {
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    if (raw != null) return clamp01(Number(raw));
  } catch {
    // ignore
  }
  return 0.6;
}

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [volume, setVolumeState] = useState(loadVolume);
  const [mode, setMode] = useState(null); // 'exploration' | 'combat' | null

  const tracksRef = useRef(null);
  const targetsRef = useRef({ exploration: 0, combat: 0 });
  const fadeRef = useRef(null);
  const volumeRef = useRef(volume);
  const modeRef = useRef(mode);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Create the persistent audio nodes once.
  useEffect(() => {
    const make = (src) => {
      const audio = new Audio(src);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      return audio;
    };
    tracksRef.current = {
      exploration: make(TRACKS.exploration),
      combat: make(TRACKS.combat),
    };

    return () => {
      if (fadeRef.current) clearInterval(fadeRef.current);
      const tracks = tracksRef.current;
      if (tracks) {
        Object.values(tracks).forEach((a) => {
          a.pause();
          a.src = '';
        });
      }
    };
  }, []);

  const runFade = useCallback(() => {
    if (fadeRef.current) return; // already fading
    fadeRef.current = setInterval(() => {
      const tracks = tracksRef.current;
      if (!tracks) return;
      let stillFading = false;

      for (const key of Object.keys(tracks)) {
        const audio = tracks[key];
        const target = targetsRef.current[key];
        const diff = target - audio.volume;

        if (Math.abs(diff) <= FADE_STEP) {
          audio.volume = clamp01(target);
          if (target === 0 && !audio.paused) audio.pause();
        } else {
          audio.volume = clamp01(audio.volume + Math.sign(diff) * FADE_STEP);
          stillFading = true;
        }
      }

      if (!stillFading) {
        clearInterval(fadeRef.current);
        fadeRef.current = null;
      }
    }, FADE_MS);
  }, []);

  // Whenever mode or volume changes, recompute targets and (re)start the fade.
  useEffect(() => {
    const tracks = tracksRef.current;
    if (!tracks) return;

    for (const key of Object.keys(tracks)) {
      const isActive = key === mode;
      targetsRef.current[key] = isActive ? volume : 0;
      if (isActive) {
        // play() may reject until the first user gesture — that's fine.
        tracks[key].play?.().catch(() => {});
      }
    }
    runFade();
  }, [mode, volume, runFade]);

  // Browser autoplay policies block audio until a user gesture. On the first
  // interaction, resume whatever track the current mode wants.
  useEffect(() => {
    const unlock = () => {
      const tracks = tracksRef.current;
      const current = modeRef.current;
      if (tracks && current) tracks[current].play?.().catch(() => {});
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const setVolume = useCallback((next) => {
    const vol = clamp01(Number(next));
    setVolumeState(vol);
    try {
      localStorage.setItem(VOLUME_KEY, String(vol));
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      mode,
      volume,
      setVolume,
      setMode,
      playExploration: () => setMode('exploration'),
      playCombat: () => setMode('combat'),
      stopMusic: () => setMode(null),
    }),
    [mode, volume, setVolume],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}