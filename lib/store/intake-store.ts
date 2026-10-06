"use client";

import { create } from "zustand";
import type { ClassificationResult } from "@/lib/decision-support";
import type { IntakeSubmission } from "@/lib/types";

interface IntakeState {
  submissions: IntakeSubmission[];
  /** Draft left mid-flow so the prototype can resume a session. */
  lastResult: ClassificationResult | null;
  /** Counter used to mint fictional ticket codes. */
  seq: number;
  add: (s: IntakeSubmission) => void;
  setLastResult: (r: ClassificationResult | null) => void;
  markReviewed: (id: string) => void;
  reset: () => void;
}

export const useIntakeStore = create<IntakeState>((set) => ({
  submissions: [],
  lastResult: null,
  seq: 100,
  add: (submission) =>
    set((s) => ({ submissions: [submission, ...s.submissions], seq: s.seq + 1 })),
  setLastResult: (lastResult) => set({ lastResult }),
  markReviewed: (id) =>
    set((s) => ({
      submissions: s.submissions.map((x) =>
        x.id === id ? { ...x, clinicianReviewed: true } : x,
      ),
    })),
  reset: () => set({ submissions: [], lastResult: null, seq: 100 }),
}));
