"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  Clock,
  FlaskConical,
  Gauge,
  Layers,
  ListOrdered,
  Radar,
  ShieldCheck,
  Siren,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, Separator, stagger, riseItem } from "@/components/ui/primitives";
import { PageHeader, SectionHeading } from "@/components/shared/page-header";
import { MetricCard, Sparkline } from "@/components/shared/metric-card";
import {
  AcuityBadge,
  ClassificationPill,
  DecisionSupportDisclaimer,
  Freshness,
  QueueStatusChip,
  SeverityBadge,
  SignalDot,
  StageChip,
} from "@/components/shared/status";
import {
  FlowAreaChart,
  DonutChart,
  HorizontalBars,
} from "@/components/charts/chart-kit";
import {
  CLASSIFICATION_SPLIT,
  DEPARTMENT_LOAD,
  HEADLINE_KPI,
  HOURLY_VOLUME,
  OPS_ALERTS,
  ACTIVITY_SEED,
} from "@/lib/mock/analytics";
import { DEPARTMENTS, totalOccupancy } from "@/lib/mock/departments";
import { selectCounts, useQueueStore } from "@/lib/store/queue-store";
import { useSystemStore } from "@/lib/store/system-store";
import { relativeTime, formatMinutes } from "@/lib/utils";
import { DEMO_BANNER } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

export default function CommandCenterPage() {
  const tickets = useQueueStore((s) => s.tickets);
  const movements = useQueueStore((s) => s.movements);
  const counts = useQueueStore(selectCounts);
  const running = useSystemStore((s) => s.simulationRunning);
  const occ = totalOccupancy();

  const boardTickets = React.useMemo(
    () =>
      tickets
        .filter((t) => t.status !== "COMPLETE")
        .sort((a, b) => a.acuity - b.acuity || b.waitMinutes - a.waitMinutes)
        .slice(0, 8),
    [tickets],
  );

  const alertCount = OPS_ALERTS.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            <SignalDot tone={running ? "mint" : "amber"} pulse={running} />
            {running ? "Live simulation running" : "Simulation paused"} · {DEMO_BANNER}
          </span>
        }
        title="Command Center"
        description="A single operational picture across intake, screening workflow, queue flow and department capacity. All values are simulated locally in your browser."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/console/queue">
                <ListOrdered className="h-4 w-4" />
                Queue board
              </Link>
            </Button>
            <Button asChild>
              <Link href="/console/intake">
                <FlaskConical className="h-4 w-4" />
                New intake
              </Link>
            </Button>
          </>
        }
      />

      {/* ── KPI strip ─────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          index={0}
          label="Facility census"
          value={HEADLINE_KPI.census}
          unit="in dept."
          delta={4}
          icon={Users}
          tone="cyan"
          spark={[118, 124, 121, 129, 133, 137, 134, HEADLINE_KPI.census]}
          caption="simulated"
        />
        <MetricCard
          index={1}
          label="Awaiting slot"
          value={counts.waiting}
          delta={-6}
          deltaInvert
          icon={Clock}
          tone="amber"
          spark={[52, 48, 46, 44, 42, 40, 39, counts.waiting]}
          caption="queue"
        />
        <MetricCard
          index={2}
          label="Mean cycle time"
          value={HEADLINE_KPI.avgCycle}
          unit="min"
          delta={-3}
          deltaInvert
          icon={Gauge}
          tone="mint"
          spark={[41, 39, 38, 37, 36, 35, 35, HEADLINE_KPI.avgCycle]}
          caption="rolling"
        />
        <MetricCard
          index={3}
          label="Occupancy"
          value={occ.pct}
          unit="%"
          delta={2}
          deltaInvert
          icon={Building2}
          tone="blue"
          spark={[64, 66, 68, 70, 72, 74, 75, occ.pct]}
          caption={`${occ.occ} of ${occ.cap}`}
        />
        <MetricCard
          index={4}
          label="Clinician acknowledged"
          value={HEADLINE_KPI.reviewed}
          unit="%"
          delta={1}
          icon={ShieldCheck}
          tone="mint"
          spark={[90, 91, 92, 93, 94, 95, 95, HEADLINE_KPI.reviewed]}
          caption="decision-support"
        />
      </div>

      {/* ── Flow + activity ───────────────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={riseItem}>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-300" />
                    Arrival & discharge flow
                  </CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    14-hour simulated window · mock event counts
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" /> Arrivals
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> Discharges
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <FlowAreaChart
                  data={HOURLY_VOLUME}
                  xKey="hour"
                  height={264}
                  series={[
                    { key: "arrivals", color: "#22D3EE", name: "Arrivals" },
                    { key: "discharges", color: "#34D399", name: "Discharges" },
                  ]}
                  note="Simulated arrival/discharge curve. No appointment, ADT or HIS feed exists."
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={riseItem} className="mt-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <Radar className="h-4 w-4 text-cyan-300" />
                  Priority board
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/console/queue">
                    Open full board
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="divide-y divide-white/[0.05]">
                  {boardTickets.map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.35, ease }}
                      className="flex flex-wrap items-center gap-2.5 px-5 py-2.5 transition-colors hover:bg-white/[0.03]"
                    >
                      <span className="w-11 shrink-0 text-[11px] font-bold text-cyan-300 mono-nums">
                        {t.ticketCode}
                      </span>
                      <AcuityBadge value={t.acuity} />
                      <span className="min-w-0 flex-1 truncate text-[13px] text-slate-200">
                        {t.displayName}
                      </span>
                      <ClassificationPill value={t.classification} size="sm" />
                      <StageChip stage={t.stage} />
                      <QueueStatusChip status={t.status} />
                      <span className="w-12 shrink-0 text-right text-[11px] text-slate-400 mono-nums">
                        {formatMinutes(t.waitMinutes)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Right rail */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={riseItem}>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-300" />
                  Operational alerts
                </CardTitle>
                <Badge variant="warning">{alertCount} open</Badge>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {OPS_ALERTS.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-lg border border-white/[0.06] bg-slate-800/50 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-semibold leading-snug text-slate-200">
                        {a.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-slate-500 mono-nums">{a.age}</span>
                    </div>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">{a.detail}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <SeverityBadge value={a.severity} />
                      <span className="truncate text-[10.5px] text-slate-500">{a.department}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={riseItem}>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-300" />
                  Movement log
                </CardTitle>
                <SignalDot tone={running ? "cyan" : "slate"} pulse={running} label={running ? "streaming" : "paused"} />
              </CardHeader>
              <CardContent>
                <ul className="max-h-[268px] space-y-2 overflow-y-auto pr-1">
                  {movements.slice(0, 12).map((m) => (
                    <li key={m.id} className="flex items-start gap-2 text-[11.5px] leading-relaxed">
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          m.kind === "ON_HOLD"
                            ? "bg-slate-400"
                            : m.kind === "COMPLETE"
                              ? "bg-emerald-400"
                              : m.kind === "WAITING"
                                ? "bg-amber-400"
                                : "bg-cyan-400"
                        }`}
                      />
                      <span className="flex-1 text-slate-400">{m.text}</span>
                      <Freshness at={m.at} className="shrink-0" />
                    </li>
                  ))}
                  {movements.length === 0 && (
                    <li className="py-6 text-center text-[11.5px] text-slate-600">
                      No simulated movements recorded yet.
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={riseItem}>
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Siren className="h-4 w-4 text-blue-400" />
                  Workflow classification split
                </CardTitle>
                <p className="text-xs text-slate-500">Routing labels only — not diagnoses</p>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={CLASSIFICATION_SPLIT}
                  height={200}
                  centerValue="3.3k"
                  centerLabel="tickets"
                  note="Simulated routing distribution across the demo cohort."
                />
                <div className="mt-1">
                  <DecisionSupportDisclaimer compact />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Department load ───────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-cyan-300" />
              Department load
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/console/departments">
                Coordinate <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <HorizontalBars
              data={DEPARTMENTS.map((d) => ({
                label: `${d.code} · ${d.name}`,
                value: Math.round((d.occupancy / d.capacity) * 100),
                sub: "% occupied",
              }))}
              note="Occupancy percentage per department — mock roster values."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-cyan-300" />
              Throughput by department
            </CardTitle>
            <span className="text-[11px] text-slate-500">completed / capacity</span>
          </CardHeader>
          <CardContent>
            <HorizontalBars
              data={DEPARTMENT_LOAD.map((d) => ({
                label: d.name,
                value: d.throughput,
                sub: `· wait ${d.wait}m`,
              }))}
              color="#3B82F6"
              note="Aggregate simulated throughput for the current window."
            />
            <Separator className="my-4" />
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: "Departments", v: DEPARTMENTS.length, s: "online" },
                { l: "Staff on duty", v: DEPARTMENTS.reduce((s, d) => s + d.staffOnDuty, 0), s: "roles" },
                { l: "Open bays", v: DEPARTMENTS.reduce((s, d) => s + d.openBays, 0), s: `of ${DEPARTMENTS.reduce((s, d) => s + d.totalBays, 0)}` },
              ].map((m) => (
                <div key={m.l} className="rounded-lg border border-white/[0.06] bg-midnight/50 px-3 py-2.5">
                  <p className="label-caps truncate">{m.l}</p>
                  <p className="mt-1 font-display text-lg font-semibold text-slate-50 mono-nums">
                    {m.v} <span className="text-[10px] font-normal text-slate-500">{m.s}</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Decision-support notice ───────────────────────────────── */}
      <Card className="border-cyan-400/20 bg-gradient-to-r from-cyan-400/[0.06] to-transparent">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <SectionHeading
              title="Decision-support posture"
              className="mb-1"
              hint="How the assistant is allowed to behave inside this prototype"
            />
            <p className="max-w-2xl text-[13px] leading-relaxed text-slate-400">
              The assistant organises submitted information into a workflow label so the queue can be
              sequenced. It never prescribes, never diagnoses and never replaces a clinician.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {(["ROUTINE", "PRIORITY", "IMMEDIATE CLINICAL REVIEW"] as const).map((c) => (
              <ClassificationPill key={c} value={c} size="sm" />
            ))}
            <Button asChild variant="secondary" size="sm">
              <Link href="/console/decision-support">Review module</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-[11px] text-slate-600">
        Last simulated refresh {relativeTime(0)} · {DEMO_BANNER}
      </p>
    </div>
  );
}
