import { useState } from 'react';
import { COURSE_MAPS } from './config/index.js';
import { PlayerProgressProvider, usePlayerProgress } from './context/PlayerProgressContext.jsx';
import { CourseBoard } from './components/GameBoard/index.js';
import SkillHexagon from './components/SkillHexagon/SkillHexagon.jsx';

const DEMO_COURSES = [
  'single-digit-multiplication',
  'triple-digit-multiplication',
  'solar-system',
  'phonics-basics',
];

function AppContent() {
  const [selectedCourseId, setSelectedCourseId] = useState(DEMO_COURSES[0]);
  const { skills, badges } = usePlayerProgress();

  const demoCourses = COURSE_MAPS.filter((course) => DEMO_COURSES.includes(course.id));

  return (
    <div>
      <nav className="fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-white/90">Phase 4 — Boss Gate</span>
            <SkillHexagon skills={skills} size={72} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {badges.length > 0 && (
              <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold text-yellow-200">
                {badges.length} badge{badges.length !== 1 ? 's' : ''}
              </span>
            )}
            {demoCourses.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => setSelectedCourseId(course.id)}
                className={`
                  rounded-full px-3 py-1 text-xs font-semibold transition
                  ${
                    selectedCourseId === course.id
                      ? 'bg-white text-stone-900'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }
                `}
              >
                {course.title}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="pt-20">
        <CourseBoard key={selectedCourseId} courseId={selectedCourseId} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PlayerProgressProvider>
      <AppContent />
    </PlayerProgressProvider>
  );
}
