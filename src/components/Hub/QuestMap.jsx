import { useEffect, useMemo, useState } from 'react';
import { REALMS, getRealmById } from '../../config/realms.js';
import { getCoursesByCurriculum, isCourseUnlocked } from '../../config/progressionEngine.js';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { neuBtn, neuCard } from '../../styles/neubrutalism.js';
import { CourseBoard } from '../GameBoard/index.js';
import DailyTriviaWheel from './DailyTriviaWheel.jsx';

export default function QuestMap({ initialRealmId = null }) {
  const { completedCourses } = usePlayerProgress();
  const { themeConfig } = useTheme();
  const [activeRealmId, setActiveRealmId] = useState(null);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [replayCourseId, setReplayCourseId] = useState(null);

  const activeRealm = REALMS.find((r) => r.id === activeRealmId) ?? null;
  const isReplaying = replayCourseId === activeCourseId && activeCourseId != null;
  const activeCourseComplete = completedCourses.includes(activeCourseId);

  const selectCourse = (courseId) => {
    setActiveCourseId(courseId);
    setReplayCourseId(null);
  };

  const enterRealm = (realm) => {
    const courses = getCoursesByCurriculum(realm.curriculumId);
    const firstPlayable =
      courses.find((c) => isCourseUnlocked(c.id, completedCourses)) ?? courses[0];

    setActiveRealmId(realm.id);
    setActiveCourseId(firstPlayable?.id ?? null);
  };

  useEffect(() => {
    if (!initialRealmId) return;
    const realm = getRealmById(initialRealmId);
    if (realm) enterRealm(realm);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only auto-enter when hub navigates to a realm
  }, [initialRealmId]);

  const realmCourses = useMemo(() => {
    if (!activeRealm) return [];
    return getCoursesByCurriculum(activeRealm.curriculumId);
  }, [activeRealm]);

  const handleRealmClick = (realm) => enterRealm(realm);

  const handleBackToRealms = () => {
    setActiveRealmId(null);
    setActiveCourseId(null);
    setReplayCourseId(null);
  };

  if (activeRealm && activeCourseId) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleBackToRealms}
            className={`${neuBtn} bg-white px-4 py-2 text-sm text-black hover:bg-lime-50`}
          >
            ← Realms
          </button>
          <div className={`${neuCard} flex flex-wrap gap-2 ${activeRealm.palette.card} p-2`}>
            {realmCourses.map((course) => {
              const unlocked = isCourseUnlocked(course.id, completedCourses);
              const complete = completedCourses.includes(course.id);

              return (
                <button
                  key={course.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => selectCourse(course.id)}
                  className={`
                    rounded-lg border-4 border-black px-3 py-1 text-xs font-black transition-all
                    ${
                      activeCourseId === course.id
                        ? 'bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                        : unlocked
                          ? 'bg-black/10 hover:bg-black/20'
                          : 'cursor-not-allowed bg-stone-300 text-stone-500'
                    }
                  `}
                >
                  {complete ? '✓ ' : ''}
                  {course.title}
                  {!unlocked && ' 🔒'}
                </button>
              );
            })}
          </div>

          {/* Replay a conquered quest for fresh, shuffled questions + bonuses */}
          {activeCourseComplete && (
            isReplaying ? (
              <button
                type="button"
                onClick={() => setReplayCourseId(null)}
                className={`${neuBtn} bg-white px-4 py-2 text-sm text-black hover:bg-stone-100`}
              >
                ✕ Exit Replay
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setReplayCourseId(activeCourseId)}
                className={`${neuBtn} bg-cyan-300 px-4 py-2 text-sm text-black hover:bg-cyan-200`}
              >
                🔁 Replay Quest
              </button>
            )
          )}
        </div>

        <div className={`overflow-hidden rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
          <CourseBoard
            key={`${activeCourseId}${isReplaying ? '-replay' : ''}`}
            courseId={activeCourseId}
            embedded
            replay={isReplaying}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <DailyTriviaWheel />
      </div>

      <header className="mb-6 text-center">
        <h1 className={`text-2xl font-black sm:text-3xl ${themeConfig.text_main}`}>
          Choose Your Realm
        </h1>
        <p className={`mt-1 text-sm font-bold ${themeConfig.contrastMuted}`}>
          Pick an adventure world to start your quest!
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {REALMS.map((realm) => {
          const courseCount = getCoursesByCurriculum(realm.curriculumId).length;
          const completedCount = getCoursesByCurriculum(realm.curriculumId).filter((c) =>
            completedCourses.includes(c.id),
          ).length;

          return (
            <button
              key={realm.id}
              type="button"
              onClick={() => handleRealmClick(realm)}
              className={`
                neu-card group text-left transition-transform hover:-translate-y-1
                ${realm.palette.card} ${realm.palette.cardHover} p-5
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-4xl" aria-hidden="true">
                  {realm.emoji}
                </span>
                <span
                  className={`rounded-full border-2 border-black px-2 py-0.5 text-[10px] font-black ${realm.palette.accent} text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                >
                  {completedCount}/{courseCount} done
                </span>
              </div>
              <h2 className="mt-3 text-xl font-black text-black">{realm.name}</h2>
              <p className="mt-1 text-sm font-semibold text-black/70">{realm.tagline}</p>
              <p className="mt-3 text-xs font-black uppercase tracking-wide text-black/50 group-hover:text-black/70">
                Enter realm →
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
