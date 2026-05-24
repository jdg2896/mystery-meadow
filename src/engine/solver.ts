import type { Assignment, Clue } from "./types";

/**
 * Backtracking solver. Counts complete assignments consistent with `clues`,
 * stopping early once `limit` (default 2) is reached — we only care whether
 * the puzzle is uniquely solvable.
 */
export function countSolutions(
  suspectIds: string[],
  itemIds: string[],
  locationIds: string[],
  clues: Clue[],
  limit = 2,
): number {
  if (suspectIds.length !== itemIds.length || suspectIds.length !== locationIds.length) {
    throw new Error("category sizes must match");
  }

  let found = 0;
  const itemPerm: string[] = [];
  const usedItem = new Set<string>();

  const tryAssignLocations = (suspectToItem: Record<string, string>) => {
    const locPerm: string[] = [];
    const usedLoc = new Set<string>();

    const recurseLoc = (idx: number): void => {
      if (found >= limit) return;
      if (idx === suspectIds.length) {
        const suspectToLocation: Record<string, string> = {};
        suspectIds.forEach((s, i) => (suspectToLocation[s] = locPerm[i]));
        const assignment: Assignment = { suspectToItem, suspectToLocation };
        if (satisfiesAll(assignment, clues)) {
          found++;
        }
        return;
      }
      for (const loc of locationIds) {
        if (usedLoc.has(loc)) continue;
        usedLoc.add(loc);
        locPerm.push(loc);
        recurseLoc(idx + 1);
        locPerm.pop();
        usedLoc.delete(loc);
        if (found >= limit) return;
      }
    };

    recurseLoc(0);
  };

  const recurseItem = (idx: number): void => {
    if (found >= limit) return;
    if (idx === suspectIds.length) {
      const suspectToItem: Record<string, string> = {};
      suspectIds.forEach((s, i) => (suspectToItem[s] = itemPerm[i]));
      tryAssignLocations(suspectToItem);
      return;
    }
    for (const item of itemIds) {
      if (usedItem.has(item)) continue;
      usedItem.add(item);
      itemPerm.push(item);
      recurseItem(idx + 1);
      itemPerm.pop();
      usedItem.delete(item);
      if (found >= limit) return;
    }
  };

  recurseItem(0);
  return found;
}

function satisfiesAll(a: Assignment, clues: Clue[]): boolean {
  return clues.every((c) => satisfies(a, c));
}

function satisfies(a: Assignment, c: Clue): boolean {
  switch (c.kind) {
    case "direct":
      return pairHolds(a, c.a, c.b);
    case "negation":
      return !pairHolds(a, c.a, c.b);
    case "if-then-not": {
      const ifTrue = pairHolds(a, c.ifPair.a, c.ifPair.b);
      if (!ifTrue) return true;
      return !pairHolds(a, c.thenNot.a, c.thenNot.b);
    }
  }
}

function pairHolds(
  a: Assignment,
  x: { category: "suspect" | "item" | "location"; id: string },
  y: { category: "suspect" | "item" | "location"; id: string },
): boolean {
  // A pair "holds" iff the two attributes belong to the same suspect.
  const xs = suspectsHaving(a, x);
  const ys = suspectsHaving(a, y);
  for (const s of xs) if (ys.has(s)) return true;
  return false;
}

function suspectsHaving(
  a: Assignment,
  attr: { category: "suspect" | "item" | "location"; id: string },
): Set<string> {
  if (attr.category === "suspect") return new Set([attr.id]);
  const map = attr.category === "item" ? a.suspectToItem : a.suspectToLocation;
  const out = new Set<string>();
  for (const [s, v] of Object.entries(map)) {
    if (v === attr.id) out.add(s);
  }
  return out;
}
