import { useCallback, useEffect, useRef, useState } from 'react';
import { getStageConfig, getStageColors } from '../data/realmConfig.js';
import { getTileQuestion, getBossQuestions } from '../data/questions/index.js';
import { drawColorCard } from '../systems/movementCards.js';

const MOVE_STEP_MS = 240;
const REVEAL_MS = 500;
const FIZZLE_MS = 700;
const PERFECT_ENERGY = 1;
const MEGA_ROLL_BONUS = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Board game loop: Game-of-Life winding paths + Monopoly central draw deck +
 * Candyland color movement.
 *
 * - `drawCard()` flips one color card from the central pile and fires movement.
 * - Movement scans the track for the card's color; if a SPHINX FORK is reached
 *   first it pauses for a gated question (`pendingSphinx`); a correct answer
 *   routes the player down the short-cut, a wrong answer down the long detour.
 * - Landing on any colored tile triggers that sub-topic's question
 *   (`pendingQuestion`); a wrong answer FIZZLES the player back to the turn's
 *   starting tile.
 */
export function useGameLoop(course, { initialEnergy = 10 } = {}) {
  const stage = getStageConfig(course.subject, course.grade, course.stage);
  const track = stage?.tileTrack ?? [];
  const trackColors = getStageColors(course.subject);
  const bossIndex = stage?.bossIndex ?? track.length - 1;
  const bank = course.questionBankId;

  const [position, setPosition] = useState(0);
  const [energy, setEnergy] = useState(initialEnergy);
  const [drawnCard, setDrawnCard] = useState(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [pendingSphinx, setPendingSphinx] = useState(null); // { forkIndex, color, count, question }
  const [pendingQuestion, setPendingQuestion] = useState(null); // { index, color, topic, question, fromIndex }
  const [branchChoice, setBranchChoice] = useState(null); // 'shortcut' | 'detour' | null
  const [bossActive, setBossActive] = useState(false);
  const [stageCleared, setStageCleared] = useState(false);
  const [fizzle, setFizzle] = useState(null);

  const positionRef = useRef(0);
  const branchChoiceRef = useRef(null);
  const turnStartRef = useRef(0);
  const walkRef = useRef(null); // { color, count, matches } carried across the Sphinx

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    setPosition(0);
    positionRef.current = 0;
    setEnergy(initialEnergy);
    setDrawnCard(null);
    setIsRevealing(false);
    setIsMoving(false);
    setPendingSphinx(null);
    setPendingQuestion(null);
    setBranchChoice(null);
    branchChoiceRef.current = null;
    setBossActive(false);
    setStageCleared(false);
    setFizzle(null);
    turnStartRef.current = 0;
    walkRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on stage swap only
  }, [course.id, initialEnergy]);

  /** Resolve the next tile index, honoring the chosen branch at the fork. */
  const nextIndex = useCallback(
    (idx) => {
      const t = track[idx];
      if (!t || t.next == null) return -1;
      if (typeof t.next === 'object') {
        const b = branchChoiceRef.current;
        if (!b) return null; // fork undecided
        return b === 'shortcut' ? t.next.shortcut : t.next.detour;
      }
      return t.next;
    },
    [track],
  );

  /** Walk forward seeking the `count`-th tile of `color` (clamped to last colored). */
  const scanColorPath = useCallback(
    (from, color, count, startMatches) => {
      let cur = from;
      let matches = startMatches;
      let lastColored = -1;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const t = track[cur];
        if (t.type === 'fork' && !branchChoiceRef.current) {
          return { stop: 'fork', forkIndex: cur, matches };
        }
        const nx = nextIndex(cur);
        if (nx == null || nx === -1) break;
        cur = nx;
        const tile = track[cur];
        if (tile.type === 'boss') break;
        if (tile.topic) {
          lastColored = cur;
          if (tile.color === color) {
            matches += 1;
            if (matches >= count) return { stop: 'target', target: cur };
          }
        }
      }
      return lastColored >= 0 ? { stop: 'target', target: lastColored } : { stop: 'none' };
    },
    [track, nextIndex],
  );

  const hasColoredAhead = useCallback(
    (idx) => {
      let cur = idx;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const t = track[cur];
        if (t.type === 'fork' && !branchChoiceRef.current) return true;
        const nx = nextIndex(cur);
        if (nx == null || nx === -1) return false;
        cur = nx;
        const tile = track[cur];
        if (tile.type === 'boss') return false;
        if (tile.topic) return true;
      }
    },
    [track, nextIndex],
  );

  const triggerFizzle = useCallback((fromColor) => {
    setFizzle({ fromColor });
    setTimeout(() => setFizzle(null), FIZZLE_MS);
  }, []);

  const animatePath = useCallback(
    async (from, to) => {
      let cur = from;
      let guard = 0;
      while (cur !== to && guard < 64) {
        const nx = nextIndex(cur);
        if (nx == null || nx === -1) break;
        // eslint-disable-next-line no-await-in-loop
        await sleep(MOVE_STEP_MS);
        cur = nx;
        setPosition(cur);
        positionRef.current = cur;
        guard += 1;
      }
    },
    [nextIndex],
  );

  /** Core movement: walk toward the color target, pausing at the Sphinx fork. */
  const beginMovement = useCallback(
    async (color, count, startMatches, from) => {
      const res = scanColorPath(from, color, count, startMatches);

      if (res.stop === 'fork') {
        setIsMoving(true);
        await animatePath(from, res.forkIndex);
        setIsMoving(false);
        walkRef.current = { color, count, matches: res.matches };
        setPendingSphinx({
          forkIndex: res.forkIndex,
          color,
          count,
          question: getBossQuestions(bank, 1)[0] ?? getTileQuestion(bank, track[res.forkIndex].topic),
        });
        return;
      }

      if (res.stop === 'none') {
        triggerFizzle(color); // card whiffs — nothing of that color ahead
        return;
      }

      setIsMoving(true);
      await animatePath(from, res.target);
      setIsMoving(false);
      const tile = track[res.target];
      setPendingQuestion({
        index: res.target,
        color: tile.color,
        topic: tile.topic,
        question: getTileQuestion(bank, tile.topic),
        fromIndex: turnStartRef.current,
      });
    },
    [scanColorPath, animatePath, triggerFizzle, bank, track],
  );

  const canDraw =
    energy > 0 &&
    !isRevealing &&
    !isMoving &&
    !pendingSphinx &&
    !pendingQuestion &&
    !bossActive &&
    !stageCleared;

  /** Monopoly-style: flip one card from the central pile, then move. */
  const drawCard = useCallback(async () => {
    if (!canDraw) return;
    const card = drawColorCard(trackColors);
    turnStartRef.current = positionRef.current;
    setEnergy((e) => Math.max(0, e - 1)); // a drawn card is consumed
    setDrawnCard(card);
    setIsRevealing(true);
    await sleep(REVEAL_MS);
    setIsRevealing(false);
    await beginMovement(card.color, card.count, 0, positionRef.current);
  }, [canDraw, trackColors, beginMovement]);

  /** Sphinx answered → route the branch and resume the queued movement. */
  const resolveSphinx = useCallback(
    (correct) => {
      const ps = pendingSphinx;
      if (!ps) return correct ? 'shortcut' : 'detour';
      const branch = correct ? 'shortcut' : 'detour';
      branchChoiceRef.current = branch;
      setBranchChoice(branch);
      setPendingSphinx(null);
      const carry = walkRef.current ?? { color: ps.color, count: ps.count, matches: 0 };
      // Resume from the fork, carrying the colors already matched pre-fork.
      beginMovement(carry.color, carry.count, carry.matches, ps.forkIndex);
      return branch;
    },
    [pendingSphinx, beginMovement],
  );

  /**
   * Resolve a tile question.
   * @returns {'perfect'|'boss'|'fizzle'}
   */
  const resolveAnswer = useCallback(
    (correct) => {
      const pq = pendingQuestion;
      setPendingQuestion(null);
      if (!pq) return 'fizzle';

      if (!correct) {
        // The Fizzle: snap back to the turn's starting tile.
        const back = turnStartRef.current;
        setPosition(back);
        positionRef.current = back;
        if (stage && back <= stage.forkIndex) {
          branchChoiceRef.current = null; // re-gate the Sphinx next time
          setBranchChoice(null);
        }
        triggerFizzle(pq.color);
        return 'fizzle';
      }

      setEnergy((e) => e + PERFECT_ENERGY);
      if (!hasColoredAhead(pq.index)) {
        setPosition(bossIndex);
        positionRef.current = bossIndex;
        setBossActive(true);
        return 'boss';
      }
      return 'perfect';
    },
    [pendingQuestion, hasColoredAhead, bossIndex, stage, triggerFizzle],
  );

  const dismissBossEncounter = useCallback(() => {
    setBossActive(false);
    setStageCleared(true);
  }, []);

  const retreatFromBoss = useCallback(() => {
    setBossActive(false);
    setPosition((p) => Math.max(0, p - 1));
  }, []);

  const grantMegaRoll = useCallback(() => setEnergy((e) => e + MEGA_ROLL_BONUS), []);
  const addEnergy = useCallback((amount) => {
    if (amount) setEnergy((e) => Math.max(0, e + amount));
  }, []);

  return {
    stage,
    track,
    edges: stage?.edges ?? [],
    position,
    energy,
    drawnCard,
    isRevealing,
    isMoving,
    pendingSphinx,
    pendingQuestion,
    branchChoice,
    bossActive,
    stageCleared,
    fizzle,
    bossIndex,
    canDraw,
    drawCard,
    resolveSphinx,
    resolveAnswer,
    dismissBossEncounter,
    retreatFromBoss,
    grantMegaRoll,
    addEnergy,
  };
}