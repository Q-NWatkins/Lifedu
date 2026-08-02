import { speakText, useAccessibility } from '../../context/AccessibilityContext.jsx';

/**
 * Reusable Text-to-Speech button. Renders (and works) only when the student's
 * `ttsEnabled` accommodation is on, so it can be dropped next to any prompt or
 * answer choice and stays invisible for students who don't need it.
 */
export default function SpeakerButton({ text, className = '', label = 'Read aloud' }) {
  const { settings } = useAccessibility();
  if (!settings.ttsEnabled || !text) return null;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        speakText(text);
      }}
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white text-xs leading-none shadow-[1px_1px_0_rgba(0,0,0,0.4)] transition-transform hover:scale-110 hover:bg-cyan-100 ${className}`}
    >
      🔊
    </button>
  );
}