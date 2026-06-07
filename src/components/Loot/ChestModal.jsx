import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { PLATFORM_THEMES } from '../../context/ThemeContext.jsx';
import { RARITY_STYLES, getThemeUnlockForRarity } from '../../systems/lootSystem.js';
import { ItemSprite } from '../../assets/gameSprites.jsx';
import { neuBtn } from '../../styles/neubrutalism.js';

/**
 * Chest unboxing modal driven by an explicit state machine:
 *
 *   idle  → player taps "Shake the Chest!"
 *   shaking → ~1s scale/rotate rattle loop
 *   burst → fullscreen flash wipe
 *   reveal → item card pops in wrapped in its rarity glow (+ theme-unlock banner)
 */
const STATE = { IDLE: 'idle', SHAKING: 'shaking', BURST: 'burst', REVEAL: 'reveal' };

const SHAKE_MS = 1000;
const BURST_MS = 500;

export default function ChestModal({ loot, onClose }) {
  const { equipItem, sendToBackpack, unlockTheme } = usePlayerProgress();
  const [phase, setPhase] = useState(STATE.IDLE);
  const [unlockedTheme, setUnlockedTheme] = useState(null);
  const timers = useRef([]);

  const item = loot?.item;
  const isMystery = loot?.isMystery;
  const styles = item ? RARITY_STYLES[item.rarity] : RARITY_STYLES.Common;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const startUnboxing = useCallback(() => {
    if (phase !== STATE.IDLE || !item) return;

    setPhase(STATE.SHAKING);
    timers.current.push(
      setTimeout(() => setPhase(STATE.BURST), SHAKE_MS),
      setTimeout(() => {
        // Grant the tiered theme drop exactly once, as the item is revealed.
        const themeId = getThemeUnlockForRarity(item.rarity);
        if (themeId && unlockTheme(themeId)) {
          setUnlockedTheme(PLATFORM_THEMES[themeId] ?? null);
        }
        setPhase(STATE.REVEAL);
      }, SHAKE_MS + BURST_MS),
    );
  }, [phase, item, unlockTheme]);

  if (!item) return null;

  const handleEquip = () => {
    equipItem(item);
    onClose();
  };

  const handleBackpack = () => {
    sendToBackpack(item);
    onClose();
  };

  const showChest = phase === STATE.IDLE || phase === STATE.SHAKING;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Treasure chest"
    >
      {/* Fullscreen flash wipe during the burst phase */}
      {phase === STATE.BURST && (
        <div className="animate-chest-flash pointer-events-none fixed inset-0 z-[160] bg-white" />
      )}

      <div className="w-full max-w-sm text-center">
        <p className="mb-4 text-sm font-black uppercase tracking-widest text-yellow-300">
          {isMystery ? 'Mystery Chest!' : 'Treasure Chest!'}
        </p>

        {/* ── Chest (idle + shaking) ──────────────────────────────────────── */}
        {showChest && (
          <>
            <div
              className={`
                mx-auto flex h-44 w-36 items-center justify-center rounded-2xl border-4 border-black
                bg-amber-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                ${phase === STATE.SHAKING ? 'animate-chest-rattle' : ''}
              `}
            >
              <span className="text-6xl">{isMystery ? '🎁' : '📦'}</span>
            </div>

            {phase === STATE.IDLE ? (
              <button
                type="button"
                onClick={startUnboxing}
                className={`${neuBtn} mt-8 bg-yellow-300 px-8 py-3 text-black hover:bg-yellow-200`}
              >
                Shake the Chest!
              </button>
            ) : (
              <p className="mt-8 animate-pulse text-sm font-black uppercase tracking-widest text-white">
                Shaking…
              </p>
            )}
          </>
        )}

        {/* ── Reveal ──────────────────────────────────────────────────────── */}
        {phase === STATE.REVEAL && (
          <div
            className={`
              animate-card-pop mx-auto w-full max-w-xs rounded-2xl border-4 p-6
              ${styles.card}
            `}
          >
            <p className={`text-xs font-black uppercase tracking-widest ${styles.label}`}>
              {item.rarity}
            </p>
            <div className="mt-3 flex justify-center">
              <ItemSprite category={item.category} className="h-14 w-14" />
            </div>
            <h2 className="mt-2 text-xl font-black text-black">{item.name}</h2>
            <p className="mt-1 text-xs font-bold capitalize text-black/60">{item.category}</p>

            {unlockedTheme && (
              <div className="mt-4 rounded-xl border-4 border-black bg-white/80 px-3 py-2">
                <p className="text-[11px] font-black uppercase tracking-wide text-purple-700">
                  ✨ New Theme Unlocked!
                </p>
                <p className="text-sm font-black text-black">{unlockedTheme.label}</p>
                <p className="text-[10px] font-bold text-black/60">
                  Equip it in My Backpack → Theme Selector.
                </p>
              </div>
            )}

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={handleEquip}
                className={`${neuBtn} bg-green-400 px-4 py-2.5 text-sm text-black hover:bg-green-300`}
              >
                Equip Item
              </button>
              <button
                type="button"
                onClick={handleBackpack}
                className={`${neuBtn} bg-white px-4 py-2.5 text-sm text-black hover:bg-lime-50`}
              >
                Send to Backpack
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
