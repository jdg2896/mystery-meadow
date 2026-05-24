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
  { id: "hello-kittys-birthday-cake", name: "the Birthday Cake", shortName: "Birthday Cake", emoji: "🎂" },
  { id: "volcano-cake", name: "the Volcano Cake", shortName: "Volcano Cake", emoji: "🌋" },
  { id: "hot-cocoa", name: "the Hot Cocoa", shortName: "Hot Cocoa", emoji: "☕" },
  { id: "fruit-tart", name: "the Fruit Tart", shortName: "Fruit Tart", emoji: "🥧" },
  { id: "pink-latte", name: "the Pink Latte", shortName: "Pink Latte", emoji: "🥤" },
  { id: "sweet-dreams-stories", name: "the Sweet Dreams Stories", shortName: "Sweet Dreams Stories", emoji: "📖" },
  { id: "mamas-apple-pie", name: "Mama's Apple Pie", shortName: "Mama's Apple Pie", emoji: "🥧" },
  { id: "pineapple-stack-cake", name: "the Pineapple Stack Cake", shortName: "Pineapple Stack Cake", emoji: "🍍" },
  { id: "strawberry-almond-galette", name: "the Strawberry Almond Galette", shortName: "Almond Galette", emoji: "🍓" },
  { id: "boulder-bits-ice-cream", name: "the Boulder Bits Ice Cream", shortName: "Boulder Bits", emoji: "🍨" },
  { id: "almond-pound-cake", name: "the Almond Pound Cake", shortName: "Pound Cake", emoji: "🍰" },
  { id: "pink-cloud", name: "the Pink Cloud", shortName: "Pink Cloud", emoji: "☁️" },
  { id: "boba", name: "the Boba", shortName: "Boba", emoji: "🧋" },
  { id: "onigiri", name: "the Onigiri", shortName: "Onigiri", emoji: "🍙" },
  { id: "taiyaki", name: "the Taiyaki", shortName: "Taiyaki", emoji: "🐟" },
  { id: "snow-ice", name: "the Snow Ice", shortName: "Snow Ice", emoji: "🍧" },
  { id: "sushi-roll", name: "the Sushi Roll", shortName: "Sushi Roll", emoji: "🍣" },
  { id: "dango", name: "the Dango", shortName: "Dango", emoji: "🍡" },
];

export const itemById = (id: string): Item => {
  const i = ITEMS.find((x) => x.id === id);
  if (!i) throw new Error(`Unknown item ${id}`);
  return i;
};
