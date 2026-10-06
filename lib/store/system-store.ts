"use client";

import { create } from "zustand";

export type SimulationSpeed = 0 | 1 | 2 | 4;

interface SystemState {
  /** Master switch for the simulated live board. */
  simulationRunning: boolean;
  /** Multiplier applied to simulated queue movement. */
  speed: SimulationSpeed;
  /** Whether the persistent DEMO banner strip is expanded. */
  bannerExpanded: boolean;
  /** Incremented on every simulated tick — used to drive live surfaces. */
  tick: number;
  /** Last time the simulation was toggled, for display. */
  lastToggledAt: number;
  setRunning: (v: boolean) => void;
  toggleRunning: () => void;
  setSpeed: (s: SimulationSpeed) => void;
  setBannerExpanded: (v: boolean) => void;
  bump: () => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  simulationRunning: true,
  speed: 1,
  bannerExpanded: true,
  tick: 0,
  lastToggledAt: Date.now(),
  setRunning: (v) => set({ simulationRunning: v, lastToggledAt: Date.now() }),
  toggleRunning: () =>
    set((s) => ({ simulationRunning: !s.simulationRunning, lastToggledAt: Date.now() })),
  setSpeed: (speed) => set({ speed }),
  setBannerExpanded: (bannerExpanded) => set({ bannerExpanded }),
  bump: () => set((s) => ({ tick: s.tick + 1 })),
}));
