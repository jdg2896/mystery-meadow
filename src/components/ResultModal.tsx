import { useEffect, useState } from "react";
import { characterById } from "../data/characters";
import { itemById } from "../data/items";
import { locationById } from "../data/locations";
import type { Puzzle } from "../engine/types";

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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-kitty-900/30 backdrop-blur-sm sm:items-center">
      <div className="relative w-full max-w-md rounded-t-3xl bg-cream p-6 shadow-2xl ring-1 ring-kitty-200 sm:rounded-3xl">
        {outcome === "win" && <Confetti />}
        <div className="text-center">
          <div className="mb-2 text-5xl">{outcome === "win" ? "🎉" : "🥲"}</div>
          <h2 className="font-cute text-2xl font-bold text-kitty-700">
            {outcome === "win" ? "Mystery solved!" : "So close!"}
          </h2>
          <p className="mt-1 text-sm text-kitty-800">
            <span className="font-semibold">
              {culprit.emoji} {culprit.name}
            </span>{" "}
            took <span className="font-semibold">{item.shortName}</span> from{" "}
            <span className="font-semibold">{location.shortName}</span>.
          </p>
          <p className="mt-1 text-xs italic text-kitty-600">
            ({culprit.flavor} — totally suspicious behavior.)
          </p>
        </div>

        {durationMs !== null && (
          <div className="mt-4 rounded-2xl bg-kitty-50 px-3 py-2 text-center text-sm text-kitty-700 ring-1 ring-kitty-100">
            ⏱️ Solved in <span className="font-bold">{formatDuration(durationMs)}</span>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="rounded-2xl bg-kitty-100 px-4 py-3 font-cute text-sm font-bold text-kitty-700 ring-1 ring-kitty-200 transition active:scale-[0.98] hover:bg-kitty-200"
          >
            {copied ? "Copied! 💌" : "Share 📋"}
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            className="rounded-2xl bg-kitty-500 px-4 py-3 font-cute text-sm font-bold text-white shadow-kawaii transition active:scale-[0.98] hover:bg-kitty-600"
          >
            Play again 🎀
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-white/70 px-2 py-1 text-xs font-semibold text-kitty-500 ring-1 ring-kitty-200 hover:bg-white"
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

function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      {pieces.map((i) => {
        const left = (i * 37) % 100;
        const delay = (i % 6) * 80;
        const emoji = ["🎀", "🍓", "✨", "💖", "🌸", "⭐"][i % 6];
        return (
          <span
            key={i}
            className="absolute text-lg"
            style={{
              left: `${left}%`,
              top: "-12%",
              animation: `confetti-fall 1.4s ${delay}ms ease-in forwards`,
            }}
          >
            {emoji}
          </span>
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(140%) rotate(540deg); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
