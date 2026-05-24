export type Category = "suspect" | "item" | "location";

export type Solution = {
  suspect: string;
  item: string;
  location: string;
};

export type Assignment = {
  suspectToItem: Record<string, string>;
  suspectToLocation: Record<string, string>;
};

/**
 * A clue is a logical constraint over the solution.
 * Each clue type is small and self-contained so the solver can evaluate it
 * against any candidate assignment.
 */
export type Clue =
  | { kind: "direct"; a: { category: Category; id: string }; b: { category: Category; id: string } }
  | { kind: "negation"; a: { category: Category; id: string }; b: { category: Category; id: string } }
  | {
      kind: "if-then-not";
      ifPair: { a: { category: Category; id: string }; b: { category: Category; id: string } };
      thenNot: { a: { category: Category; id: string }; b: { category: Category; id: string } };
    };

export type Puzzle = {
  id: string;
  seed: number;
  mystery: {
    headline: string;
    item: string;
    location: string;
  };
  suspectIds: string[];
  itemIds: string[];
  locationIds: string[];
  clues: { id: string; text: string; clue: Clue }[];
  solution: Solution;
};
