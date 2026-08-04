/**
 * Oedipus 3-tier access control.
 *
 * Roles (highest → lowest privilege):
 *   super_admin  Developers / founders — debug AdminToolbar, cheats, God mode.
 *   teacher      Educators — Teacher Analytics Portal (rosters, assignments).
 *   student      Players — default gameplay role.
 *
 * SECURITY: role is derived ONLY from Clerk `publicMetadata.role` (server-set)
 * and, for super admins, an allow-list of emails baked into the build via
 * `VITE_SUPER_ADMIN_EMAILS`. We deliberately never read URL query params or
 * browser storage flags — those are trivially forgeable by the client.
 */

export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
});

/** Parse the comma-separated super-admin allow-list from env (lowercased). */
const SUPER_ADMIN_EMAILS = String(import.meta.env.VITE_SUPER_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/** The Clerk-metadata role string for a user, or null. */
export function getUserRole(user) {
  return user?.publicMetadata?.role ?? null;
}

/** All verified email addresses on the Clerk user, lowercased. */
function userEmails(user) {
  return (user?.emailAddresses ?? [])
    .map((e) => e?.emailAddress?.toLowerCase())
    .filter(Boolean);
}

/**
 * Super admin = explicit `super_admin` metadata role OR an email on the
 * build-time allow-list. No client-forgeable signals are consulted.
 */
export function isSuperAdmin(user) {
  if (!user) return false;
  if (getUserRole(user) === ROLES.SUPER_ADMIN) return true;
  if (SUPER_ADMIN_EMAILS.length === 0) return false;
  return userEmails(user).some((email) => SUPER_ADMIN_EMAILS.includes(email));
}

/**
 * Teacher access. Super admins inherit teacher privileges (they can see
 * everything an educator can).
 */
export function isTeacher(user) {
  if (!user) return false;
  return getUserRole(user) === ROLES.TEACHER || isSuperAdmin(user);
}

/**
 * Student is the DEFAULT role: any signed-in user who is neither a teacher nor
 * a super admin (whether their metadata says 'student' or is unset entirely).
 */
export function isStudent(user) {
  if (!user) return false;
  return !isTeacher(user);
}

/* ── Teacher onboarding helpers (hybrid verification) ─────────────────────────
 * Personal-email providers that must go through District Verification / pending
 * approval instead of the auto-grant path.
 */
const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
]);

export function emailDomain(email) {
  return String(email ?? '').toLowerCase().split('@')[1] ?? '';
}

/**
 * Whether an email qualifies for an AUTOMATIC teacher grant: a `.edu` address
 * or any non-personal (school/district) domain. Personal providers do not.
 */
export function isSchoolEmail(email) {
  const domain = emailDomain(email);
  if (!domain) return false;
  if (domain.endsWith('.edu')) return true;
  return !PERSONAL_EMAIL_DOMAINS.has(domain);
}

/**
 * Decide how a "Create a Classroom" request should be handled for `user`:
 *   'granted' → already a teacher/super_admin (allow through)
 *   'auto'    → school/.edu email → safe to auto-grant the teacher role
 *   'verify'  → personal email → require District Verification / pending approval
 */
export function classroomOnboardingPath(user) {
  if (isTeacher(user)) return 'granted';
  const primary =
    user?.primaryEmailAddress?.emailAddress ?? userEmails(user)[0] ?? '';
  return isSchoolEmail(primary) ? 'auto' : 'verify';
}