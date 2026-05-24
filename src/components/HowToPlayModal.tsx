export function HowToPlayModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-kitty-900/40 backdrop-blur-sm sm:items-center">
      <div className="relative w-full max-w-md rounded-t-3xl bg-cream p-6 shadow-2xl ring-1 ring-kitty-200 sm:rounded-3xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-white/70 px-2 py-1 text-xs font-semibold text-kitty-500 ring-1 ring-kitty-200 hover:bg-white"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="text-4xl">🎀</div>
          <h2 className="mt-1 font-cute text-2xl font-bold text-kitty-700">How to play</h2>
          <p className="mt-1 text-sm text-kitty-700">
            One Sanrio friend "borrowed" something from somewhere. Use the clues to figure out{" "}
            <em>who, what,</em> and <em>where</em>.
          </p>
        </div>

        <ol className="mt-4 space-y-3 text-sm leading-snug text-kitty-900">
          <li className="rounded-2xl bg-kitty-50 px-3 py-2 ring-1 ring-kitty-100">
            <span className="font-bold text-kitty-700">1. Read the clues 🔍</span>
            <div className="mt-0.5">
              Each clue tells you something true or false. They work together — chain them.
            </div>
          </li>
          <li className="rounded-2xl bg-kitty-50 px-3 py-2 ring-1 ring-kitty-100">
            <span className="font-bold text-kitty-700">2. Mark the grid 🧩</span>
            <div className="mt-0.5">
              Tap a cell to cycle: <span className="px-1 font-mono">blank → ✕ → ✓</span>. Use ✕ for{" "}
              <em>"definitely not"</em> and ✓ for <em>"yes, this is it!"</em>.
            </div>
          </li>
          <li className="rounded-2xl bg-kitty-50 px-3 py-2 ring-1 ring-kitty-100">
            <span className="font-bold text-kitty-700">3. ✓ auto-fills row + column ✨</span>
            <div className="mt-0.5">
              A ✓ means everyone else in that row and column is impossible — the empty cells fill
              with ✕ for you.
            </div>
          </li>
          <li className="rounded-2xl bg-kitty-50 px-3 py-2 ring-1 ring-kitty-100">
            <span className="font-bold text-kitty-700">4. Make the call 🎀</span>
            <div className="mt-0.5">
              When you've narrowed it down to one friend · one item · one place, tap <b>Accuse</b>.
            </div>
          </li>
        </ol>

        <p className="mt-4 text-center text-xs italic text-kitty-600">
          tip: there's always exactly one solution — no guessing required 💖
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-2xl bg-kitty-500 px-4 py-3 font-cute text-base font-bold text-white shadow-kawaii transition active:scale-[0.98] hover:bg-kitty-600"
        >
          Let's go!
        </button>
      </div>
    </div>
  );
}
