import { CHARACTERS } from "../data/characters";
import { ITEMS, itemById } from "../data/items";
import { LOCATIONS, locationById } from "../data/locations";
import { partsToText, writeClueParts } from "./clueWriter";
import { hashStringToSeed, mulberry32, shuffle, type Rng } from "./seededRandom";
import { countSolutions } from "./solver";
import type { Clue, Puzzle, Solution } from "./types";

const N = 4;

const MYSTERY_HEADLINES: ((item: string, loc: string) => string)[] = [
  (i, l) => `Who took ${i} from ${l}?`,
  (i, l) => `Who whisked ${i} away from ${l}?`,
  (i, l) => `Who borrowed ${i} from ${l} without asking?`,
  (i, l) => `Who slipped off with ${i} at ${l}?`,
  (i, l) => `Who scampered off with ${i} from ${l}?`,
];

type FactPair = {
  a: { category: "suspect" | "item" | "location"; id: string };
  b: { category: "suspect" | "item" | "location"; id: string };
};

export function generatePuzzle(seedKey: string): Puzzle {
  const baseSeed = hashStringToSeed(seedKey);

  for (let attempt = 0; attempt < 50; attempt++) {
    const rng = mulberry32(baseSeed + attempt * 7919);
    const puzzle = tryGenerate(seedKey, baseSeed + attempt, rng);
    if (puzzle) return puzzle;
  }
  throw new Error("Could not generate a unique puzzle after 50 attempts");
}

function tryGenerate(seedKey: string, seed: number, rng: Rng): Puzzle | null {
  const suspects = shuffle(CHARACTERS, rng).slice(0, N).map((c) => c.id);
  const items = shuffle(ITEMS, rng).slice(0, N).map((i) => i.id);
  const locations = shuffle(LOCATIONS, rng).slice(0, N).map((l) => l.id);

  // Random bijections: suspect → item, suspect → location
  const shuffledItems = shuffle(items, rng);
  const shuffledLocs = shuffle(locations, rng);
  const suspectToItem: Record<string, string> = {};
  const suspectToLocation: Record<string, string> = {};
  suspects.forEach((s, i) => {
    suspectToItem[s] = shuffledItems[i];
    suspectToLocation[s] = shuffledLocs[i];
  });

  // Pick the "culprit" — the suspect who took the missing item from a location.
  const culprit = suspects[Math.floor(rng() * suspects.length)];
  const stolenItem = suspectToItem[culprit];
  const sceneLocation = suspectToLocation[culprit];

  const solution: Solution = { suspect: culprit, item: stolenItem, location: sceneLocation };

  // Build the universe of true facts.
  const trueFacts: FactPair[] = [];
  for (const s of suspects) {
    trueFacts.push({
      a: { category: "suspect", id: s },
      b: { category: "item", id: suspectToItem[s] },
    });
    trueFacts.push({
      a: { category: "suspect", id: s },
      b: { category: "location", id: suspectToLocation[s] },
    });
    trueFacts.push({
      a: { category: "item", id: suspectToItem[s] },
      b: { category: "location", id: suspectToLocation[s] },
    });
  }

  const falseFacts: FactPair[] = [];
  for (const s of suspects) {
    for (const i of items) {
      if (i !== suspectToItem[s]) {
        falseFacts.push({
          a: { category: "suspect", id: s },
          b: { category: "item", id: i },
        });
      }
    }
    for (const l of locations) {
      if (l !== suspectToLocation[s]) {
        falseFacts.push({
          a: { category: "suspect", id: s },
          b: { category: "location", id: l },
        });
      }
    }
  }

  // Strategy: start with a generous random pool of clues, then **prune** any
  // clue that is redundant (puzzle still has exactly one solution without it).
  const pool: Clue[] = [];

  for (const f of shuffle(falseFacts, rng).slice(0, 16)) {
    pool.push({ kind: "negation", a: f.a, b: f.b });
  }
  for (const f of shuffle(trueFacts, rng).slice(0, 4)) {
    // Skip direct clues that immediately reveal the culprit triple.
    if (
      (f.a.id === culprit && f.b.id === stolenItem) ||
      (f.a.id === stolenItem && f.b.id === sceneLocation) ||
      (f.a.id === culprit && f.b.id === sceneLocation)
    ) {
      continue;
    }
    pool.push({ kind: "direct", a: f.a, b: f.b });
  }
  // A couple of conditional clues for spice
  for (let k = 0; k < 3; k++) {
    const t = trueFacts[Math.floor(rng() * trueFacts.length)];
    const fa = falseFacts[Math.floor(rng() * falseFacts.length)];
    pool.push({ kind: "if-then-not", ifPair: t, thenNot: fa });
  }

  // Verify the seed pool yields uniqueness first.
  if (countSolutions(suspects, items, locations, pool) !== 1) return null;

  // Greedy prune: drop any clue that's redundant.
  const shuffledPool = shuffle(pool, rng);
  const minimal: Clue[] = [...shuffledPool];
  for (const c of shuffledPool) {
    const candidate = minimal.filter((x) => x !== c);
    if (countSolutions(suspects, items, locations, candidate) === 1) {
      const idx = minimal.indexOf(c);
      if (idx !== -1) minimal.splice(idx, 1);
    }
  }

  // We aim for 4–9 clues after pruning.
  if (minimal.length < 4 || minimal.length > 9) return null;

  const clues = minimal.map((c, idx) => {
    const parts = writeClueParts(c);
    return {
      id: `clue-${idx}`,
      clue: c,
      parts,
      text: partsToText(parts),
    };
  });

  const itemLabel = itemById(stolenItem).name;
  const locLabel = locationById(sceneLocation).name;
  const headline = MYSTERY_HEADLINES[Math.floor(rng() * MYSTERY_HEADLINES.length)](
    itemLabel,
    locLabel,
  );

  return {
    id: seedKey,
    seed,
    mystery: { headline, item: stolenItem, location: sceneLocation },
    suspectIds: suspects,
    itemIds: items,
    locationIds: locations,
    clues,
    solution,
  };
}
