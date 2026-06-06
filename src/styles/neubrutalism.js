/**
 * Neubrutalism / Pop-Art design tokens (Duolingo-style).
 * Thick outlines, hard offset shadows, sink-on-click buttons.
 */

export const NEU_SHADOW = 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
export const NEU_SHADOW_SM = 'shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]';
export const NEU_SHADOW_LG = 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]';
export const NEU_BORDER = 'border-4 border-black';

export const neuCard =
  'rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';

export const neuTile =
  'rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200';

export const neuTileActive =
  '-translate-y-0.5 scale-105 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ring-4 ring-black';

export const neuBtn =
  'rounded-xl border-4 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none';

export const neuBtnRound =
  'rounded-full border-4 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none';

export const neuPanel =
  'rounded-2xl border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';

export const neuBadge =
  'rounded-full border-2 border-black bg-yellow-300 px-2 py-0.5 text-[10px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';
