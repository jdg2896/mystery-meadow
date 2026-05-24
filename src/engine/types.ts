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

// One unit of a rendered clue. Text segments are literal punctuation/glue;
// entity segments carry enough data for the UI to render an inline Icon
// + label without re-looking-up the entity.
export type ClueSegment =
  | { type: "text"; value: string }
  | {
      type: "entity";
      kind: "characters" | "items" | "locations";
      id: string;
      emoji: string;
      label: string;
    };

export type Puzzle = {
  id: string;
  seed: number;
  mystery: {
    // Plain-text form (used for share text, logging, accessibility); the
    // app renders `parts` to get inline item/location icons in the headline.
    headline: string;
    parts: ClueSegment[];
    item: string;
    location: string;
  };
  suspectIds: string[];
  itemIds: string[];
  locationIds: string[];
  clues: { id: string; text: string; parts: ClueSegment[]; clue: Clue }[];
  solution: Solution;
};
