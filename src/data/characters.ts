export type Character = {
  id: string;
  name: string;
  emoji: string;
  accent: string;
  flavor: string;
  pronoun: "she" | "he" | "they";
};

export const CHARACTERS: Character[] = [
  {
    id: "hello-kitty",
    name: "Hello Kitty",
    emoji: "🎀",
    accent: "#ff7ab8",
    flavor: "always sharing bakery snacks",
    pronoun: "she",
  },
  {
    id: "my-melody",
    name: "My Melody",
    emoji: "🍓",
    accent: "#ff9ec7",
    flavor: "humming softly in pink hoods",
    pronoun: "she",
  },
  {
    id: "cinnamoroll",
    name: "Cinnamoroll",
    emoji: "☁️",
    accent: "#bfe7ff",
    flavor: "drifting on cloud-shaped daydreams",
    pronoun: "he",
  },
  {
    id: "kuromi",
    name: "Kuromi",
    emoji: "💀",
    accent: "#c79bff",
    flavor: "scheming a tiny mischief",
    pronoun: "she",
  },
  {
    id: "pompompurin",
    name: "Pompompurin",
    emoji: "🍮",
    accent: "#ffd86b",
    flavor: "snoozing in a pudding hat",
    pronoun: "he",
  },
  {
    id: "keroppi",
    name: "Keroppi",
    emoji: "🐸",
    accent: "#9ee49a",
    flavor: "hopping near every pond",
    pronoun: "he",
  },
  {
    id: "chococat",
    name: "Chococat",
    emoji: "🐱",
    accent: "#8d5a3c",
    flavor: "sniffing out gizmos and gadgets",
    pronoun: "he",
  },
  {
    id: "badtz-maru",
    name: "Badtz-maru",
    emoji: "🐧",
    accent: "#3a3a4a",
    flavor: "telling a deadpan joke",
    pronoun: "he",
  },
  {
    id: "pochacco",
    name: "Pochacco",
    emoji: "🐶",
    accent: "#ffffff",
    flavor: "sprinting laps before lunch",
    pronoun: "he",
  },
  {
    id: "my-sweet-piano",
    name: "My Sweet Piano",
    emoji: "🎹",
    accent: "#ffd0e6",
    flavor: "twirling a glittery ribbon",
    pronoun: "she",
  },
  {
    id: "tuxedosam",
    name: "Tuxedosam",
    emoji: "🤵",
    accent: "#5a7bd1",
    flavor: "straightening a tiny bowtie",
    pronoun: "he",
  },
  {
    id: "hangyodon",
    name: "Hangyodon",
    emoji: "🐠",
    accent: "#7fd1c0",
    flavor: "telling a wistful little tale",
    pronoun: "he",
  },
];

export const characterById = (id: string): Character => {
  const c = CHARACTERS.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown character ${id}`);
  return c;
};
