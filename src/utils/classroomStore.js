import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  createClerkSupabaseClient,
  isSupabaseConfigured,
} from '../services/supabaseClient.js';

/**
 * Shared classroom store — the bridge between students and their teacher.
 *
 * CLASSES + ROSTER are now backed by Supabase (`classrooms` /
 * `classroom_students`) so a teacher and their students sync across devices
 * and browsers in real time. When Supabase isn't configured (local dev without
 * keys) the same API transparently falls back to localStorage.
 *
 * ASSIGNMENTS + ATTEMPT ANALYTICS remain localStorage-only — those tables were
 * not migrated, so Focus Mode / Weekly Report / Skill Analytics still operate
 * on this device's data.
 *
 * Supabase row shapes (snake_case) ↔ app shapes (camelCase):
 *   classrooms         { id, teacher_id, name, code, created_at }
 *   classroom_students { id, class_code, student_id, student_name, iep_settings, joined_at }
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

/* ── Supabase connection + reactive caches ────────────────────────────────── */

let supabase = null; // live Clerk-authed Supabase client, or null (offline)
let classesCache = null; // hydrated classrooms for the active teacher
let studentsCache = null; // hydrated roster for the active teacher's codes
let assignmentsCache = null; // hydrated assignments for the active teacher's codes
let attemptRowsCache = []; // hydrated question_attempts rows for the teacher's codes

const usingCloud = () => Boolean(supabase);
const normCode = (code) => String(code ?? '').trim().toUpperCase();

const TEACHER_ID_KEY = 'wit-teacher-id';

/**
 * Resolve a stable teacher identifier. Prefers the live Clerk id; if that's
 * momentarily missing, reuses (or mints + persists) a local fallback so class
 * creation never fails on a null id.
 */
export function resolveTeacherId(clerkUserId) {
  if (clerkUserId) return clerkUserId;
  let fallback = null;
  try {
    fallback = localStorage.getItem(TEACHER_ID_KEY);
    if (!fallback) {
      fallback = `teacher-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      localStorage.setItem(TEACHER_ID_KEY, fallback);
    }
  } catch {
    fallback = `teacher-${Date.now()}`;
  }
  return fallback;
}

function mapClassRow(r) {
  return {
    id: r.id,
    name: r.name,
    code: r.code,
    teacherId: r.teacher_id ?? null,
    createdAt: r.created_at ?? null,
  };
}

function mapStudentRow(r) {
  return {
    id: r.student_id,
    name: r.student_name ?? 'Student',
    classCode: r.class_code,
    grade: r.grade ?? 1,
    currentRealm: r.current_realm ?? undefined,
    accuracy: r.accuracy ?? 0,
    iepSettings: r.iep_settings ?? null,
    joinedAt: r.joined_at ?? null,
  };
}

function mapAssignmentRow(r) {
  return {
    id: r.id,
    classCode: r.class_code,
    teacherId: r.teacher_id ?? null,
    title: r.title,
    realm: r.target_realm,
    grade: r.target_grade,
    stage: r.target_stage,
    accuracyGoal: r.accuracy_goal,
    focusMode: Boolean(r.is_focus_mode),
    createdAt: r.created_at ?? null,
  };
}

/** Register the live Supabase client (idempotent). */
export function connectSupabase(client) {
  if (client && !supabase) {
    supabase = client;
    classesCache = classesCache ?? [];
    studentsCache = studentsCache ?? [];
    assignmentsCache = assignmentsCache ?? [];
  }
}

/**
 * Render-time hook that lazily builds the Clerk-authed Supabase client and
 * registers it with the store. Safe to call from any component that touches
 * classroom data. Returns whether cloud sync is active.
 */
export function useClassroomSupabase() {
  const { getToken } = useAuth();
  const tokenRef = useRef(getToken);
  tokenRef.current = getToken;
  if (isSupabaseConfigured() && !supabase) {
    connectSupabase(createClerkSupabaseClient({ getToken: () => tokenRef.current() }));
  }
  return usingCloud();
}

/** Pull the teacher's classes + full roster into the caches, then notify. */
async function hydrateTeacher(teacherId) {
  if (!usingCloud() || !teacherId) return;
  const { data: classRows, error: classErr } = await supabase
    .from('classrooms')
    .select('*')
    .eq('teacher_id', teacherId);
  if (classErr) {
    console.error('[classroomStore] hydrateTeacher (classrooms) failed:', classErr.message, classErr);
    return;
  }

  classesCache = (classRows ?? []).map(mapClassRow);
  const codes = classesCache.map((c) => c.code);

  if (codes.length) {
    const [studentsRes, assignRes, attemptRes] = await Promise.all([
      supabase.from('classroom_students').select('*').in('class_code', codes),
      supabase.from('assignments').select('*').in('class_code', codes),
      supabase.from('question_attempts').select('*').in('class_code', codes),
    ]);
    studentsCache = (studentsRes.data ?? []).map(mapStudentRow);
    assignmentsCache = (assignRes.data ?? []).map(mapAssignmentRow);
    attemptRowsCache = attemptRes.data ?? [];
  } else {
    studentsCache = [];
    assignmentsCache = [];
    attemptRowsCache = [];
  }
  emit();
}

/**
 * Teacher-side live sync: hydrates the roster, then keeps it fresh via a
 * Supabase Realtime subscription (with a slow polling fallback) so a student
 * joining on another device appears without a manual refresh.
 */
export function useTeacherClassroom(teacherId) {
  useClassroomSupabase(); // ensure the client is connected

  useEffect(() => {
    if (!usingCloud() || !teacherId) return undefined;
    let alive = true;
    const refresh = () => {
      if (alive) hydrateTeacher(teacherId);
    };
    refresh();

    // Realtime: any insert/update/delete on the roster or classes → refetch.
    const channel = supabase
      .channel(`classroom-sync-${teacherId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classroom_students' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classrooms' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'question_attempts' }, refresh)
      .subscribe();

    // Fallback poll in case Realtime isn't enabled on the project.
    const poll = setInterval(refresh, 15000);

    return () => {
      alive = false;
      clearInterval(poll);
      try {
        supabase.removeChannel(channel);
      } catch {
        /* no-op */
      }
    };
  }, [teacherId]);
}

/* ── classes ──────────────────────────────────────────────────────────────── */

export function getClasses() {
  if (usingCloud()) return classesCache ?? [];
  return read(CLASSES_KEY, []);
}

export function getClassesForTeacher(teacherId) {
  return getClasses().filter((c) => c.teacherId === teacherId);
}

/** Look up a class by join code from the local cache (synchronous). */
export function getClassByCode(code) {
  const norm = normCode(code);
  if (!norm) return null;
  return getClasses().find((c) => normCode(c.code) === norm) ?? null;
}

/**
 * Verify a join code exists — queries Supabase directly (students never have
 * the teacher's classes cached). Falls back to the local cache when offline.
 */
export async function verifyClassCode(code) {
  const norm = normCode(code);
  if (!norm) return null;
  if (!usingCloud()) return getClassByCode(norm);
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('code', norm)
    .maybeSingle();
  if (error || !data) return null;
  return mapClassRow(data);
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I

/** Generate a short join code, e.g. QUEST-6A (prefix + 2 unambiguous chars). */
export function newJoinCode() {
  let suffix = '';
  for (let i = 0; i < 2; i += 1) {
    suffix += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return `QUEST-${suffix}`;
}

/**
 * Create a class. On Supabase, retries a fresh code on a unique-code collision;
 * on any other failure it THROWS so the caller can surface the real message
 * (e.g. an RLS violation). Offline it appends to localStorage.
 */
export async function addClass({ name, code, teacherId }) {
  if (usingCloud()) {
    let lastError = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const tryCode = attempt === 0 && code ? code : newJoinCode();
      const { data, error } = await supabase
        .from('classrooms')
        .insert({ teacher_id: teacherId ?? null, name, code: tryCode })
        .select()
        .single();
      if (!error && data) {
        const cls = mapClassRow(data);
        classesCache = [...(classesCache ?? []), cls]; // optimistic; realtime confirms
        emit();
        return cls;
      }
      lastError = error;
      // 23505 = unique_violation → the code was taken; loop to try another.
      if (error?.code !== '23505') break;
    }
    console.error('[classroomStore] addClass failed:', lastError?.message, lastError);
    throw new Error(lastError?.message || 'Could not create the class. Please try again.');
  }

  const cls = {
    id: `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    code: code || newJoinCode(),
    teacherId: teacherId ?? null,
    createdAt: Date.now(),
  };
  write(CLASSES_KEY, [...getClasses(), cls]);
  return cls;
}

/**
 * Delete a class and purge its dependents (data-retention cleanup). In Supabase
 * the `classroom_students` FK cascades on delete; we still drop this device's
 * local assignments for that code (assignments aren't migrated).
 */
export async function deleteClass(classId) {
  const cls = getClasses().find((c) => c.id === classId);
  if (!cls) return;
  const code = cls.code;

  if (usingCloud()) {
    const { error } = await supabase.from('classrooms').delete().eq('code', code);
    if (error) {
      console.error('[classroomStore] deleteClass failed:', error.message, error);
      return;
    }
    classesCache = (classesCache ?? []).filter((c) => c.id !== classId);
    studentsCache = (studentsCache ?? []).filter((s) => s.classCode !== code);
    write(ASSIGN_KEY, getAssignments().filter((a) => a.classCode !== code)); // emits
    emit();
    return;
  }

  write(CLASSES_KEY, getClasses().filter((c) => c.id !== classId));
  write(STUDENTS_KEY, getStudents().filter((s) => s.classCode !== code));
  write(ASSIGN_KEY, getAssignments().filter((a) => a.classCode !== code));
}

/* ── students ─────────────────────────────────────────────────────────────── */

export function getStudents() {
  if (usingCloud()) return studentsCache ?? [];
  return read(STUDENTS_KEY, []);
}

export function getStudentsForCodes(codes = []) {
  const set = new Set(codes.map(normCode));
  return getStudents().filter((s) => set.has(normCode(s.classCode)));
}

/**
 * Enroll a student in a class. Cloud: insert a `classroom_students` mapping
 * (idempotent per student_id + class_code). Offline: upsert into localStorage.
 */
export async function joinClassroom(profile) {
  if (!profile?.id || !profile?.classCode) return null;
  const classCode = normCode(profile.classCode);

  if (usingCloud()) {
    const { data: existing } = await supabase
      .from('classroom_students')
      .select('id')
      .eq('class_code', classCode)
      .eq('student_id', profile.id)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase.from('classroom_students').insert({
        class_code: classCode,
        student_id: profile.id,
        student_name: profile.name ?? 'Student',
        current_realm: profile.currentRealm ?? null,
        grade: profile.grade ?? 1,
      });
      if (error) {
        console.error('[classroomStore] joinClassroom insert failed:', error.message, error);
        return null;
      }
    } else {
      // Keep realm/grade fresh on re-join so the teacher roster reflects progress.
      await supabase
        .from('classroom_students')
        .update({ current_realm: profile.currentRealm ?? null, grade: profile.grade ?? 1 })
        .eq('class_code', classCode)
        .eq('student_id', profile.id);
    }
    // If the teacher had already set accommodations, keep them; otherwise seed.
    if (profile.iepSettings) {
      await supabase
        .from('classroom_students')
        .update({ iep_settings: profile.iepSettings })
        .eq('class_code', classCode)
        .eq('student_id', profile.id)
        .is('iep_settings', null);
    }
    return { ...profile, classCode };
  }

  const students = getStudents();
  const idx = students.findIndex((s) => s.id === profile.id && s.classCode === classCode);
  const merged = {
    ...(idx >= 0 ? students[idx] : {}),
    ...profile,
    classCode,
    joinedAt: idx >= 0 ? students[idx].joinedAt : Date.now(),
  };
  const next = idx >= 0 ? students.map((s, i) => (i === idx ? merged : s)) : [...students, merged];
  write(STUDENTS_KEY, next);
  return merged;
}

/**
 * Remove a single student from one class (unenroll). Deletes the matching
 * `classroom_students` row and optimistically drops it from the roster cache.
 * Does NOT touch the student's global account.
 */
export async function removeStudentFromClass(studentId, classCode) {
  if (!studentId || !classCode) return;
  const code = normCode(classCode);

  if (usingCloud()) {
    const { error } = await supabase
      .from('classroom_students')
      .delete()
      .eq('student_id', studentId)
      .eq('class_code', code);
    if (error) {
      console.error('[classroomStore] removeStudentFromClass failed:', error.message, error);
      throw new Error(error.message || 'Could not remove the student. Please try again.');
    }
    studentsCache = (studentsCache ?? []).filter(
      (s) => !(s.id === studentId && normCode(s.classCode) === code),
    );
    emit();
    return;
  }

  write(
    STUDENTS_KEY,
    getStudents().filter((s) => !(s.id === studentId && normCode(s.classCode) === code)),
  );
}

/** Persist IEP accommodations onto a student's roster profile. */
export async function updateStudentIep(studentId, iepSettings) {
  if (!studentId) return;

  if (usingCloud()) {
    const { error } = await supabase
      .from('classroom_students')
      .update({ iep_settings: iepSettings })
      .eq('student_id', studentId);
    if (error) {
      console.error('[classroomStore] updateStudentIep failed:', error.message, error);
      return;
    }
    studentsCache = (studentsCache ?? []).map((s) =>
      s.id === studentId ? { ...s, iepSettings: { ...(s.iepSettings ?? {}), ...iepSettings } } : s,
    );
    emit();
    return;
  }

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

/**
 * Fetch a student's saved accommodations from Supabase (used at login so their
 * teacher-assigned IEP toggles auto-apply on any device). Null when none.
 */
export async function fetchStudentIep(studentId) {
  if (!usingCloud() || !studentId) return null;
  const { data, error } = await supabase
    .from('classroom_students')
    .select('iep_settings')
    .eq('student_id', studentId)
    .not('iep_settings', 'is', null)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data.iep_settings ?? null;
}

/* ── assignments (Supabase `assignments`, localStorage fallback) ──────────── */

export function getAssignments() {
  if (usingCloud()) return assignmentsCache ?? [];
  return read(ASSIGN_KEY, []);
}

export function getAssignmentsForCode(code) {
  const norm = normCode(code);
  return getAssignments().filter((a) => normCode(a.classCode) === norm);
}

export async function addAssignment(assignment) {
  const classCode = normCode(assignment.classCode);

  if (usingCloud()) {
    const { data, error } = await supabase
      .from('assignments')
      .insert({
        class_code: classCode,
        teacher_id: assignment.teacherId ?? null,
        title: assignment.title,
        target_realm: assignment.realm,
        target_grade: assignment.grade,
        target_stage: assignment.stage,
        accuracy_goal: assignment.accuracyGoal,
        is_focus_mode: false,
      })
      .select()
      .single();
    if (error || !data) return null;
    const asg = mapAssignmentRow(data);
    assignmentsCache = [...(assignmentsCache ?? []), asg];
    emit();
    return asg;
  }

  const asg = {
    id: `asg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    focusMode: false,
    createdAt: Date.now(),
    ...assignment,
    classCode,
  };
  write(ASSIGN_KEY, [...getAssignments(), asg]);
  return asg;
}

/** Delete a published assignment. Optimistically drops it from the cache. */
export async function deleteAssignment(assignmentId) {
  if (!assignmentId) return;

  if (usingCloud()) {
    const { error } = await supabase.from('assignments').delete().eq('id', assignmentId);
    if (error) {
      console.error('[classroomStore] deleteAssignment failed:', error.message, error);
      throw new Error(error.message || 'Could not delete the assignment. Please try again.');
    }
    assignmentsCache = (assignmentsCache ?? []).filter((a) => a.id !== assignmentId);
    emit();
    return;
  }

  write(ASSIGN_KEY, getAssignments().filter((a) => a.id !== assignmentId));
}

/** Toggle focus on one assignment; turning it on clears focus on its classmates. */
export async function setAssignmentFocus(assignmentId, on) {
  const target = getAssignments().find((a) => a.id === assignmentId);
  if (!target) return;
  const code = normCode(target.classCode);

  if (usingCloud()) {
    if (on) {
      // Only one focus assignment per class — clear siblings first.
      await supabase.from('assignments').update({ is_focus_mode: false }).eq('class_code', code);
    }
    const { error } = await supabase
      .from('assignments')
      .update({ is_focus_mode: on })
      .eq('id', assignmentId);
    if (error) return;
    assignmentsCache = (assignmentsCache ?? []).map((a) => {
      if (a.id === assignmentId) return { ...a, focusMode: on };
      if (on && normCode(a.classCode) === code) return { ...a, focusMode: false };
      return a;
    });
    emit();
    return;
  }

  const next = getAssignments().map((a) => {
    if (a.id === assignmentId) return { ...a, focusMode: on };
    if (on && normCode(a.classCode) === code) return { ...a, focusMode: false };
    return a;
  });
  write(ASSIGN_KEY, next);
}

/** The active focus-mode assignment for a class code, from cache (teacher side). */
export function getFocusAssignmentForCode(code) {
  const norm = normCode(code);
  if (!norm) return null;
  return getAssignments().find((a) => normCode(a.classCode) === norm && a.focusMode) ?? null;
}

/**
 * Fetch the active focus assignment for a class code straight from Supabase —
 * used student-side (they don't have the teacher's assignments cached). Falls
 * back to the local cache when offline.
 */
export async function fetchFocusAssignment(code) {
  const norm = normCode(code);
  if (!norm) return null;
  if (!usingCloud()) return getFocusAssignmentForCode(norm);
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('class_code', norm)
    .eq('is_focus_mode', true)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return mapAssignmentRow(data);
}

/**
 * Student-side hook: resolves the live focus assignment for their class code,
 * re-checking on a short interval so a teacher toggling Focus Mode on another
 * device takes effect without a reload. Returns the assignment or null.
 */
export function useFocusAssignment(classCode) {
  useClassroomSupabase();
  const [focus, setFocus] = useState(null);

  useEffect(() => {
    if (!classCode) {
      setFocus(null);
      return undefined;
    }
    let alive = true;
    const check = async () => {
      const a = await fetchFocusAssignment(classCode);
      if (alive) setFocus(a);
    };
    check();
    const poll = setInterval(check, 12000);
    return () => {
      alive = false;
      clearInterval(poll);
    };
  }, [classCode]);

  return focus;
}

/* ── attempts / analytics (Supabase `question_attempts`, local fallback) ──── */

/**
 * Insert one answered question into Supabase so a teacher can see cross-device
 * accuracy. Fire-and-forget — never blocks or breaks gameplay.
 */
export function recordAttemptRemote({ studentId, classCode, realm, grade, stage, topic, isCorrect }) {
  if (!usingCloud() || !studentId) return;
  supabase
    .from('question_attempts')
    .insert({
      student_id: studentId,
      class_code: classCode ? normCode(classCode) : null,
      realm: realm ?? null,
      grade: grade ?? null,
      stage: stage ?? null,
      topic: topic ?? null,
      is_correct: Boolean(isCorrect),
    })
    .then(
      () => {},
      () => {},
    );
}

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
export function recordAttempt({ studentId, subject, category, isCorrect }) {
  if (!studentId) return;
  const all = getAttempts();
  const cur = all[studentId] ?? { total: 0, correct: 0, bySubject: {}, week: { start: weekStart(), total: 0, correct: 0 } };

  cur.total += 1;
  if (isCorrect) cur.correct += 1;

  const sub = subject ?? 'unknown';
  const bucket = cur.bySubject[sub] ?? { total: 0, correct: 0, byCategory: {} };
  bucket.byCategory = bucket.byCategory ?? {};
  bucket.total += 1;
  if (isCorrect) bucket.correct += 1;

  // Sub-topic (category) breakdown, e.g. 'addition_basics', 'nouns_verbs'.
  if (category) {
    const cat = bucket.byCategory[category] ?? { total: 0, correct: 0 };
    cat.total += 1;
    if (isCorrect) cat.correct += 1;
    bucket.byCategory[category] = cat;
  }
  cur.bySubject[sub] = bucket;

  const ws = weekStart();
  if (!cur.week || cur.week.start !== ws) cur.week = { start: ws, total: 0, correct: 0 };
  cur.week.total += 1;
  if (isCorrect) cur.week.correct += 1;

  all[studentId] = cur;
  write(ATTEMPTS_KEY, all);
}

export function getAccuracy(studentId) {
  if (usingCloud()) {
    const rows = attemptRowsCache.filter((r) => r.student_id === studentId);
    if (!rows.length) return 0;
    const correct = rows.reduce((n, r) => n + (r.is_correct ? 1 : 0), 0);
    return Math.round((correct / rows.length) * 100);
  }
  const a = getAttempts()[studentId];
  if (!a || !a.total) return 0;
  return Math.round((a.correct / a.total) * 100);
}

/**
 * Aggregate real question attempts across a set of students (a class), grouped
 * by realm → topic. Returns { [realm]: { [topic]: {total, correct} } }.
 * Topics with no logged attempts are simply absent (callers render "No Data Yet").
 */
export function getClassSkillAnalytics(studentIds = []) {
  const out = {};

  if (usingCloud()) {
    const ids = new Set(studentIds);
    attemptRowsCache.forEach((r) => {
      if (!ids.has(r.student_id) || !r.realm || !r.topic) return;
      out[r.realm] = out[r.realm] ?? {};
      const acc = out[r.realm][r.topic] ?? { total: 0, correct: 0 };
      acc.total += 1;
      if (r.is_correct) acc.correct += 1;
      out[r.realm][r.topic] = acc;
    });
    return out;
  }

  const attempts = getAttempts();
  studentIds.forEach((id) => {
    const rec = attempts[id];
    if (!rec?.bySubject) return;
    Object.entries(rec.bySubject).forEach(([sub, bucket]) => {
      out[sub] = out[sub] ?? {};
      Object.entries(bucket.byCategory ?? {}).forEach(([cat, cnt]) => {
        const acc = out[sub][cat] ?? { total: 0, correct: 0 };
        acc.total += cnt.total;
        acc.correct += cnt.correct;
        out[sub][cat] = acc;
      });
    });
  });
  return out;
}

/**
 * Fetch one student's raw `question_attempts` rows (most recent first) for the
 * individual Progress Report Card. Pulls live from Supabase so the log is
 * complete even beyond what's cached; returns [] when offline.
 */
export async function fetchStudentAttempts(studentId, limit = 200) {
  if (!usingCloud() || !studentId) return [];
  const { data, error } = await supabase
    .from('question_attempts')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data;
}