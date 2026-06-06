import { useCallback, useEffect, useRef, useState } from 'react';
import { rollLoot } from '../systems/lootSystem.js';

const STEP_DELAY_MS = 350;
const RETREAT_STEPS = 3;
const MEGA_ROLL_BONUS = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Core game loop: dice rolls, tile-by-tile movement, chest loot, boss encounters.
 */
export function useGameLoop(
  pathLength,
  {
    initialEnergy = 10,
    initialTile = 1,
    chestTiles = [],
    skipBossEncounter = false,
  } = {},
) {
  const bossTile = pathLength + 1;
  const chestSet = useRef(new Set(chestTiles));

  const [currentTile, setCurrentTile] = useState(initialTile);
  const [diceRollEnergy, setDiceRollEnergy] = useState(initialEnergy);
  const [isMoving, setIsMoving] = useState(false);
  const [lastRoll, setLastRoll] = useState(null);
  const [pendingLoot, setPendingLoot] = useState(null);
  const [bossEncounterActive, setBossEncounterActive] = useState(false);

  const movingRef = useRef(false);
  const currentTileRef = useRef(initialTile);
  const openedChestsRef = useRef(new Set());
  const lootResolveRef = useRef(null);
  const skipBossRef = useRef(skipBossEncounter);

  useEffect(() => {
    chestSet.current = new Set(chestTiles);
  }, [chestTiles]);

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
    setPendingLoot(null);
    setBossEncounterActive(false);
    movingRef.current = false;
    currentTileRef.current = initialTile;
    openedChestsRef.current = new Set();
    lootResolveRef.current = null;
  }, [pathLength, initialEnergy, initialTile]);

  const closeLootReveal = useCallback(() => {
    setPendingLoot(null);
    lootResolveRef.current?.();
    lootResolveRef.current = null;
  }, []);

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

  const grantMegaRoll = useCallback(() => {
    setDiceRollEnergy((energy) => energy + MEGA_ROLL_BONUS);
  }, []);

  const rollDice = useCallback(async () => {
    if (movingRef.current || diceRollEnergy <= 0 || bossEncounterActive || pendingLoot) return;

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

      const isChest = chestSet.current.has(step);
      const alreadyOpened = openedChestsRef.current.has(step);

      if (isChest && !alreadyOpened) {
        openedChestsRef.current.add(step);
        const item = rollLoot();

        await new Promise((resolve) => {
          lootResolveRef.current = resolve;
          setPendingLoot({ item, tile: step });
        });
      }
    }

    if (landingTile >= bossTile && !skipBossRef.current) {
      setBossEncounterActive(true);
    }

    movingRef.current = false;
    setIsMoving(false);
  }, [bossEncounterActive, bossTile, diceRollEnergy, pendingLoot]);

  const lootRevealActive = Boolean(pendingLoot);
  const canRoll = diceRollEnergy > 0 && !isMoving && !bossEncounterActive && !lootRevealActive;

  return {
    currentTile,
    diceRollEnergy,
    isMoving,
    lastRoll,
    pendingLoot,
    lootRevealActive,
    canRoll,
    bossTile,
    bossEncounterActive,
    rollDice,
    closeLootReveal,
    retreatFromBoss,
    dismissBossEncounter,
    grantMegaRoll,
  };
}
