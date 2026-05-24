import { create } from "zustand";
import { persist } from "zustand/middleware";

type AudioState = {
  bgmOn: boolean;
  sfxOn: boolean;
  hasInteracted: boolean;
  setBgm: (v: boolean) => void;
  setSfx: (v: boolean) => void;
  noteInteraction: () => void;
};

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      bgmOn: false,
      sfxOn: true,
      hasInteracted: false,
      setBgm: (v) => set({ bgmOn: v }),
      setSfx: (v) => set({ sfxOn: v }),
      noteInteraction: () => set({ hasInteracted: true }),
    }),
    { name: "mystery-meadow-audio-prefs-v1" },
  ),
);
