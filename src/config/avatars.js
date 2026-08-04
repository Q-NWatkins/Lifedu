/**
 * Player avatar registry — the hero the student rides across the Quest Map and
 * into boss battles. `src === null` means "use the built-in pawn sprite"; the
 * others resolve to images under `public/avatars/`.
 *
 * NOTE: the image filenames are capitalized to match the actual files in
 * `public/avatars/` (case matters on Linux/Vercel).
 */
export const AVATARS = {
  pawn_default: { id: 'pawn_default', name: 'Adventure Pawn', src: null },
  boy_vinerox: { id: 'boy_vinerox', name: 'Leo the Explorer', src: '/avatars/Boy_avatar.png' },
  girl_vinerox: { id: 'girl_vinerox', name: 'Maya the Adventurer', src: '/avatars/Girl_avatar.png' },
};

/** Display / selection order for the customization grid. */
export const AVATAR_ORDER = ['pawn_default', 'boy_vinerox', 'girl_vinerox'];

export const DEFAULT_AVATAR = 'pawn_default';
export const DEFAULT_UNLOCKED_AVATARS = ['pawn_default', 'boy_vinerox', 'girl_vinerox'];

/** Image URL for an avatar id, or null when it uses the built-in pawn sprite. */
export function getAvatarSrc(avatarId) {
  return AVATARS[avatarId]?.src ?? null;
}