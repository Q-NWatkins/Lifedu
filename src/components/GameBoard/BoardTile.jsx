import { neuTileActive } from '../../styles/neubrutalism.js';
import AvatarPawn from './AvatarPawn.jsx';

function ChestIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-8 w-8 animate-bounce"
      aria-hidden="true"
    >
      <rect x="6" y="18" width="36" height="24" rx="3" fill="#f59e0b" stroke="#000" strokeWidth="2" />
      <rect x="6" y="12" width="36" height="10" rx="2" fill="#fbbf24" stroke="#000" strokeWidth="2" />
      <rect x="20" y="22" width="8" height="10" rx="1" fill="#92400e" stroke="#000" strokeWidth="1.5" />
      <circle cx="24" cy="17" r="3" fill="#fcd34d" stroke="#000" strokeWidth="1.5" />
    </svg>
  );
}

export default function BoardTile({
  number,
  variant = 'lesson',
  isActive = false,
  isMoving = false,
  isOpenedChest = false,
  palette,
  label,
}) {
  const isBoss = variant === 'boss';
  const isQuiz = variant === 'quiz';
  const isChest = variant === 'chest';

  const fillClass = isBoss
    ? palette.boss
    : isChest
      ? 'bg-amber-300 text-black'
      : isQuiz
        ? palette.quiz
        : palette.tile;

  return (
    <div
      className={`
        neu-tile relative flex aspect-square w-full max-w-[4.5rem] flex-col
        items-center justify-center font-bold
        ${fillClass}
        ${isActive ? neuTileActive : 'hover:-translate-y-0.5'}
        ${isMoving ? 'animate-bounce' : ''}
        ${isChest && !isOpenedChest ? 'ring-2 ring-amber-500' : ''}
        ${isOpenedChest ? 'opacity-60' : ''}
        ${isBoss ? 'max-w-[5.5rem] min-h-[5.5rem] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]' : ''}
      `}
    >
      {isActive && <AvatarPawn palette={palette} />}

      {isBoss ? (
        <>
          <span className="text-[0.55rem] font-black uppercase tracking-widest">Boss</span>
          <span className="px-1 text-center text-[0.65rem] leading-tight font-black">
            {label}
          </span>
        </>
      ) : isChest ? (
        <>
          <ChestIcon />
          <span className="mt-0.5 text-[0.5rem] font-black uppercase">
            {isOpenedChest ? 'Opened' : 'Chest'}
          </span>
        </>
      ) : (
        <>
          {isQuiz && (
            <span className="absolute top-1 text-[0.5rem] font-black uppercase">Quiz</span>
          )}
          <span className={`text-lg font-black ${isQuiz ? 'mt-2' : ''}`}>{number}</span>
        </>
      )}
    </div>
  );
}
