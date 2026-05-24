import { useCallback, useEffect, useRef } from "react";
import { useAudioStore } from "../store/audioStore";

export type SfxKey = "click" | "mark" | "yes" | "no" | "win" | "lose";

type Ctx = {
  audio: AudioContext;
  masterSfx: GainNode;
  masterBgm: GainNode;
  bgmStop?: () => void;
};

let ctxSingleton: Ctx | null = null;

function getCtx(): Ctx {
  if (ctxSingleton) return ctxSingleton;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  const audio = new AC();
  const masterSfx = audio.createGain();
  masterSfx.gain.value = 0.45;
  masterSfx.connect(audio.destination);
  const masterBgm = audio.createGain();
  masterBgm.gain.value = 0.2;
  masterBgm.connect(audio.destination);
  ctxSingleton = { audio, masterSfx, masterBgm };
  return ctxSingleton;
}

function blip(notes: { freq: number; dur: number; type?: OscillatorType; delay?: number }[]) {
  const { audio, masterSfx } = getCtx();
  const now = audio.currentTime;
  for (const n of notes) {
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = n.type ?? "triangle";
    o.frequency.value = n.freq;
    g.gain.value = 0;
    const start = now + (n.delay ?? 0);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.5, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, start + n.dur);
    o.connect(g).connect(masterSfx);
    o.start(start);
    o.stop(start + n.dur + 0.02);
  }
}

const SFX: Record<SfxKey, () => void> = {
  click: () => blip([{ freq: 880, dur: 0.08, type: "sine" }]),
  mark: () => blip([{ freq: 660, dur: 0.07, type: "triangle" }]),
  no: () => blip([{ freq: 520, dur: 0.09, type: "square" }, { freq: 440, dur: 0.11, type: "square", delay: 0.06 }]),
  yes: () =>
    blip([
      { freq: 784, dur: 0.08, type: "triangle" },
      { freq: 988, dur: 0.1, type: "triangle", delay: 0.06 },
      { freq: 1318, dur: 0.14, type: "triangle", delay: 0.14 },
    ]),
  win: () =>
    blip([
      { freq: 659, dur: 0.14, type: "triangle" },
      { freq: 784, dur: 0.14, type: "triangle", delay: 0.12 },
      { freq: 988, dur: 0.18, type: "triangle", delay: 0.24 },
      { freq: 1319, dur: 0.32, type: "triangle", delay: 0.38 },
      { freq: 1568, dur: 0.32, type: "sine", delay: 0.4 },
    ]),
  lose: () =>
    blip([
      { freq: 520, dur: 0.18, type: "triangle" },
      { freq: 440, dur: 0.2, type: "triangle", delay: 0.16 },
      { freq: 349, dur: 0.32, type: "triangle", delay: 0.34 },
    ]),
};

/**
 * Cute kawaii arpeggio BGM that loops every 8 bars.
 * Built from simple oscillators so we ship zero audio assets.
 */
function startBgm(): () => void {
  const { audio, masterBgm } = getCtx();
  const tempo = 120; // bpm
  const beat = 60 / tempo;
  const bar = beat * 4;
  const loopLen = bar * 8;

  // pentatonic-ish riff in F major (kawaii vibes)
  const riff: number[] = [
    659, 784, 880, 988, 880, 784, 659, 587,
    659, 784, 880, 1175, 988, 784, 659, 523,
    587, 659, 784, 988, 880, 784, 587, 523,
    659, 784, 988, 1175, 988, 880, 784, 659,
  ];
  const stepLen = loopLen / riff.length;
  let stopped = false;

  const schedule = (loopStart: number) => {
    for (let i = 0; i < riff.length; i++) {
      const t = loopStart + i * stepLen;
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = "triangle";
      o.frequency.value = riff[i] / 2; // octave down, softer
      g.gain.value = 0;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.35, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + stepLen * 0.95);
      o.connect(g).connect(masterBgm);
      o.start(t);
      o.stop(t + stepLen + 0.02);

      // soft companion bell
      const o2 = audio.createOscillator();
      const g2 = audio.createGain();
      o2.type = "sine";
      o2.frequency.value = riff[i];
      g2.gain.value = 0;
      g2.gain.setValueAtTime(0, t);
      g2.gain.linearRampToValueAtTime(0.12, t + 0.02);
      g2.gain.exponentialRampToValueAtTime(0.001, t + stepLen * 0.6);
      o2.connect(g2).connect(masterBgm);
      o2.start(t);
      o2.stop(t + stepLen + 0.02);
    }
  };

  let nextLoopStart = audio.currentTime + 0.05;
  schedule(nextLoopStart);
  nextLoopStart += loopLen;

  const interval = window.setInterval(() => {
    if (stopped) return;
    const ahead = nextLoopStart - audio.currentTime;
    if (ahead < loopLen * 0.5) {
      schedule(nextLoopStart);
      nextLoopStart += loopLen;
    }
  }, 1000);

  return () => {
    stopped = true;
    window.clearInterval(interval);
  };
}

export function useAudio() {
  const sfxOn = useAudioStore((s) => s.sfxOn);
  const bgmOn = useAudioStore((s) => s.bgmOn);
  const hasInteracted = useAudioStore((s) => s.hasInteracted);
  const noteInteractionStore = useAudioStore((s) => s.noteInteraction);
  const startedRef = useRef(false);
  const stopRef = useRef<(() => void) | null>(null);

  const noteInteraction = useCallback(() => {
    noteInteractionStore();
    try {
      const c = getCtx();
      if (c.audio.state === "suspended") void c.audio.resume();
    } catch {
      /* noop */
    }
  }, [noteInteractionStore]);

  const play = useCallback(
    (key: SfxKey) => {
      if (!sfxOn || !hasInteracted) return;
      try {
        const c = getCtx();
        if (c.audio.state === "suspended") void c.audio.resume();
        SFX[key]();
      } catch {
        /* noop */
      }
    },
    [sfxOn, hasInteracted],
  );

  useEffect(() => {
    if (!hasInteracted) return;
    if (bgmOn && !startedRef.current) {
      try {
        const c = getCtx();
        if (c.audio.state === "suspended") void c.audio.resume();
        stopRef.current = startBgm();
        startedRef.current = true;
      } catch {
        /* noop */
      }
    } else if (!bgmOn && startedRef.current) {
      stopRef.current?.();
      stopRef.current = null;
      startedRef.current = false;
    }
  }, [bgmOn, hasInteracted]);

  return { play, noteInteraction };
}
