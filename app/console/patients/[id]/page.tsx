"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Building2,
  ClipboardList,
  Clock,
  Database,
  FolderOpen,
  Gauge,
  ScrollText,
  SearchX,
  ShieldCheck,
  Timer,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Separator, riseItem, stagger } from "@/components/ui/primitives";
import { EmptyState, PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import {
  AcuityBadge,
  ClassificationPill,
  DecisionSupportDisclaimer,
  DemoTag,
  Freshness,
} from "@/components/shared/status";
import { departmentById } from "@/lib/mock/departments";
import { buildTimeline, patientById } from "@/lib/mock/patients";
import { cn, relativeTime, seededRandom } from "@/lib/utils";
import { DEMO_BANNER, type PatientState, type TimelineEvent } from "@/lib/types";

/* ── Local state chip — colour is always paired with text ─────────────── */

const STATE_STYLE: Record<PatientState, { label: string; className: string; dot: string }> = {
  ACTIVE: { label: "Active", className: "border-cyan-400/35 text-cyan-300", dot: "bg-cyan-400" },
  OBSERVATION: {
    label: "Observation",
    className: "border-amber-400/40 text-amber-300",
    dot: "bg-amber-400",
  },
  ADMITTED: { label: "Admitted", className: "border-blue-500/40 text-blue-400", dot: "bg-blue-500" },
  DISCHARGED: {
    label: "Discharged",
    className: "border-emerald-400/35 text-emerald-300",
    dot: "bg-emerald-400",
  },
};

function StateChip({ value }: { value: PatientState }) {
  const cfg = STATE_STYLE[value];
  return (
    <span
      title={`Simulated record state: ${cfg.label}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        cfg.className,
      )}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

/* ── Timeline kind chip ───────────────────────────────────────────────── */

const KIND_STYLE: Record<
  TimelineEvent["kind"],
  { label: string; className: string; dot: string }
> = {
  INTAKE: {
    label: "Intake",
    className: "border-white/12 bg-white/[0.05] text-slate-300",
    dot: "bg-slate-300",
  },
  ASSESS: {
    label: "Assess",
    className: "border-blue-500/35 bg-blue-500/10 text-blue-400",
    dot: "bg-blue-500",
  },
  IMAGING: {
    label: "Imaging",
    className: "border-violet-400/35 bg-violet-400/10 text-violet-300",
    dot: "bg-violet-400",
  },
  LAB: {
    label: "Lab",
    className: "border-emerald-400/35 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  REVIEW: {
    label: "Review",
    className: "border-cyan-400/35 bg-cyan-400/10 text-cyan-300",
    dot: "bg-cyan-400",
  },
  HANDOFF: {
    label: "Handoff",
    className: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
  },
  DISPOSITION: {
    label: "Disposition",
    className: "border-slate-400/35 bg-slate-400/10 text-slate-300",
    dot: "bg-slate-400",
  },
};

function KindChip({ kind }: { kind: TimelineEvent["kind"] }) {
  const cfg = KIND_STYLE[kind];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        cfg.className,
      )}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

/* ── Small definition field ───────────────────────────────────────────── */

function Field({
  label,
  value,
  mono = false,
  className,
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-midnight/50 px-3 py-2.5", className)}>
      <p className="label-caps truncate">{label}</p>
      <p
        className={cn(
          "mt-1 truncate text-[13px] text-slate-200",
          mono && "text-cyan-300 mono-nums",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/* ── Information index — provenance of every value on the page ────────── */

const SOURCES: Array<{ path: string; note: string }> = [
  {
    path: "lib/mock/patients.ts",
    note: "Fictional roster entry: name, MRN, age/sex, record state, allergies, care team, coverage, pathway and encounter id.",
  },
  {
    path: "lib/mock/departments.ts",
    note: "Department name, code, floor and lead shown in the workflow panel.",
  },
  {
    path: "lib/types.ts",
    note: "Workflow classification labels, acuity band type and the decision-support disclaimer text.",
  },
  {
    path: "lib/utils.ts",
    note: "Relative-time and numeric formatting helpers used for stamps and counters.",
  },
];

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function PatientRecordPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const patient = patientById(id);

  /* Not found — no hooks below this point, so routing stays predictable. */
  if (!patient) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow={
            <span className="flex items-center gap-2">
              {DEMO_BANNER} · Local mock roster
            </span>
          }
          title="Record not found"
          description="No fictional subject matches this identifier. Nothing was looked up in any external clinical system."
          actions={
            <Button asChild>
              <Link href="/console/patients">
                <ArrowLeft aria-hidden="true" />
                Back to registry
              </Link>
            </Button>
          }
        />
        <EmptyState
          icon={SearchX}
          title="Unknown record identifier"
          description="The requested id does not exist in the simulated patient roster. Return to the registry to pick one of the demo subjects."
          action={
            <Button asChild variant="secondary">
              <Link href="/console/patients">Return to patient registry</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const events = buildTimeline(patient.id);
  const department = departmentById(patient.departmentId);
  const registeredMinutes = Math.max(0, (Date.now() - patient.registeredAt) / 60_000);
  const hoursSince = (registeredMinutes / 60).toFixed(1);

  /* Deterministic mock values derived from the fictional encounter id. */
  const rand = seededRandom(Number(patient.encounterId.replace(/\D/g, "")) || 1);
  const simulatedWait = 4 + Math.floor(rand() * 41);

  const acuityTone: "red" | "amber" | "cyan" | "slate" =
    patient.acuity === 1 ? "red" : patient.acuity <= 2 ? "amber" : patient.acuity === 3 ? "cyan" : "slate";

  return (
    <div className="space-y-6">
      <Link
        href="/console/patients"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
      >
        <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
        Back to patient registry
      </Link>

      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            {DEMO_BANNER} · Fictional subject
            <span className="text-slate-600">|</span>
            <span className="mono-nums text-cyan-300">{patient.mrn}</span>
          </span>
        }
        title={patient.displayName}
        description={`Simulated encounter record for MRN ${patient.mrn}. Invented for this prototype — no real patient, chart or external system is involved.`}
        actions={<DemoTag />}
      />

      {/* ── Metric strip for this record ──────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          index={0}
          label="Simulated wait"
          value={simulatedWait}
          unit="min"
          icon={Timer}
          tone="amber"
          spark={[18, 22, 20, 26, 24, 21, 23, simulatedWait]}
          caption="mock estimate"
        />
        <MetricCard
          index={1}
          label="Acuity band"
          value={patient.acuity}
          unit="of 5"
          icon={Gauge}
          tone={acuityTone}
          spark={[3, 3, 2, 3, 2, 2, 3, patient.acuity]}
          caption="simulated routing band"
        />
        <MetricCard
          index={2}
          label="Events logged"
          value={events.length}
          unit="entries"
          icon={ClipboardList}
          tone="cyan"
          spark={[3, 4, 5, 5, 6, 6, 7, events.length]}
          caption="local timeline"
        />
        <MetricCard
          index={3}
          label="Hours since registration"
          value={hoursSince}
          unit="h"
          icon={Clock}
          tone="slate"
          spark={[0.4, 0.9, 1.4, 1.9, 2.4, 2.9, 3.4, Number(hoursSince)]}
          caption="relative to now"
        />
      </div>

      {/* ── Two-column record layout ──────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        {/* Left: identity + timeline */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={riseItem}>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <Users aria-hidden="true" className="h-4 w-4 text-cyan-300" />
                  Subject identity
                </CardTitle>
                <StateChip value={patient.state} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <Avatar name={patient.displayName} tone="blue" className="h-14 w-14 text-base" />
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-semibold tracking-tight text-slate-50">
                      {patient.displayName}
                    </p>
                    <p className="truncate text-sm text-cyan-300 mono-nums">{patient.mrn}</p>
                    <p className="mt-0.5 text-xs text-slate-500 mono-nums">
                      {patient.age} years · sex {patient.sex} · registered{" "}
                      {relativeTime(registeredMinutes)}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-amber-400/30 bg-amber-400/[0.07] px-3 py-2.5">
                  <p className="label-caps text-amber-300">Fictional record</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-100/80">
                    {patient.fictionalNote} Generated locally by the demo roster — no admission,
                    encounter or identifier exists outside this prototype.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Coverage (simulated)" value={patient.coverage} />
                  <Field label="Encounter id" value={patient.encounterId} mono />
                  <Field label="Registered" value={relativeTime(registeredMinutes)} />
                  <Field label="Assigned pathway" value={patient.pathway} />
                </div>

                <Separator />

                <div>
                  <p className="label-caps mb-2">Allergies on record (simulated)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.map((a) => (
                      <Badge
                        key={a}
                        variant={a.toLowerCase().startsWith("no known") ? "success" : "warning"}
                      >
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="label-caps mb-2">Care team (simulated)</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.careTeam.map((member) => (
                      <span
                        key={member}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-midnight/50 px-2.5 py-1.5"
                      >
                        <Avatar name={member} tone="cyan" className="h-6 w-6 text-[9px]" />
                        <span className="text-xs text-slate-300">{member}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={riseItem}>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <ScrollText aria-hidden="true" className="h-4 w-4 text-cyan-300" />
                  Encounter timeline
                </CardTitle>
                <span className="text-[11px] text-slate-500 mono-nums">
                  {events.length} simulated events
                </span>
              </CardHeader>
              <CardContent>
                <ol className="relative space-y-4 pl-7">
                  <span
                    aria-hidden="true"
                    className="absolute bottom-3 left-[7px] top-3 w-px bg-gradient-to-b from-cyan-400/40 via-white/10 to-transparent"
                  />
                  {events.map((ev) => (
                    <motion.li key={ev.id} variants={riseItem} className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute -left-7 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-navy bg-slate-700"
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", KIND_STYLE[ev.kind].dot)} />
                      </span>
                      <div className="rounded-lg border border-white/[0.06] bg-slate-800/50 p-3 transition-colors hover:border-white/[0.12]">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[13px] font-semibold text-slate-100">{ev.title}</p>
                          <KindChip kind={ev.kind} />
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-400">{ev.detail}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                          <span className="text-slate-400">{ev.actor}</span>
                          <span aria-hidden="true" className="text-slate-700">
                            ·
                          </span>
                          <span>{ev.role}</span>
                          <span className="ml-auto mono-nums">
                            {relativeTime(Math.max(0, (Date.now() - ev.at) / 60_000))}
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ol>
                <p className="mt-4 text-[11px] leading-relaxed text-slate-600">
                  Entries are drafted by the prototype from static templates. No device, order or
                  messaging system was contacted.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Right: workflow panel + information index */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={riseItem}>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <Activity aria-hidden="true" className="h-4 w-4 text-cyan-300" />
                  Workflow panel
                </CardTitle>
                <Freshness at={patient.lastUpdated} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <p className="label-caps">Routing classification</p>
                  <div>
                    <ClassificationPill value={patient.classification} />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-slate-800/60 px-3 py-2.5">
                  <span className="label-caps">Simulated acuity band</span>
                  <span className="flex items-center gap-2">
                    <AcuityBadge value={patient.acuity} />
                    <span className="text-xs text-slate-400 mono-nums">
                      {patient.acuity} of 5
                    </span>
                  </span>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-slate-800/60 px-3 py-2.5">
                  <Building2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-slate-100">
                      {department.name}
                    </p>
                    <p className="truncate text-[11px] text-slate-500 mono-nums">
                      {department.code} · {department.floor} · lead {department.lead}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-midnight/50 px-3 py-2.5">
                  <span className="label-caps">Record state</span>
                  <StateChip value={patient.state} />
                </div>

                <DecisionSupportDisclaimer />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={riseItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database aria-hidden="true" className="h-4 w-4 text-cyan-300" />
                  Information index
                </CardTitle>
                <CardDescription>
                  Which local mock datasets this record is assembled from
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2">
                  {SOURCES.map((s) => (
                    <li
                      key={s.path}
                      className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-midnight/50 px-3 py-2.5"
                    >
                      <FolderOpen
                        aria-hidden="true"
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs text-cyan-300 mono-nums">{s.path}</p>
                        <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                          {s.note}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex items-start gap-2.5 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.07] px-3 py-2.5">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300"
                  />
                  <p className="text-xs leading-relaxed text-emerald-100/90">
                    Nothing on this record was retrieved from any external system. No EHR, ADT, PACS,
                    LIS, appointment or device connection exists — every value is generated locally in
                    your browser from the datasets listed above.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      <p className="text-center text-[11px] text-slate-600">
        {DEMO_BANNER} · Fictional subject {patient.mrn} — no real record is represented.
      </p>
    </div>
  );
}
