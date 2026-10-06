"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowRightLeft,
  Ban,
  Bell,
  Boxes,
  Building2,
  CircleAlert,
  CircleCheck,
  Clock,
  LayoutGrid,
  MapPin,
  Table2,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress, riseItem, stagger } from "@/components/ui/primitives";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard, Sparkline } from "@/components/shared/metric-card";
import { PageHeader, SectionHeading } from "@/components/shared/page-header";
import { SeverityBadge, SignalDot } from "@/components/shared/status";
import {
  DEPARTMENTS,
  departmentById,
  departmentLoadPct,
  totalOccupancy,
} from "@/lib/mock/departments";
import { HOURLY_VOLUME, OPS_ALERTS } from "@/lib/mock/analytics";
import { DEMO_BANNER, type CapacityState, type Department } from "@/lib/types";

/* ── Derived facility figures (all fictional) ────────────────────────── */

const STAFF_ON_DUTY = DEPARTMENTS.reduce((sum, d) => sum + d.staffOnDuty, 0);
const STAFF_PLANNED = DEPARTMENTS.reduce((sum, d) => sum + d.staffPlanned, 0);
const AVG_WAIT = Math.round(
  DEPARTMENTS.reduce((sum, d) => sum + d.averageWait, 0) / DEPARTMENTS.length,
);
const HANDOFF_LINKS = DEPARTMENTS.reduce((sum, d) => sum + d.downstream.length, 0);
const WAIT_INDEX_SERIES = HOURLY_VOLUME.map((h) => h.waitIndex);

/** Facility-level index trend — mean of every department trend point. */
const FACILITY_TREND: number[] = DEPARTMENTS[0].trend.map((_, i) =>
  Math.round(
    DEPARTMENTS.reduce((sum, d) => sum + (d.trend[i] ?? 0), 0) / DEPARTMENTS.length,
  ),
);

/* ── Capacity state styling — colour is never used alone ─────────────── */

interface CapacityTone {
  className: string;
  icon: LucideIcon;
  indicator: "auto" | "cyan" | "blue" | "mint" | "amber" | "red";
  avatar: "cyan" | "blue" | "mint" | "amber" | "red" | "slate";
  spark: string;
}

const CAPACITY_STATE: Record<CapacityState, CapacityTone> = {
  OPTIMAL: {
    className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    icon: CircleCheck,
    indicator: "mint",
    avatar: "mint",
    spark: "#34D399",
  },
  ELEVATED: {
    className: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    icon: TrendingUp,
    indicator: "amber",
    avatar: "amber",
    spark: "#FBBF24",
  },
  AT_CAPACITY: {
    className: "border-red-500/45 bg-red-500/10 text-red-300",
    icon: CircleAlert,
    indicator: "red",
    avatar: "red",
    spark: "#EF4444",
  },
  DIVERTING: {
    className: "border-red-500/30 bg-slate-800 text-red-300",
    icon: ArrowRightLeft,
    indicator: "red",
    avatar: "slate",
    spark: "#EF4444",
  },
};

function CapacityChip({
  state,
  className,
}: {
  state: CapacityState;
  className?: string;
}) {
  const cfg = CAPACITY_STATE[state];
  const Icon = cfg.icon;
  return (
    <span
      title={`Simulated capacity state: ${state.replace("_", " ")}`}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        cfg.className,
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {state.replace("_", " ")}
    </span>
  );
}

/* ── Department card ─────────────────────────────────────────────────── */

function DepartmentCard({ dept }: { dept: Department }) {
  const cfg = CAPACITY_STATE[dept.capacityState];
  const occupancyPct = departmentLoadPct(dept);
  const staffPct = Math.round(
    (dept.staffOnDuty / Math.max(1, dept.staffPlanned)) * 100,
  );

  return (
    <motion.article
      variants={riseItem}
      className="group flex flex-col rounded-xl border border-white/[0.06] bg-navy/80 p-4 shadow-panel transition-colors hover:border-white/[0.14]"
    >
      {/* Header: code, name, floor, capacity state */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 px-1.5 text-[10px] font-bold tracking-wider text-cyan-300 mono-nums">
            {dept.code}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-display text-sm font-semibold text-slate-50">
              {dept.name}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              {dept.floor}
            </p>
          </div>
        </div>
        <CapacityChip state={dept.capacityState} />
      </div>

      {/* Lead */}
      <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-slate-800/40 px-2.5 py-2">
        <Avatar name={dept.lead} tone={cfg.avatar} className="h-8 w-8" />
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-200">{dept.lead}</p>
          <p className="label-caps mt-0.5">Unit lead</p>
        </div>
      </div>

      {/* Staff + occupancy */}
      <div className="mt-3 space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="label-caps">Staff on duty</span>
            <span className="mono-nums text-[11px] text-slate-300">
              {dept.staffOnDuty}
              <span className="text-slate-500"> / {dept.staffPlanned}</span>
              <span className="text-slate-500"> · {staffPct}%</span>
            </span>
          </div>
          <Progress
            className="mt-1.5"
            value={dept.staffOnDuty}
            max={dept.staffPlanned}
            indicator={staffPct >= 100 ? "mint" : "amber"}
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="label-caps">Occupancy</span>
            <span className="mono-nums text-[11px] text-slate-300">
              {occupancyPct}%
              <span className="text-slate-500">
                {" "}
                · {dept.occupancy}/{dept.capacity}
              </span>
            </span>
          </div>
          <Progress
            className="mt-1.5"
            value={dept.occupancy}
            max={dept.capacity}
            indicator={cfg.indicator}
          />
        </div>
      </div>

      {/* Bays + wait */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-white/[0.05] bg-slate-800/40 px-2.5 py-2">
          <p className="label-caps">Open bays</p>
          <p className="mt-1 font-display text-base font-semibold text-slate-50 mono-nums">
            {dept.openBays}
            <span className="text-xs font-normal text-slate-500"> / {dept.totalBays}</span>
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.05] bg-slate-800/40 px-2.5 py-2">
          <p className="label-caps">Average wait</p>
          <p className="mt-1 font-display text-base font-semibold text-slate-50 mono-nums">
            {dept.averageWait}
            <span className="text-xs font-normal text-slate-500"> min</span>
          </p>
        </div>
      </div>

      {/* KPI + sparkline */}
      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-white/[0.05] bg-slate-800/40 px-2.5 py-2">
        <div className="min-w-0">
          <p className="label-caps">KPI index</p>
          <p className="mt-1 font-display text-base font-semibold text-slate-50 mono-nums">
            {dept.kpi}
            <span className="text-xs font-normal text-slate-500">%</span>
          </p>
        </div>
        <Sparkline
          data={dept.trend}
          stroke={cfg.spark}
          width={96}
          height={28}
          className="shrink-0"
        />
      </div>

      {/* Downstream handoffs */}
      <div className="mt-3 border-t border-white/[0.06] pt-3">
        <p className="label-caps mb-2">Downstream handoffs</p>
        {dept.downstream.length === 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <Ban className="h-3 w-3 shrink-0" aria-hidden="true" />
            Terminal · no handoff
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-cyan-400" aria-hidden="true" />
            {dept.downstream.map((id) => {
              const target = departmentById(id);
              return (
                <span
                  key={id}
                  className="inline-flex max-w-full items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300"
                  title={`Hands off to ${target.name}`}
                >
                  <span className="mono-nums">{target.code}</span>
                  <span className="truncate font-normal text-blue-200/70">{target.name}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </motion.article>
  );
}

/* ── Handoff map ─────────────────────────────────────────────────────── */

function HandoffMap() {
  return (
    <motion.section variants={riseItem} aria-labelledby="handoff-map-title">
      <SectionHeading
        title="Handoff map"
        hint="Simulated department → downstream routing. No transfer, referral or transport is triggered."
        action={
          <Badge variant="muted" className="mono-nums">
            <Workflow className="h-3 w-3" aria-hidden="true" />
            {HANDOFF_LINKS} links
          </Badge>
        }
      />
      <Card>
        <CardContent className="space-y-2 p-4">
          {DEPARTMENTS.map((dept) => (
            <div
              key={dept.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-white/[0.05] bg-slate-800/40 px-3 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-6 shrink-0 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 px-1.5 text-[10px] font-bold text-cyan-300 mono-nums">
                  {dept.code}
                </span>
                <span className="truncate text-xs font-medium text-slate-200">{dept.name}</span>
              </span>

              <span
                className="hidden h-px min-w-[28px] flex-1 bg-gradient-to-r from-cyan-400/50 to-white/10 sm:block"
                aria-hidden="true"
              />
              <ArrowRight className="hidden h-4 w-4 shrink-0 text-cyan-400 sm:block" aria-hidden="true" />

              <span className="sr-only">hands off to</span>
              {dept.downstream.length === 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <Ban className="h-3 w-3 shrink-0" aria-hidden="true" />
                  Terminal · no downstream handoff
                </span>
              ) : (
                <span className="flex flex-wrap items-center gap-1.5">
                  {dept.downstream.map((id) => {
                    const target = departmentById(id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300"
                      >
                        <span className="mono-nums">{target.code}</span>
                        <span className="truncate font-normal text-blue-200/70">
                          {target.name}
                        </span>
                      </span>
                    );
                  })}
                </span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.section>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function DepartmentsPage() {
  const occ = totalOccupancy();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            <SignalDot tone="cyan" />
            Coordination · {DEMO_BANNER}
          </span>
        }
        title="Department Coordination"
        description="Capacity, staffing and downstream handoffs across every simulated unit. All values are fictional and generated locally in your browser."
        actions={<Badge variant="muted">{DEPARTMENTS.length} units</Badge>}
      />

      {/* ── Facility strip ─────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          index={0}
          label="Facility occupancy"
          value={occ.pct}
          unit="%"
          delta={2}
          deltaInvert
          icon={Building2}
          tone="cyan"
          spark={FACILITY_TREND}
          caption={`${occ.occ} of ${occ.cap} places`}
        />
        <MetricCard
          index={1}
          label="Departments"
          value={DEPARTMENTS.length}
          unit="units"
          icon={Boxes}
          tone="blue"
          caption={`${HANDOFF_LINKS} handoff links`}
        />
        <MetricCard
          index={2}
          label="Average wait"
          value={AVG_WAIT}
          unit="min"
          icon={Clock}
          tone="amber"
          spark={WAIT_INDEX_SERIES}
          caption="simulated wait index"
        />
        <MetricCard
          index={3}
          label="Staff on duty"
          value={STAFF_ON_DUTY}
          unit={`of ${STAFF_PLANNED}`}
          icon={Users}
          tone="mint"
          caption="simulated rota"
        />
      </div>

      {/* ── Views ──────────────────────────────────────────────────── */}
      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
            Board
          </TabsTrigger>
          <TabsTrigger value="table">
            <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
            Capacity table
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="h-3.5 w-3.5" aria-hidden="true" />
            Alerts
            <span className="ml-0.5 rounded border border-amber-400/40 bg-amber-400/10 px-1 mono-nums text-amber-300">
              {OPS_ALERTS.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Board */}
        <TabsContent value="board">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {DEPARTMENTS.map((dept) => (
              <DepartmentCard key={dept.id} dept={dept} />
            ))}
          </motion.div>
        </TabsContent>

        {/* Capacity table */}
        <TabsContent value="table">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Lead</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Bays</TableHead>
                    <TableHead>Wait</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Handoffs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEPARTMENTS.map((dept) => {
                    const cfg = CAPACITY_STATE[dept.capacityState];
                    return (
                      <TableRow key={dept.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 shrink-0 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 px-1.5 text-[10px] font-bold text-cyan-300 mono-nums">
                              {dept.code}
                            </span>
                            <span className="font-medium text-slate-200">{dept.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-slate-400">
                          {dept.floor}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={dept.lead}
                              tone={cfg.avatar}
                              className="h-7 w-7 text-[10px]"
                            />
                            <span className="whitespace-nowrap text-xs text-slate-300">
                              {dept.lead}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap mono-nums text-xs text-slate-300">
                          {dept.staffOnDuty} / {dept.staffPlanned}
                        </TableCell>
                        <TableCell>
                          <div className="w-32">
                            <div className="flex items-center justify-between mono-nums text-[11px]">
                              <span className="text-slate-300">{departmentLoadPct(dept)}%</span>
                              <span className="text-slate-500">
                                {dept.occupancy}/{dept.capacity}
                              </span>
                            </div>
                            <Progress
                              className="mt-1"
                              value={dept.occupancy}
                              max={dept.capacity}
                              indicator={cfg.indicator}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap mono-nums text-xs text-slate-300">
                          {dept.openBays} / {dept.totalBays}
                        </TableCell>
                        <TableCell className="whitespace-nowrap mono-nums text-xs text-slate-300">
                          {dept.averageWait} min
                        </TableCell>
                        <TableCell>
                          <CapacityChip state={dept.capacityState} />
                        </TableCell>
                        <TableCell>
                          {dept.downstream.length === 0 ? (
                            <span className="text-[11px] text-slate-500">Terminal</span>
                          ) : (
                            <span className="flex flex-wrap gap-1">
                              {dept.downstream.map((id) => (
                                <Badge key={id} variant="muted" className="mono-nums">
                                  {departmentById(id).code}
                                </Badge>
                              ))}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts">
          <div className="space-y-3">
            <SectionHeading
              title="Operational alerts"
              hint={`${OPS_ALERTS.length} simulated alerts — severity is always written out in text, never colour alone.`}
            />
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
              {OPS_ALERTS.map((alert) => (
                <motion.article
                  key={alert.id}
                  variants={riseItem}
                  className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-navy/80 p-4 shadow-panel sm:flex-row sm:items-start sm:gap-4"
                >
                  <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-start">
                    <SeverityBadge value={alert.severity} />
                    <span className="mono-nums text-[11px] text-slate-500">{alert.age} ago</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-slate-100">{alert.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{alert.detail}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Building2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {alert.department}
                    </p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Handoff map ────────────────────────────────────────────── */}
      <HandoffMap />
    </div>
  );
}
