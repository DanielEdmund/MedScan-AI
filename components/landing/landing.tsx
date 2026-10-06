"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Boxes,
  Command,
  FlaskConical,
  ListOrdered,
  Radar,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClassificationPill,
  DemoTag,
  QueueStatusChip,
  SignalDot,
  StageChip,
} from "@/components/shared/status";
import { Sparkline } from "@/components/shared/metric-card";
import { DEPARTMENTS, totalOccupancy } from "@/lib/mock/departments";
import { selectCounts, useQueueStore } from "@/lib/store/queue-store";
import { CLASSIFICATION_DISCLAIMER, DEMO_BANNER } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

/* ── Header ──────────────────────────────────────────────────────────── */

export function LandingHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="sticky top-0 z-40 border-b border-white/[0.06] bg-midnight/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/40 bg-gradient-to-br from-cyan-400/20 to-blue-600/20">
            <Radar className="h-[18px] w-[18px] text-cyan-300" />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            MedScan <span className="text-cyan-300">AI</span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 md:flex">
          {[
            ["Capabilities", "#capabilities"],
            ["Safety model", "#safety"],
            ["Console preview", "#preview"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-xs font-medium text-slate-400 transition-colors hover:text-cyan-300"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden sm:block">
            <DemoTag />
          </span>
          <Button asChild size="sm">
            <Link href="/console">
              <Command className="h-3.5 w-3.5" />
              Open console
            </Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

/* ── Hero ────────────────────────────────────────────────────────────── */

const HERO_STATS = [
  { label: "Departments online", value: "08", sub: "simulated" },
  { label: "Queue lanes", value: "06", sub: "stages" },
  { label: "Workflow classes", value: "03", sub: "routing only" },
  { label: "Real systems", value: "00", sub: "disconnected" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
      <div className="pointer-events-none absolute inset-0 bg-command-grid opacity-40" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
        <div className="flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <Badge variant="warning" size="lg" className="mb-5">
              <ShieldCheck className="h-3.5 w-3.5" />
              {DEMO_BANNER}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="text-balance font-display text-4xl font-semibold leading-[1.06] tracking-tight text-gradient-white sm:text-5xl lg:text-[56px]"
          >
            The clinical operations
            <br />
            <span className="text-gradient">command center</span> for
            <br />
            modern care teams.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
            className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-400"
          >
            MedScan AI unifies patient intake, screening workflow classification, queue
            orchestration and department coordination into one live operations surface —
            so every team sees the same board, at the same time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg">
              <Link href="/console">
                Launch command center
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/console/intake">
                <FlaskConical className="h-4 w-4" />
                Try simulated intake
              </Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-slate-500"
          >
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
            Decision-support concept only. MedScan AI does not diagnose, prescribe, recommend
            treatment or replace clinicians. {CLASSIFICATION_DISCLAIMER}
          </motion.p>

          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36, ease }}
            className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {HERO_STATS.map((s) => (
              <div key={s.label} className="rounded-lg border border-white/[0.07] bg-navy/70 px-3 py-3">
                <dt className="label-caps truncate">{s.label}</dt>
                <dd className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-display text-xl font-semibold text-slate-50 mono-nums">{s.value}</span>
                  <span className="text-[10px] text-slate-500">{s.sub}</span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Floating console preview */}
        <motion.div
          initial={{ opacity: 0, y: 26, rotateX: 6 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.75, delay: 0.2, ease }}
          className="relative hidden lg:block"
        >
          <HeroConsoleCard />
        </motion.div>
      </div>
    </section>
  );
}

function HeroConsoleCard() {
  const tickets = useQueueStore((s) => s.tickets);
  const counts = useQueueStore(selectCounts);
  const occ = totalOccupancy();

  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-cyan-400/10 via-transparent to-blue-600/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy/90 shadow-panel">
        <div className="flex items-center gap-2 border-b border-white/[0.07] bg-midnight/60 px-4 py-3">
          <SignalDot tone="mint" />
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
            Live operations board
          </span>
          <span className="ml-auto flex items-center gap-1.5 rounded-md border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
            simulated
          </span>
        </div>

        <div className="grid grid-cols-3 gap-px bg-white/[0.06]">
          {[
            { l: "Waiting", v: counts.waiting, c: "text-amber-300" },
            { l: "In progress", v: counts.inProgress, c: "text-cyan-300" },
            { l: "Avg wait", v: `${Math.round(counts.avgWait)}m`, c: "text-slate-100" },
          ].map((m) => (
            <div key={m.l} className="bg-navy/90 px-3 py-3">
              <p className="label-caps">{m.l}</p>
              <p className={`mt-1 font-display text-2xl font-semibold mono-nums ${m.c}`}>{m.v}</p>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 p-3">
          {tickets.slice(0, 5).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.4, ease }}
              className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-slate-800/50 px-2.5 py-2"
            >
              <span className="w-10 shrink-0 text-[11px] font-bold text-cyan-300 mono-nums">{t.ticketCode}</span>
              <span className="min-w-0 flex-1 truncate text-[11.5px] text-slate-300">{t.displayName}</span>
              <StageChip stage={t.stage} />
              <span className="w-8 shrink-0 text-right text-[10.5px] text-slate-500 mono-nums">
                {Math.round(t.waitMinutes)}m
              </span>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] bg-midnight/50 px-4 py-3">
          <div>
            <p className="label-caps">Facility occupancy</p>
            <p className="mt-0.5 font-display text-lg font-semibold text-slate-50 mono-nums">
              {occ.pct}% <span className="text-[11px] font-normal text-slate-500">({occ.occ}/{occ.cap})</span>
            </p>
          </div>
          <Sparkline data={[58, 62, 60, 66, 71, 69, 74, occ.pct]} stroke="#22D3EE" width={120} height={38} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(["ROUTINE", "PRIORITY", "IMMEDIATE CLINICAL REVIEW"] as const).map((c) => (
          <ClassificationPill key={c} value={c} size="sm" />
        ))}
      </div>
    </div>
  );
}

/* ── Capabilities ────────────────────────────────────────────────────── */

const CAPABILITIES = [
  {
    icon: FlaskConical,
    title: "Patient intake terminal",
    body: "A guided intake flow that captures demographics, arrival mode, reported concerns and simulated observations — then stages the case on the board.",
    tags: ["Multi-step form", "Local validation", "Zod + RHF"],
    href: "/console/intake",
    accent: "cyan" as const,
  },
  {
    icon: Radar,
    title: "Workflow classification",
    body: "A transparent routing assistant that organises submitted information into ROUTINE, PRIORITY or IMMEDIATE CLINICAL REVIEW — and shows every factor it used.",
    tags: ["Explainable", "Rule-based", "Clinician sign-off"],
    href: "/console/decision-support",
    accent: "blue" as const,
  },
  {
    icon: ListOrdered,
    title: "Live queue board",
    body: "Watch tickets move through registered, triage, imaging, lab, consult and discharge with simulated timing, holds, assignments and re-sequencing.",
    tags: ["Simulated movement", "Stage lanes", "Hold & assign"],
    href: "/console/queue",
    accent: "amber" as const,
  },
  {
    icon: Boxes,
    title: "Department coordination",
    body: "Capacity, occupancy, staffing and downstream handoffs for every department in a single coordination surface with clear escalation states.",
    tags: ["Capacity map", "Handoff paths", "Escalation"],
    href: "/console/departments",
    accent: "mint" as const,
  },
  {
    icon: Workflow,
    title: "Pathway orchestration",
    body: "See where each simulated workflow sits, what is blocking it and who owns the next step — with adherence tracked across the demo cohort.",
    tags: ["Step states", "Blockers", "Ownership"],
    href: "/console/pathways",
    accent: "violet" as const,
  },
  {
    icon: Activity,
    title: "Operational analytics",
    body: "Arrival curves, cycle-time distribution, modality utilisation and classification splits — all generated from local mock datasets.",
    tags: ["Recharts", "Mock datasets", "Export-ready"],
    href: "/console/analytics",
    accent: "cyan" as const,
  },
];

const ACCENT_MAP: Record<string, string> = {
  cyan: "border-cyan-400/30 text-cyan-300 bg-cyan-400/10",
  blue: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  amber: "border-amber-400/30 text-amber-300 bg-amber-400/10",
  mint: "border-emerald-400/30 text-emerald-300 bg-emerald-400/10",
  violet: "border-violet-400/30 text-violet-300 bg-violet-400/10",
};

export function Capabilities() {
  return (
    <section id="capabilities" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <p className="label-caps mb-3">Platform capabilities</p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-gradient-white sm:text-4xl">
          One surface for the whole operational day.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Six connected modules built around a single principle: give operations teams a shared,
          legible picture of flow — and give clinicians the final word, always.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAPABILITIES.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.07, ease }}
          >
            <Link
              href={c.href}
              className="group flex h-full flex-col rounded-xl border border-white/[0.07] bg-navy/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
            >
              <span
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg border ${ACCENT_MAP[c.accent]}`}
              >
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-base font-semibold text-slate-50">{c.title}</h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-400">{c.body}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 opacity-0 transition-opacity group-hover:opacity-100">
                Open module <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── Safety model ────────────────────────────────────────────────────── */

const NEVER = [
  "Diagnose patients",
  "Prescribe medication",
  "Recommend treatment",
  "Replace clinicians",
  "Claim medical certainty",
  "Determine a patient's disease",
];

const MAY = [
  "Organise submitted intake information",
  "Surface the factors behind a routing label",
  "Sequence a demo queue by workflow class",
  "Highlight capacity and handoff pressure",
  "Record who acknowledged what, and when",
];

export function SafetyModel() {
  return (
    <section id="safety" className="relative overflow-hidden border-y border-white/[0.06] bg-navy/40">
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="label-caps mb-3 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              AI safety principle
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-gradient-white">
              Decision support. Never a decision maker.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              The MedScan AI assistant is presented strictly as a workflow-organisation concept. It
              takes information in and returns a routing label — that is the entire scope of its
              authority inside this prototype.
            </p>

            <div className="mt-6 rounded-xl border border-cyan-400/25 bg-cyan-400/[0.06] p-4">
              <div className="flex items-start gap-3">
                <Siren className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
                    Permitted output
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {(["ROUTINE", "PRIORITY", "IMMEDIATE CLINICAL REVIEW"] as const).map((c) => (
                      <ClassificationPill key={c} value={c} />
                    ))}
                  </div>
                  <p className="mt-3 text-xs font-semibold text-cyan-100">
                    {CLASSIFICATION_DISCLAIMER}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-red-500/25 bg-red-500/[0.05] p-5">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-red-400">
                <ShieldAlert className="h-3.5 w-3.5" />
                Never does
              </p>
              <ul className="space-y-2">
                {NEVER.map((n) => (
                  <li key={n} className="flex items-start gap-2 text-[13px] text-slate-300">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/[0.05] p-5">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                May do
              </p>
              <ul className="space-y-2">
                {MAY.map((m) => (
                  <li key={m} className="flex items-start gap-2 text-[13px] text-slate-300">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-midnight/60 p-5 sm:col-span-2">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                <Command className="h-3.5 w-3.5" />
                Data boundary
              </p>
              <p className="text-[13px] leading-relaxed text-slate-400">
                Every patient, identifier, observation, queue entry, pathway and analytics figure in
                this prototype is <span className="font-semibold text-slate-200">fictional and local</span>.
                No authentication, no backend, no database, no device, no laboratory, no pharmacy and
                no hospital system is contacted at any point.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Console preview strip ───────────────────────────────────────────── */

export function ConsolePreview() {
  const tickets = useQueueStore((s) => s.tickets);
  const counts = useQueueStore(selectCounts);

  return (
    <section id="preview" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="label-caps mb-3">Inside the console</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-gradient-white">
            The board everyone works from.
          </h2>
        </div>
        <Button asChild variant="secondary">
          <Link href="/console/queue">
            <ListOrdered className="h-4 w-4" />
            Explore live queue
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-navy/70 shadow-panel">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.07] bg-midnight/50 px-4 py-3">
          <SignalDot tone="cyan" />
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
            Queue · simulated
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Badge variant="amber">waiting {counts.waiting}</Badge>
            <Badge variant="cyan">in progress {counts.inProgress}</Badge>
            <Badge variant="success">complete {counts.complete}</Badge>
          </div>
        </div>

        <div className="divide-y divide-white/[0.05]">
          {tickets.slice(0, 7).map((t) => (
            <div key={t.id} className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]">
              <span className="w-12 shrink-0 text-xs font-bold text-cyan-300 mono-nums">{t.ticketCode}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{t.displayName}</span>
              <span className="hidden w-36 truncate text-xs text-slate-500 sm:block">
                {t.departmentId}
              </span>
              <ClassificationPill value={t.classification} size="sm" />
              <StageChip stage={t.stage} />
              <QueueStatusChip status={t.status} />
              <span className="w-10 text-right text-xs text-slate-400 mono-nums">
                {Math.round(t.waitMinutes)}m
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-white/[0.07] bg-midnight/50 px-4 py-3">
          <span className="label-caps">Department load</span>
          <div className="flex flex-wrap gap-2">
            {DEPARTMENTS.slice(0, 6).map((d) => (
              <span
                key={d.id}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[11px] text-slate-400"
              >
                <span className="font-bold text-slate-300">{d.code}</span>
                <span className="mono-nums">{Math.round((d.occupancy / d.capacity) * 100)}%</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── CTA + footer ────────────────────────────────────────────────────── */

export function ClosingCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <ScanLine className="mx-auto mb-6 h-9 w-9 text-cyan-300" />
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-gradient-white sm:text-4xl">
            Step onto the floor.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
            Explore the full simulated operations console — intake, classification, queue,
            departments, pathways and analytics, all running on fictional local data.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/console">
                <Command className="h-4 w-4" />
                Open command center
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/console/system">Review safety guardrails</Link>
            </Button>
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-amber-300/80">{DEMO_BANNER}</p>
        </motion.div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-navy/50">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400/40 bg-cyan-400/10">
            <Radar className="h-4 w-4 text-cyan-300" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-200">MedScan AI</p>
            <p className="text-[10.5px] text-slate-500">Clinical operations prototype · v1.0 demo</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <SignalDot tone="mint" /> Simulation online
          </span>
          <span>·</span>
          <span>Fictional patients only</span>
          <span>·</span>
          <span>No real clinical systems</span>
          <span>·</span>
          <span className="text-amber-300/80">{DEMO_BANNER}</span>
        </div>
      </div>
    </footer>
  );
}
