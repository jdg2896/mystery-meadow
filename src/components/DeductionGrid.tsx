import { useAudio } from "../hooks/useAudio";
import type { Puzzle } from "../engine/types";
import { type GridKey, usePuzzleStore } from "../store/puzzleStore";
import { characterById } from "../data/characters";
import { itemById } from "../data/items";
import { locationById } from "../data/locations";
import { Icon, type IconKind } from "./Icon";

type AxisCategory = "suspect" | "item" | "location";

type Props = {
  puzzle: Puzzle;
  disabled?: boolean;
};

type AxisLabel = { name: string; emoji: string; kind: IconKind; id: string };

const labelFor = (cat: AxisCategory, id: string): AxisLabel => {
  if (cat === "suspect") {
    const c = characterById(id);
    return { name: c.name, emoji: c.emoji, kind: "characters", id: c.id };
  }
  if (cat === "item") {
    const i = itemById(id);
    return { name: i.shortName, emoji: i.emoji, kind: "items", id: i.id };
  }
  const l = locationById(id);
  return { name: l.shortName, emoji: l.emoji, kind: "locations", id: l.id };
};

const subgrids: { key: GridKey; rowCat: AxisCategory; colCat: AxisCategory; title: string }[] = [
  { key: "suspect-item", rowCat: "suspect", colCat: "item", title: "Friends × Items" },
  { key: "suspect-location", rowCat: "suspect", colCat: "location", title: "Friends × Places" },
  { key: "item-location", rowCat: "item", colCat: "location", title: "Items × Places" },
];

export function DeductionGrid({ puzzle, disabled }: Props) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white/60 px-3 py-2 text-center text-[11px] font-semibold text-kitty-600 ring-1 ring-kitty-100">
        Tap to cycle: <span className="font-mono">blank → ✕ → ✓</span>. A ✓ auto-fills the rest of
        the row + column with ✕.
      </div>
      <div className="grid gap-4">
        {subgrids.map((sg) => (
          <SubGrid
            key={sg.key}
            gridKey={sg.key}
            title={sg.title}
            rowIds={sg.rowCat === "suspect" ? puzzle.suspectIds : puzzle.itemIds}
            colIds={sg.colCat === "item" ? puzzle.itemIds : puzzle.locationIds}
            rowCat={sg.rowCat}
            colCat={sg.colCat}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

function SubGrid({
  gridKey,
  title,
  rowIds,
  colIds,
  rowCat,
  colCat,
  disabled,
}: {
  gridKey: GridKey;
  title: string;
  rowIds: string[];
  colIds: string[];
  rowCat: AxisCategory;
  colCat: AxisCategory;
  disabled?: boolean;
}) {
  const grid = usePuzzleStore((s) => s.grids[gridKey]);
  const cycleCell = usePuzzleStore((s) => s.cycleCell);
  const { play, noteInteraction } = useAudio();

  const handleTap = (row: string, col: string) => {
    if (disabled) return;
    noteInteraction();
    cycleCell(gridKey, row, col, rowIds, colIds);
    const next = nextMark(grid[row]?.[col] ?? "blank");
    play(next === "yes" ? "yes" : next === "no" ? "no" : "mark");
  };

  return (
    <div className="rounded-3xl bg-white/80 p-2.5 shadow-kawaiiSoft ring-1 ring-kitty-200/60 backdrop-blur sm:p-3">
      <h3 className="px-1 pb-1.5 font-cute text-sm font-semibold text-kitty-700 sm:text-base">
        {title}
      </h3>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `minmax(5.5rem, 8rem) repeat(${colIds.length}, minmax(2.25rem, 1fr))`,
        }}
      >
        <div />
        {colIds.map((c) => {
          const l = labelFor(colCat, c);
          return (
            <div
              key={c}
              className="flex flex-col items-center justify-end pb-1 text-center text-[10px] font-semibold text-kitty-700"
              title={l.name}
            >
              <Icon kind={l.kind} id={l.id} emoji={l.emoji} className="h-7 w-7 text-xl leading-none" />
              <span className="mt-1 line-clamp-2 leading-tight">{l.name}</span>
            </div>
          );
        })}

        {rowIds.map((r) => {
          const rl = labelFor(rowCat, r);
          return (
            <RowGroup
              key={r}
              rowLabel={rl}
              rowId={r}
              colIds={colIds}
              cells={grid[r] ?? {}}
              onTap={(col) => handleTap(r, col)}
            />
          );
        })}
      </div>
    </div>
  );
}

function RowGroup({
  rowLabel,
  rowId,
  colIds,
  cells,
  onTap,
}: {
  rowLabel: AxisLabel;
  rowId: string;
  colIds: string[];
  cells: Record<string, "blank" | "no" | "yes">;
  onTap: (col: string) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2 pl-1 text-sm font-semibold text-kitty-800">
        <Icon
          kind={rowLabel.kind}
          id={rowLabel.id}
          emoji={rowLabel.emoji}
          className="h-7 w-7 text-lg"
        />
        <span className="line-clamp-1">{rowLabel.name}</span>
      </div>
      {colIds.map((c) => {
        const mark = cells[c] ?? "blank";
        return (
          <button
            key={`${rowId}-${c}`}
            type="button"
            onClick={() => onTap(c)}
            aria-label={`${rowLabel.name} ↔ ${c}, currently ${mark}`}
            className={`grid-cell aspect-square min-h-[44px] rounded-xl border-2 text-xl font-semibold transition active:scale-95 ${cellClasses(mark)}`}
          >
            <span className={mark === "yes" ? "animate-sparkle" : ""}>
              {mark === "yes" ? "✓" : mark === "no" ? "✕" : ""}
            </span>
          </button>
        );
      })}
    </>
  );
}

const cellClasses = (m: "blank" | "no" | "yes") => {
  if (m === "yes") return "border-kitty-500 bg-kitty-100 text-kitty-700 shadow-kawaii";
  if (m === "no") return "border-kitty-200 bg-kitty-50 text-kitty-400";
  return "border-kitty-100 bg-white text-transparent hover:bg-kitty-50";
};

const nextMark = (m: "blank" | "no" | "yes") =>
  m === "blank" ? "no" : m === "no" ? "yes" : "blank";
