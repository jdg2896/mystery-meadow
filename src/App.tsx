import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AccusationPanel } from "./components/AccusationPanel";
import { ClueList } from "./components/ClueList";
import { DeductionGrid } from "./components/DeductionGrid";
import { HeaderBar } from "./components/HeaderBar";
import { HowToPlayModal } from "./components/HowToPlayModal";
import { Icon } from "./components/Icon";
import { MobileTabs } from "./components/MobileTabs";
import { ResultModal } from "./components/ResultModal";
import type { ClueSegment } from "./engine/types";
import { usePuzzle, useRandomFreeSeed } from "./hooks/usePuzzle";
import { usePuzzleStore } from "./store/puzzleStore";
import { type MobileTab, useUiStore } from "./store/uiStore";

const MOBILE_MAX_WIDTH = 1024; // matches Tailwind `lg` breakpoint

export default function App() {
  const [mode, setMode] = useState<"daily" | "free">("daily");
  const [freeSeed, reroll] = useRandomFreeSeed();
  const puzzle = usePuzzle(mode, freeSeed);

  const outcome = usePuzzleStore((s) => s.outcome);
  const startedAt = usePuzzleStore((s) => s.startedAt);
  const finishedAt = usePuzzleStore((s) => s.finishedAt);
  const reset = usePuzzleStore((s) => s.reset);

  const mobileTab = useUiStore((s) => s.mobileTab);
  const setMobileTab = useUiStore((s) => s.setMobileTab);
  const hasSeenHowTo = useUiStore((s) => s.hasSeenHowTo);
  const markHowToSeen = useUiStore((s) => s.markHowToSeen);

  const [showResult, setShowResult] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (outcome) setShowResult(true);
  }, [outcome]);

  useEffect(() => {
    if (!hasSeenHowTo) setShowHelp(true);
  }, [hasSeenHowTo]);

  // Remember each mobile tab's scroll position so jumping Grid → Clues → Grid
  // lands the player back where they were instead of at the top.
  const tabRef = useRef<MobileTab>(mobileTab);
  tabRef.current = mobileTab;
  const tabScrollsRef = useRef<Record<MobileTab, number>>({ grid: 0, clues: 0, accuse: 0 });

  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth >= MOBILE_MAX_WIDTH) return;
      tabScrollsRef.current[tabRef.current] = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    if (window.innerWidth >= MOBILE_MAX_WIDTH) return;
    window.scrollTo({ top: tabScrollsRef.current[mobileTab] ?? 0, behavior: "auto" });
  }, [mobileTab]);

  // Wipe the memory whenever a new puzzle replaces the old one — scroll
  // positions from yesterday's grid are meaningless against today's layout.
  useEffect(() => {
    tabScrollsRef.current = { grid: 0, clues: 0, accuse: 0 };
  }, [puzzle.id]);

  // Jump to Accuse tab on mobile once player has set all three picks
  const accusation = usePuzzleStore((s) => s.accusation);

  const duration = startedAt && finishedAt ? finishedAt - startedAt : null;

  const handlePlayAgain = () => {
    if (mode === "daily") {
      setMode("free");
      reroll();
    } else {
      reroll();
    }
    reset();
    setShowResult(false);
    setMobileTab("grid");
  };

  const handleHelpClose = () => {
    setShowHelp(false);
    if (!hasSeenHowTo) markHowToSeen();
  };

  return (
    <div className="min-h-full pb-20 kawaii-dots lg:pb-12">
      <HeaderBar
        mode={mode}
        onModeChange={(m) => {
          setMode(m);
          if (m === "free") reroll();
          reset();
          setMobileTab("grid");
        }}
        onReroll={() => {
          reroll();
          reset();
          setMobileTab("grid");
        }}
        onShowHelp={() => setShowHelp(true)}
      />

      <main className="mx-auto max-w-5xl px-3 pt-3">
        <div className="mb-3 rounded-3xl bg-gradient-to-br from-kitty-100 to-kitty-50 p-3 text-center shadow-kawaiiSoft ring-1 ring-kitty-200/60 sm:p-4">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-kitty-500">
            {mode === "daily" ? "Today's Mystery" : "Free Play Mystery"}
          </div>
          <h1
            className="mt-0.5 font-cute text-lg font-bold leading-tight text-kitty-700 sm:text-2xl"
            aria-label={puzzle.mystery.headline}
          >
            {puzzle.mystery.parts.map((p, i) => (
              <MysterySegment key={i} part={p} />
            ))}
          </h1>
        </div>

        <MobileTabs clueCount={puzzle.clues.length} />

        {/* Desktop: side-by-side */}
        <div className="hidden gap-4 lg:grid lg:grid-cols-[1fr_360px]">
          <DeductionGrid puzzle={puzzle} disabled={outcome !== null} />
          <div className="space-y-4">
            <ClueList puzzle={puzzle} />
            <AccusationPanel puzzle={puzzle} onResolve={() => undefined} />
          </div>
        </div>

        {/* Mobile: all tabs mounted, only the active one is visible.
            Keeping the DOM in place avoids the unmount/remount "reload" flash
            when switching tabs — only window scroll changes. */}
        <div className="lg:hidden">
          <div hidden={mobileTab !== "grid"}>
            <DeductionGrid puzzle={puzzle} disabled={outcome !== null} />
          </div>
          <div hidden={mobileTab !== "clues"}>
            <ClueList puzzle={puzzle} />
          </div>
          <div hidden={mobileTab !== "accuse"}>
            <AccusationPanel puzzle={puzzle} onResolve={() => undefined} />
          </div>
        </div>

        {/* Mobile-only: nudge the player to the Accuse tab once all three picks are set */}
        {!outcome &&
          mobileTab !== "accuse" &&
          accusation.suspect &&
          accusation.item &&
          accusation.location && (
            <div className="fixed bottom-3 left-0 right-0 z-10 mx-auto flex max-w-md justify-center px-3 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileTab("accuse")}
                className="pointer-events-auto rounded-full bg-kitty-500 px-5 py-3 font-cute text-sm font-bold text-white shadow-kawaii ring-2 ring-white/60 transition active:scale-95 animate-floaty"
              >
                Ready to accuse 🎀
              </button>
            </div>
          )}

        <footer className="mt-8 text-center text-[10px] text-kitty-500">
          made with 💖 — fan project, not affiliated with Sanrio or Sunblink.
        </footer>
      </main>

      {showHelp && <HowToPlayModal onClose={handleHelpClose} />}
      {showResult && outcome && (
        <ResultModal
          puzzle={puzzle}
          outcome={outcome}
          durationMs={duration}
          onPlayAgain={handlePlayAgain}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  );
}

function MysterySegment({ part }: { part: ClueSegment }) {
  if (part.type === "text") return <span>{part.value}</span>;
  return (
    <span className="mx-0.5 inline-flex items-center gap-1 align-middle">
      <Icon
        kind={part.kind}
        id={part.id}
        emoji={part.emoji}
        className="h-6 w-6 sm:h-7 sm:w-7"
      />
      {part.label}
    </span>
  );
}
