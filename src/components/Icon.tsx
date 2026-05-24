import { useState } from "react";

export type IconKind = "characters" | "items" | "locations";

type Props = {
  kind: IconKind;
  id: string;
  emoji: string;
  alt?: string;
  className?: string;
};

// The fetcher saves files with whatever extension the wiki served (mostly png,
// occasionally webp), so try both before giving up to the emoji fallback.
const EXTS = ["png", "webp"] as const;

export function Icon({ kind, id, emoji, alt = "", className = "" }: Props) {
  const [extIdx, setExtIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={className} aria-hidden={alt === "" ? true : undefined}>
        {emoji}
      </span>
    );
  }

  const src = `${import.meta.env.BASE_URL}img/${kind}/${id}.${EXTS[extIdx]}`;
  return (
    <img
      src={src}
      alt={alt}
      onError={() => {
        if (extIdx < EXTS.length - 1) setExtIdx(extIdx + 1);
        else setFailed(true);
      }}
      className={`inline-block object-contain ${className}`}
      draggable={false}
    />
  );
}
