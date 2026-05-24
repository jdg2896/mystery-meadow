import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Puzzle } from "../engine/types";

export type Mark = "blank" | "no" | "yes";

export type GridKey = "suspect-item" | "suspect-location" | "item-location";

export type Accusation = {
  suspect: string | null;
  item: string | null;
  location: string | null;
};

type GridState = Record<GridKey, Record<string, Record<string, Mark>>>;

type PuzzleState = {
  puzzleId: string | null;
  mode: "daily" | "free";
  startedAt: number | null;
  finishedAt: number | null;
  outcome: "win" | "lose" | null;
  grids: GridState;
  accusation: Accusation;
  // Lifecycle
  startPuzzle: (p: Puzzle, mode: "daily" | "free") => void;
  cycleCell: (grid: GridKey, row: string, col: string, rowIds?: string[], colIds?: string[]) => void;
  setAccusation: (field: keyof Accusation, value: string) => void;
  submitAccusation: (p: Puzzle) => "win" | "lose";
  reset: () => void;
};

const emptyGrids = (): GridState => ({
  "suspect-item": {},
  "suspect-location": {},
  "item-location": {},
});

const cycle = (m: Mark): Mark => (m === "blank" ? "no" : m === "no" ? "yes" : "blank");

export const usePuzzleStore = create<PuzzleState>()(
  persist(
    (set, get) => ({
      puzzleId: null,
      mode: "daily",
      startedAt: null,
      finishedAt: null,
      outcome: null,
      grids: emptyGrids(),
      accusation: { suspect: null, item: null, location: null },

      startPuzzle: (p, mode) => {
        const current = get();
        if (current.puzzleId === p.id && current.outcome === null) {
          // resume in-progress puzzle
          return;
        }
        set({
          puzzleId: p.id,
          mode,
          startedAt: Date.now(),
          finishedAt: null,
          outcome: null,
          grids: emptyGrids(),
          accusation: { suspect: null, item: null, location: null },
        });
      },

      cycleCell: (grid, row, col, rowIds, colIds) =>
        set((s) => {
          const g = { ...s.grids };
          const current = g[grid][row]?.[col] ?? "blank";
          const next = cycle(current);
          const updatedRow = { ...(g[grid][row] ?? {}), [col]: next };
          g[grid] = { ...g[grid], [row]: updatedRow };

          // Murdle-style auto-fill: marking a cell ✓ means everyone else in that
          // row/column is impossible — fill the *blank* siblings with ✕. We
          // don't overwrite existing marks (preserves user deductions).
          if (next === "yes" && rowIds && colIds) {
            for (const c of colIds) {
              if (c === col) continue;
              if ((g[grid][row]?.[c] ?? "blank") === "blank") {
                g[grid] = { ...g[grid], [row]: { ...g[grid][row], [c]: "no" } };
              }
            }
            for (const r of rowIds) {
              if (r === row) continue;
              if ((g[grid][r]?.[col] ?? "blank") === "blank") {
                g[grid] = { ...g[grid], [r]: { ...(g[grid][r] ?? {}), [col]: "no" } };
              }
            }
          }
          return { grids: g };
        }),

      setAccusation: (field, value) =>
        set((s) => ({ accusation: { ...s.accusation, [field]: value } })),

      submitAccusation: (p) => {
        const a = get().accusation;
        const win =
          a.suspect === p.solution.suspect &&
          a.item === p.solution.item &&
          a.location === p.solution.location;
        const outcome: "win" | "lose" = win ? "win" : "lose";
        set({ outcome, finishedAt: Date.now() });
        return outcome;
      },

      reset: () =>
        set({
          puzzleId: null,
          startedAt: null,
          finishedAt: null,
          outcome: null,
          grids: emptyGrids(),
          accusation: { suspect: null, item: null, location: null },
        }),
    }),
    { name: "mystery-meadow-puzzle-state-v1" },
  ),
);
