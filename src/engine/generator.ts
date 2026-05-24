import { CHARACTERS, characterById } from "../data/characters";
import { ITEMS, itemById } from "../data/items";
import { LOCATIONS, locationById } from "../data/locations";
import { partsToText, writeClueParts } from "./clueWriter";
import {
  hashStringToSeed,
  mulberry32,
  shuffle,
  weightedPickIndex,
  type Rng,
} from "./seededRandom";
import { countSolutions } from "./solver";
import type { Clue, Puzzle, Solution } from "./types";

// How strongly to prefer canonical (loved-gift / home-island) pairings.
// 3× means a thematic option is three times as likely as a non-thematic one
// at each pick; the puzzle still feels random and solutions aren't guessable
// from the character alone.
const THEMATIC_WEIGHT = 3;

// Greedy weighted bijection: for each suspect (in random order), draw one
// remaining option, with thematic matches weighted higher. Produces a 1-to-1
// mapping with a thematic bias but no fixed pattern.
//
// `firstPick` (the culprit) is assigned first so the *solution* tends to feel
// canonical — they get first crack at their loved gift / home island while
// any is still available. Decoys remain weakly biased and surprising.
function weightedBijection(
  suspects: string[],
  options: string[],
  isThematic: (suspectId: string, optionId: string) => boolean,
  rng: Rng,
  firstPick?: string,
): Record<string, string> {
  const remaining = [...options];
  const rest = shuffle(
    suspects.filter((s) => s !== firstPick),
    rng,
  );
  const order = firstPick ? [firstPick, ...rest] : rest;
  const out: Record<string, string> = {};
  for (const s of order) {
    const weights = remaining.map((o) => (isThematic(s, o) ? THEMATIC_WEIGHT : 1));
    const idx = weightedPickIndex(weights, rng);
    out[s] = remaining[idx];
    remaining.splice(idx, 1);
  }
  return out;
}

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

// Weighted sample without replacement — pick `n` distinct ids, where ids the
// suspects care about (loved gifts / home islands) get a higher weight. Keeps
// the pool surprising while making canonical pairings reachable.
function weightedSample(
  pool: readonly string[],
  n: number,
  weight: (id: string) => number,
  rng: Rng,
): string[] {
  const ids = [...pool];
  const weights = ids.map(weight);
  const picked: string[] = [];
  for (let k = 0; k < n; k++) {
    const idx = weightedPickIndex(weights, rng);
    picked.push(ids[idx]);
    ids.splice(idx, 1);
    weights.splice(idx, 1);
  }
  return picked;
}

function tryGenerate(seedKey: string, seed: number, rng: Rng): Puzzle | null {
  const suspects = shuffle(CHARACTERS, rng).slice(0, N).map((c) => c.id);
  // Bias the item/location pools so that at least some of the chosen suspects'
  // canonical pairings can land in the bijection — without making the pool
  // entirely thematic (decoys matter for the puzzle).
  const lovedByAny = new Set(suspects.flatMap((s) => characterById(s).lovedItems));
  const homesOfAny = new Set(suspects.map((s) => characterById(s).homeLocation));
  const items = weightedSample(
    ITEMS.map((i) => i.id),
    N,
    (id) => (lovedByAny.has(id) ? THEMATIC_WEIGHT : 1),
    rng,
  );
  const locations = weightedSample(
    LOCATIONS.map((l) => l.id),
    N,
    (id) => (homesOfAny.has(id) ? THEMATIC_WEIGHT : 1),
    rng,
  );

  // Pick the "culprit" first so the bijection can give them first pick of any
  // thematic options — making the solution feel canonical without forcing it.
  const culprit = suspects[Math.floor(rng() * suspects.length)];

  // Thematic-weighted bijections: suspect → item and suspect → location.
  // Loved gifts and home islands get a higher weight per THEMATIC_WEIGHT, so
  // solutions skew canonical without being deterministic.
  const suspectToItem = weightedBijection(
    suspects,
    items,
    (s, i) => characterById(s).lovedItems.includes(i),
    rng,
    culprit,
  );
  const suspectToLocation = weightedBijection(
    suspects,
    locations,
    (s, l) => characterById(s).homeLocation === l,
    rng,
    culprit,
  );

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
