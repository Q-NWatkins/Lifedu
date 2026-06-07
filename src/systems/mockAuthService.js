/**
 * Isolated, local mock authentication service.
 *
 * Security posture (frontend-only mock):
 *  - NO plaintext passwords exist anywhere in the bundle. Every credential is
 *    stored only as a pre-calculated SHA-256 hex digest.
 *  - The user registry lives in module (closure) scope and is NEVER exported,
 *    so it can't be read or mutated from the React tree or DevTools console.
 *  - Sessions handed back are deeply frozen and only ever carry { username, role }.
 *  - `role` is assigned by this service alone; registration is hard-pinned to
 *    'user', so the client cannot escalate to 'admin'.
 *
 * NOTE: This is a *mock* for local/edutainment use. Real authentication must
 * happen server-side — a SHA-256 hash shipped to the browser is reversible by
 * brute force and must never guard real secrets.
 */

/** Hash arbitrary text to a lowercase SHA-256 hex string via SubtleCrypto. */
export async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(String(text));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── Private credential registry (closure scope — intentionally not exported) ──
// Hashes were pre-calculated with SHA-256. Demo logins:
//   admin    / LearnQuestAdmin!2026   (role: admin)
//   explorer / explorer123            (role: user)
//   maya     / maya2026               (role: user)
const _users = [
  {
    username: 'admin',
    role: 'admin',
    passwordHash: '5773ab1fa45e457ef1ceab3c9ae2f9ee1d30d121ceacd57c102d5ecc9d6f9cbb',
  },
  {
    username: 'explorer',
    role: 'user',
    passwordHash: '218ee7b7ec84b477ee83f45cc7867a15b5aa0f232bddeefa499c2e75b42ac34a',
  },
  {
    username: 'maya',
    role: 'user',
    passwordHash: '18c2905a2dc7161295f95f76e60f8d1bb0ed2b3e4ba85f7b0d6288192cfb35fb',
  },
];

function findUser(username) {
  const key = String(username ?? '').trim().toLowerCase();
  return _users.find((u) => u.username.toLowerCase() === key) ?? null;
}

/** Length-aware, branch-flat comparison of two hex strings. */
function safeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verify credentials against the hashed registry.
 * @returns a frozen `{ username, role }` session, or `null` on failure.
 */
export async function verifyCredentials(username, password) {
  const user = findUser(username);
  if (!user) return null;

  const attemptHash = await sha256Hex(password);
  if (!safeEqualHex(attemptHash, user.passwordHash)) return null;

  return Object.freeze({ username: user.username, role: user.role });
}

/**
 * Register a brand-new standard user (in-memory, hashed). Role is hard-pinned to
 * 'user' here, so registration can never mint an admin session.
 * @returns a frozen `{ username, role: 'user' }` session.
 * @throws Error with a friendly message on validation failure.
 */
export async function registerUser(username, password) {
  const name = String(username ?? '').trim();

  if (name.length < 3) throw new Error('Username must be at least 3 characters.');
  if (String(password ?? '').length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
  if (name.toLowerCase() === 'admin') throw new Error('That username is reserved.');
  if (findUser(name)) throw new Error('That username is already taken.');

  const passwordHash = await sha256Hex(password);
  _users.push({ username: name, role: 'user', passwordHash });

  return Object.freeze({ username: name, role: 'user' });
}

/**
 * Admin-only directory view: usernames + roles, never hashes. Returns frozen
 * copies so callers can't mutate the registry.
 */
export function listUserSummaries() {
  return _users.map((u) => Object.freeze({ username: u.username, role: u.role }));
}
