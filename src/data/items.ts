export type Item = {
  id: string;
  name: string;
  emoji: string;
  shortName: string;
};

// Items are real gifts from Hello Kitty Island Adventure, picked so the wiki
// has matching artwork in public/img/items/<id>.png (see scripts/fetch-assets.mjs).
// `name` reads naturally inside clue templates like "X was carrying ___".
export const ITEMS: Item[] = [
  { id: "pink-clouds-ice-cream", name: "the Pink Clouds Ice Cream", shortName: "Pink Clouds Ice Cream", emoji: "🍦" },
  { id: "strawberry-shortcake", name: "the Strawberry Shortcake", shortName: "Strawberry Shortcake", emoji: "🍰" },
  { id: "pineapple-pizza", name: "the Pineapple Pizza", shortName: "Pineapple Pizza", emoji: "🍕" },
  { id: "jack-o-lantern", name: "the Jack-O-Lantern", shortName: "Jack-O-Lantern", emoji: "🎃" },
  { id: "swampy-lamb-plush", name: "the Swampy Lamb Plush", shortName: "Swampy Lamb Plush", emoji: "🐑" },
  { id: "pochacco-energy-pop", name: "the Pochacco Energy Pop", shortName: "Energy Pop", emoji: "🍭" },
  { id: "red-bow-apple-pie", name: "the Red Bow Apple Pie", shortName: "Red Bow Apple Pie", emoji: "🥧" },
  { id: "spooky-cake", name: "the Spooky Cake", shortName: "Spooky Cake", emoji: "🍰" },
  { id: "pastel-fluff-heart-cake", name: "the Pastel Fluff Heart Cake", shortName: "Heart Cake", emoji: "💗" },
  { id: "designer-island-doll", name: "the Designer Island Doll", shortName: "Island Doll", emoji: "🪆" },
  { id: "pumpkin-spice-soda", name: "the Pumpkin Spice Soda", shortName: "Pumpkin Spice Soda", emoji: "🥤" },
  { id: "critter-totem", name: "the Critter Totem", shortName: "Critter Totem", emoji: "🗿" },
];

export const itemById = (id: string): Item => {
  const i = ITEMS.find((x) => x.id === id);
  if (!i) throw new Error(`Unknown item ${id}`);
  return i;
};
