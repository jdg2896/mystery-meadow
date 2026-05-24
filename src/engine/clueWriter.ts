import { characterById } from "../data/characters";
import { itemById } from "../data/items";
import { locationById } from "../data/locations";
import type { Clue, ClueSegment } from "./types";

type Attr = { category: "suspect" | "item" | "location"; id: string };

const suspectSeg = (id: string): ClueSegment => {
  const c = characterById(id);
  return { type: "entity", kind: "characters", id: c.id, emoji: c.emoji, label: c.name };
};
const itemSeg = (id: string): ClueSegment => {
  const i = itemById(id);
  return { type: "entity", kind: "items", id: i.id, emoji: i.emoji, label: i.name };
};
const locationSeg = (id: string): ClueSegment => {
  const l = locationById(id);
  return { type: "entity", kind: "locations", id: l.id, emoji: l.emoji, label: l.name };
};

function describePairParts(a: Attr, b: Attr, positive: boolean): ClueSegment[] {
  // Normalize: prefer suspect-as-subject
  const [x, y]: [Attr, Attr] =
    a.category === "suspect" ? [a, b] : b.category === "suspect" ? [b, a] : [a, b];

  if (x.category === "suspect" && y.category === "item") {
    return [
      suspectSeg(x.id),
      { type: "text", value: positive ? " was carrying " : " wasn't carrying " },
      itemSeg(y.id),
      { type: "text", value: "." },
    ];
  }
  if (x.category === "suspect" && y.category === "location") {
    return [
      suspectSeg(x.id),
      { type: "text", value: positive ? " was spotted at " : " wasn't anywhere near " },
      locationSeg(y.id),
      { type: "text", value: "." },
    ];
  }
  // item ↔ location
  const itemFirst = x.category === "item";
  const itemId = itemFirst ? x.id : y.id;
  const locId = itemFirst ? y.id : x.id;
  return [
    itemSeg(itemId),
    { type: "text", value: positive ? " turned up at " : " didn't turn up at " },
    locationSeg(locId),
    { type: "text", value: "." },
  ];
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const capFirst = (parts: ClueSegment[]): ClueSegment[] => {
  if (parts.length === 0) return parts;
  const first = parts[0];
  const rest = parts.slice(1);
  return first.type === "entity"
    ? [{ ...first, label: cap(first.label) }, ...rest]
    : [{ ...first, value: cap(first.value) }, ...rest];
};

const stripTrailingDot = (parts: ClueSegment[]): ClueSegment[] => {
  if (parts.length === 0) return parts;
  const last = parts[parts.length - 1];
  if (last.type === "text" && last.value.endsWith(".")) {
    return [...parts.slice(0, -1), { type: "text", value: last.value.replace(/\.$/, "") }];
  }
  return parts;
};

export function writeClueParts(c: Clue): ClueSegment[] {
  switch (c.kind) {
    case "direct":
      return capFirst(describePairParts(c.a, c.b, true));
    case "negation":
      return capFirst(describePairParts(c.a, c.b, false));
    case "if-then-not": {
      const condParts = stripTrailingDot(describePairParts(c.ifPair.a, c.ifPair.b, true));
      const thenParts = stripTrailingDot(describePairParts(c.thenNot.a, c.thenNot.b, false));
      return [
        { type: "text", value: "If " },
        ...condParts,
        { type: "text", value: ", then " },
        ...thenParts,
        { type: "text", value: "." },
      ];
    }
  }
}

export const partsToText = (parts: ClueSegment[]): string =>
  parts.map((s) => (s.type === "text" ? s.value : s.label)).join("");
