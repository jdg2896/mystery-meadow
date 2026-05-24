export type Item = {
  id: string;
  name: string;
  emoji: string;
  shortName: string;
};

export const ITEMS: Item[] = [
  { id: "pink-ribbon", name: "the pink ribbon", shortName: "pink ribbon", emoji: "🎀" },
  { id: "strawberry-cupcake", name: "the strawberry cupcake", shortName: "cupcake", emoji: "🧁" },
  { id: "friendship-bracelet", name: "the friendship bracelet", shortName: "bracelet", emoji: "💖" },
  { id: "parasol", name: "the lacy parasol", shortName: "parasol", emoji: "☂️" },
  { id: "seashell", name: "the glittery seashell", shortName: "seashell", emoji: "🐚" },
  { id: "star-coin", name: "the lucky star coin", shortName: "star coin", emoji: "⭐" },
  { id: "music-note", name: "the music-note charm", shortName: "music charm", emoji: "🎵" },
  { id: "picnic-basket", name: "the picnic basket", shortName: "picnic basket", emoji: "🧺" },
  { id: "sparkle-wand", name: "the sparkle wand", shortName: "sparkle wand", emoji: "✨" },
  { id: "sun-hat", name: "the floppy sun hat", shortName: "sun hat", emoji: "👒" },
  { id: "macaron", name: "the rainbow macaron", shortName: "macaron", emoji: "🍪" },
  { id: "teacup", name: "the tiny teacup", shortName: "teacup", emoji: "🍵" },
];

export const itemById = (id: string): Item => {
  const i = ITEMS.find((x) => x.id === id);
  if (!i) throw new Error(`Unknown item ${id}`);
  return i;
};
