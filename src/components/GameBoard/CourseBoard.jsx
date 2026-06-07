import { getCourseDetails } from '../../config/index.js';
import { getMapById } from '../../config/mapRegistry.js';
import GameBoard from './GameBoard.jsx';

export default function CourseBoard({
  courseId,
  initialEnergy = 10,
  embedded = false,
  replay = false,
}) {
  // Prefer the progressive grade registry (e.g. "math_2"); fall back to the
  // legacy named-course config for any other id.
  const course = getMapById(courseId) ?? getCourseDetails(courseId);

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="neu-panel px-6 py-4 font-black text-black">Course not found: {courseId}</p>
      </div>
    );
  }

  return (
    <GameBoard
      key={`${courseId}${replay ? '-replay' : ''}`}
      course={course}
      theme={course.themeId}
      bossName={course.boss.name}
      courseTitle={course.title}
      initialEnergy={initialEnergy}
      embedded={embedded}
      replay={replay}
    />
  );
}
