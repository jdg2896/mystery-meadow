import { useUiStore, type MobileTab } from "../store/uiStore";
import { usePuzzleStore } from "../store/puzzleStore";

const TABS: { id: MobileTab; emoji: string; label: string }[] = [
  { id: "grid", emoji: "🧩", label: "Grid" },
  { id: "clues", emoji: "🔍", label: "Clues" },
  { id: "accuse", emoji: "🎀", label: "Accuse" },
];

export function MobileTabs({ clueCount }: { clueCount: number }) {
  const tab = useUiStore((s) => s.mobileTab);
  const setTab = useUiStore((s) => s.setMobileTab);
  const accusation = usePuzzleStore((s) => s.accusation);
  const ready =
    accusation.suspect !== null && accusation.item !== null && accusation.location !== null;

  return (
    <nav className="-mx-3 mb-3 border-b border-kitty-200/60 bg-cream/85 px-3 py-1.5 backdrop-blur lg:hidden">
      <div className="flex gap-1.5">
        {TABS.map((t) => {
          const active = t.id === tab;
          const badge =
            t.id === "clues"
              ? clueCount
              : t.id === "accuse" && ready
                ? "●"
                : null;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition active:scale-95 ${
                active
                  ? "bg-kitty-500 text-white shadow-kawaii"
                  : "bg-white/70 text-kitty-700 ring-1 ring-kitty-200 hover:bg-kitty-100"
              }`}
              aria-pressed={active}
            >
              <span className="text-base leading-none">{t.emoji}</span>
              <span>{t.label}</span>
              {badge !== null && (
                <span
                  className={`ml-0.5 rounded-full px-1.5 text-[10px] font-bold leading-tight ${
                    active ? "bg-white/30 text-white" : "bg-kitty-100 text-kitty-700"
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
