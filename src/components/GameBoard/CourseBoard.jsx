import { getCourseDetails } from '../../config/index.js';
import GameBoard from './GameBoard.jsx';

/**
 * Connects Phase 1 course configuration to the board + boss encounter flow.
 */
export default function CourseBoard({ courseId, initialEnergy = 10 }) {
  const course = getCourseDetails(courseId);

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-900 text-stone-200">
        <p>Course not found: {courseId}</p>
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
      courseTitle={course.title}
      initialEnergy={initialEnergy}
    />
  );
}
