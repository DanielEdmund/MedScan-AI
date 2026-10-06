"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  Layers,
  Lock,
  Percent,
  Timer,
  Users,
} from "lucide-react";
import { cn, compact } from "@/lib/utils";
import { DEMO_BANNER } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { DemoTag, DecisionSupportDisclaimer } from "@/components/shared/status";
import {
  AMBER,
  BLUE,
  CYAN,
  DonutChart,
  FlowAreaChart,
  GroupedBarChart,
  HorizontalBars,
  MINT,
  RED,
  TrendLineChart,
} from "@/components/charts/chart-kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress, riseItem, stagger } from "@/components/ui/primitives";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CLASSIFICATION_SPLIT,
  CYCLE_TIME_BUCKETS,
  DEPARTMENT_LOAD,
  HEADLINE_KPI,
  HOURLY_VOLUME,
  MODALITY_UTILIZATION,
  THROUGHPUT_SERIES,
  WAIT_DISTRIBUTION,
  WEEKLY_TREND,
} from "@/lib/mock/analytics";

/* ── Chart-kit helpers ───────────────────────────────────────────────────
 * The chart kit accepts loose `Record<string, unknown>` rows, while the mock
 * datasets are typed interfaces. This adapter widens them without altering
 * a single value — it is a type-level bridge only.
 */
const toRows = (data: readonly unknown[]): Record<string, unknown>[] =>
  data.map((d) => d as Record<string, unknown>);

const flowRows = toRows(HOURLY_VOLUME);
const trendRows = toRows(WEEKLY_TREND);
const loadRows = toRows(DEPARTMENT_LOAD);
const cycleRows = toRows(CYCLE_TIME_BUCKETS);
const throughputRows = toRows(THROUGHPUT_SERIES);
const modalityRows = toRows(MODALITY_UTILIZATION);

const classificationTotal = CLASSIFICATION_SPLIT.reduce((sum, s) => sum + s.value, 0);

const waitRows = WAIT_DISTRIBUTION.map((w) => ({
  name: w.name,
  value: w.value,
  color: w.fill,
}));

/* ── Local chart frame: label-caps heading + mock-figure note ─────────── */

function ChartCard({
  title,
  note,
  children,
  className,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      variants={riseItem}
      className={cn(
        "flex flex-col rounded-xl border border-white/[0.06] bg-navy/80 p-4 shadow-panel sm:p-5",
        className,
      )}
    >
      <h3 className="label-caps mb-3">{title}</h3>
      <div className="min-w-0 flex-1">{children}</div>
      <p className="mt-3 flex items-start gap-1.5 border-t border-white/[0.06] pt-2.5 text-[11px] leading-relaxed text-slate-500">
        <Lock className="mt-px h-3 w-3 shrink-0 text-slate-500" aria-hidden="true" />
        <span>{note}</span>
      </p>
    </motion.section>
  );
}

/* ── Utilisation status (icon + text — never colour alone) ────────────── */

function utilisationStatus(utilisation: number) {
  if (utilisation >= 95)
    return {
      label: "Tight headroom",
      className: "border-amber-400/40 bg-amber-400/10 text-amber-300",
      icon: AlertTriangle,
    };
  if (utilisation >= 85)
    return {
      label: "On target",
      className: "border-emerald-400/35 bg-emerald-400/10 text-emerald-300",
      icon: CheckCircle2,
    };
  return {
    label: "Headroom",
    className: "border-cyan-400/35 bg-cyan-400/10 text-cyan-300",
    icon: Gauge,
  };
}

export default function AnalyticsPage() {
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
            <Activity className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            Command center · Analytics
          </span>
        }
        title="Operations Analytics"
        description="Throughput, capacity and utilisation across the simulated floor. Every figure is generated locally from mock datasets — nothing here is clinical, diagnostic, or drawn from a real facility."
        actions={
          <>
            <Badge variant="outline" size="lg">
              Static snapshot · 14h window
            </Badge>
            <DemoTag />
          </>
        }
      />

      {/* Required demo / simulation notice */}
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/35 bg-amber-400/[0.08] px-4 py-3 shadow-panel">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-amber-100/90">
          <span className="font-bold uppercase tracking-[0.14em] text-amber-200">{DEMO_BANNER}</span>
          {" — all figures generated from local mock datasets."}
        </p>
      </div>

      {/* ── Headline metrics ───────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          index={0}
          label="Active census"
          value={HEADLINE_KPI.census}
          unit="in-house"
          delta={4.2}
          icon={Users}
          tone="cyan"
          spark={HOURLY_VOLUME.map((h) => h.arrivals)}
          caption="rolling 14h arrivals"
        />
        <MetricCard
          index={1}
          label="Waiting now"
          value={HEADLINE_KPI.waiting}
          unit="tickets"
          delta={3}
          deltaInvert
          icon={Clock}
          tone="amber"
          spark={HOURLY_VOLUME.map((h) => h.waitIndex)}
          caption="queue pressure"
        />
        <MetricCard
          index={2}
          label="Avg cycle time"
          value={HEADLINE_KPI.avgCycle}
          unit="min"
          delta={-8.4}
          deltaInvert
          icon={Timer}
          tone="mint"
          spark={CYCLE_TIME_BUCKETS.map((b) => b.count)}
          caption="registration → exit"
        />
        <MetricCard
          index={3}
          label="Occupancy"
          value={HEADLINE_KPI.occupancy}
          unit="%"
          delta={2.1}
          deltaInvert
          icon={Gauge}
          tone="blue"
          spark={DEPARTMENT_LOAD.map((d) => d.occupancy)}
          caption="across 8 departments"
        />
        <MetricCard
          index={4}
          label="Clinician reviewed"
          value={HEADLINE_KPI.reviewed}
          unit="%"
          delta={1.4}
          icon={CheckCircle2}
          tone="mint"
          spark={CLASSIFICATION_SPLIT.map((s) => s.value)}
          caption="routing labels signed off"
        />
      </div>

      {/* ── Chart groups ───────────────────────────────────────────────── */}
      <Tabs defaultValue="flow" className="pt-1">
        <TabsList aria-label="Analytics chart groups">
          <TabsTrigger value="flow">
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
            Flow
          </TabsTrigger>
          <TabsTrigger value="capacity">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            Capacity
          </TabsTrigger>
          <TabsTrigger value="utilisation">
            <Percent className="h-3.5 w-3.5" aria-hidden="true" />
            Utilisation
          </TabsTrigger>
        </TabsList>

        {/* Flow */}
        <TabsContent value="flow" className="focus-visible:outline-none">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-4 lg:grid-cols-3"
          >
            <ChartCard
              className="lg:col-span-2"
              title="Hourly flow · arrivals vs discharges"
              note="Mock series built from the local demo dataset — no live feed is connected."
            >
              <FlowAreaChart
                data={flowRows}
                xKey="hour"
                height={264}
                series={[
                  { key: "arrivals", color: CYAN, name: "Arrivals" },
                  { key: "discharges", color: MINT, name: "Discharges" },
                ]}
              />
            </ChartCard>

            <ChartCard
              title="Workflow routing split"
              note="Simulated routing labels for the demo only — never a clinical determination."
            >
              <DonutChart
                data={CLASSIFICATION_SPLIT}
                height={252}
                centerValue={compact(classificationTotal)}
                centerLabel="routing labels"
              />
            </ChartCard>

            <ChartCard
              className="lg:col-span-2"
              title="Seven-day routing trend"
              note="Simulated seven-day volumes from the local mock dataset — fictional data."
            >
              <TrendLineChart
                data={trendRows}
                xKey="label"
                height={264}
                series={[
                  { key: "intake", color: BLUE, name: "Total intake" },
                  { key: "priority", color: AMBER, name: "Priority" },
                  { key: "immediate", color: RED, name: "Immediate review" },
                ]}
              />
            </ChartCard>

            <ChartCard
              title="Wait-time distribution"
              note="Simulated wait bands from the local mock dataset — no patient data involved."
            >
              <DonutChart
                data={waitRows}
                height={252}
                centerValue={`${WAIT_DISTRIBUTION[0].value}%`}
                centerLabel="under 10m"
              />
            </ChartCard>
          </motion.div>
        </TabsContent>

        {/* Capacity */}
        <TabsContent value="capacity" className="focus-visible:outline-none">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-4 lg:grid-cols-2"
          >
            <ChartCard
              title="Department occupancy"
              note="Simulated occupancy from the local department mock — not a live feed."
            >
              <HorizontalBars
                data={DEPARTMENT_LOAD.map((d) => ({ label: d.name, value: d.occupancy, sub: "%" }))}
                height={258}
              />
            </ChartCard>

            <ChartCard
              title="Cycle-time distribution (minutes)"
              note="Simulated cycle times bucketed locally — fictional demo data."
            >
              <GroupedBarChart
                data={cycleRows}
                xKey="bucket"
                height={258}
                series={[{ key: "count", color: BLUE, name: "Encounters" }]}
              />
            </ChartCard>

            <ChartCard
              className="lg:col-span-2"
              title="Department load · average wait vs throughput"
              note="Mock wait and throughput figures — series use different units; demo data only."
            >
              <GroupedBarChart
                data={loadRows}
                xKey="name"
                height={272}
                series={[
                  { key: "wait", color: AMBER, name: "Avg wait (min)" },
                  { key: "throughput", color: CYAN, name: "Throughput index" },
                ]}
              />
            </ChartCard>
          </motion.div>
        </TabsContent>

        {/* Utilisation */}
        <TabsContent value="utilisation" className="focus-visible:outline-none">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-4 lg:grid-cols-2"
          >
            <ChartCard
              title="Rolling throughput index"
              note="Simulated eight-week index from the local mock dataset — demo only."
            >
              <TrendLineChart
                data={throughputRows}
                xKey="t"
                height={258}
                series={[{ key: "value", color: CYAN, name: "Throughput index" }]}
              />
            </ChartCard>

            <ChartCard
              title="Utilisation rate by modality"
              note="Simulated utilisation rates from the local mock dataset — demo only."
            >
              <HorizontalBars
                data={MODALITY_UTILIZATION.map((m) => ({
                  label: m.modality,
                  value: m.utilization,
                  sub: "%",
                }))}
                height={258}
                color={BLUE}
              />
            </ChartCard>

            <ChartCard
              className="lg:col-span-2"
              title="Modality workload · scheduled vs completed"
              note="Simulated workload counts from the local mock dataset — no live feed."
            >
              <GroupedBarChart
                data={modalityRows}
                xKey="modality"
                height={272}
                series={[
                  { key: "scheduled", color: BLUE, name: "Scheduled" },
                  { key: "completed", color: CYAN, name: "Completed" },
                ]}
              />
            </ChartCard>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ── Modality utilisation table ─────────────────────────────────── */}
      <motion.section
        variants={riseItem}
        className="overflow-hidden rounded-xl border border-white/[0.06] bg-navy/80 shadow-panel"
        aria-labelledby="modality-table-heading"
      >
        <div className="flex flex-col gap-1 border-b border-white/[0.06] px-4 py-4 sm:px-5">
          <h3 id="modality-table-heading" className="label-caps">
            Modality utilisation detail
          </h3>
          <p className="text-xs text-slate-500">
            Scheduled vs completed studies in the simulated window — status is stated in text, never
            colour alone.
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modality</TableHead>
              <TableHead className="text-right">Scheduled</TableHead>
              <TableHead className="text-right">Completed</TableHead>
              <TableHead className="text-right">Completion</TableHead>
              <TableHead>Utilisation</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MODALITY_UTILIZATION.map((m) => {
              const completion = Math.round((m.completed / m.scheduled) * 100);
              const status = utilisationStatus(m.utilization);
              const StatusIcon = status.icon;
              return (
                <TableRow key={m.modality}>
                  <TableCell className="font-semibold text-slate-100">{m.modality}</TableCell>
                  <TableCell className="text-right mono-nums text-slate-300">
                    {m.scheduled}
                  </TableCell>
                  <TableCell className="text-right mono-nums text-slate-300">
                    {m.completed}
                  </TableCell>
                  <TableCell className="text-right mono-nums text-slate-400">{completion}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div aria-hidden="true" className="w-24 sm:w-32">
                        <Progress
                          value={m.utilization}
                          indicator={m.utilization >= 95 ? "amber" : "cyan"}
                        />
                      </div>
                      <span className="mono-nums text-xs font-semibold text-slate-200">
                        {m.utilization}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        status.className,
                      )}
                    >
                      <StatusIcon className="h-3 w-3" aria-hidden="true" />
                      {status.label}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableCaption>
            Simulated utilisation figures — fictional demo data, not a live operational feed.
          </TableCaption>
        </Table>
      </motion.section>

      {/* ── Decision-support posture ───────────────────────────────────── */}
      <motion.section variants={riseItem}>
        <DecisionSupportDisclaimer />
        <p className="mt-2 text-[11.5px] leading-relaxed text-slate-500">
          Figures labelled “routing”, “priority” or “immediate review” describe workflow sequencing
          in the prototype only. They carry no clinical meaning and must never be read as outcomes,
          risk scores or assessments of any individual.
        </p>
      </motion.section>
    </motion.div>
  );
}
