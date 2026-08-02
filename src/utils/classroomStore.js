import { useSyncExternalStore } from 'react';

/**
 * Shared classroom store — the bridge between students and their teacher.
 *
 * Backed by localStorage so a teacher and their students (same browser/device,
 * different logins) can see a live roster without a backend. The same API shape
 * is ready to swap for Supabase later. Everything is namespaced so it never
 * collides with a single student's own progress blob.
 *
 * Records:
 *   classes     [{ id, name, code, teacherId, createdAt }]
 *   students    [{ id, name, classCode, currentRealm, grade, accuracy, iepSettings, joinedAt }]
 *   assignments [{ id, classCode, title, realm, grade, stage, accuracyGoal, focusMode, createdAt }]
 *   attempts    { [studentId]: { total, correct, bySubject:{[s]:{total,correct}}, week:{start,total,correct} } }
 */

const CLASSES_KEY = 'wit-classroom-classes';
const STUDENTS_KEY = 'wit-classroom-students';
const ASSIGN_KEY = 'wit-classroom-assignments';
const ATTEMPTS_KEY = 'wit-classroom-attempts';

export const SUBJECT_ORDER = ['math', 'science', 'reading', 'history'];
export const REALM_LABELS = {
  math: 'Math Volcano',
  science: 'Science Cosmos',
  reading: 'Reading Realm',
  history: 'History Timeline',
};

/* ── low-level storage + subscription ─────────────────────────────────────── */

let version = 0;
const listeners = new Set();

function emit() {
  version += 1;
  listeners.forEach((l) => l());
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
  emit();
}

function subscribe(cb) {
  listeners.add(cb);
  const onStorage = () => cb();
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

/** React hook: re-renders whenever any classroom record changes. */
export function useClassroomStore() {
  return useSyncExternalStore(subscribe, () => version, () => version);
}

/* ── classes ──────────────────────────────────────────────────────────────── */

export function getClasses() {
  return read(CLASSES_KEY, []);
}

export function getClassesForTeacher(teacherId) {
  return getClasses().filter((c) => c.teacherId === teacherId);
}

export function newJoinCode() {
  return `QUEST-${Math.floor(Math.random() * 90) + 10}`; // e.g. QUEST-42
}

export function addClass({ name, code, teacherId }) {
  const cls = {
    id: `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    code,
    teacherId: teacherId ?? null,
    createdAt: Date.now(),
  };
  write(CLASSES_KEY, [...getClasses(), cls]);
  return cls;
}

/* ── students ─────────────────────────────────────────────────────────────── */

export function getStudents() {
  return read(STUDENTS_KEY, []);
}

export function getStudentsForCodes(codes = []) {
  const set = new Set(codes);
  return getStudents().filter((s) => set.has(s.classCode));
}

/** Upsert a student's join record (unique per id + classCode). */
export function joinClassroom(profile) {
  if (!profile?.id || !profile?.classCode) return null;
  const students = getStudents();
  const idx = students.findIndex((s) => s.id === profile.id && s.classCode === profile.classCode);
  const merged = {
    ...(idx >= 0 ? students[idx] : {}),
    ...profile,
    joinedAt: idx >= 0 ? students[idx].joinedAt : Date.now(),
  };
  const next = idx >= 0 ? students.map((s, i) => (i === idx ? merged : s)) : [...students, merged];
  write(STUDENTS_KEY, next);
  return merged;
}

/** Persist IEP accommodations onto a student's roster profile. */
export function updateStudentIep(studentId, iepSettings) {
  let changed = false;
  const next = getStudents().map((s) => {
    if (s.id === studentId) {
      changed = true;
      return { ...s, iepSettings: { ...(s.iepSettings ?? {}), ...iepSettings } };
    }
    return s;
  });
  if (changed) write(STUDENTS_KEY, next);
}

/* ── assignments ──────────────────────────────────────────────────────────── */

export function getAssignments() {
  return read(ASSIGN_KEY, []);
}

export function getAssignmentsForCode(code) {
  return getAssignments().filter((a) => a.classCode === code);
}

export function addAssignment(assignment) {
  const asg = {
    id: `asg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    focusMode: false,
    createdAt: Date.now(),
    ...assignment,
  };
  write(ASSIGN_KEY, [...getAssignments(), asg]);
  return asg;
}

/** Toggle focus on one assignment; turning it on clears focus on its classmates. */
export function setAssignmentFocus(assignmentId, on) {
  const target = getAssignments().find((a) => a.id === assignmentId);
  const next = getAssignments().map((a) => {
    if (a.id === assignmentId) return { ...a, focusMode: on };
    if (on && target && a.classCode === target.classCode) return { ...a, focusMode: false };
    return a;
  });
  write(ASSIGN_KEY, next);
}

/** The active focus-mode assignment for a class code, if any. */
export function getFocusAssignmentForCode(code) {
  if (!code) return null;
  return getAssignments().find((a) => a.classCode === code && a.focusMode) ?? null;
}

/* ── attempts (analytics) ─────────────────────────────────────────────────── */

function weekStart(ts = Date.now()) {
  const d = new Date(ts);
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - dow);
  return d.getTime();
}

export function getAttempts() {
  return read(ATTEMPTS_KEY, {});
}

/** Fold one answered question into a student's rolling + weekly aggregates. */
export function recordAttempt({ studentId, subject, isCorrect }) {
  if (!studentId) return;
  const all = getAttempts();
  const cur = all[studentId] ?? { total: 0, correct: 0, bySubject: {}, week: { start: weekStart(), total: 0, correct: 0 } };

  cur.total += 1;
  if (isCorrect) cur.correct += 1;

  const sub = subject ?? 'unknown';
  cur.bySubject[sub] = cur.bySubject[sub] ?? { total: 0, correct: 0 };
  cur.bySubject[sub].total += 1;
  if (isCorrect) cur.bySubject[sub].correct += 1;

  const ws = weekStart();
  if (!cur.week || cur.week.start !== ws) cur.week = { start: ws, total: 0, correct: 0 };
  cur.week.total += 1;
  if (isCorrect) cur.week.correct += 1;

  all[studentId] = cur;
  write(ATTEMPTS_KEY, all);
}

export function getAccuracy(studentId) {
  const a = getAttempts()[studentId];
  if (!a || !a.total) return 0;
  return Math.round((a.correct / a.total) * 100);
}