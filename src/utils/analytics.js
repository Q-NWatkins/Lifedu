import posthog from 'posthog-js';
import { recordAttempt } from './classroomStore.js';

/**
 * Central question-attempt logger — the single choke point every answer path
 * (board tiles, boss battles, the trivia wheel) calls when a question is
 * answered. Today it emits a PostHog event (when analytics is configured) and a
 * dev-console trace; the same shape is ready to be persisted to Supabase for the
 * Teacher Portal analytics (e.g. a `question_attempts` table).
 *
 * @param {Object}  attempt
 * @param {string}  [attempt.studentId] Clerk user id of the answering student.
 * @param {string}  [attempt.subject]   'math' | 'science' | 'reading' | 'history'
 * @param {string}  [attempt.category]  legend category, e.g. 'addition_basics'
 * @param {number}  [attempt.stage]     stage number (1–5) when applicable
 * @param {boolean} attempt.isCorrect
 * @param {string}  [attempt.source]    where it happened: 'tile' | 'boss' | 'trivia'
 * @returns {Object} the normalized event payload.
 */
export function logQuestionAttempt({
  studentId = null,
  subject = null,
  category = null,
  stage = null,
  isCorrect,
  source = null,
} = {}) {
  const event = {
    studentId,
    subject,
    category,
    stage: stage ?? null,
    isCorrect: Boolean(isCorrect),
    source,
    ts: Date.now(),
  };

  // Fold into the classroom analytics aggregates (powers the Teacher roster
  // accuracy + Weekly Progress Report).
  try {
    recordAttempt({ studentId, subject, isCorrect: event.isCorrect });
  } catch {
    // never let analytics break gameplay
  }

  // Fire to PostHog when it's initialized (env-gated at app start).
  try {
    if (posthog && typeof posthog.capture === 'function' && posthog.__loaded) {
      posthog.capture('question_attempt', event);
    }
  } catch {
    // Never let telemetry break gameplay.
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[analytics] question_attempt', event);
  }

  return event;
}