"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRightLeft,
  Ban,
  CircleAlert,
  CircleCheck,
  Cpu,
  Info,
  Lock,
  Palette,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn, formatClock } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch, riseItem, stagger } from "@/components/ui/primitives";
import { PageHeader, SectionHeading } from "@/components/shared/page-header";
import {
  ClassificationPill,
  DecisionSupportDisclaimer,
  DemoTag,
  SignalDot,
} from "@/components/shared/status";
import { useQueueStore } from "@/lib/store/queue-store";
import { useSystemStore, type SimulationSpeed } from "@/lib/store/system-store";
import { CLASSIFICATION_GUIDE } from "@/lib/decision-support";
import { DEMO_BANNER, WORKFLOW_CLASSES, type CapacityState } from "@/lib/types";

const APP_VERSION = "1.0.0";
const SPEEDS: SimulationSpeed[] = [0, 1, 2, 4];

/* ── Data boundary — everything this prototype deliberately lacks ────── */

const NOT_IMPLEMENTED: Array<{ label: string; note: string }> = [
  { label: "Real hospital systems", note: "no EHR, HIS or device connection" },
  { label: "Patient records", note: "fictional demo subjects only" },
  { label: "Medical databases", note: "no clinical knowledge source is queried" },
  { label: "Healthcare APIs", note: "no external request is ever made" },
  { label: "Diagnosis", note: "routing labels, never clinical conclusions" },
  { label: "Prescriptions", note: "no medication data of any kind" },
  { label: "Authentication", note: "no login, sessions or user accounts" },
  { label: "Lab & pharmacy integration", note: "no results, orders or dispense data" },
  { label: "Notifications", note: "no email, SMS, push or paging" },
  { label: "Real-time hospital infrastructure", note: "no feeds, sockets or bed links" },
  { label: "Production backend / database", note: "client state only, resets on reload" },
  { label: "Remote AI inference", note: "fixed local rules, no model is called" },
];

/* ── Hard limits of the simulated decision support ───────────────────── */

const NEVER_DOES = [
  "Diagnose or name any condition",
  "Prescribe, suggest or adjust medication",
  "Recommend treatment or clinical pathways",
  "Replace clinicians or clinical judgement",
  "Claim medical certainty about any value",
  "Determine disease presence or absence",
];

/* ── Palette ─────────────────────────────────────────────────────────── */

const PALETTE = [
  { name: "Midnight", hex: "#07111F", role: "Primary application background" },
  { name: "Deep Navy", hex: "#0B172A", role: "Panels, sidebar and elevated surfaces" },
  { name: "Slate", hex: "#172033", role: "Inner cards, rows and data wells" },
  { name: "Electric Cyan", hex: "#22D3EE", role: "Active, live and focus states" },
  { name: "Medical Blue", hex: "#3B82F6", role: "Primary actions and buttons" },
  { name: "Mint", hex: "#34D399", role: "Normal, success and optimal capacity" },
  { name: "Amber", hex: "#FBBF24", role: "Pending, attention and elevated load" },
  { name: "Alert Red", hex: "#EF4444", role: "Genuine urgent states only — used sparingly" },
  { name: "White", hex: "#F8FAFC", role: "Primary text and headings" },
];

const CAPACITY_LEGEND: Array<{ state: CapacityState; className: string; icon: typeof CircleCheck; meaning: string }> = [
  {
    state: "OPTIMAL",
    className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    icon: CircleCheck,
    meaning: "Within planned capacity",
  },
  {
    state: "ELEVATED",
    className: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    icon: TrendingUp,
    meaning: "Load rising, watch the board",
  },
  {
    state: "AT_CAPACITY",
    className: "border-red-500/45 bg-red-500/10 text-red-300",
    icon: CircleAlert,
    meaning: "No headroom left locally",
  },
  {
    state: "DIVERTING",
    className: "border-red-500/30 bg-slate-800 text-red-300",
    icon: ArrowRightLeft,
    meaning: "Simulated inflow redirected",
  },
];

/* ── Small local helpers ─────────────────────────────────────────────── */

function Readout({
  label,
  value,
  sub,
  tone = "slate",
}: {
  label: string;
  value: string | number;
  sub: string;
  tone?: "mint" | "amber" | "cyan" | "blue" | "slate";
}) {
  const tones = {
    mint: "text-emerald-300",
    amber: "text-amber-300",
    cyan: "text-cyan-300",
    blue: "text-blue-300",
    slate: "text-slate-50",
  };
  return (
    <div className="rounded-lg border border-white/[0.06] bg-slate-800/50 px-3 py-2.5">
      <p className="label-caps">{label}</p>
      <p className={cn("mt-1.5 font-display text-lg font-semibold mono-nums", tones[tone])}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function SystemPage() {
  const running = useSystemStore((s) => s.simulationRunning);
  const speed = useSystemStore((s) => s.speed);
  const tick = useSystemStore((s) => s.tick);
  const lastToggledAt = useSystemStore((s) => s.lastToggledAt);
  const setRunning = useSystemStore((s) => s.setRunning);
  const setSpeed = useSystemStore((s) => s.setSpeed);

  const ticketCount = useQueueStore((s) => s.tickets.length);
  const resetQueue = useQueueStore((s) => s.reset);

  const [resetNote, setResetNote] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!resetNote) return;
    const id = window.setTimeout(() => setResetNote(null), 2500);
    return () => window.clearTimeout(id);
  }, [resetNote]);

  const handleReset = () => {
    resetQueue();
    setResetNote("Demo queue rebuilt from the fictional seed");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            Platform · {DEMO_BANNER}
          </span>
        }
        title="System & Safety"
        description="Guardrails, demo controls and the explicit boundary of this front-end prototype. Nothing here connects to a hospital, a database or any clinical system."
        actions={
          <>
            <DemoTag />
            <Button asChild variant="secondary" size="sm">
              <Link href="/console">
                <Settings2 className="h-4 w-4" aria-hidden="true" />
                Command center
              </Link>
            </Button>
          </>
        }
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* ── a) Simulation controls ───────────────────────────────── */}
        <motion.section variants={riseItem} aria-labelledby="sim-controls-title">
          <SectionHeading
            title="Simulation controls"
            hint="A local browser timer mutating local state only — no queue, appointment or notification system is attached."
          />
          <Card>
            <CardHeader>
              <CardTitle id="sim-controls-title" className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
                  <Cpu className="h-4 w-4" aria-hidden="true" />
                </span>
                Demo driver
              </CardTitle>
              <CardDescription>
                Controls apply instantly to every open console surface.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Master switch */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/[0.06] bg-slate-800/50 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100">Live simulation</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Drives the simulated queue board and activity feed.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={cn(
                      "label-caps",
                      running ? "text-emerald-300" : "text-amber-300",
                    )}
                  >
                    {running ? "Running" : "Paused"}
                  </span>
                  <Switch
                    checked={running}
                    onCheckedChange={setRunning}
                    aria-label="Toggle the local simulation timer"
                  />
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-slate-300"
                    aria-hidden="true"
                  >
                    {running ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                  </span>
                </div>
              </div>

              {/* Speed */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/[0.06] bg-slate-800/50 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100">Tick speed</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Multiplier applied to simulated queue movement.
                  </p>
                </div>
                <div
                  role="group"
                  aria-label="Simulation speed multiplier"
                  className="flex shrink-0 items-center gap-1.5"
                >
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={speed === s}
                      aria-label={`Set simulation speed to ${s} times`}
                      onClick={() => setSpeed(s)}
                      className={cn(
                        "h-8 min-w-[3.25rem] rounded-md border px-2 text-xs font-semibold mono-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight",
                        speed === s
                          ? "border-cyan-400/50 bg-cyan-400/12 text-cyan-200"
                          : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-slate-200",
                      )}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/[0.06] bg-slate-800/50 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100">Reset demo queue</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Rebuilds the fictional seed tickets and clears the movement log.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  {resetNote && (
                    <span role="status" className="text-[11px] font-medium text-emerald-300">
                      {resetNote}
                    </span>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleReset}
                    aria-label="Reset the demo queue to its fictional seed tickets"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Reset demo queue
                  </Button>
                </div>
              </div>

              {/* Live readout */}
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <Readout
                  label="Simulation"
                  value={running ? "RUNNING" : "PAUSED"}
                  sub={`toggled at ${formatClock(new Date(lastToggledAt))}`}
                  tone={running ? "mint" : "amber"}
                />
                <Readout label="Speed" value={`${speed}×`} sub="tick multiplier" tone="cyan" />
                <Readout label="Ticks" value={tick} sub="since page load" />
                <Readout
                  label="Demo queue"
                  value={ticketCount}
                  sub="fictional tickets"
                  tone="blue"
                />
              </div>

              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                Speed 0× pauses queue movement without switching the board into a paused state.
                Reloading the page restores every default.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* ── b) Data boundary ─────────────────────────────────────── */}
        <motion.section variants={riseItem} aria-labelledby="data-boundary-title">
          <SectionHeading
            title="Data boundary"
            hint="Everything below is deliberately absent. This is a front-end prototype, not a clinical product."
          />
          <Card>
            <CardHeader>
              <CardTitle id="data-boundary-title" className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-slate-400">
                  <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                </span>
                Not implemented
              </CardTitle>
              <CardDescription>
                No list item below exists anywhere in this build — not partially, not behind a flag.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {NOT_IMPLEMENTED.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-slate-800/50 px-3 py-2.5"
                  >
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-slate-500"
                      aria-hidden="true"
                    >
                      <X className="h-3 w-3" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-400 line-through decoration-slate-600">
                        {item.label}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                        {item.note}
                      </p>
                      <span className="mt-1.5 inline-flex items-center rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        Not implemented
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 rounded-lg border border-white/[0.06] bg-midnight/60 px-3 py-2.5 text-[11px] leading-relaxed text-slate-400">
                Every figure on screen is fictional and generated locally in your browser. Nothing
                is stored, transmitted or persisted beyond the current tab.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* ── c) AI safety principle ───────────────────────────────── */}
        <motion.section variants={riseItem} aria-labelledby="ai-safety-title">
          <SectionHeading
            title="AI safety principle"
            hint="The simulated classifier is a workflow router. Its entire output vocabulary is three labels."
          />
          <div className="grid gap-3 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle id="ai-safety-title" className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-400/35 bg-emerald-400/10 text-emerald-300">
                    <CircleCheck className="h-4 w-4" aria-hidden="true" />
                  </span>
                  Permitted outputs
                </CardTitle>
                <CardDescription>
                  Workflow routing labels only — never a clinical statement.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {WORKFLOW_CLASSES.map((label) => (
                    <ClassificationPill key={label} value={label} />
                  ))}
                </div>
                <ul className="space-y-2">
                  {CLASSIFICATION_GUIDE.map((entry) => (
                    <li
                      key={entry.key}
                      className="rounded-lg border border-white/[0.06] bg-slate-800/50 px-3 py-2.5"
                    >
                      <p className="text-xs font-semibold text-slate-200">{entry.title}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                        {entry.meaning}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md border border-red-500/35 bg-red-500/10 text-red-400">
                    <Ban className="h-4 w-4" aria-hidden="true" />
                  </span>
                  Never does
                </CardTitle>
                <CardDescription>Hard limits of this prototype, without exception.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {NEVER_DOES.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-slate-800/50 px-3 py-2.5"
                    >
                      <Ban
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400"
                        aria-hidden="true"
                      />
                      <span className="text-xs leading-relaxed text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-400/30 bg-amber-400/[0.07] px-3 py-2.5">
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-300"
                    aria-hidden="true"
                  />
                  <p className="text-[11px] leading-relaxed text-amber-200/80">
                    Clinicians own every decision. The board exists to sequence work, not to
                    interpret it.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <DecisionSupportDisclaimer className="mt-3" />
        </motion.section>

        {/* ── d) Colour & status legend ────────────────────────────── */}
        <motion.section variants={riseItem} aria-labelledby="legend-title">
          <SectionHeading
            title="Colour & status legend"
            hint="Every accent has one job. Meaning is always carried by text as well as colour."
          />
          <Card>
            <CardHeader>
              <CardTitle id="legend-title" className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-slate-300">
                  <Palette className="h-4 w-4" aria-hidden="true" />
                </span>
                Palette
              </CardTitle>
              <CardDescription>Nine tokens, each with a single reserved role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {PALETTE.map((swatch) => (
                  <li
                    key={swatch.hex}
                    className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-slate-800/50 px-3 py-2.5"
                  >
                    <span
                      className="h-9 w-9 shrink-0 rounded-md border border-white/15"
                      style={{ backgroundColor: swatch.hex }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold text-slate-200">
                        {swatch.name}
                        <span className="mono-nums text-[10px] font-normal uppercase text-slate-500">
                          {swatch.hex}
                        </span>
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                        {swatch.role}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div>
                <p className="label-caps mb-2">Status chips</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {CAPACITY_LEGEND.map((entry) => {
                    const Icon = entry.icon;
                    return (
                      <li
                        key={entry.state}
                        className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-slate-800/50 px-3 py-2.5"
                      >
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            entry.className,
                          )}
                        >
                          <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
                          {entry.state.replace("_", " ")}
                        </span>
                        <span className="truncate text-right text-[11px] text-slate-400">
                          {entry.meaning}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/[0.07] px-3 py-2.5">
                  <ShieldAlert
                    className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                    aria-hidden="true"
                  />
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    <span className="font-semibold text-slate-100">Alert red is reserved.</span>{" "}
                    <span className="mono-nums">#EF4444</span> appears only for genuine urgent
                    states — never for branding, decoration or routine emphasis.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    <span className="font-semibold text-slate-100">Colour is never used alone.</span>{" "}
                    Every state pairs its swatch with a written label and, where useful, an icon —
                    so meaning survives greyscale and colour-vision differences.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ── e) About / version ───────────────────────────────────── */}
        <motion.section variants={riseItem} aria-labelledby="about-title">
          <SectionHeading title="About & version" hint="What this build is, and what it is not." />
          <Card className="relative overflow-hidden">
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-400/[0.06] via-transparent to-cyan-400/[0.05]"
              aria-hidden="true"
            />
            <CardContent className="relative space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-semibold tracking-tight text-slate-50">
                      MedScan <span className="text-cyan-300">AI</span>
                    </span>
                    <Badge variant="muted" className="mono-nums">
                      v{APP_VERSION}
                    </Badge>
                    <Badge variant="outline">Front-end prototype</Badge>
                  </div>
                  <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-400">
                    A presentation-grade mock of a clinical-operations command center, built with
                    Next.js 14, TypeScript, Tailwind CSS and framer-motion. All patients, staff,
                    departments, queues, alerts and analytics are fictional.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <SignalDot tone="mint" />
                  <span className="label-caps">Local build · no backend</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border border-amber-400/35 bg-amber-400/[0.08] px-3 py-2.5">
                <Lock className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
                    {DEMO_BANNER}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-amber-200/70">
                    Not a medical device. Not for clinical use. No real person, facility or record
                    is represented anywhere in this prototype.
                  </p>
                </div>
              </div>

              <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { k: "Version", v: `v${APP_VERSION}` },
                  { k: "Stack", v: "Next.js 14 · TS · Tailwind" },
                  { k: "Data", v: "Local mock fixtures" },
                  { k: "Persistence", v: "None — in-memory only" },
                ].map((row) => (
                  <div
                    key={row.k}
                    className="rounded-lg border border-white/[0.06] bg-slate-800/50 px-3 py-2.5"
                  >
                    <dt className="label-caps">{row.k}</dt>
                    <dd className="mt-1 text-xs font-medium text-slate-200">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </motion.section>
      </motion.div>
    </div>
  );
}
