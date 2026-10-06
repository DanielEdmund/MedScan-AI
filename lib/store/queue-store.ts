"use client";

import { create } from "zustand";
import type { QueueStage, QueueStatus, QueueTicket } from "@/lib/types";
import { buildQueueSeed } from "@/lib/mock/patients";

const STAGE_ORDER: QueueStage[] = [
  "REGISTERED",
  "TRIAGE",
  "IMAGING",
  "LAB",
  "CONSULT",
  "DISCHARGE",
];

interface QueueState {
  tickets: QueueTicket[];
  /** Chronological log of simulated movements, newest first. */
  movements: MovementLog[];
  advance: (id: string) => void;
  toggleHold: (id: string) => void;
  assign: (id: string, clinician: string) => void;
  /** One simulation step — moves a small number of tickets forward. */
  simulateTick: (speed: number) => void;
  addTicket: (ticket: QueueTicket) => void;
  reset: () => void;
}

export interface MovementLog {
  id: string;
  at: number;
  text: string;
  kind: string;
}

const CLINICIANS = [
  "Dr. Ilse Brandt",
  "Dr. Marcus Oyelaran",
  "Dr. Priya Raghunathan",
  "Dr. Hana Lindqvist",
  "N. Ferreira, RN",
  "J. Aldridge, RN",
];

let seq = 0;
const nextId = () => `mv-${Date.now()}-${seq++}`;

export const useQueueStore = create<QueueState>((set, get) => ({
  tickets: buildQueueSeed(),
  movements: [
    { id: "mv-seed-3", at: Date.now() - 90_000, text: "A-104 moved to CONSULT · Cardiac Care Unit", kind: "MOVE" },
    { id: "mv-seed-2", at: Date.now() - 210_000, text: "A-111 placed ON HOLD pending simulated lab panel", kind: "ON_HOLD" },
    { id: "mv-seed-1", at: Date.now() - 340_000, text: "A-107 entered the priority lane", kind: "IN_PROGRESS" },
  ],

  advance: (id) =>
    set((s) => {
      const ticket = s.tickets.find((t) => t.id === id);
      if (!ticket) return s;
      const idx = STAGE_ORDER.indexOf(ticket.stage);
      const nextStage = STAGE_ORDER[Math.min(idx + 1, STAGE_ORDER.length - 1)];
      const finished = nextStage === ticket.stage;
      const code = ticket.ticketCode;

      return {
        tickets: s.tickets.map((t) =>
          t.id === id
            ? {
                ...t,
                stage: nextStage,
                status: finished ? "COMPLETE" : "IN_PROGRESS",
                waitMinutes: finished ? 0 : Math.max(0, t.waitMinutes - 2),
                clinician: t.clinician ?? CLINICIANS[idx % CLINICIANS.length],
              }
            : t,
        ),
        movements: [
          {
            id: nextId(),
            at: Date.now(),
            text: finished
              ? `${code} completed the simulated pathway`
              : `${code} advanced to ${nextStage}`,
            kind: finished ? "COMPLETE" : "MOVE",
          },
          ...s.movements,
        ].slice(0, 40),
      };
    }),

  toggleHold: (id) =>
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "ON_HOLD" ? "WAITING" : "ON_HOLD" }
          : t,
      ),
      movements: [
        {
          id: nextId(),
          at: Date.now(),
          text: `${s.tickets.find((t) => t.id === id)?.ticketCode ?? id} ${
            s.tickets.find((t) => t.id === id)?.status === "ON_HOLD" ? "released from hold" : "placed on hold"
          }`,
          kind: s.tickets.find((t) => t.id === id)?.status === "ON_HOLD" ? "WAITING" : "ON_HOLD",
        },
        ...get().movements,
      ].slice(0, 40),
    })),

  assign: (id, clinician) =>
    set((s) => ({
      tickets: s.tickets.map((t) => (t.id === id ? { ...t, clinician } : t)),
      movements: [
        {
          id: nextId(),
          at: Date.now(),
          text: `${s.tickets.find((t) => t.id === id)?.ticketCode ?? id} assigned to ${clinician}`,
          kind: "IN_PROGRESS",
        },
        ...get().movements,
      ].slice(0, 40),
    })),

  simulateTick: (speed) => {
    const { tickets } = get();
    const candidates = tickets.filter((t) => t.status === "WAITING" || t.status === "IN_PROGRESS");
    if (candidates.length === 0) return;

    const moves = speed >= 2 ? 2 : 1;
    const chosen = candidates
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, moves);

    const log: MovementLog[] = [];

    const updated = tickets.map((t) => {
      const target = chosen.find((c) => c.id === t.id);
      if (!target) {
        return { ...t, elapsedMinutes: t.elapsedMinutes + 0.25, waitMinutes: t.waitMinutes + 0.25 };
      }
      const idx = STAGE_ORDER.indexOf(t.stage);
      if (idx >= STAGE_ORDER.length - 1) {
        log.push({
          id: nextId(),
          at: Date.now(),
          text: `${t.ticketCode} completed the simulated pathway`,
          kind: "COMPLETE",
        });
        return { ...t, status: "COMPLETE" as QueueStatus, waitMinutes: 0 };
      }
      const nextStage = STAGE_ORDER[idx + 1];
      log.push({
        id: nextId(),
        at: Date.now(),
        text: `${t.ticketCode} moved to ${nextStage}`,
        kind: "MOVE",
      });
      return {
        ...t,
        stage: nextStage,
        status: "IN_PROGRESS" as QueueStatus,
        waitMinutes: Math.max(0, t.waitMinutes - 3),
        clinician: t.clinician ?? CLINICIANS[idx % CLINICIANS.length],
        elapsedMinutes: t.elapsedMinutes + 0.25,
      };
    });

    set({
      tickets: updated,
      movements: [...log, ...get().movements].slice(0, 40),
    });
  },

  addTicket: (ticket) =>
    set((s) => ({
      tickets: [ticket, ...s.tickets],
      movements: [
        {
          id: nextId(),
          at: Date.now(),
          text: `${ticket.ticketCode} registered at intake — ${ticket.classification.toLowerCase()}`,
          kind: "WAITING",
        },
        ...s.movements,
      ].slice(0, 40),
    })),

  reset: () =>
    set({ tickets: buildQueueSeed(), movements: [] }),
}));

/* ── Selectors ───────────────────────────────────────────────────────── */

export const selectCounts = (s: QueueState) => {
  const total = s.tickets.length;
  const waiting = s.tickets.filter((t) => t.status === "WAITING").length;
  const inProgress = s.tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const onHold = s.tickets.filter((t) => t.status === "ON_HOLD").length;
  const complete = s.tickets.filter((t) => t.status === "COMPLETE").length;
  const immediate = s.tickets.filter(
    (t) => t.classification === "IMMEDIATE CLINICAL REVIEW" && t.status !== "COMPLETE",
  ).length;
  const priority = s.tickets.filter(
    (t) => t.classification === "PRIORITY" && t.status !== "COMPLETE",
  ).length;
  const avgWait =
    s.tickets.filter((t) => t.status !== "COMPLETE").reduce((sum, t) => sum + t.waitMinutes, 0) /
    Math.max(1, waiting + inProgress + onHold);
  return { total, waiting, inProgress, onHold, complete, immediate, priority, avgWait };
};
