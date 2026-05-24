import { useAudioStore } from "../store/audioStore";

type Props = {
  mode: "daily" | "free";
  onModeChange: (m: "daily" | "free") => void;
  onReroll: () => void;
  onShowHelp: () => void;
};

export function HeaderBar({ mode, onModeChange, onReroll, onShowHelp }: Props) {
  const bgmOn = useAudioStore((s) => s.bgmOn);
  const sfxOn = useAudioStore((s) => s.sfxOn);
  const setBgm = useAudioStore((s) => s.setBgm);
  const setSfx = useAudioStore((s) => s.setSfx);
  const noteInteraction = useAudioStore((s) => s.noteInteraction);

  return (
    <header className="sticky top-0 z-20 border-b border-kitty-200/60 bg-cream/85 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-cream/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎀</span>
          <div className="leading-tight">
            <div className="font-cute text-lg font-bold text-kitty-700">Mystery Meadow</div>
            <div className="-mt-0.5 text-[10px] uppercase tracking-widest text-kitty-500">
              a kawaii whodunnit
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ModePill active={mode === "daily"} onClick={() => onModeChange("daily")}>
            Daily 🌸
          </ModePill>
          <ModePill active={mode === "free"} onClick={() => onModeChange("free")}>
            Free 🎲
          </ModePill>
          {mode === "free" && (
            <button
              type="button"
              onClick={() => {
                noteInteraction();
                onReroll();
              }}
              className="rounded-full bg-kitty-100 px-2.5 py-1 text-xs font-semibold text-kitty-700 ring-1 ring-kitty-200 transition active:scale-95 hover:bg-kitty-200"
              aria-label="New puzzle"
            >
              ↻
            </button>
          )}

          <div className="ml-1 flex items-center gap-1 border-l border-kitty-200 pl-1.5">
            <button
              type="button"
              onClick={onShowHelp}
              aria-label="How to play"
              title="How to play"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/70 text-sm font-bold text-kitty-600 ring-1 ring-kitty-200 transition active:scale-95 hover:bg-kitty-100"
            >
              ?
            </button>
            <ToggleButton
              on={sfxOn}
              onToggle={() => {
                noteInteraction();
                setSfx(!sfxOn);
              }}
              label={sfxOn ? "SFX on" : "SFX off"}
            >
              {sfxOn ? "🔔" : "🔕"}
            </ToggleButton>
            <ToggleButton
              on={bgmOn}
              onToggle={() => {
                noteInteraction();
                setBgm(!bgmOn);
              }}
              label={bgmOn ? "Music on" : "Music off"}
            >
              {bgmOn ? "🎵" : "🚫"}
            </ToggleButton>
          </div>
        </div>
      </div>
    </header>
  );
}

function ModePill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-bold transition active:scale-95 ${
        active
          ? "bg-kitty-500 text-white shadow-kawaii"
          : "bg-kitty-50 text-kitty-600 ring-1 ring-kitty-200 hover:bg-kitty-100"
      }`}
    >
      {children}
    </button>
  );
}

function ToggleButton({
  on,
  onToggle,
  label,
  children,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-full text-sm transition active:scale-95 ${
        on ? "bg-kitty-100 ring-1 ring-kitty-300" : "bg-white/70 ring-1 ring-kitty-100"
      }`}
    >
      {children}
    </button>
  );
}
