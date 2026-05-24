// Pulls character + location artwork from the Hello Kitty Island Adventure
// fan wiki on wiki.gg and saves under public/img/. Run with `npm run fetch:assets`.
//
// Source: https://hellokittyislandadventure.wiki.gg/ — images there are user-uploaded
// Sanrio IP. This is a fan project; treat assets accordingly.
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://hellokittyislandadventure.wiki.gg/api.php";
// MediaWiki etiquette: identify the bot so admins can reach out if it misbehaves.
const UA = "mystery-meadow-asset-fetcher/0.1 (+https://github.com/jdg2896/mystery-meadow)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, attempt = 0) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (r.ok) return r;
  if ((r.status === 429 || r.status >= 500) && attempt < 4) {
    await sleep(1500 * (attempt + 1));
    return fetchWithRetry(url, attempt + 1);
  }
  return r;
}

// id (must match data/*.ts id field) -> wiki File: title (no "File:" prefix, no extension)
// Square 128x128 face icons — more legible at small render sizes than the
// Full_Character_* portraits, and avoid aspect-ratio mismatch (Cinnamoroll's
// full portrait is wide-format while the others are tall).
const CHARACTERS = {
  "hello-kitty": "Icon_square_Hello_Kitty",
  "my-melody": "Icon_square_My_Melody",
  cinnamoroll: "Icon_square_Cinnamoroll",
  kuromi: "Icon_square_Kuromi",
  pompompurin: "Icon_square_Pompompurin",
  keroppi: "Icon_square_Keroppi",
  chococat: "Icon_square_Chococat",
  "badtz-maru": "Icon_square_Badtzmaru",
  pochacco: "Icon_square_Pochacco",
  "my-sweet-piano": "Icon_square_My_Sweet_Piano",
  tuxedosam: "Icon_square_Tuxedosam",
  hangyodon: "Icon_square_Hangyodon",
  pekkle: "Icon_square_Pekkle",
  retsuko: "Icon_square_Retsuko",
  "wish-me-mell": "Icon_square_WishMeMell",
  "big-challenges": "Icon_square_Big_Challenges",
  tophat: "Icon_square_Tophat",
  lala: "Icon_square_Lala",
  kiki: "Icon_square_Kiki",
  usahana: "Icon_square_Usahana",
  cogimyun: "Icon_square_Cogimyun",
  moppu: "Icon_square_Moppu",
};

const ITEMS = {
  "pink-clouds-ice-cream": "Pink_Clouds_Ice_Cream",
  "strawberry-shortcake": "Strawberry_Shortcake",
  "pineapple-pizza": "Pineapple_Pizza",
  "jack-o-lantern": "Jack-O-Lantern",
  "swampy-lamb-plush": "Swampy_Lamb_Plush",
  "pochacco-energy-pop": "Pochacco_Energy_Pop",
  "red-bow-apple-pie": "Red_Bow_Apple_Pie",
  "spooky-cake": "Spooky_Cake",
  "pastel-fluff-heart-cake": "Pastel_Fluff_Heart_Cake",
  "designer-island-doll": "Designer_Island_Doll",
  "pumpkin-spice-soda": "Pumpkin_Spice_Soda",
  "critter-totem": "Critter_Totem",
  "hello-kittys-birthday-cake": "Hello_Kitty's_Birthday_Cake",
  "volcano-cake": "Volcano_Cake",
  "hot-cocoa": "Hot_Cocoa",
  "fruit-tart": "Fruit_Tart",
  "pink-latte": "Pink_Latte",
  "sweet-dreams-stories": "Sweet_Dreams_Stories",
  "mamas-apple-pie": "Mama's_Apple_Pie",
  "pineapple-stack-cake": "Pineapple_Stack_Cake",
  "strawberry-almond-galette": "Strawberry_Almond_Galette",
  "boulder-bits-ice-cream": "Boulder_Bits_Ice_Cream",
  "almond-pound-cake": "Almond_Pound_Cake",
  "pink-cloud": "Pink_Cloud",
  boba: "Boba",
  onigiri: "Onigiri",
  taiyaki: "Taiyaki",
  "snow-ice": "Snow_Ice",
  "sushi-roll": "Sushi_Roll",
  dango: "Dango",
};

const LOCATIONS = {
  "seaside-resort": "Seaside_Resort_Icon",
  "spooky-swamp": "Spooky_Swamp_Icon",
  "rainbow-reef": "Rainbow_Reef_Icon",
  "gemstone-mountain": "Gemstone_Mountain_Icon",
  "mount-hothead": "Mount_Hothead_Icon",
  "merry-meadow": "Merry_Meadow_Icon",
  "icy-peak": "Icy_Peak",
  "cloud-island": "Cloud_Island_Icon",
  "city-town": "City_Town_Icon",
};

async function resolveUrl(title) {
  // Try .png first, then .webp — the wiki mixes both.
  for (const ext of ["png", "webp"]) {
    const params = new URLSearchParams({
      action: "query",
      titles: `File:${title}.${ext}`,
      prop: "imageinfo",
      iiprop: "url",
      format: "json",
      formatversion: "2",
    });
    const r = await fetchWithRetry(`${API}?${params}`);
    if (!r.ok) continue;
    const j = await r.json();
    const page = j?.query?.pages?.[0];
    const url = page?.imageinfo?.[0]?.url;
    if (url) return url;
  }
  return null;
}

async function download(url, dest) {
  const r = await fetchWithRetry(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
}

async function fetchKind(kind, map) {
  const outDir = join(ROOT, "public", "img", kind);
  let ok = 0;
  let miss = 0;
  for (const [id, title] of Object.entries(map)) {
    process.stdout.write(`  ${id.padEnd(20)} `);
    try {
      const url = await resolveUrl(title);
      if (!url) {
        console.log("MISSING");
        miss++;
        continue;
      }
      const ext = extname(new URL(url).pathname).slice(1) || "png";
      const dest = join(outDir, `${id}.${ext}`);
      await download(url, dest);
      console.log(`${ext} <- ${title}`);
      ok++;
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      miss++;
    }
    // Polite pause so we don't trip wiki.gg's per-IP rate limit.
    await sleep(1200);
  }
  return { ok, miss };
}

console.log("characters:");
const c = await fetchKind("characters", CHARACTERS);
console.log("items:");
const i = await fetchKind("items", ITEMS);
console.log("locations:");
const l = await fetchKind("locations", LOCATIONS);
console.log(
  `\ndone — characters ${c.ok}/${c.ok + c.miss}, items ${i.ok}/${i.ok + i.miss}, locations ${l.ok}/${l.ok + l.miss}`,
);
