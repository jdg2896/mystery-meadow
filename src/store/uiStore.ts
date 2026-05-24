import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MobileTab = "grid" | "clues" | "accuse";

type UiState = {
  mobileTab: MobileTab;
  hasSeenHowTo: boolean;
  setMobileTab: (t: MobileTab) => void;
  markHowToSeen: () => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      mobileTab: "grid",
      hasSeenHowTo: false,
      setMobileTab: (t) => set({ mobileTab: t }),
      markHowToSeen: () => set({ hasSeenHowTo: true }),
    }),
    {
      name: "mystery-meadow-ui-v1",
      // mobileTab is ephemeral per-session — don't persist it
      partialize: (s) => ({ hasSeenHowTo: s.hasSeenHowTo }) as Partial<UiState>,
    },
  ),
);
