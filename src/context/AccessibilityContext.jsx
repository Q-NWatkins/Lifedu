import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { fetchStudentIep, useClassroomSupabase } from '../utils/classroomStore.js';

/**
 * Teacher-managed accessibility / accommodation engine.
 *
 * A student's accommodations are persisted per-user (keyed by Clerk id) so they
 * follow the student across sessions/devices. A teacher can set them for any
 * student via `saveAccommodations(studentId, settings)`; when the edited student
 * is the one currently signed in, the change is applied live via a window event.
 */

export const ACCESSIBILITY_DEFAULTS = Object.freeze({
  ttsEnabled: false, // Enables speaker buttons on UI
  ttsAutoRead: false, // Auto-speaks questions on open
  fontStyle: 'default', // 'default' | 'lexend' | 'open-dyslexic'
  visualMode: 'default', // 'default' | 'high-contrast' | 'warm-tint'
  switchAccess: false, // Enables auto-scanning selector
  switchScanSpeedMs: 1500, // Milliseconds per item scan
});

const NS = 'wit-accessibility';
const keyFor = (studentId) => `${NS}:${studentId ?? 'guest'}`;
const UPDATE_EVENT = 'wit-accessibility-updated';

/** Load a student's saved accommodations (merged over defaults). */
export function loadAccommodations(studentId) {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    return raw
      ? { ...ACCESSIBILITY_DEFAULTS, ...JSON.parse(raw) }
      : { ...ACCESSIBILITY_DEFAULTS };
  } catch {
    return { ...ACCESSIBILITY_DEFAULTS };
  }
}

/** Persist a student's accommodations and notify any live listeners (same tab). */
export function saveAccommodations(studentId, settings) {
  const merged = { ...ACCESSIBILITY_DEFAULTS, ...settings };
  try {
    localStorage.setItem(keyFor(studentId), JSON.stringify(merged));
  } catch {
    // ignore storage errors
  }
  try {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { studentId, settings: merged } }));
  } catch {
    // ignore
  }
  return merged;
}

/** Speak text via the Web Speech API, at an elementary-friendly pace. */
export function speakText(text) {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(String(text));
  utterance.rate = 0.85; // Slightly slower pacing for elementary students
  window.speechSynthesis.speak(utterance);
}

const FONT_STACK = {
  default: null,
  lexend: "'Lexend', system-ui, sans-serif",
  'open-dyslexic': "'OpenDyslexic', 'Comic Sans MS', system-ui, sans-serif",
};

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const { session } = useAuth();
  const userId = session?.userId ?? null;

  useClassroomSupabase(); // ensure the live Supabase client is connected
  const [settings, setSettings] = useState(() => loadAccommodations(userId));

  // Reload this student's saved profile whenever the signed-in account changes.
  useEffect(() => {
    setSettings(loadAccommodations(userId));
  }, [userId]);

  // On login, pull any teacher-assigned accommodations from Supabase so the
  // student's IEP toggles auto-apply on this device even if set elsewhere.
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    (async () => {
      const remote = await fetchStudentIep(userId);
      if (alive && remote) {
        saveAccommodations(userId, remote); // persist locally for offline use
        setSettings((prev) => ({ ...prev, ...remote }));
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  // Live-apply when a teacher edits THIS signed-in student's accommodations.
  useEffect(() => {
    const onUpdate = (e) => {
      if (e.detail?.studentId === userId) setSettings(e.detail.settings);
    };
    window.addEventListener(UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(UPDATE_EVENT, onUpdate);
  }, [userId]);

  // Apply global visual accommodations (font + visual mode) to the document.
  useEffect(() => {
    const root = document.documentElement;
    document.body.dataset.font = settings.fontStyle;
    document.body.dataset.visual = settings.visualMode;
    const stack = FONT_STACK[settings.fontStyle];
    if (stack) root.style.setProperty('--font-main', stack);
    else root.style.removeProperty('--font-main');
  }, [settings.fontStyle, settings.visualMode]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (userId) saveAccommodations(userId, next);
      return next;
    });
  }, [userId]);

  const value = useMemo(
    () => ({ settings, updateSetting, speakText }),
    [settings, updateSetting],
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
}