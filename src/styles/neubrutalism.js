/**
 * Arcade 3D design tokens (Brawl Stars / Nintendo Switch energy).
 *
 * Buttons are heavy "key caps": a thick colored bottom border gives physical
 * depth and presses down on :active. Cards float on a chunky bottom slab shadow.
 * The legacy `neu*` names are retained so existing call-sites upgrade for free.
 */

export const NEU_SHADOW = 'shadow-[0_6px_0_rgba(0,0,0,0.3)]';
export const NEU_SHADOW_SM = 'shadow-[0_4px_0_rgba(0,0,0,0.3)]';
export const NEU_SHADOW_LG = 'shadow-[0_10px_0_rgba(0,0,0,0.3)]';
export const NEU_BORDER = 'border-4 border-black';

/** Floating 3D card: thick border + chunky slab shadow (color set by caller). */
export const neuCard =
  'rounded-2xl border-4 border-black shadow-[0_8px_0_rgba(0,0,0,0.3)]';

export const neuTile =
  'rounded-xl border-4 border-black shadow-[0_5px_0_rgba(0,0,0,0.3)] transition-all duration-200';

export const neuTileActive =
  'translate-y-0.5 scale-105 shadow-[0_2px_0_rgba(0,0,0,0.3)] ring-4 ring-white/40';

/**
 * 3D "key cap" button base. Caller supplies the fill color (e.g. bg-green-400)
 * and padding; this adds the bevel, gloss, uppercase punch, and press physics.
 */
export const neuBtn =
  'rounded-xl border-b-[6px] border-black/30 font-extrabold uppercase tracking-wide shadow-lg transition-all active:translate-y-[4px] active:border-b-2';

export const neuBtnRound =
  'rounded-full border-b-[6px] border-black/30 font-extrabold uppercase tracking-wide shadow-lg transition-all active:translate-y-[4px] active:border-b-2';

/** White panel variant with the same floating slab depth. */
export const neuPanel =
  'rounded-2xl border-4 border-black bg-white shadow-[0_8px_0_rgba(0,0,0,0.3)]';

/** Status chip (yellow). Kept perfectly straight for crisp readability. */
export const neuBadge =
  'rotate-0 skew-x-0 rounded-full border-2 border-black bg-yellow-300 px-2 py-0.5 text-[10px] font-black uppercase text-black shadow-[0_3px_0_rgba(0,0,0,0.4)]';

/* ── Bevel-layered gradient buttons (featured CTAs) ───────────────────────── */

const BTN3D_BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl border-b-8 font-extrabold uppercase tracking-wide text-white shadow-lg transition-all active:border-b-2 active:translate-y-[6px] disabled:opacity-60 disabled:active:translate-y-0';

/** Default / reward (yellow → amber). */
export const btn3d = `${BTN3D_BASE} bg-gradient-to-b from-yellow-400 to-amber-500 border-amber-700`;
/** Success / confirm (green → emerald). */
export const btn3dSuccess = `${BTN3D_BASE} bg-gradient-to-b from-green-400 to-emerald-600 border-emerald-800`;
/** Danger / battle (rose → red). */
export const btn3dDanger = `${BTN3D_BASE} bg-gradient-to-b from-rose-400 to-red-600 border-red-800`;
/** Navigation / menus (violet → purple). */
export const btn3dNav = `${BTN3D_BASE} bg-gradient-to-b from-violet-400 to-purple-600 border-purple-800`;

/* ── Vibrant layered dashboard panel ──────────────────────────────────────── */

/**
 * Deep, rich arcade container: dark primary fill, high-contrast neon border, and
 * an inner ambient glow. Ships its own light ink (`text-cyan-50`) so dynamic
 * typography stays crystal clear against the energetic surface.
 */
export const arcadeCard =
  'rounded-2xl border-4 border-cyan-400/70 bg-indigo-950 text-cyan-50 shadow-[inset_0_0_24px_rgba(34,211,238,0.35),0_8px_0_rgba(0,0,0,0.4)]';

/** Subtle comic-book tilt for headers / titles. */
export const ARC_TILT = '-rotate-2';
export const ARC_SKEW = '-skew-x-3';
