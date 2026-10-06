"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Cpu,
  Info,
  ListChecks,
  Lock,
  RotateCcw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, NumberInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator, Progress, stagger, riseItem } from "@/components/ui/primitives";
import { PageHeader, SectionHeading, EmptyState } from "@/components/shared/page-header";
import {
  ClassificationPill,
  DecisionSupportDisclaimer,
  DemoTag,
  Freshness,
} from "@/components/shared/status";
import { classifyWorkflow, type ClassificationResult } from "@/lib/decision-support";
import { useIntakeStore } from "@/lib/store/intake-store";
import { CLASSIFICATION_DISCLAIMER, WORKFLOW_CLASSES, DEMO_BANNER } from "@/lib/types";
import { cn, pad } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const NEVER_LIST = [
  "Diagnose patients",
  "Prescribe medication",
  "Recommend treatment",
  "Replace clinicians",
  "Claim medical certainty",
  "Determine a patient's disease",
];

const BOUNDARIES = [
  { label: "Oxygen saturation", key: "spo2" as const, unit: "%", ref: "≥ 94 (demo)" },
  { label: "Heart rate", key: "heartRate" as const, unit: "bpm", ref: "48 – 110 (demo)" },
  { label: "Systolic pressure", key: "systolic" as const, unit: "mmHg", ref: "92 – 170 (demo)" },
  { label: "Temperature", key: "temp" as const, unit: "°C", ref: "< 38.4 (demo)" },
  { label: "Respiratory rate", key: "respRate" as const, unit: "/min", ref: "≤ 24 (demo)" },
];

interface Inputs {
  spo2: number;
  heartRate: number;
  systolic: number;
  temp: number;
  respRate: number;
  arrivalMode: "WALK_IN" | "AMBULANCE" | "TRANSFER" | "REFERRAL";
  symptomDuration: string;
  flags: string[];
}

const DEFAULTS: Inputs = {
  spo2: 97,
  heartRate: 78,
  systolic: 124,
  temp: 36.9,
  respRate: 16,
  arrivalMode: "WALK_IN",
  symptomDuration: "3 days",
  flags: [],
};

const FLAG_OPTIONS = [
  { id: "chest", label: "Chest discomfort" },
  { id: "breathlessness", label: "Breathlessness" },
  { id: "fall", label: "Recent fall" },
  { id: "escalation", label: "Coordinator escalation" },
  { id: "paediatric", label: "Paediatric routing" },
];

export default function DecisionSupportPage() {
  const [inputs, setInputs] = React.useState<Inputs>(DEFAULTS);
  const [result, setResult] = React.useState<ClassificationResult | null>(null);
  const submissions = useIntakeStore((s) => s.submissions);

  const run = () => {
    setResult(
      classifyWorkflow({
        vitals: {
          systolic: inputs.systolic,
          diastolic: 80,
          heartRate: inputs.heartRate,
          spo2: inputs.spo2,
          temp: inputs.temp,
          respRate: inputs.respRate,
        },
        arrivalMode: inputs.arrivalMode,
        symptomDuration: inputs.symptomDuration,
        departmentId: "emergency",
        flags: inputs.flags,
      }),
    );
  };

  const set = <K extends keyof Inputs>(k: K, v: Inputs[K]) => setInputs((p) => ({ ...p, [k]: v }));

  const toggleFlag = (id: string) =>
    setInputs((p) => ({
      ...p,
      flags: p.flags.includes(id) ? p.flags.filter((f) => f !== id) : [...p.flags, id],
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            <BrainCircuit className="h-3.5 w-3.5 text-cyan-400" />
            Workflow routing assistant · {DEMO_BANNER}
          </span>
        }
        title="Decision Support"
        description="An explainable routing helper. It organises submitted information into a workflow label so the demo queue can be sequenced — and nothing more."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/console/intake">
                Open intake terminal <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <DemoTag />
          </>
        }
      />

      {/* ── Safety guardrails ─────────────────────────────────────── */}
      <Card className="border-red-500/20">
        <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_1fr_auto]">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-red-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              This assistant never
            </p>
            <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
              {NEVER_LIST.map((n) => (
                <li key={n} className="flex items-start gap-2 text-[12.5px] text-slate-300">
                  <Lock className="mt-0.5 h-3 w-3 shrink-0 text-red-400/80" />
                  {n}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Permitted output
            </p>
            <div className="flex flex-wrap gap-2">
              {WORKFLOW_CLASSES.map((c) => (
                <ClassificationPill key={c} value={c} />
              ))}
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-slate-400">
              Each label maps to a queue lane, not a clinical conclusion. A clinician reviews every
              assessment before anything moves.
            </p>
            <div className="mt-3">
              <DecisionSupportDisclaimer compact />
            </div>
          </div>

          <div className="hidden w-px bg-white/8 lg:block" />
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        {/* ── Interactive sandbox ─────────────────────────────────── */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={riseItem}>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-white/[0.06] pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Cpu className="h-4 w-4 text-cyan-300" />
                    Routing sandbox
                  </CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    Type prototype values, then run the classifier locally.
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => { setInputs(DEFAULTS); setResult(null); }}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </CardHeader>

              <CardContent className="space-y-5 pt-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  {BOUNDARIES.map((b) => (
                    <div
                      key={b.key}
                      className="rounded-lg border border-white/[0.07] bg-midnight/50 p-3"
                    >
                      <div className="flex items-baseline justify-between gap-1">
                        <Label className="text-[10.5px]">{b.label}</Label>
                        <span className="text-[9.5px] text-slate-600">{b.unit}</span>
                      </div>
                      <div className="mt-1.5">
                        <NumberInput
                          step={b.key === "temp" ? "0.1" : "1"}
                          value={inputs[b.key]}
                          onChange={(e) => set(b.key, Number(e.target.value))}
                          aria-label={b.label}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-slate-600 mono-nums">ref {b.ref}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Arrival mode</Label>
                    <Select
                      value={inputs.arrivalMode}
                      onValueChange={(v) => set("arrivalMode", v as Inputs["arrivalMode"])}
                    >
                      <SelectTrigger aria-label="Arrival mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WALK_IN">Walk-in</SelectItem>
                        <SelectItem value="AMBULANCE">Ambulance (simulated)</SelectItem>
                        <SelectItem value="TRANSFER">Transfer (simulated)</SelectItem>
                        <SelectItem value="REFERRAL">Referral (simulated)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Reported duration</Label>
                    <Input
                      value={inputs.symptomDuration}
                      onChange={(e) => set("symptomDuration", e.target.value)}
                      placeholder="e.g. sudden onset"
                    />
                    <p className="text-[10px] text-slate-600">
                      Words like “sudden”, “rapid”, “acute”, “minutes” weight the routing label.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Intake flags</Label>
                  <div className="flex flex-wrap gap-2">
                    {FLAG_OPTIONS.map((f) => {
                      const on = inputs.flags.includes(f.id);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleFlag(f.id)}
                          aria-pressed={on}
                          className={cn(
                            "rounded-md border px-2.5 py-1.5 text-[11.5px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40",
                            on
                              ? "border-cyan-400/50 bg-cyan-400/12 text-cyan-200"
                              : "border-white/10 bg-midnight/50 text-slate-400 hover:border-white/25",
                          )}
                        >
                          {on && "✓ "}
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-4">
                  <Button variant="cyan" onClick={run}>
                    <Sparkles className="h-4 w-4" />
                    Run workflow classifier
                  </Button>
                  <span className="text-[11.5px] text-slate-500">
                    Runs entirely in your browser. Nothing is sent.
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Result */}
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key={result.generatedAt}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease }}
              >
                <Card className="border-cyan-400/25">
                  <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-white/[0.06] pb-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ListChecks className="h-4 w-4 text-cyan-300" />
                        Assessment summary
                      </CardTitle>
                      <p className="mt-1 text-xs text-slate-500">
                        Generated <Freshness at={result.generatedAt} />
                      </p>
                    </div>
                    <Badge variant="muted">score {result.score}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <ClassificationPill value={result.classification} />
                      <div className="min-w-[160px] flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">presentation confidence</span>
                          <span className="text-[11px] font-semibold text-slate-300 mono-nums">
                            {result.confidence}%
                          </span>
                        </div>
                        <Progress value={result.confidence} />
                      </div>
                    </div>

                    <p className="text-[13px] leading-relaxed text-slate-400">{result.statement}</p>

                    <div className="overflow-hidden rounded-lg border border-white/[0.07]">
                      <table className="w-full text-left text-[12.5px]">
                        <thead>
                          <tr className="bg-midnight/60 text-[10px] uppercase tracking-wider text-slate-500">
                            <th className="px-3 py-2 font-semibold">Factor</th>
                            <th className="px-3 py-2 font-semibold">Observed</th>
                            <th className="px-3 py-2 font-semibold">Demo reference</th>
                            <th className="px-3 py-2 text-right font-semibold">Weight</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                          {result.factors.map((f, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 text-slate-200">{f.label}</td>
                              <td className="px-3 py-2 font-semibold text-slate-100 mono-nums">
                                {f.observed}
                              </td>
                              <td className="px-3 py-2 text-slate-500 mono-nums">{f.reference}</td>
                              <td className="px-3 py-2 text-right">
                                <Badge
                                  size="sm"
                                  variant={
                                    f.level === "HIGH"
                                      ? "danger"
                                      : f.level === "ELEVATED"
                                        ? "warning"
                                        : "success"
                                  }
                                >
                                  {f.level}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <DecisionSupportDisclaimer />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState
                  icon={Scale}
                  title="No assessment yet"
                  description="Enter prototype values above and run the classifier to see an explainable routing label. No diagnosis is produced at any point."
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Right column ────────────────────────────────────────── */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={riseItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-emerald-300" />
                  Label guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    c: "ROUTINE" as const,
                    text: "The packet can proceed down the standard simulated lane with no re-sequencing.",
                    icon: BadgeCheck,
                  },
                  {
                    c: "PRIORITY" as const,
                    text: "Offer an earlier slot in the demo queue so a clinician sees the subject sooner.",
                    icon: TriangleAlert,
                  },
                  {
                    c: "IMMEDIATE CLINICAL REVIEW" as const,
                    text: "Flag the ticket to the charge desk for prompt human review. The label changes urgency of *review*, never of treatment.",
                    icon: Siren,
                  },
                ].map((g) => (
                  <div
                    key={g.c}
                    className="rounded-lg border border-white/[0.07] bg-midnight/50 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]">
                        <g.icon className="h-3.5 w-3.5 text-slate-300" />
                      </span>
                      <div className="min-w-0">
                        <ClassificationPill value={g.c} size="sm" />
                        <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">{g.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={riseItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-cyan-300" />
                  How a label is produced
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <ol className="space-y-2.5">
                  {[
                    "Inputs are compared against local demo thresholds.",
                    "Each crossing adds a weighted point to a routing score.",
                    "The score is bucketed into one of three workflow labels.",
                    "Every contributing factor is shown alongside the label.",
                    "A clinician reviews and may override the label entirely.",
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-cyan-400/30 bg-cyan-400/10 text-[10px] font-bold text-cyan-300 mono-nums">
                        {pad(i + 1)}
                      </span>
                      <span className="text-[12.5px] leading-relaxed text-slate-400">{s}</span>
                    </li>
                  ))}
                </ol>
                <Separator />
                <p className="text-[11.5px] leading-relaxed text-slate-500">
                  Thresholds are arbitrary prototype values chosen to make the demo legible. They are
                  not clinical limits, not guidelines, and must never be interpreted as such.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={riseItem}>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Recent simulated assessments</CardTitle>
                <Badge variant="muted">{submissions.length}</Badge>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <EmptyState
                    icon={BrainCircuit}
                    title="Nothing staged yet"
                    description="Commit an intake packet and it will appear here with its routing label."
                    action={
                      <Button asChild size="sm" variant="secondary">
                        <Link href="/console/intake">Open intake terminal</Link>
                      </Button>
                    }
                  />
                ) : (
                  <ul className="space-y-2">
                    {submissions.slice(0, 6).map((s) => (
                      <li
                        key={s.id}
                        className="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.06] bg-midnight/50 px-3 py-2.5"
                      >
                        <span className="text-[12.5px] font-medium text-slate-200">{s.displayName}</span>
                        <span className="text-[11px] text-slate-600 mono-nums">{s.mrn}</span>
                        <ClassificationPill value={s.classification} size="sm" />
                        <Freshness at={s.createdAt} className="ml-auto" />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={riseItem} className="rounded-xl border border-cyan-400/25 bg-gradient-to-br from-cyan-400/[0.07] to-transparent p-4">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200">
              <Scale className="h-3.5 w-3.5" />
              {CLASSIFICATION_DISCLAIMER}
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-400">
              MedScan AI is decision support in the literal sense: it presents organised information
              and defers every judgement to a qualified clinician.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
