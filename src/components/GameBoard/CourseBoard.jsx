import { getCourseDetails } from '../../config/index.js';
import GameBoard from './GameBoard.jsx';

export default function CourseBoard({
  courseId,
  initialEnergy = 10,
  embedded = false,
  replay = false,
}) {
  const course = getCourseDetails(courseId);

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
