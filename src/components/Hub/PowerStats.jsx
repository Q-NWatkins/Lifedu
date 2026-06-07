import { useMemo } from 'react';
import { CURRICULUMS } from '../../config/index.js';
import { getRealmByCurriculum } from '../../config/realms.js';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { neuBtn, neuCard } from '../../styles/neubrutalism.js';
import SkillHexagon from '../SkillHexagon/SkillHexagon.jsx';

const SKILL_IDS = ['math', 'science', 'reading', 'history'];
const GAP_THRESHOLD = 35;

function buildInsights(skills) {
  const ranked = [...SKILL_IDS].sort((a, b) => (skills[b] ?? 0) - (skills[a] ?? 0));
  const strengths = ranked.slice(0, 2).filter((id) => (skills[id] ?? 0) > 0);
  const gaps = ranked
    .filter((id) => (skills[id] ?? 0) < GAP_THRESHOLD)
    .slice(-2)
    .reverse();

  if (gaps.length === 0) {
    gaps.push(ranked[ranked.length - 1]);
  }

  return { strengths, gaps };
}

export default function PowerStats({ onGoToRealm }) {
  const { skills, badges, completedCourses } = usePlayerProgress();
  const { themeConfig } = useTheme();
  const { strengths, gaps } = useMemo(() => buildInsights(skills), [skills]);

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className={`text-2xl font-black sm:text-3xl ${themeConfig.contrastText}`}>Power Stats</h1>
        <p className={`mt-1 text-sm font-bold ${themeConfig.contrastMuted}`}>
          Scan your skills and plan your next quest!
        </p>
      </header>

      {/* Sci-fi scanner / spellbook frame */}
      <div className={`${neuCard} relative overflow-hidden bg-indigo-950 p-6`}>
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(74,222,128,0.03)_2px,rgba(74,222,128,0.03)_4px)]" />
        <div className="pointer-events-none absolute top-3 right-3 left-3 flex justify-between text-[10px] font-black uppercase tracking-widest text-green-400">
          <span>◈ Skill Scanner v2.0</span>
          <span className="animate-pulse">● LIVE</span>
        </div>

        <div className="relative mx-auto mt-6 flex max-w-xs justify-center rounded-2xl border-4 border-green-400 bg-black/40 p-6 shadow-[0_0_24px_rgba(74,222,128,0.25)]">
          <div className="absolute top-2 left-2 h-4 w-4 border-t-4 border-l-4 border-green-400" />
          <div className="absolute top-2 right-2 h-4 w-4 border-t-4 border-r-4 border-green-400" />
          <div className="absolute bottom-2 left-2 h-4 w-4 border-b-4 border-l-4 border-green-400" />
          <div className="absolute right-2 bottom-2 h-4 w-4 border-r-4 border-b-4 border-green-400" />
          <SkillHexagon skills={skills} size={200} />
        </div>

        <p className="relative mt-4 text-center text-xs font-bold text-green-300/80">
          {badges.length} badges earned · {completedCourses.length} courses conquered
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Superpowers */}
        <div className={`${neuCard} bg-amber-100 p-5`}>
          <h2 className="text-lg font-black text-black">🔥 My Superpowers</h2>
          <p className="mt-1 text-xs font-semibold text-black/60">Your strongest subjects!</p>
          <ul className="mt-4 space-y-3">
            {strengths.map((skillId) => {
              const realm = getRealmByCurriculum(skillId);
              return (
                <li
                  key={skillId}
                  className="rounded-xl border-4 border-black bg-white px-4 py-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <p className="font-black text-black">
                    {realm?.emoji} {CURRICULUMS[skillId].label}
                  </p>
                  <p className="text-xs font-bold text-black/60">
                    Power level: <strong className="text-black">{skills[skillId]}</strong> / 100
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Needs Energy */}
        <div className={`${neuCard} bg-sky-100 p-5`}>
          <h2 className="text-lg font-black text-black">⚡ Needs Energy</h2>
          <p className="mt-1 text-xs font-semibold text-black/60">
            Boost these skills on the Quest Map!
          </p>
          <ul className="mt-4 space-y-3">
            {gaps.map((skillId) => {
              const realm = getRealmByCurriculum(skillId);
              return (
                <li
                  key={skillId}
                  className="rounded-xl border-4 border-black bg-white px-4 py-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <p className="font-black text-black">
                    {realm?.emoji} {CURRICULUMS[skillId].label}
                  </p>
                  <p className="text-xs font-bold text-black/60">
                    Power level: <strong className="text-black">{skills[skillId]}</strong> / 100
                  </p>
                  {realm && (
                    <button
                      type="button"
                      onClick={() => onGoToRealm(realm.id)}
                      className={`${neuBtn} mt-2 bg-yellow-300 px-3 py-1.5 text-xs text-black hover:bg-yellow-200`}
                    >
                      Go to {realm.name} →
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
