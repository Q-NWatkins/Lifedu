/**
 * Player avatar registry — the hero the student rides across the Quest Map and
 * into boss battles.
 *
 * Each animated avatar has two assets:
 *   • `preview` — a static neutral idle frame, for UI cards / HUD / selector.
 *   • `sheet`   — the full 8×6 sprite sheet, for the animated in-game token.
 * `pawn_default` has neither (it uses the built-in pawn sprite/emoji).
 *
 * NOTE: files live under `public/avatars/<boy|girl>/` (plural "avatars"), and
 * the sheet filenames are capitalized — case matters on Linux/Vercel.
 */

/** Shared sprite-sheet geometry (identical for boy & girl sheets). */
export const SHEET_SPEC = {
  frameW: 46,
  frameH: 46,
  cols: 8,
  rows: 6,
  sheetW: 368,
  sheetH: 276,
  // Row index (0-based) + frame count for the animations we drive.
  animations: {
    idle: { row: 0, frames: 6, fps: 6, loop: true }, // Row 1 — idle stance
    walk: { row: 2, frames: 8, fps: 10, loop: true }, // Row 3 — walking loop
    attack: { row: 3, frames: 5, fps: 12, loop: false }, // Row 4 — sword slash
  },
};

export const AVATARS = {
  pawn_default: {
    id: 'pawn_default',
    name: 'Adventure Pawn',
    preview: null,
    sheet: null,
  },
  boy_vinerox: {
    id: 'boy_vinerox',
    name: 'Leo the Explorer',
    preview: '/avatars/boy/boy_preview.png',
    sheet: '/avatars/boy/Boy_avatar.png',
  },
  girl_vinerox: {
    id: 'girl_vinerox',
    name: 'Maya the Adventurer',
    preview: '/avatars/girl/girl_preview.png',
    sheet: '/avatars/girl/Girl_avatar.png',
  },
};

/** Display / selection order for the customization grid. */
export const AVATAR_ORDER = ['pawn_default', 'boy_vinerox', 'girl_vinerox'];

export const DEFAULT_AVATAR = 'pawn_default';
export const DEFAULT_UNLOCKED_AVATARS = ['pawn_default', 'boy_vinerox', 'girl_vinerox'];

/** Static preview image for an avatar id (null → built-in pawn). */
export function getAvatarPreview(avatarId) {
  return AVATARS[avatarId]?.preview ?? null;
}

/** Animated sprite-sheet URL for an avatar id (null → built-in pawn). */
export function getAvatarSheet(avatarId) {
  return AVATARS[avatarId]?.sheet ?? null;
}