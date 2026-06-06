import { useCallback, useEffect, useRef, useState } from 'react';

const DUMMY_REWARDS = [
  'You found a Cool Cap!',
  'You found Sparkle Shoes!',
  'You earned a Forest Badge!',
  'You unlocked a new pawn color!',
  'You discovered a bonus star!',
];

const STEP_DELAY_MS = 350;
const RETREAT_STEPS = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pickRandomReward() {
  return DUMMY_REWARDS[Math.floor(Math.random() * DUMMY_REWARDS.length)];
}

/**
 * Core game loop: dice rolls, tile-by-tile movement, rewards, boss encounters.
 */
export function useGameLoop(
  pathLength,
  { initialEnergy = 10, initialTile = 1, onBossEncounter, skipBossEncounter = false } = {},
) {
  const bossTile = pathLength + 1;

  const [currentTile, setCurrentTile] = useState(initialTile);
  const [diceRollEnergy, setDiceRollEnergy] = useState(initialEnergy);
  const [isMoving, setIsMoving] = useState(false);
  const [lastRoll, setLastRoll] = useState(null);
  const [reward, setReward] = useState(null);
  const [bossEncounterActive, setBossEncounterActive] = useState(false);

  const movingRef = useRef(false);
  const currentTileRef = useRef(initialTile);
  const onBossEncounterRef = useRef(onBossEncounter);
  const skipBossRef = useRef(skipBossEncounter);

  useEffect(() => {
    onBossEncounterRef.current = onBossEncounter;
  }, [onBossEncounter]);

  useEffect(() => {
    skipBossRef.current = skipBossEncounter;
  }, [skipBossEncounter]);

  useEffect(() => {
    currentTileRef.current = currentTile;
  }, [currentTile]);

  useEffect(() => {
    setCurrentTile(initialTile);
    setDiceRollEnergy(initialEnergy);
    setIsMoving(false);
    setLastRoll(null);
    setReward(null);
    setBossEncounterActive(false);
    movingRef.current = false;
    currentTileRef.current = initialTile;
  }, [pathLength, initialEnergy, initialTile]);

  const closeReward = useCallback(() => setReward(null), []);

  const retreatFromBoss = useCallback(() => {
    setBossEncounterActive(false);
    setCurrentTile((tile) => {
      const next = Math.max(1, tile - RETREAT_STEPS);
      currentTileRef.current = next;
      return next;
    });
  }, []);

  const dismissBossEncounter = useCallback(() => {
    setBossEncounterActive(false);
  }, []);

  const rollDice = useCallback(async () => {
    if (movingRef.current || diceRollEnergy <= 0 || bossEncounterActive) return;

    movingRef.current = true;
    setIsMoving(true);
    setDiceRollEnergy((energy) => energy - 1);

    const roll = Math.floor(Math.random() * 6) + 1;
    setLastRoll(roll);

    const startTile = currentTileRef.current;
    const landingTile = Math.min(startTile + roll, bossTile);

    for (let step = startTile + 1; step <= landingTile; step++) {
      await sleep(STEP_DELAY_MS);
      setCurrentTile(step);
      currentTileRef.current = step;
    }

    if (landingTile >= bossTile && !skipBossRef.current) {
      setBossEncounterActive(true);
      onBossEncounterRef.current?.();
    } else if (landingTile % 2 === 0) {
      setReward({ message: pickRandomReward() });
    }

    movingRef.current = false;
    setIsMoving(false);
  }, [bossEncounterActive, bossTile, diceRollEnergy]);

  const canRoll = diceRollEnergy > 0 && !isMoving && !bossEncounterActive;

  return {
    currentTile,
    diceRollEnergy,
    isMoving,
    lastRoll,
    reward,
    canRoll,
    bossTile,
    bossEncounterActive,
    rollDice,
    closeReward,
    retreatFromBoss,
    dismissBossEncounter,
  };
}
