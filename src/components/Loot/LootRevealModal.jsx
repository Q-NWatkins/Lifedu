import { useEffect, useState } from 'react';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import {
  RARITY_STYLES,
  getItemEmoji,
} from '../../systems/lootSystem.js';
import { neuBtn } from '../../styles/neubrutalism.js';

const PHASE = { SHAKE: 'shake', REVEAL: 'reveal', ACTIONS: 'actions' };

export default function LootRevealModal({ loot, onClose }) {
  const { equipItem, sendToBackpack } = usePlayerProgress();
  const [phase, setPhase] = useState(PHASE.SHAKE);

  const item = loot?.item;
  const styles = item ? RARITY_STYLES[item.rarity] : RARITY_STYLES.Common;

  useEffect(() => {
    setPhase(PHASE.SHAKE);
    const shakeTimer = setTimeout(() => setPhase(PHASE.REVEAL), 900);
    const actionTimer = setTimeout(() => setPhase(PHASE.ACTIONS), 1500);
    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(actionTimer);
    };
  }, [loot?.item?.id]);

  if (!item) return null;

  const handleEquip = () => {
    equipItem(item);
    onClose();
  };

  const handleBackpack = () => {
    sendToBackpack(item);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Loot reveal"
    >
      <div className="w-full max-w-sm text-center">
        <p className="mb-4 text-sm font-black uppercase tracking-widest text-yellow-300">
          Treasure Chest!
        </p>

        <div
          className={`
            mx-auto flex h-44 w-36 items-center justify-center rounded-2xl border-4 border-black
            bg-amber-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
            ${phase === PHASE.SHAKE ? 'animate-[wiggle_0.15s_ease-in-out_infinite]' : ''}
            ${phase !== PHASE.SHAKE ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
            transition-all duration-500
          `}
        >
          {phase === PHASE.SHAKE && <span className="text-6xl">📦</span>}
        </div>

        <div
          className={`
            mx-auto mt-6 w-full max-w-xs rounded-2xl border-4 p-6
            ${styles.card}
            ${phase === PHASE.SHAKE ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
            transition-all duration-500
          `}
        >
          <p className={`text-xs font-black uppercase tracking-widest ${styles.label}`}>
            {item.rarity}
          </p>
          <div className="mt-3 text-5xl">{getItemEmoji(item)}</div>
          <h2 className="mt-2 text-xl font-black text-black">{item.name}</h2>
          <p className="mt-1 text-xs font-bold capitalize text-black/60">{item.category}</p>

          {phase === PHASE.ACTIONS && (
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
          )}
        </div>
      </div>
    </div>
  );
}
