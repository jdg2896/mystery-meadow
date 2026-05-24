import { useAudio } from "../hooks/useAudio";
import { characterById } from "../data/characters";
import { itemById } from "../data/items";
import { locationById } from "../data/locations";
import type { Puzzle } from "../engine/types";
import { usePuzzleStore } from "../store/puzzleStore";

export function AccusationPanel({
  puzzle,
  onResolve,
}: {
  puzzle: Puzzle;
  onResolve: (outcome: "win" | "lose") => void;
}) {
  const accusation = usePuzzleStore((s) => s.accusation);
  const setAccusation = usePuzzleStore((s) => s.setAccusation);
  const submit = usePuzzleStore((s) => s.submitAccusation);
  const outcome = usePuzzleStore((s) => s.outcome);
  const { play, noteInteraction } = useAudio();

  const ready =
    accusation.suspect !== null && accusation.item !== null && accusation.location !== null;

  const onSubmit = () => {
    if (!ready || outcome) return;
    noteInteraction();
    const result = submit(puzzle);
    play(result === "win" ? "win" : "lose");
    onResolve(result);
  };

  return (
    <div className="rounded-3xl bg-white/85 p-4 shadow-kawaiiSoft ring-1 ring-kitty-200/60">
      <h2 className="mb-3 font-cute text-lg font-semibold text-kitty-700">Make the call 🎀</h2>

      <div className="space-y-3">
        <Picker
          label="Who?"
          options={puzzle.suspectIds.map((id) => ({
            id,
            label: characterById(id).name,
            emoji: characterById(id).emoji,
          }))}
          selected={accusation.suspect}
          onPick={(id) => {
            noteInteraction();
            setAccusation("suspect", id);
            play("click");
          }}
        />
        <Picker
          label="Took…"
          options={puzzle.itemIds.map((id) => ({
            id,
            label: itemById(id).shortName,
            emoji: itemById(id).emoji,
          }))}
          selected={accusation.item}
          onPick={(id) => {
            noteInteraction();
            setAccusation("item", id);
            play("click");
          }}
        />
        <Picker
          label="From…"
          options={puzzle.locationIds.map((id) => ({
            id,
            label: locationById(id).shortName,
            emoji: locationById(id).emoji,
          }))}
          selected={accusation.location}
          onPick={(id) => {
            noteInteraction();
            setAccusation("location", id);
            play("click");
          }}
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!ready || outcome !== null}
        className={`mt-4 w-full rounded-2xl px-4 py-3 font-cute text-base font-bold transition active:scale-[0.98] ${
          ready && !outcome
            ? "bg-kitty-500 text-white shadow-kawaii hover:bg-kitty-600"
            : "cursor-not-allowed bg-kitty-100 text-kitty-300"
        }`}
      >
        {outcome ? "Solved!" : "Accuse 💖"}
      </button>
    </div>
  );
}

function Picker({
  label,
  options,
  selected,
  onPick,
}: {
  label: string;
  options: { id: string; label: string; emoji: string }[];
  selected: string | null;
  onPick: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-kitty-500">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o.id === selected;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onPick(o.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition active:scale-95 ${
                active
                  ? "bg-kitty-500 text-white shadow-kawaii"
                  : "bg-kitty-50 text-kitty-700 ring-1 ring-kitty-200 hover:bg-kitty-100"
              }`}
            >
              <span>{o.emoji}</span>
              <span>{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
