import { useEffect } from "react";
import { CHARACTERS } from "../data/characters";
import { ITEMS } from "../data/items";
import { LOCATIONS } from "../data/locations";

// Most assets are PNG; a handful (e.g. merry-meadow.webp) only ship as webp,
// so we mirror Icon's two-extension fallback when warming the cache.
const EXTS = ["png", "webp"] as const;

// Warms the browser cache with every character/item/location icon after first
// paint so a free-play reroll (or any puzzle swap) doesn't flash unloaded
// icons. Total payload is ~1.5 MB across ~75 files, fetched on idle.
export function usePreloadAssets() {
  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    const assets: { kind: string; id: string }[] = [
      ...CHARACTERS.map((c) => ({ kind: "characters", id: c.id })),
      ...ITEMS.map((i) => ({ kind: "items", id: i.id })),
      ...LOCATIONS.map((l) => ({ kind: "locations", id: l.id })),
    ];

    const preloadOne = (kind: string, id: string, extIdx = 0) => {
      if (extIdx >= EXTS.length) return;
      const img = new Image();
      img.onerror = () => preloadOne(kind, id, extIdx + 1);
      img.src = `${base}img/${kind}/${id}.${EXTS[extIdx]}`;
    };

    const run = () => {
      for (const { kind, id } of assets) preloadOne(kind, id);
    };

    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback?.(handle);
    }
    const timer = window.setTimeout(run, 300);
    return () => window.clearTimeout(timer);
  }, []);
}
