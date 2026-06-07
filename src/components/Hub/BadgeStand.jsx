import { useState } from 'react';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { listMilestones } from '../../systems/milestones.js';
import Confetti from '../common/Confetti.jsx';

/**
 * 'Level Up Badge Stand' — the interactive ring of milestone badges that frames
 * the Skill Hexagon. Reached-but-unclaimed badges glow and are clickable: tap
 * one to fire confetti and unlock its avatar title. Claimed badges can be tapped
 * again to set the active title shown on the hero.
 */
export default function BadgeStand() {
  const { skills, unlockedTitles, activeTitle, unlockTitle, setActiveTitle } = usePlayerProgress();
  const [celebrate, setCelebrate] = useState(false);
  const milestones = listMilestones(skills);

  const handleClick = (m) => {
    if (!m.reached) return;
    const isUnlocked = unlockedTitles.includes(m.id);
    if (!isUnlocked) {
      unlockTitle(m.id);
      setActiveTitle(m.id);
      setCelebrate(true);
    } else {
      // Toggle as the displayed title.
      setActiveTitle(activeTitle === m.id ? null : m.id);
    }
  };

  const activeMilestone = milestones.find((m) => m.id === activeTitle);

  return (
    <div className="relative">
      {celebrate && <Confetti onDone={() => setCelebrate(false)} />}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-black">🏅 Level Up Badge Stand</h3>
        {activeMilestone && (
          <span className="rounded-full border-2 border-black bg-yellow-300 px-2 py-0.5 text-[10px] font-black text-black">
            Title: {activeMilestone.title}
          </span>
        )}
      </div>

      <p className="mt-1 text-xs font-semibold text-black/60">
        Cross 25 · 50 · 75 · 100 points in a skill to claim glowing badges & avatar titles!
      </p>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {milestones.map((m) => {
          const isUnlocked = unlockedTitles.includes(m.id);
          const isActive = activeTitle === m.id;
          const claimable = m.reached && !isUnlocked;

          return (
            <button
              key={m.id}
              type="button"
              disabled={!m.reached}
              onClick={() => handleClick(m)}
              title={m.reached ? m.title : `Reach ${m.threshold} in ${m.subject}`}
              className={`
                relative flex flex-col items-center gap-0.5 rounded-xl border-4 border-black px-1 py-2 transition-all
                ${claimable ? 'animate-badge-glow bg-yellow-200 hover:scale-105' : ''}
                ${isUnlocked ? 'bg-white hover:scale-105' : ''}
                ${!m.reached ? 'cursor-not-allowed bg-stone-200 opacity-60 grayscale' : 'shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}
                ${isActive ? 'ring-4 ring-yellow-400' : ''}
              `}
            >
              <span className="text-xl">{m.reached ? m.emoji : '🔒'}</span>
              <span className="text-[8px] font-black uppercase leading-tight text-black/60">
                {m.threshold}
              </span>
              <span className="line-clamp-2 text-center text-[8px] font-black leading-tight text-black">
                {m.reached ? m.title : '???'}
              </span>
              {claimable && (
                <span className="absolute -top-2 -right-1 rounded-full border-2 border-black bg-red-500 px-1 text-[7px] font-black text-white">
                  NEW
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
