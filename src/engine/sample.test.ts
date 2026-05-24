import { describe, it } from "vitest";
import { generatePuzzle } from "./generator";

describe("sample puzzle (for human review)", () => {
  it("prints a few puzzles", () => {
    for (const key of ["daily-2026-05-24", "daily-2026-05-25", "daily-2026-05-26"]) {
      const p = generatePuzzle(key);
      // eslint-disable-next-line no-console
      console.log(`\n=== ${key} ===`);
      console.log(`MYSTERY: ${p.mystery.headline}`);
      console.log(`SOLUTION: ${p.solution.suspect} / ${p.solution.item} / ${p.solution.location}`);
      console.log("CLUES:");
      p.clues.forEach((c, i) => console.log(`  ${i + 1}. ${c.text}`));
    }
  });
});
