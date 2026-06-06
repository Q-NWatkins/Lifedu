import { getCourseDetails } from '../../config/index.js';
import GameBoard from './GameBoard.jsx';

/**
 * Connects Phase 1 course configuration to the board + boss encounter flow.
 */
export default function CourseBoard({ courseId, initialEnergy = 10, embedded = false }) {
  const course = getCourseDetails(courseId);

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-red-300">
        <p className="neu-panel px-6 py-4 font-black text-black">Course not found: {courseId}</p>
      </div>
    );
  }

  return (
    <GameBoard
      key={courseId}
      course={course}
      pathLength={course.pathLength}
      theme={course.themeId}
      bossName={course.boss.name}
      milestones={course.milestones}
      chestTiles={course.chestTiles}
      courseTitle={course.title}
      initialEnergy={initialEnergy}
      embedded={embedded}
    />
  );
}
