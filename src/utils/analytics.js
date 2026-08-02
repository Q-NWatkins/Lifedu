import posthog from 'posthog-js';
import { recordAttempt, recordAttemptRemote } from './classroomStore.js';

/**
 * Central question-attempt logger — the single choke point every answer path
 * (board tiles, boss battles, the trivia wheel) calls when a question is
 * answered. It persists to Supabase `question_attempts` (cross-device Teacher
 * analytics), folds into local aggregates, emits a PostHog event, and traces
 * in dev.
 *
 * @param {Object}  attempt
 * @param {string}  [attempt.studentId] Clerk user id of the answering student.
 * @param {string}  [attempt.classCode] the student's active class code, if joined.
 * @param {string}  [attempt.subject]   realm: 'math' | 'science' | 'reading' | 'history'
 * @param {string}  [attempt.category]  topic/legend category, e.g. 'addition_basics'
 * @param {number}  [attempt.grade]     grade level (1–5) when applicable
 * @param {number}  [attempt.stage]     stage number (1–5) when applicable
 * @param {boolean} attempt.isCorrect
 * @param {string}  [attempt.source]    where it happened: 'tile' | 'boss' | 'trivia'
 * @returns {Object} the normalized event payload.
 */
export function logQuestionAttempt({
  studentId = null,
  classCode = null,
  subject = null,
  category = null,
  grade = null,
  stage = null,
  isCorrect,
  source = null,
} = {}) {
  const event = {
    studentId,
    classCode,
    subject,
    category,
    grade: grade ?? null,
    stage: stage ?? null,
    isCorrect: Boolean(isCorrect),
    source,
    ts: Date.now(),
  };

  // Persist to Supabase so the teacher sees this student's accuracy on any
  // device (fire-and-forget; no-op when Supabase isn't configured).
  try {
    recordAttemptRemote({
      studentId,
      classCode,
      realm: subject,
      grade,
      stage,
      topic: category,
      isCorrect: event.isCorrect,
    });
  } catch {
    // never let analytics break gameplay
  }

  // Fold into local aggregates too (offline fallback + this device's view).
  try {
    recordAttempt({ studentId, subject, category, isCorrect: event.isCorrect });
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