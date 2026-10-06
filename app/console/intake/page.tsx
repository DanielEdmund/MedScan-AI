"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  Cpu,
  FileText,
  FlaskConical,
  Info,
  Layers,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, NumberInput, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator, Checkbox, Progress, stagger, riseItem } from "@/components/ui/primitives";
import { PageHeader } from "@/components/shared/page-header";
import {
  ClassificationPill,
  DecisionSupportDisclaimer,
  DemoTag,
  SeverityBadge,
} from "@/components/shared/status";
import { Badge as UIBadge } from "@/components/ui/badge";
import {
  DEFAULT_INTAKE_VALUES,
  INTAKE_FLAGS,
  INTAKE_STEPS,
  intakeSchema,
  type IntakeFormValues,
} from "@/lib/validation/intake";
import { DEPARTMENTS, DEPARTMENT_OPTIONS } from "@/lib/mock/departments";
import { classifyWorkflow, type ClassificationResult } from "@/lib/decision-support";
import { useIntakeStore } from "@/lib/store/intake-store";
import { useQueueStore } from "@/lib/store/queue-store";
import type { IntakeSubmission, QueueTicket } from "@/lib/types";
import { DEMO_BANNER } from "@/lib/types";
import { cn, pad } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const MODALITIES = ["CT", "MRI", "X-RAY", "ULTRASOUND", "LAB", "VITALS", "NONE"] as const;
const ARRIVAL_MODES = [
  { value: "WALK_IN", label: "Walk-in" },
  { value: "AMBULANCE", label: "Ambulance (simulated)" },
  { value: "TRANSFER", label: "Transfer (simulated)" },
  { value: "REFERRAL", label: "Referral (simulated)" },
] as const;

/* ── Field shell ─────────────────────────────────────────────────────── */

function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={undefined}>
          {label}
          {required && <span className="ml-1 text-cyan-400">*</span>}
        </Label>
        {hint && <span className="text-[10.5px] text-slate-600">{hint}</span>}
      </div>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 text-[11.5px] font-medium text-red-400"
          >
            <span className="h-1 w-1 rounded-full bg-red-500" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function VitalsField({
  label,
  unit,
  error,
  children,
}: {
  label: string;
  unit: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-midnight/50 p-3">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <span className="text-[10px] text-slate-600">{unit}</span>
      </div>
      {children}
      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-red-400">
          <span className="mr-1 inline-block h-1 w-1 rounded-full bg-red-500 align-middle" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function IntakePage() {
  const [stepIndex, setStepIndex] = React.useState(0);
  const [result, setResult] = React.useState<ClassificationResult | null>(null);
  const [committed, setCommitted] = React.useState<{ code: string; result: ClassificationResult } | null>(null);
  const addSubmission = useIntakeStore((s) => s.add);
  const seq = useIntakeStore((s) => s.seq);
  const addTicket = useQueueStore((s) => s.addTicket);

  const step = INTAKE_STEPS[stepIndex];
  const isLast = stepIndex === INTAKE_STEPS.length - 1;

  const {
    register,
    handleSubmit,
    control,
    trigger,
    getValues,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: DEFAULT_INTAKE_VALUES,
    mode: "onTouched",
  });

  const runClassifier = React.useCallback((): ClassificationResult => {
    const v = getValues();
    return classifyWorkflow({
      vitals: v.vitals,
      arrivalMode: v.arrivalMode,
      symptomDuration: v.symptomDuration,
      departmentId: v.departmentId,
      flags: v.flags,
    });
  }, [getValues]);

  const goNext = async () => {
    const fields = step.fields.map(String);
    const ok = await trigger(fields as never, { shouldFocus: true });
    if (!ok) return;
    if (isLast) return;
    setStepIndex((i) => Math.min(i + 1, INTAKE_STEPS.length - 1));
  };

  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const onClassify = async () => {
    const ok = await trigger();
    if (!ok) return;
    setResult(runClassifier());
  };

  const onCommit = handleSubmit((values) => {
    const r = result ?? runClassifier();
    const code = `A-${101 + seq + 40}`;
    const mrn = `MSA-${String(51000 + seq * 7).padStart(6, "0")}`;
    const now = Date.now();

    const ticket: QueueTicket = {
      id: `q-intake-${now}`,
      ticketCode: code,
      mrn,
      displayName: values.displayName,
      age: values.age,
      sex: values.sex,
      departmentId: values.departmentId as QueueTicket["departmentId"],
      stage: "REGISTERED",
      status: "WAITING",
      classification: r.classification,
      acuity: r.classification === "IMMEDIATE CLINICAL REVIEW" ? 1 : r.classification === "PRIORITY" ? 2 : 3,
      arrivalAt: now,
      elapsedMinutes: 0,
      waitMinutes: 0,
      estimatedMinutes: 12 + Math.round(r.score / 4),
      zone: "A1",
      clinician: null,
      note: "Registered from the simulated intake terminal",
    };

    const submission: IntakeSubmission = {
      id: `sub-${now}`,
      createdAt: now,
      mrn,
      displayName: values.displayName,
      age: values.age,
      sex: values.sex,
      departmentId: values.departmentId as IntakeSubmission["departmentId"],
      modality: values.modality,
      arrivalMode: values.arrivalMode,
      chiefComplaint: values.chiefComplaint,
      symptomDuration: values.symptomDuration,
      vitals: values.vitals,
      flags: values.flags,
      classification: r.classification,
      confidence: r.confidence,
      reasons: r.reasons,
      assignedQueueId: ticket.id,
      clinicianReviewed: false,
    };

    addTicket(ticket);
    addSubmission(submission);
    setCommitted({ code, result: r });
  });

  const resetAll = () => {
    reset(DEFAULT_INTAKE_VALUES);
    setStepIndex(0);
    setResult(null);
    setCommitted(null);
  };

  /* ── Success screen ─────────────────────────────────────────────── */
  if (committed) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          eyebrow={DEMO_BANNER}
          title="Intake staged"
          description="The fictional subject has been added to the simulated queue. Nothing was transmitted anywhere."
          actions={<DemoTag />}
        />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <Card className="border-emerald-400/25">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/35 bg-emerald-400/10 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-semibold text-slate-50">
                    Ticket <span className="text-cyan-300 mono-nums">{committed.code}</span> created
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Queued under the routing label below. A clinician must still review the subject.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <ClassificationPill value={committed.result.classification} />
                    <UIBadge variant="muted">confidence {committed.result.confidence}%</UIBadge>
                    <UIBadge variant="muted">simulated score {committed.result.score}</UIBadge>
                  </div>

                  <Separator className="my-4" />

                  <p className="label-caps mb-2">Factors considered</p>
                  <ul className="space-y-1.5">
                    {committed.result.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12.5px] text-slate-400">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                        {r}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4">
                    <DecisionSupportDisclaimer />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button asChild>
                      <Link href="/console/queue">
                        View on queue board <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="secondary" onClick={resetAll}>
                      <RotateCcw className="h-4 w-4" />
                      Start another intake
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/console/decision-support">Open decision support</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ── Wizard ─────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            <FlaskConical className="h-3.5 w-3.5 text-cyan-400" />
            Simulated intake terminal
          </span>
        }
        title="Patient Intake"
        description="Capture a fictional subject, the reported concern and prototype observations — then stage it on the workflow board."
        actions={<DemoTag />}
      />

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* Stepper rail */}
        <aside className="lg:sticky lg:top-[112px] lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-cyan-300" />
                Intake sequence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {INTAKE_STEPS.map((s, i) => {
                const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "todo";
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => i < stepIndex && setStepIndex(i)}
                    disabled={i > stepIndex}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40",
                      state === "todo" ? "cursor-not-allowed opacity-45" : "hover:bg-white/[0.04]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold mono-nums",
                        state === "done"
                          ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                          : state === "active"
                            ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-300"
                            : "border-white/12 bg-white/[0.04] text-slate-500",
                      )}
                    >
                      {state === "done" ? <Check className="h-3.5 w-3.5" /> : pad(i + 1)}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block text-[13px] font-semibold",
                          state === "active" ? "text-cyan-200" : "text-slate-300",
                        )}
                      >
                        {s.title}
                      </span>
                      <span className="block text-[11px] leading-snug text-slate-500">
                        {s.caption}
                      </span>
                    </span>
                  </button>
                );
              })}

              <Separator className="my-3" />
              <Progress value={((stepIndex + 1) / INTAKE_STEPS.length) * 100} />
              <p className="pt-2 text-[10.5px] text-slate-600">
                Step {stepIndex + 1} of {INTAKE_STEPS.length}
              </p>
            </CardContent>
          </Card>

          <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] p-3.5">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Invented data only
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-amber-100/70">
              Make up names and values. Do not enter real personal or clinical information — this
              prototype stores nothing, but the habit matters.
            </p>
          </div>
        </aside>

        {/* Form */}
        <div>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-white/[0.06] pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  {stepIndex === 0 && <FileText className="h-4 w-4 text-cyan-300" />}
                  {stepIndex === 1 && <Layers className="h-4 w-4 text-cyan-300" />}
                  {stepIndex === 2 && <Cpu className="h-4 w-4 text-cyan-300" />}
                  {stepIndex === 3 && <Sparkles className="h-4 w-4 text-cyan-300" />}
                  {step.title}
                </CardTitle>
                <p className="mt-1 text-xs text-slate-500">{step.caption}</p>
              </div>
              <UIBadge variant="outline" className="hidden sm:inline-flex">
                {DEMO_BANNER}
              </UIBadge>
            </CardHeader>

            <CardContent className="pt-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, ease }}
                >
                  {/* STEP 1 — subject */}
                  {step.id === "subject" && (
                    <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2">
                      <motion.div variants={riseItem} className="sm:col-span-2">
                        <Field label="Fictional subject name" required error={errors.displayName?.message} hint="e.g. Nova Vance">
                          <Input placeholder="Invent a name…" {...register("displayName")} />
                        </Field>
                      </motion.div>
                      <motion.div variants={riseItem}>
                        <Field label="Age" required error={errors.age?.message} hint="years">
                          <NumberInput {...register("age", { valueAsNumber: true })} />
                        </Field>
                      </motion.div>
                      <motion.div variants={riseItem}>
                        <Field label="Recorded sex" required error={errors.sex?.message}>
                          <Controller
                            control={control}
                            name="sex"
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger aria-label="Recorded sex">
                                  <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="F">F</SelectItem>
                                  <SelectItem value="M">M</SelectItem>
                                  <SelectItem value="X">X / undisclosed</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </Field>
                      </motion.div>
                      <motion.div variants={riseItem} className="sm:col-span-2 rounded-lg border border-white/[0.07] bg-midnight/50 p-3.5">
                        <p className="flex items-center gap-2 text-[11.5px] text-slate-400">
                          <Info className="h-3.5 w-3.5 text-cyan-400" />
                          A fictional MRN is generated automatically when the packet is committed.
                          No registry, EHR or identity service is contacted.
                        </p>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* STEP 2 — encounter */}
                  {step.id === "encounter" && (
                    <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2">
                      <motion.div variants={riseItem}>
                        <Field label="Receiving department" required error={errors.departmentId?.message}>
                          <Controller
                            control={control}
                            name="departmentId"
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger aria-label="Receiving department">
                                  <SelectValue placeholder="Select department…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DEPARTMENT_OPTIONS.map((d) => (
                                    <SelectItem key={d.value} value={d.value}>
                                      <span className="mr-2 font-bold text-cyan-300">{d.code}</span>
                                      {d.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </Field>
                      </motion.div>

                      <motion.div variants={riseItem}>
                        <Field label="Requested modality" required error={errors.modality?.message}>
                          <Controller
                            control={control}
                            name="modality"
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger aria-label="Requested modality">
                                  <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {MODALITIES.map((m) => (
                                    <SelectItem key={m} value={m}>
                                      {m === "NONE" ? "None requested" : m}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </Field>
                      </motion.div>

                      <motion.div variants={riseItem} className="sm:col-span-2">
                        <Field label="Arrival mode" required error={errors.arrivalMode?.message}>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {ARRIVAL_MODES.map((m) => (
                              <Controller
                                key={m.value}
                                control={control}
                                name="arrivalMode"
                                render={({ field }) => (
                                  <button
                                    type="button"
                                    onClick={() => field.onChange(m.value)}
                                    className={cn(
                                      "rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40",
                                      field.value === m.value
                                        ? "border-cyan-400/50 bg-cyan-400/12 text-cyan-200"
                                        : "border-white/10 bg-midnight/50 text-slate-400 hover:border-white/25",
                                    )}
                                  >
                                    {m.label}
                                  </button>
                                )}
                              />
                            ))}
                          </div>
                        </Field>
                      </motion.div>

                      <motion.div variants={riseItem} className="sm:col-span-2">
                        <Field
                          label="Reported concern (verbatim)"
                          required
                          error={errors.chiefComplaint?.message}
                          hint="free text, no clinical coding"
                        >
                          <Textarea
                            placeholder="What the fictional subject reports…"
                            {...register("chiefComplaint")}
                          />
                        </Field>
                      </motion.div>

                      <motion.div variants={riseItem}>
                        <Field label="Reported duration" required error={errors.symptomDuration?.message} hint="e.g. '3 days'">
                          <Input placeholder="2 hours" {...register("symptomDuration")} />
                        </Field>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* STEP 3 — observations */}
                  {step.id === "observations" && (
                    <div className="space-y-5">
                      <div>
                        <p className="label-caps mb-2.5">Prototype observations</p>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {(
                            [
                              ["systolic", "Systolic", "mmHg"],
                              ["diastolic", "Diastolic", "mmHg"],
                              ["heartRate", "Heart rate", "bpm"],
                              ["spo2", "Saturation", "%"],
                              ["temp", "Temperature", "°C"],
                              ["respRate", "Respiratory", "/min"],
                            ] as const
                          ).map(([key, label, unit]) => (
                            <VitalsField
                              key={key}
                              label={label}
                              unit={unit}
                              error={errors.vitals?.[key]?.message as string | undefined}
                            >
                              <NumberInput step={key === "temp" ? "0.1" : "1"} {...register(`vitals.${key}`, { valueAsNumber: true })} />
                            </VitalsField>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="label-caps mb-2.5">Intake flags</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {INTAKE_FLAGS.map((f) => {
                            const checked = (getValues("flags") ?? []).includes(f.id);
                            return (
                              <Controller
                                key={f.id}
                                control={control}
                                name="flags"
                                render={({ field }) => {
                                  const list = field.value ?? [];
                                  const on = list.includes(f.id);
                                  return (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        field.onChange(
                                          on ? list.filter((x) => x !== f.id) : [...list, f.id],
                                        )
                                      }
                                      className={cn(
                                        "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40",
                                        on
                                          ? "border-cyan-400/45 bg-cyan-400/[0.09]"
                                          : "border-white/[0.08] bg-midnight/50 hover:border-white/20",
                                        checked && on && "border-cyan-400/45",
                                      )}
                                    >
                                      <span className="mt-0.5">
                                        <Checkbox checked={on} aria-label={f.label} />
                                      </span>
                                      <span>
                                        <span className="block text-[12.5px] font-medium text-slate-200">
                                          {f.label}
                                        </span>
                                        <span className="block text-[11px] text-slate-500">{f.hint}</span>
                                      </span>
                                    </button>
                                  );
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-lg border border-blue-500/25 bg-blue-500/[0.07] p-3.5">
                        <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-blue-200/90">
                          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
                          These values are typed by hand into a prototype form. No vital-sign device,
                          monitor or bedside system is read by this application.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 4 — review */}
                  {step.id === "review" && (
                    <div className="space-y-5">
                      <ReviewSummary watch={watch} />

                      <div className="rounded-lg border border-white/[0.08] bg-midnight/50 p-4">
                        <Controller
                          control={control}
                          name="acknowledged"
                          render={({ field }) => (
                            <label className="flex cursor-pointer items-start gap-3">
                              <span className="mt-0.5">
                                <Checkbox checked={field.value} aria-label="Confirm simulated record" />
                              </span>
                              <span
                                onClick={() => field.onChange(!field.value)}
                                className="text-[12.5px] leading-relaxed text-slate-300"
                              >
                                I confirm this packet contains{" "}
                                <span className="font-semibold text-slate-100">invented demo data</span>{" "}
                                and that nothing here represents a real person.
                              </span>
                            </label>
                          )}
                        />
                        {errors.acknowledged && (
                          <p className="mt-2 text-[11.5px] font-medium text-red-400">
                            {errors.acknowledged.message}
                          </p>
                        )}
                      </div>

                      {!result ? (
                        <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/[0.05] p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
                                <Cpu className="h-4 w-4 text-cyan-300" />
                                Ready to run workflow classifier
                              </p>
                              <p className="mt-1 text-[12px] leading-relaxed text-cyan-100/70">
                                Produces a routing label only — never a diagnosis.
                              </p>
                            </div>
                            <Button variant="cyan" onClick={onClassify}>
                              <Sparkles className="h-4 w-4" />
                              Classify workflow
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <ClassificationResultCard result={result} onReclassify={() => setResult(null)} />
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>

            {/* Wizard footer */}
            <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] p-5">
              <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="flex items-center gap-2">
                {stepIndex < INTAKE_STEPS.length - 1 ? (
                  <Button onClick={goNext}>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={onCommit}
                    disabled={!result || isSubmitting}
                    variant="cyan"
                    title={!result ? "Run the classifier first" : "Commit to the simulated queue"}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Commit to simulated queue
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <div className="mt-4">
            <DecisionSupportDisclaimer />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Review summary ──────────────────────────────────────────────────── */

function ReviewSummary({ watch }: { watch: IntakeWatch }) {
  const values = useFormValuesSnapshot(watch);
  const dept = DEPARTMENTS.find((d) => d.id === values.departmentId);

  const rows: Array<[string, string]> = [
    ["Subject", values.displayName || "—"],
    ["Age / sex", `${values.age} · ${values.sex}`],
    ["Department", dept ? `${dept.code} · ${dept.name}` : "—"],
    ["Modality", values.modality === "NONE" ? "None requested" : values.modality],
    ["Arrival", values.arrivalMode.replace("_", " ").toLowerCase()],
    ["Duration", values.symptomDuration || "—"],
    ["Concern", values.chiefComplaint || "—"],
    [
      "Observations",
      `${values.vitals.systolic}/${values.vitals.diastolic} mmHg · ${values.vitals.heartRate} bpm · SpO₂ ${values.vitals.spo2}% · ${values.vitals.temp}°C · RR ${values.vitals.respRate}`,
    ],
    ["Flags", values.flags.length ? values.flags.join(", ") : "none set"],
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08]">
      <div className="flex items-center justify-between border-b border-white/[0.07] bg-midnight/60 px-4 py-2.5">
        <span className="label-caps">Packet summary</span>
        <span className="text-[10.5px] text-slate-600">local only</span>
      </div>
      <dl className="divide-y divide-white/[0.05]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-4 px-4 py-2.5 sm:grid sm:grid-cols-[150px_1fr]">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{k}</dt>
            <dd className="min-w-0 break-words text-[12.5px] text-slate-200">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Lightweight subscription to the whole form for the review summary. */
type IntakeWatch = ReturnType<typeof useForm<IntakeFormValues>>["watch"];

function useFormValuesSnapshot(watch: IntakeWatch) {
  const [values, setValues] = React.useState<IntakeFormValues>(DEFAULT_INTAKE_VALUES);
  React.useEffect(() => {
    const sub = watch((v) => setValues({ ...DEFAULT_INTAKE_VALUES, ...(v as IntakeFormValues) }));
    return () => sub.unsubscribe();
  }, [watch]);
  return values;
}

/* ── Classification result ───────────────────────────────────────────── */

function ClassificationResultCard({
  result,
  onReclassify,
}: {
  result: ClassificationResult;
  onReclassify: () => void;
}) {
  const tone =
    result.classification === "IMMEDIATE CLINICAL REVIEW"
      ? "border-red-500/30 bg-red-500/[0.06]"
      : result.classification === "PRIORITY"
        ? "border-amber-400/30 bg-amber-400/[0.06]"
        : "border-emerald-400/30 bg-emerald-400/[0.06]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
      className={cn("overflow-hidden rounded-xl border", tone)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] bg-midnight/40 px-4 py-3">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
          Workflow classification
        </span>
        <div className="flex items-center gap-2">
          <Badge variant="muted">confidence {result.confidence}%</Badge>
          <Button size="sm" variant="ghost" onClick={onReclassify}>
            <RotateCcw className="h-3.5 w-3.5" />
            Re-run
          </Button>
        </div>
      </div>

      <div className="p-4">
        <ClassificationPill value={result.classification} />
        <p className="mt-3 text-[12.5px] leading-relaxed text-slate-400">{result.statement}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/[0.07] bg-midnight/50 p-3">
            <p className="label-caps mb-2">Factors observed</p>
            <ul className="space-y-2">
              {result.factors.map((f, i) => (
                <li key={i}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[12px] text-slate-300">{f.label}</span>
                    <span className="text-[11.5px] font-semibold text-slate-200 mono-nums">
                      {f.observed}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="text-[10.5px] text-slate-600">demo ref {f.reference}</span>
                    <Badge
                      size="sm"
                      variant={f.level === "HIGH" ? "danger" : f.level === "ELEVATED" ? "warning" : "success"}
                    >
                      {f.level}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-white/[0.07] bg-midnight/50 p-3">
            <p className="label-caps mb-2">Why this label</p>
            <ul className="space-y-1.5">
              {result.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-[11.5px] leading-relaxed text-slate-400">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                  {r}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {result.classification === "IMMEDIATE CLINICAL REVIEW" && (
                <SeverityBadge value="URGENT" />
              )}
              {result.classification === "PRIORITY" && <SeverityBadge value="ACTION" />}
              {result.classification === "ROUTINE" && <SeverityBadge value="INFO" />}
              <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                routing only
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <DecisionSupportDisclaimer />
        </div>
      </div>
    </motion.div>
  );
}
