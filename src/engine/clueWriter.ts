import { characterById } from "../data/characters";
import { itemById } from "../data/items";
import { locationById } from "../data/locations";
import type { Clue } from "./types";

const labels = {
  suspect: (id: string) => characterById(id).name,
  item: (id: string) => itemById(id).name,
  location: (id: string) => locationById(id).name,
} as const;

type Attr = { category: "suspect" | "item" | "location"; id: string };

function describePair(a: Attr, b: Attr, positive: boolean): string {
  // Normalize: prefer suspect-as-subject
  const [x, y]: [Attr, Attr] =
    a.category === "suspect" ? [a, b] : b.category === "suspect" ? [b, a] : [a, b];

  if (x.category === "suspect" && y.category === "item") {
    const s = labels.suspect(x.id);
    const i = labels.item(y.id);
    return positive ? `${s} was carrying ${i}.` : `${s} wasn't carrying ${i}.`;
  }
  if (x.category === "suspect" && y.category === "location") {
    const s = labels.suspect(x.id);
    const l = labels.location(y.id);
    return positive ? `${s} was spotted at ${l}.` : `${s} wasn't anywhere near ${l}.`;
  }
  // item ↔ location
  const itemFirst = x.category === "item";
  const itemId = itemFirst ? x.id : y.id;
  const locId = itemFirst ? y.id : x.id;
  const i = labels.item(itemId);
  const l = labels.location(locId);
  return positive ? `${i} turned up at ${l}.` : `${i} didn't turn up at ${l}.`;
}

const CUTE_PREFIXES = ["👀", "🎀", "🍓", "✨", "🍰", "🐾", "💖", "🌸"];

let prefixIdx = 0;
const nextPrefix = () => {
  const p = CUTE_PREFIXES[prefixIdx % CUTE_PREFIXES.length];
  prefixIdx++;
  return `${p} `;
};

const stripTrailingDot = (s: string) => s.replace(/\.$/, "");
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function writeClue(c: Clue): string {
  switch (c.kind) {
    case "direct":
      return `${nextPrefix()}${cap(describePair(c.a, c.b, true))}`;
    case "negation":
      return `${nextPrefix()}${cap(describePair(c.a, c.b, false))}`;
    case "if-then-not": {
      const cond = stripTrailingDot(describePair(c.ifPair.a, c.ifPair.b, true));
      const then = stripTrailingDot(describePair(c.thenNot.a, c.thenNot.b, false));
      return `${nextPrefix()}If ${cond}, then ${then}.`;
    }
  }
}

export function resetClueStyling() {
  prefixIdx = 0;
}
