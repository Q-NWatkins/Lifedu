import { useCallback, useEffect, useRef, useState } from 'react';
import { rollLoot } from '../systems/lootSystem.js';
import {
  buildConstellationLayout,
  getPathForBranch,
  stepAtPathIndex,
} from '../systems/constellationMap.js';

const STEP_DELAY_MS = 350;
const RETREAT_STEPS = 3;
const MEGA_ROLL_BONUS = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isLootNode(node) {
  return node?.type === 'chest' || node?.type === 'mysteryChest';
}

/**
 * Constellation-aware game loop with movement cards, branching paths, and
 * interactive obstacle nodes (Mini-Boss gates + optional Side-Boss skirmishes).
 */
export function useGameLoop(course, { initialEnergy = 10, skipBossEncounter = false } = {}) {
  const layout = buildConstellationLayout(course);
  const bossStep = layout.bossStep;

  const [pathBranch, setPathBranch] = useState(null);
  const [pathIndex, setPathIndex] = useState(0);
  const [energy, setEnergy] = useState(initialEnergy);
  const [isMoving, setIsMoving] = useState(false);
  const [lastMoveSteps, setLastMoveSteps] = useState(null);
  const [pendingLoot, setPendingLoot] = useState(null);
  const [bossEncounterActive, setBossEncounterActive] = useState(false);
  const [forkChoicePending, setForkChoicePending] = useState(false);
  const [miniBossEncounter, setMiniBossEncounter] = useState(null);
  const [sideBossEncounter, setSideBossEncounter] = useState(null);
  const [clearedNodes, setClearedNodes] = useState([]);

  const movingRef = useRef(false);
  const pathIndexRef = useRef(0);
  const pathBranchRef = useRef(null);
  const openedChestsRef = useRef(new Set());
  const lootResolveRef = useRef(null);
  const skipBossRef = useRef(skipBossEncounter);
  const clearedNodesRef = useRef(new Set());

  const activePath = getPathForBranch(layout, pathBranch ?? 'short');

  const getNodeAt = useCallback(
    (index) => {
      const nodeId = activePath[index];
      return layout.nodes.find((n) => n.id === nodeId);
    },
    [activePath, layout.nodes],
  );

  const currentStep = stepAtPathIndex(layout, activePath, pathIndex);

  useEffect(() => {
    skipBossRef.current = skipBossEncounter;
  }, [skipBossEncounter]);

  useEffect(() => {
    pathIndexRef.current = pathIndex;
  }, [pathIndex]);

  useEffect(() => {
    pathBranchRef.current = pathBranch;
  }, [pathBranch]);

  useEffect(() => {
    setPathBranch(null);
    setPathIndex(0);
    setEnergy(initialEnergy);
    setIsMoving(false);
    setLastMoveSteps(null);
    setPendingLoot(null);
    setBossEncounterActive(false);
    setForkChoicePending(false);
    setMiniBossEncounter(null);
    setSideBossEncounter(null);
    setClearedNodes([]);
    movingRef.current = false;
    pathIndexRef.current = 0;
    pathBranchRef.current = null;
    openedChestsRef.current = new Set();
    lootResolveRef.current = null;
    clearedNodesRef.current = new Set();
  }, [course.id, initialEnergy]);

  const closeLootReveal = useCallback(() => {
    setPendingLoot(null);
    lootResolveRef.current?.();
    lootResolveRef.current = null;
  }, []);

  const retreatFromBoss = useCallback(() => {
    setBossEncounterActive(false);
    setPathIndex((idx) => {
      const next = Math.max(0, idx - RETREAT_STEPS);
      pathIndexRef.current = next;
      return next;
    });
  }, []);

  const dismissBossEncounter = useCallback(() => {
    setBossEncounterActive(false);
  }, []);

  const grantMegaRoll = useCallback(() => {
    setEnergy((e) => e + MEGA_ROLL_BONUS);
  }, []);

  /** Generic energy grant (used for the replay-mastery bonus). */
  const addEnergy = useCallback((amount) => {
    if (!amount) return;
    setEnergy((e) => Math.max(0, e + amount));
  }, []);

  const markNodeCleared = useCallback((nodeId) => {
    if (nodeId == null) return;
    clearedNodesRef.current.add(nodeId);
    setClearedNodes((prev) => (prev.includes(nodeId) ? prev : [...prev, nodeId]));
  }, []);

  /** Mini-Boss defeated → unlock the path past it. */
  const resolveMiniBoss = useCallback(
    (nodeId) => {
      markNodeCleared(nodeId);
      setMiniBossEncounter(null);
    },
    [markNodeCleared],
  );

  /** Side-Boss resolved (won or skipped) → allow passing. */
  const resolveSideBoss = useCallback(
    (nodeId) => {
      markNodeCleared(nodeId);
      setSideBossEncounter(null);
    },
    [markNodeCleared],
  );

  const chooseForkBranch = useCallback((branch) => {
    setPathBranch(branch);
    pathBranchRef.current = branch;
    setForkChoicePending(false);
  }, []);

  const moveAlongPath = useCallback(
    async (steps) => {
      if (
        movingRef.current ||
        energy <= 0 ||
        bossEncounterActive ||
        pendingLoot ||
        miniBossEncounter ||
        sideBossEncounter
      ) {
        return false;
      }

      let branch = pathBranchRef.current ?? 'short';
      let path = getPathForBranch(layout, branch);
      let fromIndex = pathIndexRef.current;

      const atFork =
        !pathBranchRef.current &&
        layout.nodes.find((n) => n.id === path[fromIndex])?.type === 'fork';

      if (atFork) {
        setForkChoicePending(true);
        return false;
      }

      movingRef.current = true;
      setIsMoving(true);
      setEnergy((e) => e - 1);
      setLastMoveSteps(steps);

      const targetIndex = Math.min(fromIndex + steps, path.length - 1);

      for (let i = fromIndex + 1; i <= targetIndex; i++) {
        await sleep(STEP_DELAY_MS);

        branch = pathBranchRef.current ?? 'short';
        path = getPathForBranch(layout, branch);
        const node = layout.nodes.find((n) => n.id === path[i]);

        setPathIndex(i);
        pathIndexRef.current = i;

        if (node?.type === 'fork' && !pathBranchRef.current) {
          setForkChoicePending(true);
          movingRef.current = false;
          setIsMoving(false);
          return true;
        }

        // Mini-Boss gate — stop dead and require a win before moving on.
        if (node?.type === 'miniBoss' && !clearedNodesRef.current.has(node.id)) {
          setMiniBossEncounter(node);
          movingRef.current = false;
          setIsMoving(false);
          return true;
        }

        // Side-Boss — optional skirmish on arrival.
        if (node?.type === 'sideBoss' && !clearedNodesRef.current.has(node.id)) {
          setSideBossEncounter(node);
          movingRef.current = false;
          setIsMoving(false);
          return true;
        }

        const chestKey = `${branch}-${node?.id}`;
        if (node && isLootNode(node) && !openedChestsRef.current.has(chestKey)) {
          openedChestsRef.current.add(chestKey);
          const item = rollLoot();
          const isMystery = node.type === 'mysteryChest';

          await new Promise((resolve) => {
            lootResolveRef.current = resolve;
            setPendingLoot({ item, tile: node.step, isMystery });
          });
        }
      }

      branch = pathBranchRef.current ?? 'short';
      path = getPathForBranch(layout, branch);
      const landedIndex = pathIndexRef.current;
      const landedNode = layout.nodes.find((n) => n.id === path[landedIndex]);

      if (landedNode?.type === 'boss' && !skipBossRef.current) {
        setBossEncounterActive(true);
      }

      movingRef.current = false;
      setIsMoving(false);
      return true;
    },
    [bossEncounterActive, energy, layout, pendingLoot, miniBossEncounter, sideBossEncounter],
  );

  const lootRevealActive = Boolean(pendingLoot);
  const canMove =
    energy > 0 &&
    !isMoving &&
    !bossEncounterActive &&
    !lootRevealActive &&
    !forkChoicePending &&
    !miniBossEncounter &&
    !sideBossEncounter;

  return {
    layout,
    pathBranch,
    pathIndex,
    currentStep,
    activePath,
    energy,
    isMoving,
    lastMoveSteps,
    pendingLoot,
    lootRevealActive,
    canMove,
    bossStep,
    bossEncounterActive,
    forkChoicePending,
    miniBossEncounter,
    sideBossEncounter,
    clearedNodes,
    moveAlongPath,
    chooseForkBranch,
    closeLootReveal,
    retreatFromBoss,
    dismissBossEncounter,
    grantMegaRoll,
    addEnergy,
    resolveMiniBoss,
    resolveSideBoss,
    getNodeAt,
  };
}
