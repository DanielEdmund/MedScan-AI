"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  LoaderCircle,
  ShieldAlert,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pathway, PathwayStep, StepState } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { DecisionSupportDisclaimer, DemoTag } from "@/components/shared/status";
import { PATHWAYS, pathwayById } from "@/lib/mock/pathways";
import { departmentName } from "@/lib/mock/departments";
import { Badge } from "@/components/ui/badge";
import { Progress, riseItem, stagger } from "@/components/ui/primitives";

/* ── Step-state vocabulary — icon + text label, never colour alone ────── */

interface StateMeta {
  label: string;
  icon: LucideIcon;
  node: string;
  chip: string;
  text: string;
  description: string;
}

const STATE_META: Record<StepState, StateMeta> = {
  DONE: {
    label: "Done",
    icon: CheckCircle2,
    node: "border-emerald-400/50 bg-emerald-400/15 text-emerald-300",
    chip: "border-emerald-400/35 bg-emerald-400/10 text-emerald-300",
    text: "text-emerald-300",
    description: "Step completed inside the simulation.",
  },
  ACTIVE: {
    label: "Active",
    icon: LoaderCircle,
    node: "border-cyan-400/50 bg-cyan-400/15 text-cyan-300",
    chip: "border-cyan-400/35 bg-cyan-400/10 text-cyan-300",
    text: "text-cyan-300",
    description: "In progress in the demo right now.",
  },
  QUEUED: {
    label: "Queued",
    icon: Clock,
    node: "border-white/25 bg-white/[0.06] text-slate-300",
    chip: "border-white/15 bg-white/[0.05] text-slate-300",
    text: "text-slate-300",
    description: "Waiting on the steps ahead of it.",
  },
  BLOCKED: {
    label: "Blocked",
    icon: ShieldAlert,
    node: "border-red-500/50 bg-red-500/15 text-red-300",
    chip: "border-red-500/40 bg-red-500/10 text-red-300",
    text: "text-red-300",
    description: "Held by a simulated capacity constraint.",
  },
};

const STATE_ORDER: StepState[] = ["DONE", "ACTIVE", "QUEUED", "BLOCKED"];

const countState = (steps: PathwayStep[], state: StepState) =>
  steps.filter((s) => s.state === state).length;

/* ── Strip totals ─────────────────────────────────────────────────────── */

const TOTAL_COHORT = PATHWAYS.reduce((sum, p) => sum + p.cohort, 0);
const MEAN_ADHERENCE = Math.round(
  PATHWAYS.reduce((sum, p) => sum + p.adherence, 0) / PATHWAYS.length,
);
const ACTIVE_STEPS = PATHWAYS.reduce((sum, p) => sum + countState(p.steps, "ACTIVE"), 0);
const BLOCKED_STEPS = PATHWAYS.reduce((sum, p) => sum + countState(p.steps, "BLOCKED"), 0);

/* ── Small stat block ─────────────────────────────────────────────────── */

function StatBlock({
  label,
  value,
  hint,
  children,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-slate-800/50 p-3.5 shadow-inner-faint">
      <p className="label-caps">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-slate-50 mono-nums">
        {value}
      </p>
      {children}
      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{hint}</p>
    </div>
  );
}

/* ── Selectable pathway card ──────────────────────────────────────────── */

function PathwayCard({
  pathway,
  selected,
  onSelect,
}: {
  pathway: Pathway;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group w-full rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight",
        selected
          ? "border-cyan-400/45 bg-cyan-400/[0.07] shadow-glow"
          : "border-white/[0.06] bg-navy/80 shadow-panel hover:border-white/[0.14]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="label-caps text-cyan-300/80">{pathway.code}</span>
          <span className="mt-1 block font-display text-sm font-semibold text-slate-50">
            {pathway.name}
          </span>
        </div>
        {selected ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-cyan-400/40 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-200">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            Selected
          </span>
        ) : (
          <ChevronRight
            className="h-4 w-4 shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        )}
      </div>

      <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
        <span className="mono-nums">{pathway.cohort} cohort</span>
        <span className="h-3 w-px bg-white/10" aria-hidden="true" />
        <span className="mono-nums">{pathway.adherence}% adherence</span>
        <span className="h-3 w-px bg-white/10" aria-hidden="true" />
        <span className="mono-nums">{pathway.averageCycle} average cycle</span>
      </span>
    </button>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function PathwaysPage() {
  const [selectedId, setSelectedId] = React.useState<string>(PATHWAYS[0].id);
  const selected = pathwayById(selectedId) ?? PATHWAYS[0];

  const doneCount = countState(selected.steps, "DONE");

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="space-y-6"
    >
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Workflow className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            Command center · Pathways
          </span>
        }
        title="Pathway Orchestration"
        description="Simulated workflow templates and their step state. Pathways describe sequencing and ownership only — they contain no orders, protocols or clinical guidance, and every cohort figure is fictional demo data."
        actions={
          <>
            <Badge variant="outline" size="lg">
              {PATHWAYS.length} templates
            </Badge>
            <DemoTag />
          </>
        }
      />

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          index={0}
          label="Pathways in demo"
          value={PATHWAYS.length}
          unit="templates"
          icon={Workflow}
          tone="cyan"
          spark={PATHWAYS.map((p) => p.adherence)}
          caption="workflow only"
        />
        <MetricCard
          index={1}
          label="Cohort in scope"
          value={TOTAL_COHORT}
          unit="episodes"
          delta={2.4}
          icon={Users}
          tone="blue"
          spark={PATHWAYS.map((p) => p.cohort)}
          caption="fictional subjects"
        />
        <MetricCard
          index={2}
          label="Mean adherence"
          value={MEAN_ADHERENCE}
          unit="%"
          delta={1.2}
          icon={BadgeCheck}
          tone="mint"
          spark={PATHWAYS.map((p) => p.adherence)}
          caption="across all templates"
        />
        <MetricCard
          index={3}
          label="Steps active now"
          value={ACTIVE_STEPS}
          unit="steps"
          icon={LoaderCircle}
          tone="cyan"
          spark={PATHWAYS.map((p) => p.steps.length)}
          caption="in progress"
        />
        <MetricCard
          index={4}
          label="Steps blocked"
          value={BLOCKED_STEPS}
          unit="steps"
          delta={-1}
          deltaInvert
          icon={ShieldAlert}
          tone="amber"
          spark={PATHWAYS.map((p) => countState(p.steps, "BLOCKED"))}
          caption="capacity hold"
        />
      </div>

      {/* ── Pathway list + timeline ───────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        {/* Left — selectable pathway cards */}
        <section aria-label="Selectable pathways" className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="label-caps">Select a pathway</h2>
            <span className="text-[11px] text-slate-500 mono-nums">
              {PATHWAYS.length} templates
            </span>
          </div>

          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2.5">
            {PATHWAYS.map((p) => (
              <motion.div key={p.id} variants={riseItem}>
                <PathwayCard
                  pathway={p}
                  selected={p.id === selected.id}
                  onSelect={() => setSelectedId(p.id)}
                />
              </motion.div>
            ))}
          </motion.div>

          <p className="text-[11px] leading-relaxed text-slate-500">
            Templates are demonstration workflow steps only — no protocol, order set or guideline is
            reproduced here.
          </p>
        </section>

        {/* Right — selected pathway timeline */}
        <motion.section
          key={selected.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-xl border border-white/[0.06] bg-navy/80 shadow-panel"
          aria-label={`${selected.name} step timeline`}
        >
          {/* Panel header */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.06] p-4 sm:p-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="cyan">{selected.code}</Badge>
                <Badge variant="outline">{departmentName(selected.departmentId)}</Badge>
              </div>
              <h2 className="mt-2 font-display text-lg font-semibold tracking-tight text-slate-50">
                {selected.name}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                <span className="mono-nums">{doneCount}</span> of{" "}
                <span className="mono-nums">{selected.steps.length}</span> steps complete · workflow
                sequencing only
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
              <Workflow className="h-3 w-3" aria-hidden="true" />
              Simulated pathway
            </span>
          </div>

          {/* Stats: cohort · adherence · average cycle */}
          <div className="grid gap-3 border-b border-white/[0.06] p-4 sm:grid-cols-3 sm:p-5">
            <StatBlock
              label="Cohort size"
              value={selected.cohort}
              hint="Fictional episodes in the demo cohort."
            />
            <StatBlock
              label="Adherence"
              value={
                <span>
                  {selected.adherence}
                  <span className="text-base text-slate-500">%</span>
                </span>
              }
              hint="Share of simulated steps completed in sequence."
            >
              <div aria-hidden="true" className="mt-2.5">
                <Progress value={selected.adherence} indicator="mint" />
              </div>
            </StatBlock>
            <StatBlock
              label="Average cycle"
              value={selected.averageCycle}
              hint="Simulated end-to-end duration across the cohort."
            />
          </div>

          {/* State counts */}
          <div className="flex flex-wrap gap-1.5 border-b border-white/[0.06] px-4 py-3 sm:px-5">
            {STATE_ORDER.map((s) => {
              const meta = STATE_META[s];
              const StateIcon = meta.icon;
              const count = countState(selected.steps, s);
              return (
                <span
                  key={s}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    meta.chip,
                  )}
                >
                  <StateIcon className="h-3 w-3" aria-hidden="true" />
                  {count} {meta.label}
                </span>
              );
            })}
          </div>

          {/* Vertical step timeline */}
          <motion.ol
            variants={stagger}
            initial="hidden"
            animate="show"
            className="relative space-y-1 px-4 py-5 sm:px-5"
          >
            {selected.steps.map((step, index) => {
              const meta = STATE_META[step.state];
              const StepIcon = meta.icon;
              const isLast = index === selected.steps.length - 1;
              return (
                <motion.li key={step.id} variants={riseItem} className="relative flex gap-3 pb-4 last:pb-0">
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[15px] top-9 h-[calc(100%-2.25rem)] w-px bg-white/[0.09]"
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                      meta.node,
                    )}
                    aria-hidden="true"
                  >
                    <StepIcon
                      className={cn("h-4 w-4", step.state === "ACTIVE" && "animate-spin")}
                    />
                  </span>

                  <div className="min-w-0 flex-1 rounded-lg border border-white/[0.06] bg-slate-800/50 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            meta.chip,
                          )}
                        >
                          <StepIcon
                            className={cn(
                              "h-3 w-3",
                              step.state === "ACTIVE" && "animate-spin",
                            )}
                            aria-hidden="true"
                          />
                          {meta.label}
                        </span>
                        <h3 className="text-sm font-medium text-slate-100">{step.label}</h3>
                      </div>
                      <span className="mono-nums text-[11px] text-slate-400">{step.duration}</span>
                    </div>

                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{step.detail}</p>

                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Users className="h-3 w-3 shrink-0" aria-hidden="true" />
                      Owner: <span className="text-slate-400">{step.owner}</span>
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </motion.ol>

          {/* Legend — icon + text for every state */}
          <div className="border-t border-white/[0.06] px-4 py-4 sm:px-5">
            <h3 className="label-caps">Step state legend</h3>
            <ul className="mt-2.5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {STATE_ORDER.map((s) => {
                const meta = STATE_META[s];
                const LegendIcon = meta.icon;
                return (
                  <li
                    key={s}
                    className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-slate-800/40 p-2.5"
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                        meta.node,
                      )}
                      aria-hidden="true"
                    >
                      <LegendIcon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className={cn("text-[10px] font-bold uppercase tracking-wider", meta.text)}>
                        {meta.label}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                        {meta.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Safety disclaimer */}
          <div className="space-y-2.5 border-t border-white/[0.06] p-4 sm:p-5">
            <p className="text-xs leading-relaxed text-slate-400">
              Pathways are workflow-orchestration templates only: they sequence steps, owners and
              hand-offs. They never contain orders, protocols or clinical guidance, and no step output
              is a diagnosis.
            </p>
            <DecisionSupportDisclaimer />
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
