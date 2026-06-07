import { useCallback, useMemo, useRef, useState } from 'react';
import {
  getItemEmoji,
  getThemeUnlockForRarity,
  RARITY_STYLES,
  rollLoot,
} from '../../systems/lootSystem.js';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { neuBtn } from '../../styles/neubrutalism.js';
import { getQuestionsForDifficulty } from '../../data/questions/multiSubject.js';
import { getPlayerHand } from '../../systems/combatCards.js';
import DefeatScreen from './DefeatScreen.jsx';

const BOSS_MAX_HP = 100;
const STARTING_HEARTS = 3;
const PHASE = { INTRO: 'intro', BATTLE: 'battle', VICTORY: 'victory', DEFEAT: 'defeat' };

/* ── Sub-components ──────────────────────────────────────────────────────── */

function HeartRow({ hearts, shieldActive, shaking }) {
  return (
    <div className={`flex items-center gap-3 transition-all ${shaking ? 'animate-player-hit' : ''}`}>
      <div className="flex gap-1">
        {Array.from({ length: STARTING_HEARTS }, (_, i) => (
          <span
            key={i}
            className={`text-2xl transition-all duration-300 ${i < hearts ? '' : 'opacity-20 grayscale'}`}
          >
            ❤️
          </span>
        ))}
      </div>
      {shieldActive && (
        <span className="animate-pulse rounded-full border-2 border-blue-400 bg-blue-500 px-2 py-0.5 text-xs font-black text-white shadow-[0_0_10px_rgba(59,130,246,0.7)]">
          🛡️ SHIELDED
        </span>
      )}
    </div>
  );
}

function CombatCard({ card, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={() => onClick(card)}
      disabled={disabled}
      style={{
        boxShadow: disabled
          ? '3px 3px 0px rgba(0,0,0,0.6)'
          : `4px 4px 0px rgba(0,0,0,1), 0 0 16px rgba(${card.glowRgb},0.55)`,
      }}
      className={`
        flex w-[118px] flex-col overflow-hidden rounded-2xl border-4 bg-white text-left
        transition-all duration-200
        ${card.borderCls}
        ${disabled
          ? 'cursor-not-allowed opacity-40'
          : 'cursor-pointer hover:-translate-y-2 hover:scale-105 active:translate-y-0.5 active:shadow-none'
        }
      `}
    >
      {/* Gradient header */}
      <div
        style={{ background: `linear-gradient(160deg, ${card.headerFrom}, ${card.headerTo})` }}
        className="flex flex-col items-center justify-center py-4"
      >
        <span className="text-3xl drop-shadow">{card.emoji}</span>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col items-center gap-1 px-2 py-3">
        <p className="text-center text-[11px] font-black leading-tight text-black">{card.name}</p>
        <p className="mt-1 rounded-full border border-black px-2 py-0.5 text-[10px] font-bold text-black">
          {card.effect}
        </p>
        <span className={`mt-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${card.labelCls}`}>
          {card.difficultyLabel}
        </span>
      </div>
    </button>
  );
}

function QuestionModal({ question, card, onAnswer, answerIndex, isLocked, feedback }) {
  const getOptionStyle = (i) => {
    if (!isLocked) return 'bg-white hover:bg-yellow-50 text-black';
    if (i === question.correctIndex) return 'bg-green-400 text-black';
    if (i === answerIndex) return 'bg-red-400 text-black';
    return 'bg-white opacity-50 text-black';
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-end justify-center bg-black/75 p-4 pb-8 sm:items-center">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Modal header */}
        <div
          style={{ background: `linear-gradient(135deg, ${card.headerFrom}, ${card.headerTo})` }}
          className="flex items-center gap-3 px-5 py-3"
        >
          <span className="text-2xl">{card.emoji}</span>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-white">{card.name}</p>
            <p className="text-[10px] font-bold text-white/70">
              {card.difficultyLabel} · {question.subject}
            </p>
          </div>
        </div>

        {/* Feedback banner */}
        {feedback && (
          <div
            className={`px-5 py-2 text-center text-sm font-black ${
              feedback === 'correct'
                ? 'bg-green-400 text-black'
                : feedback === 'blocked'
                ? 'bg-blue-400 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {feedback === 'correct' && '✅ CORRECT!'}
            {feedback === 'wrong' && '❌ Boss attacks!'}
            {feedback === 'blocked' && '🛡️ Shield blocked the attack!'}
          </div>
        )}

        {/* Question */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-base font-black leading-snug text-black">{question.prompt}</p>
        </div>

        {/* Options */}
        <div className="grid gap-2 px-5 pb-5">
          {question.options.map((option, i) => (
            <button
              key={option}
              type="button"
              disabled={isLocked}
              onClick={() => onAnswer(i)}
              className={`neu-btn px-4 py-3 text-left text-sm font-bold ${getOptionStyle(i)} disabled:cursor-default`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LootRevealInline({ loot, lootRevealPhase, onEquip, onBackpack }) {
  const styles = loot ? RARITY_STYLES[loot.rarity] : RARITY_STYLES.Common;

  return (
    <div className="mt-4 flex flex-col items-center">
      {/* Chest shake → item reveal */}
      <div
        className={`
          flex h-32 w-24 items-center justify-center rounded-2xl border-4 border-black
          bg-amber-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          transition-all duration-500
          ${lootRevealPhase === 'chest' ? 'scale-100 animate-[wiggle_0.15s_ease-in-out_infinite]' : 'scale-0 opacity-0 h-0'}
        `}
      >
        {lootRevealPhase === 'chest' && <span className="text-5xl">📦</span>}
      </div>

      {lootRevealPhase !== 'chest' && loot && (
        <div
          className={`
            w-full max-w-xs rounded-2xl border-4 p-5 text-center
            ${styles.card}
            transition-all duration-500
            ${lootRevealPhase === 'reveal' || lootRevealPhase === 'actions' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
          `}
        >
          <p className={`text-xs font-black uppercase tracking-widest ${styles.label}`}>
            {loot.rarity} Loot!
          </p>
          <div className="mt-2 text-4xl">{getItemEmoji(loot)}</div>
          <h3 className="mt-1 text-lg font-black text-black">{loot.name}</h3>
          <p className="text-xs font-bold capitalize text-black/60">{loot.category}</p>

          {lootRevealPhase === 'actions' && (
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={onEquip}
                className={`${neuBtn} bg-green-400 px-4 py-2.5 text-sm text-black hover:bg-green-300`}
              >
                Equip Item
              </button>
              <button
                type="button"
                onClick={onBackpack}
                className={`${neuBtn} bg-white px-4 py-2.5 text-sm text-black hover:bg-lime-50`}
              >
                Send to Backpack
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

export default function BossBattle({
  course,
  onVictoryComplete,
  onDefeatComplete,
  onMegaRoll,
  isReplay = false,
  onReplayReward,
}) {
  const { completeCourse, equipItem, sendToBackpack, unlockTheme, unlockedCombatCards, unlockGrade } =
    usePlayerProgress();

  // Base hand + any permanently unlocked Side-Boss cards.
  const hand = useMemo(() => getPlayerHand(unlockedCombatCards), [unlockedCombatCards]);

  const boss = course.boss;
  const rawBadge = course.rewards?.completionBadge?.replace('badge-', '').replace(/-/g, ' ') ?? 'Course Champion';
  const badgeLabel = rawBadge.replace(/\b\w/g, (c) => c.toUpperCase());
  const curriculumId = course.curriculumId;

  // Pre-shuffle question pools for each difficulty tier
  const [questionPools] = useState(() => ({
    easy: getQuestionsForDifficulty('easy'),
    medium: getQuestionsForDifficulty('medium'),
    hard: getQuestionsForDifficulty('hard'),
  }));
  const qIdxRef = useRef({ easy: 0, medium: 0, hard: 0 });

  const nextQuestion = useCallback(
    (difficulty) => {
      const pool = questionPools[difficulty];
      const idx = qIdxRef.current[difficulty];
      const q = pool[idx % pool.length];
      qIdxRef.current[difficulty] = idx + 1;
      return q;
    },
    [questionPools],
  );

  // Core battle state
  const [phase, setPhase] = useState(PHASE.INTRO);
  const [bossHp, setBossHp] = useState(BOSS_MAX_HP);
  const [hearts, setHearts] = useState(STARTING_HEARTS);
  const [shieldActive, setShieldActive] = useState(false);

  // Question modal state
  const [activeCard, setActiveCard] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [answerIndex, setAnswerIndex] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Animation flags
  const [bossShaking, setBossShaking] = useState(false);
  const [playerShaking, setPlayerShaking] = useState(false);

  // Victory loot
  const [victoryLoot, setVictoryLoot] = useState(null);
  const [lootRevealPhase, setLootRevealPhase] = useState('chest');

  const bossHpPct = (bossHp / BOSS_MAX_HP) * 100;
  const bossBarColor =
    bossHpPct > 60 ? '#ef4444' : bossHpPct > 30 ? '#f97316' : '#facc15';

  const closeQuestion = useCallback(() => {
    setActiveCard(null);
    setActiveQuestion(null);
    setAnswerIndex(null);
    setFeedback(null);
    setIsLocked(false);
  }, []);

  const handleCardClick = useCallback(
    (card) => {
      if (activeCard || isLocked || phase !== PHASE.BATTLE) return;
      setActiveCard(card);
      setActiveQuestion(nextQuestion(card.difficulty));
      setAnswerIndex(null);
      setFeedback(null);
      setIsLocked(false);
    },
    [activeCard, isLocked, phase, nextQuestion],
  );

  const triggerVictory = useCallback(() => {
    const loot = rollLoot();
    setVictoryLoot(loot);
    // Tiered animated themes can also drop from boss rewards.
    const themeId = getThemeUnlockForRarity(loot.rarity);
    if (themeId) unlockTheme(themeId);
    setLootRevealPhase('chest');
    setTimeout(() => setLootRevealPhase('reveal'), 900);
    setTimeout(() => setLootRevealPhase('actions'), 1600);
    setPhase(PHASE.VICTORY);
  }, [unlockTheme]);

  const handleAnswer = useCallback(
    (i) => {
      if (isLocked || !activeQuestion || !activeCard) return;

      setIsLocked(true);
      setAnswerIndex(i);

      const isCorrect = i === activeQuestion.correctIndex;

      if (isCorrect) {
        setFeedback('correct');

        setTimeout(() => {
          if (activeCard.id === 'shield') {
            setShieldActive(true);
            closeQuestion();
          } else {
            const dmg = activeCard.damage;
            setBossShaking(true);
            setTimeout(() => setBossShaking(false), 550);

            setBossHp((hp) => {
              const next = Math.max(0, hp - dmg);
              if (next <= 0) {
                setTimeout(triggerVictory, 400);
              } else {
                closeQuestion();
              }
              return next;
            });
          }
        }, 850);
      } else {
        if (shieldActive) {
          setFeedback('blocked');
          setShieldActive(false);
          setTimeout(closeQuestion, 1100);
        } else {
          setFeedback('wrong');
          setPlayerShaking(true);
          setTimeout(() => setPlayerShaking(false), 600);

          setHearts((h) => {
            const next = h - 1;
            if (next <= 0) {
              setTimeout(() => setPhase(PHASE.DEFEAT), 900);
            }
            return next;
          });
          setTimeout(closeQuestion, 1000);
        }
      }
    },
    [isLocked, activeQuestion, activeCard, shieldActive, closeQuestion, triggerVictory],
  );

  const finalizeVictory = useCallback(() => {
    completeCourse({
      courseId: course.id,
      curriculumId,
      badgeId: course.rewards?.completionBadge ?? `badge-${course.id}`,
      badgeLabel,
      skillGain: 10,
    });
    onMegaRoll?.();
    // Progressive campaign: defeating a grade boss unlocks the next grade map.
    if (course.grade) unlockGrade(curriculumId, course.grade + 1);
    // Replaying a conquered level grants a flat mastery bonus on top.
    if (isReplay) onReplayReward?.();
    onVictoryComplete?.();
  }, [completeCourse, course, curriculumId, badgeLabel, onMegaRoll, unlockGrade, isReplay, onReplayReward, onVictoryComplete]);

  const handleLootEquip = useCallback(() => {
    if (victoryLoot) equipItem(victoryLoot);
    finalizeVictory();
  }, [victoryLoot, equipItem, finalizeVictory]);

  const handleLootBackpack = useCallback(() => {
    if (victoryLoot) sendToBackpack(victoryLoot);
    finalizeVictory();
  }, [victoryLoot, sendToBackpack, finalizeVictory]);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(175deg, #030712 0%, #1e1b4b 45%, #0c0a09 100%)' }}
      role="dialog"
      aria-modal="true"
      aria-label={`Boss battle against ${boss.name}`}
    >
      {/* ── INTRO ─────────────────────────────────────────────────────────── */}
      {phase === PHASE.INTRO && (
        <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-red-400">
            ⚡ Boss Encounter ⚡
          </p>

          <div
            className="flex h-32 w-32 animate-[wiggle_1.5s_ease-in-out_infinite] items-center justify-center rounded-2xl border-4 border-black text-6xl"
            style={{ background: 'linear-gradient(135deg,#7f1d1d,#450a0a)', boxShadow: '6px 6px 0 rgba(0,0,0,1), 0 0 30px rgba(239,68,68,0.6)' }}
          >
            👹
          </div>

          <div>
            <h2 className="text-3xl font-black text-white drop-shadow">{boss.name}</h2>
            <p className="mt-2 max-w-xs text-sm font-semibold text-white/60">{boss.description}</p>
          </div>

          <div className="max-w-xs rounded-2xl border-2 border-white/20 bg-white/10 p-4 text-sm text-white/80">
            <p className="font-black text-white">How to fight:</p>
            <p className="mt-1">
              Play a <span className="font-black text-blue-300">Shield Card</span> (Easy) to block attacks.
            </p>
            <p className="mt-1">
              Play a <span className="font-black text-red-300">Strike Card</span> (Medium) for 25 damage.
            </p>
            <p className="mt-1">
              Play a <span className="font-black text-rose-300">Fireball Card</span> (Hard) for 50 damage.
            </p>
            <p className="mt-2 text-xs text-white/50">Answer correctly to unleash each card's power!</p>
          </div>

          <button
            type="button"
            onClick={() => setPhase(PHASE.BATTLE)}
            className={`${neuBtn} bg-red-600 px-10 py-3 text-lg text-white hover:bg-red-500`}
            style={{ boxShadow: '4px 4px 0 rgba(0,0,0,1), 0 0 20px rgba(239,68,68,0.5)' }}
          >
            Enter the Arena!
          </button>
        </div>
      )}

      {/* ── BATTLE ────────────────────────────────────────────────────────── */}
      {phase === PHASE.BATTLE && (
        <>
          {/* Boss section — top ~45% */}
          <div className="flex flex-none flex-col items-center px-4 pt-5 pb-3">
            {/* Boss label */}
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-400">
              Boss
            </p>

            {/* Boss card */}
            <div
              className={`flex w-full max-w-sm items-center gap-4 rounded-2xl border-4 border-black p-4 ${bossShaking ? 'animate-boss-shake' : ''}`}
              style={{ background: 'linear-gradient(135deg,#1c0000,#3b0000)', boxShadow: '4px 4px 0 rgba(0,0,0,1), 0 0 20px rgba(239,68,68,0.3)' }}
            >
              <div
                className="flex h-16 w-16 flex-none items-center justify-center rounded-xl border-4 border-black text-4xl"
                style={{ background: 'linear-gradient(135deg,#7f1d1d,#450a0a)' }}
              >
                👹
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate font-black text-white">{boss.name}</p>
                  <p className="ml-2 flex-none text-xs font-bold text-white/60">
                    {bossHp}/{BOSS_MAX_HP}
                  </p>
                </div>
                {/* HP Bar */}
                <div className="mt-2 h-5 overflow-hidden rounded-lg border-4 border-black bg-stone-900">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${bossHpPct}%`, background: bossBarColor, boxShadow: `0 0 10px ${bossBarColor}` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 h-px flex-none bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

          {/* Player section — bottom */}
          <div className="flex flex-1 flex-col items-center justify-between overflow-y-auto px-4 py-4">
            {/* Player info */}
            <div className="flex w-full max-w-sm flex-col items-center gap-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400">
                Your Hero
              </p>
              <HeartRow
                hearts={hearts}
                shieldActive={shieldActive}
                shaking={playerShaking}
              />
            </div>

            {/* Hand of cards */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                — Your Hand —
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {hand.map((card) => (
                  <CombatCard
                    key={card.id}
                    card={card}
                    onClick={handleCardClick}
                    disabled={!!activeCard || phase !== PHASE.BATTLE}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Question modal (rendered on top of arena) */}
          {activeCard && activeQuestion && (
            <QuestionModal
              question={activeQuestion}
              card={activeCard}
              onAnswer={handleAnswer}
              answerIndex={answerIndex}
              isLocked={isLocked}
              feedback={feedback}
            />
          )}
        </>
      )}

      {/* ── VICTORY ───────────────────────────────────────────────────────── */}
      {phase === PHASE.VICTORY && (
        <div className="flex h-full flex-col items-center justify-start overflow-y-auto p-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-black bg-yellow-300 text-5xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            🏆
          </div>
          <h2 className="mt-4 animate-bounce text-3xl font-black text-white">Victory!</h2>
          <p className="mt-1 max-w-xs text-sm font-semibold text-white/70">
            You defeated <strong className="text-white">{boss.name}</strong>!
          </p>

          <div className="mt-3 rounded-xl border-2 border-amber-400 bg-amber-900/60 px-5 py-2 text-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">
              Badge Earned
            </p>
            <p className="font-black text-white">{badgeLabel}</p>
            <p className="mt-1 text-xs text-white/60">
              Skill Hexagon +10 pts · Mega Roll +3 bonus!
            </p>
          </div>

          {isReplay && (
            <div className="mt-3 rounded-xl border-2 border-cyan-400 bg-cyan-900/50 px-5 py-2 text-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
                Replay Mastery Bonus
              </p>
              <p className="font-black text-white">💎 +25 Gems · 🎲 +2 Energy</p>
            </div>
          )}

          <p className="mt-4 text-sm font-black text-yellow-300">✨ Boss Reward!</p>

          <LootRevealInline
            loot={victoryLoot}
            lootRevealPhase={lootRevealPhase}
            onEquip={handleLootEquip}
            onBackpack={handleLootBackpack}
          />
        </div>
      )}

      {/* ── DEFEAT ────────────────────────────────────────────────────────── */}
      {phase === PHASE.DEFEAT && (
        <div className="flex h-full items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border-4 border-black bg-white p-8">
            <DefeatScreen
              bossName={boss.name}
              heartsLost={STARTING_HEARTS}
              onRetry={onDefeatComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
