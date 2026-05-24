export type Location = {
  id: string;
  name: string;
  emoji: string;
  shortName: string;
  vibe: string;
};

export const LOCATIONS: Location[] = [
  {
    id: "seaside-resort",
    name: "the Seaside Resort",
    shortName: "Seaside Resort",
    emoji: "🏖️",
    vibe: "where the cafés smell like sea salt and sugar",
  },
  {
    id: "spooky-swamp",
    name: "the Spooky Swamp",
    shortName: "Spooky Swamp",
    emoji: "🎃",
    vibe: "where lanterns float between crooked trees",
  },
  {
    id: "rainbow-reef",
    name: "the Rainbow Reef",
    shortName: "Rainbow Reef",
    emoji: "🐚",
    vibe: "where seaponies race through pastel coral",
  },
  {
    id: "gemstone-mountain",
    name: "Gemstone Mountain",
    shortName: "Gemstone Mountain",
    emoji: "💎",
    vibe: "where every step jingles with crystals",
  },
  {
    id: "mount-hothead",
    name: "Mount Hothead",
    shortName: "Mount Hothead",
    emoji: "🌋",
    vibe: "where the hot springs make perfect pizza weather",
  },
  {
    id: "merry-meadow",
    name: "Merry Meadow",
    shortName: "Merry Meadow",
    emoji: "🌼",
    vibe: "where the greenhouses bloom on tiptoe",
  },
  {
    id: "icy-peak",
    name: "Icy Peak",
    shortName: "Icy Peak",
    emoji: "❄️",
    vibe: "where snow villages tuck under twinkly lights",
  },
  {
    id: "cloud-island",
    name: "Cloud Island",
    shortName: "Cloud Island",
    emoji: "☁️",
    vibe: "where stars are within hopping distance",
  },
  {
    id: "city-town",
    name: "City Town",
    shortName: "City Town",
    emoji: "🏙️",
    vibe: "where neon signs hum above a tangle of food stalls",
  },
];

export const locationById = (id: string): Location => {
  const l = LOCATIONS.find((x) => x.id === id);
  if (!l) throw new Error(`Unknown location ${id}`);
  return l;
};
