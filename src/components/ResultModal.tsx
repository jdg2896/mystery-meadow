import { useEffect, useState } from "react";
import { characterById } from "../data/characters";
import { itemById } from "../data/items";
import { locationById } from "../data/locations";
import type { Puzzle } from "../engine/types";
import { Icon } from "./Icon";

type Props = {
  puzzle: Puzzle;
  outcome: "win" | "lose";
  durationMs: number | null;
  onPlayAgain: () => void;
  onClose: () => void;
};

export function ResultModal({ puzzle, outcome, durationMs, onPlayAgain, onClose }: Props) {
  const culprit = characterById(puzzle.solution.suspect);
  const item = itemById(puzzle.solution.item);
  const location = locationById(puzzle.solution.location);

  const shareText = makeShareText(puzzle, outcome, durationMs);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const won = outcome === "win";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-kitty-900/30 backdrop-blur-sm sm:items-center">
      <div className="relative w-full max-w-md overflow-hidden rounded-t-3xl bg-cream shadow-2xl ring-1 ring-kitty-200 sm:rounded-3xl">
        {won && <Confetti />}

        <div className="relative px-6 pb-5 pt-6 text-center">
          <div
            className={`mx-auto text-[10px] font-bold uppercase tracking-[0.2em] ${
              won ? "text-kitty-500" : "text-kitty-400"
            }`}
          >
            {won ? "Case closed" : "Case unsolved"}
          </div>

          <div className="mt-3 flex justify-center">
            <div
              className={`relative grid h-24 w-24 place-items-center rounded-full ring-4 ${
                won
                  ? "bg-kitty-100 ring-kitty-300"
                  : "bg-kitty-50 ring-kitty-200"
              }`}
              style={{ boxShadow: `0 6px 20px ${won ? "rgba(255,122,184,0.25)" : "rgba(0,0,0,0.08)"}` }}
            >
              <Icon
                kind="characters"
                id={culprit.id}
                emoji={culprit.emoji}
                className="h-20 w-20"
                alt={culprit.name}
              />
            </div>
          </div>

          <h2 className="mt-4 font-cute text-2xl font-bold text-kitty-700">
            {won ? `${culprit.name}!` : `It was ${culprit.name}.`}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-kitty-800">
            {won ? "You caught them with " : "They slipped off with "}
            <span className="inline-flex items-center gap-1 font-semibold align-middle">
              <Icon kind="items" id={item.id} emoji={item.emoji} className="h-5 w-5" />
              {item.shortName}
            </span>{" "}
            at{" "}
            <span className="inline-flex items-center gap-1 font-semibold align-middle">
              <Icon
                kind="locations"
                id={location.id}
                emoji={location.emoji}
                className="h-5 w-5"
              />
              {location.shortName}
            </span>
            .
          </p>
          <p className="mt-2 text-xs italic text-kitty-500">{culprit.flavor}.</p>
        </div>

        <div className="px-6 pb-6">
          {durationMs !== null && (
            <div className="rounded-2xl bg-kitty-50 px-3 py-2 text-center text-sm text-kitty-700 ring-1 ring-kitty-100">
              Solved in <span className="font-bold">{formatDuration(durationMs)}</span>
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-2xl bg-kitty-100 px-4 py-3 font-cute text-sm font-bold text-kitty-700 ring-1 ring-kitty-200 transition active:scale-[0.98] hover:bg-kitty-200"
            >
              {copied ? "Copied!" : "Share"}
            </button>
            <button
              type="button"
              onClick={onPlayAgain}
              className="rounded-2xl bg-kitty-500 px-4 py-3 font-cute text-sm font-bold text-white shadow-kawaii transition active:scale-[0.98] hover:bg-kitty-600"
            >
              Play again
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/80 text-xs font-semibold text-kitty-500 ring-1 ring-kitty-200 hover:bg-white"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function makeShareText(p: Puzzle, outcome: "win" | "lose", durationMs: number | null) {
  const date = p.id.replace(/^daily-/, "");
  const emojiLine = outcome === "win" ? "💖✨🎀" : "🥲🌧️";
  const time = durationMs ? ` in ${formatDuration(durationMs)}` : "";
  return `Mystery Meadow ${date}: ${outcome === "win" ? "solved" : "stumped"}${time} ${emojiLine}`;
}

function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Soft sparkle drift that frames the reveal without crowding it.
function Confetti() {
  const pieces = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => {
        const left = (i * 41) % 100;
        const delay = (i % 5) * 90;
        const sparkle = ["✦", "✧", "·"][i % 3];
        return (
          <span
            key={i}
            className="absolute text-base text-kitty-400/80"
            style={{
              left: `${left}%`,
              top: "-8%",
              animation: `confetti-fall 1.6s ${delay}ms ease-in forwards`,
            }}
          >
            {sparkle}
          </span>
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(120%) rotate(180deg); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
