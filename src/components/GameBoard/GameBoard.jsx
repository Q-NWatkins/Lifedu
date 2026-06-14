import { useEffect, useRef, useState } from 'react';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useGameAudio } from '../../context/AudioContext.jsx';
import { useGameLoop } from '../../hooks/useGameLoop.js';
import { TILE_CLASS } from '../../data/realmConfig.js';
import { neuBadge, neuCard } from '../../styles/neubrutalism.js';
import { BossBattle } from '../BossBattle/index.js';
import { MonsterNodeSprite } from '../../assets/gameSprites.jsx';
import AvatarPawn from './AvatarPawn.jsx';
import MovementDeck from './MovementDeck.jsx';
import SphinxGateModal from './SphinxGateModal.jsx';
import { getBoardTheme } from './boardTheme.js';

const PERFECT_GEMS = 3;
const REPLAY_GEM_BONUS = 25;
const REPLAY_ENERGY_BONUS = 2;

const EDGE_STROKE = { main: '#0f172a', shortcut: '#22c55e', detour: '#f97316' };

/* ── Winding board render ──────────────────────────────────────────────────── */

function TileDisc({ tile, isCurrent }) {
  const colorClass = TILE_CLASS[tile.color] ?? 'bg-stone-300';
  let content = tile.index;
  if (tile.type === 'boss') content = <MonsterNodeSprite className="h-6 w-6" variant="boss" />;
  else if (tile.type === 'fork') content = '🦁';
  else if (tile.type === 'merge') content = '•';
  else if (tile.type === 'start') content = 'S';

  return (
    <div
      className={`
        flex h-9 w-9 items-center justify-center rounded-full border-4 border-black text-[10px] font-black
        shadow-[0_3px_0_rgba(0,0,0,0.3)] transition-transform ${colorClass}
        ${isCurrent ? 'z-20 scale-125 ring-4 ring-black' : 'z-10'}
      `}
      title={tile.topic ?? tile.type}
    >
      {content}
    </div>
  );
}

function WindingTrack({ track, edges, position, branchChoice, palette }) {
  return (
    <div className={`relative mx-auto aspect-[5/4] w-full max-w-2xl rounded-xl border-4 border-black ${palette.track}`}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {edges.map((e, i) => {
          const a = track[e.from];
          const b = track[e.to];
          if (!a || !b) return null;
          const dimmed =
            branchChoice &&
            ((branchChoice === 'shortcut' && e.kind === 'detour') ||
              (branchChoice === 'detour' && e.kind === 'shortcut'));
          return (
            <line
              key={`${e.from}-${e.to}-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={EDGE_STROKE[e.kind] ?? '#0f172a'}
              strokeWidth="0.9"
              strokeDasharray={e.kind === 'main' ? undefined : '4 3'}
              opacity={dimmed ? 0.2 : 0.9}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0">
        {track.map((tile, i) => (
          <div
            key={tile.index}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${tile.x}%`, top: `${tile.y}%` }}
          >
            {i === position && <AvatarPawn />}
            <TileDisc tile={tile} isCurrent={i === position} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tile question modal (Core Question Trigger) ──────────────────────────── */

function TileQuestionModal({ pending, onAnswer }) {
  const { question, color, topic } = pending;
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);

  const choose = (i) => {
    if (locked) return;
    setLocked(true);
    setSelected(i);
    setTimeout(() => onAnswer(i === question.correctIndex), 750);
  };

  const optionStyle = (i) => {
    if (!locked) return 'bg-white text-black hover:bg-yellow-50';
    if (i === question.correctIndex) return 'bg-green-400 text-black';
    if (i === selected) return 'bg-red-400 text-white';
    return 'bg-white text-black opacity-50';
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-end justify-center bg-black/70 p-4 pb-8 sm:items-center">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className={`flex items-center gap-2 px-5 py-3 ${TILE_CLASS[color] ?? 'bg-stone-300'}`}>
          <span className="h-5 w-5 rounded-full border-2 border-black bg-white/40" />
          <p className="text-xs font-black uppercase tracking-wide text-black">
            {(topic ?? color).replace(/-/g, ' ')}
          </p>
        </div>
        <div className="px-5 pt-4 pb-2">
          <p className="text-base font-black leading-snug text-black">{question.prompt}</p>
        </div>
        <div className="grid gap-2 px-5 pb-5">
          {question.options.map((option, i) => (
            <button
              key={option}
              type="button"
              disabled={locked}
              onClick={() => choose(i)}
              className={`neu-btn px-4 py-3 text-left text-sm font-bold ${optionStyle(i)} disabled:cursor-default`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Board ────────────────────────────────────────────────────────────────── */

export default function GameBoard({
  course,
  theme,
  bossName = 'Boss',
  courseTitle,
  initialEnergy = 10,
  embedded = false,
  replay = false,
}) {
  const palette = getBoardTheme(theme);
  const { themeConfig } = useTheme();
  const { playTrack } = useGameAudio();
  const { completedCourses, addGems, stepCards, consumeStepCards } = usePlayerProgress();
  const isCourseComplete = course ? completedCourses.includes(course.id) : false;

  useEffect(() => {
    if (playTrack) playTrack('gameboard');
  }, [course?.id, playTrack]);

  const startEnergyRef = useRef(initialEnergy + stepCards);
  const bonusStepsRef = useRef(stepCards);
  useEffect(() => {
    if (bonusStepsRef.current > 0) consumeStepCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- consume once on mount
  }, []);

  const {
    stage,
    track,
    edges,
    position,
    energy,
    drawnCard,
    isRevealing,
    pendingSphinx,
    pendingQuestion,
    branchChoice,
    bossActive,
    stageCleared,
    fizzle,
    canDraw,
    drawCard,
    resolveSphinx,
    resolveAnswer,
    dismissBossEncounter,
    retreatFromBoss,
    grantMegaRoll,
    addEnergy,
  } = useGameLoop(course, { initialEnergy: startEnergyRef.current });

  const handleReplayReward = () => {
    addGems(REPLAY_GEM_BONUS);
    addEnergy(REPLAY_ENERGY_BONUS);
  };

  const handleTileAnswer = (correct) => {
    const outcome = resolveAnswer(correct);
    if (outcome === 'perfect' || outcome === 'boss') addGems(PERFECT_GEMS);
  };

  if (!stage) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center p-6">
        <p className="neu-panel bg-white px-6 py-4 font-black text-black">
          No realm track configured for {course?.subject ?? 'this realm'}.
        </p>
      </section>
    );
  }

  return (
    <section
      className={`relative w-full overflow-hidden ${embedded ? 'px-2 py-4' : 'min-h-screen px-4 py-8'}`}
      aria-label={courseTitle ? `${courseTitle} winding track` : 'Winding track'}
    >
      {pendingQuestion && <TileQuestionModal pending={pendingQuestion} onAnswer={handleTileAnswer} />}
      {pendingSphinx && (
        <SphinxGateModal question={pendingSphinx.question} onResolve={resolveSphinx} />
      )}

      {bossActive && course && (
        <BossBattle
          course={course}
          palette={palette}
          onVictoryComplete={dismissBossEncounter}
          onDefeatComplete={retreatFromBoss}
          onMegaRoll={grantMegaRoll}
          isReplay={replay}
          onReplayReward={handleReplayReward}
        />
      )}

      <div
        className={`
          mx-auto max-w-4xl transition-all duration-700 ease-in-out
          ${bossActive ? '-translate-x-full scale-95 opacity-0' : 'translate-x-0 scale-100 opacity-100'}
        `}
      >
        {courseTitle && (
          <header className="mb-4 text-center">
            <h1 className={`text-2xl font-black tracking-tight sm:text-3xl ${themeConfig.text_main}`}>
              {courseTitle}
            </h1>
            <p className={`mt-1 text-sm font-bold ${themeConfig.contrastMuted}`}>{palette.label}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {replay && <span className={`inline-block ${neuBadge}`}>Replay — fresh questions!</span>}
              {!replay && isCourseComplete && (
                <span className={`inline-block ${neuBadge}`}>Stage Cleared!</span>
              )}
              {bonusStepsRef.current > 0 && (
                <span className={`inline-block ${neuBadge}`}>🎴 +{bonusStepsRef.current} bonus energy!</span>
              )}
            </div>
          </header>
        )}

        <div className={`${neuCard} relative ${palette.board} p-4 sm:p-6`}>
          {/* Sub-topic legend (color → topic) + branch key */}
          <div className="mb-3 flex flex-wrap justify-center gap-2">
            {Object.entries(stage.topics).map(([color, topic]) => (
              <span
                key={color}
                className="flex items-center gap-1 rounded-full border-2 border-black bg-white/90 px-2 py-0.5 text-[10px] font-black text-black"
              >
                <span className={`h-3 w-3 rounded-full border border-black ${TILE_CLASS[color]}`} />
                {topic.replace(/-/g, ' ')}
              </span>
            ))}
            <span className="flex items-center gap-1 rounded-full border-2 border-black bg-white/90 px-2 py-0.5 text-[10px] font-black text-black">
              🦁 Sphinx · <span className="text-green-700">short-cut</span> /{' '}
              <span className="text-orange-600">detour</span>
            </span>
          </div>

          <WindingTrack
            track={track}
            edges={edges}
            position={position}
            branchChoice={branchChoice}
            palette={palette}
          />

          {fizzle && (
            <p className="mt-3 animate-pulse text-center text-sm font-black text-red-600">
              💥 Fizzle! Sent back to where the turn began.
            </p>
          )}

          {stageCleared ? (
            <div className={`${neuCard} mt-4 bg-white/95 p-4 text-center`}>
              <p className="text-lg font-black text-black">🎉 Stage Cleared!</p>
              <p className="mt-1 text-xs font-bold text-black/60">
                Pick the next stage from the track above.
              </p>
            </div>
          ) : (
            <MovementDeck
              drawnCard={drawnCard}
              isRevealing={isRevealing}
              energy={energy}
              canDraw={canDraw}
              onDraw={drawCard}
            />
          )}

          <footer className={`mt-4 flex flex-wrap justify-center gap-3 text-[10px] font-bold ${palette.subtitle}`}>
            <span>🎴 Draw a color card</span>
            <span>❓ Land = answer its topic</span>
            <span>🦁 Sphinx fork = short-cut or detour</span>
            <span>💥 Wrong = fizzle back</span>
            <span>👹 {bossName} at the end</span>
          </footer>
        </div>
      </div>
    </section>
  );
}