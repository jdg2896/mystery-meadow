import { describe, expect, it } from "vitest";
import { generatePuzzle } from "./generator";
import { countSolutions } from "./solver";

describe("generatePuzzle", () => {
  it("produces a puzzle with exactly one solution for many seeds", () => {
    for (let i = 0; i < 25; i++) {
      const p = generatePuzzle(`test-${i}`);
      expect(p.suspectIds.length).toBe(4);
      expect(p.itemIds.length).toBe(4);
      expect(p.locationIds.length).toBe(4);
      expect(p.clues.length).toBeGreaterThanOrEqual(4);
      expect(p.clues.length).toBeLessThanOrEqual(9);

      const count = countSolutions(
        p.suspectIds,
        p.itemIds,
        p.locationIds,
        p.clues.map((c) => c.clue),
      );
      expect(count).toBe(1);
    }
  });

  it("is deterministic for the same seed", () => {
    const a = generatePuzzle("2026-05-24");
    const b = generatePuzzle("2026-05-24");
    expect(a.solution).toEqual(b.solution);
    expect(a.clues.map((c) => c.text)).toEqual(b.clues.map((c) => c.text));
  });
});
