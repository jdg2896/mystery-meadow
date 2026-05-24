import type { ClueSegment, Puzzle } from "../engine/types";
import { Icon } from "./Icon";

export function ClueList({ puzzle }: { puzzle: Puzzle }) {
  return (
    <div className="rounded-3xl bg-white/85 p-4 shadow-kawaiiSoft ring-1 ring-kitty-200/60">
      <h2 className="mb-2 font-cute text-lg font-semibold text-kitty-700">Clues 🔍</h2>
      <ul className="space-y-2">
        {puzzle.clues.map((c) => (
          <li
            key={c.id}
            className="rounded-2xl bg-kitty-50/70 px-3 py-2 text-sm leading-snug text-kitty-900 ring-1 ring-kitty-100"
          >
            {c.parts.map((p, i) => (
              <Segment key={i} part={p} />
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Segment({ part }: { part: ClueSegment }) {
  if (part.type === "text") return <span>{part.value}</span>;
  return (
    <span className="inline-flex items-center gap-1 align-middle font-semibold">
      <Icon kind={part.kind} id={part.id} emoji={part.emoji} className="h-5 w-5" />
      {part.label}
    </span>
  );
}
