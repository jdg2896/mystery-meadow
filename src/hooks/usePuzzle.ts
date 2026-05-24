import { useEffect, useMemo, useState } from "react";
import { generatePuzzle } from "../engine/generator";
import { todayKey } from "../engine/seededRandom";
import type { Puzzle } from "../engine/types";
import { usePuzzleStore } from "../store/puzzleStore";

export type Mode = "daily" | "free";

export function usePuzzle(mode: Mode, freeSeedKey?: string): Puzzle {
  const startPuzzle = usePuzzleStore((s) => s.startPuzzle);

  const seedKey = useMemo(() => {
    if (mode === "daily") return `daily-${todayKey()}`;
    return freeSeedKey ?? `free-${Date.now()}`;
  }, [mode, freeSeedKey]);

  const puzzle = useMemo(() => generatePuzzle(seedKey), [seedKey]);

  useEffect(() => {
    startPuzzle(puzzle, mode);
  }, [puzzle, mode, startPuzzle]);

  return puzzle;
}

export function useRandomFreeSeed(): [string, () => void] {
  const [seed, setSeed] = useState(() => `free-${Date.now()}`);
  const reroll = () => setSeed(`free-${Date.now()}-${Math.random()}`);
  return [seed, reroll];
}
