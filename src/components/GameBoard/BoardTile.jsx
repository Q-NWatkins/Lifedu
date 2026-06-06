import AvatarPawn from './AvatarPawn.jsx';

export default function BoardTile({
  number,
  variant = 'lesson',
  isActive = false,
  isMoving = false,
  palette,
  label,
}) {
  const isBoss = variant === 'boss';
  const isQuiz = variant === 'quiz';

  const tileClasses = isBoss
    ? `${palette.boss} ${palette.bossGlow}`
    : isQuiz
      ? palette.quiz
      : palette.tile;

  return (
    <div
      className={`
        relative flex aspect-square w-full max-w-[4.5rem] flex-col items-center justify-center
        rounded-xl border-2 font-semibold shadow-lg transition-all duration-300
        ${tileClasses} ${palette.tileShadow}
        ${isActive ? 'scale-110 ring-4 ring-white/80' : 'hover:scale-105'}
        ${isMoving ? 'animate-pulse' : ''}
        ${isBoss ? 'max-w-[5.5rem] min-h-[5.5rem]' : ''}
      `}
    >
      {isActive && <AvatarPawn palette={palette} />}

      {isBoss ? (
        <>
          <span className="text-[0.55rem] font-bold uppercase tracking-widest opacity-90">
            Boss
          </span>
          <span className="px-1 text-center text-[0.65rem] leading-tight font-bold">
            {label}
          </span>
        </>
      ) : (
        <>
          {isQuiz && (
            <span className="absolute top-1 text-[0.5rem] font-bold uppercase opacity-80">
              Quiz
            </span>
          )}
          <span className={`text-lg font-bold ${isQuiz ? 'mt-2' : ''}`}>{number}</span>
        </>
      )}
    </div>
  );
}
