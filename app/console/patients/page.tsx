"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BedDouble,
  LayoutGrid,
  Search,
  ShieldAlert,
  Siren,
  Table2,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { riseItem, stagger } from "@/components/ui/primitives";
import { EmptyState, PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import {
  AcuityBadge,
  ClassificationPill,
  DemoTag,
  SignalDot,
} from "@/components/shared/status";
import { DEPARTMENT_OPTIONS, departmentName } from "@/lib/mock/departments";
import { PATIENTS } from "@/lib/mock/patients";
import { cn, relativeTime } from "@/lib/utils";
import { DEMO_BANNER, type MockPatient, type PatientState } from "@/lib/types";

/* ── Local state chip — colour is always paired with text ─────────────── */

const STATE_STYLE: Record<
  PatientState,
  { label: string; className: string; dot: string }
> = {
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

function StateChip({ value, className }: { value: PatientState; className?: string }) {
  const cfg = STATE_STYLE[value];
  return (
    <span
      title={`Simulated record state: ${cfg.label}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        cfg.className,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

/* ── Filter options ───────────────────────────────────────────────────── */

const STATE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All states" },
  { value: "ACTIVE", label: "Active" },
  { value: "OBSERVATION", label: "Observation" },
  { value: "ADMITTED", label: "Admitted" },
  { value: "DISCHARGED", label: "Discharged" },
];

type View = "table" | "cards";

const registeredAgo = (p: MockPatient) =>
  relativeTime(Math.max(0, (Date.now() - p.registeredAt) / 60_000));

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function PatientRegistryPage() {
  const [query, setQuery] = React.useState("");
  const [dept, setDept] = React.useState("all");
  const [state, setState] = React.useState("all");
  const [view, setView] = React.useState<View>("table");

  const stats = React.useMemo(
    () => ({
      total: PATIENTS.length,
      active: PATIENTS.filter((p) => p.state === "ACTIVE").length,
      onWard: PATIENTS.filter((p) => p.state === "OBSERVATION" || p.state === "ADMITTED").length,
      immediate: PATIENTS.filter((p) => p.classification === "IMMEDIATE CLINICAL REVIEW").length,
    }),
    [],
  );

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return PATIENTS.filter((p) => {
      if (dept !== "all" && p.departmentId !== dept) return false;
      if (state !== "all" && p.state !== state) return false;
      if (!term) return true;
      return (
        p.displayName.toLowerCase().includes(term) || p.mrn.toLowerCase().includes(term)
      );
    }).sort((a, b) => b.registeredAt - a.registeredAt);
  }, [query, dept, state]);

  const filtersActive = query.trim() !== "" || dept !== "all" || state !== "all";
  const clearFilters = () => {
    setQuery("");
    setDept("all");
    setState("all");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            <SignalDot tone="cyan" />
            {DEMO_BANNER} · Local mock roster
          </span>
        }
        title="Patient Registry (Fictional)"
        description="Search and filter simulated demo records. Every subject below is invented for this prototype — no real person, record or identifier is represented."
        actions={<DemoTag />}
      />

      {/* ── Fictional-subjects banner ─────────────────────────────── */}
      <motion.div
        role="note"
        aria-label="Fictional subjects only"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-start gap-3 rounded-xl border border-amber-400/40 bg-amber-400/[0.08] px-4 py-3.5 shadow-panel"
      >
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-relaxed text-amber-200">
            FICTIONAL SUBJECTS ONLY — simulated demo records, no real patients.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-200/70">
            Names, MRNs, encounters and workflow values are generated locally in your browser.
            Nothing on this page was retrieved from any external clinical system.
          </p>
        </div>
      </motion.div>

      {/* ── Metric strip ──────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          index={0}
          label="Total records"
          value={stats.total}
          unit="subjects"
          icon={Users}
          tone="cyan"
          spark={[19, 20, 21, 21, 22, 23, 24, stats.total]}
          caption="fictional roster"
        />
        <MetricCard
          index={1}
          label="Active records"
          value={stats.active}
          unit="open"
          icon={Activity}
          tone="mint"
          spark={[6, 7, 7, 8, 8, 7, 8, stats.active]}
          caption="state: active"
        />
        <MetricCard
          index={2}
          label="Observation / admitted"
          value={stats.onWard}
          unit="on ward"
          icon={BedDouble}
          tone="blue"
          spark={[9, 10, 10, 11, 11, 10, 11, stats.onWard]}
          caption="simulated states"
        />
        <MetricCard
          index={3}
          label="Immediate review"
          value={stats.immediate}
          unit="routing"
          icon={Siren}
          tone="red"
          spark={[3, 3, 4, 4, 3, 4, 4, stats.immediate]}
          caption="workflow label only"
        />
      </div>

      {/* ── Toolbar + results share a single Tabs root ────────────── */}
      <Tabs
        value={view}
        onValueChange={(v) => setView(v as View)}
        className="space-y-6"
      >
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1 space-y-1.5">
                <label htmlFor="registry-search" className="label-caps block">
                  Search by name or MRN
                </label>
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  />
                  <Input
                    id="registry-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Vance or MSA-048217"
                    autoComplete="off"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="w-full space-y-1.5 lg:w-56">
                <label htmlFor="registry-dept" className="label-caps block">
                  Department
                </label>
                <Select value={dept} onValueChange={setDept}>
                  <SelectTrigger id="registry-dept" aria-label="Filter by department">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All departments</SelectItem>
                    {DEPARTMENT_OPTIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full space-y-1.5 lg:w-48">
                <label htmlFor="registry-state" className="label-caps block">
                  Record state
                </label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger id="registry-state" aria-label="Filter by record state">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATE_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filtersActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  aria-label="Clear all filters"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
              <p className="text-xs text-slate-400" aria-live="polite">
                <span className="font-semibold text-slate-100 mono-nums">{filtered.length}</span>{" "}
                of <span className="mono-nums">{PATIENTS.length}</span> fictional records match
              </p>

              <TabsList>
                <TabsTrigger value="table">
                  <Table2 aria-hidden="true" className="h-3.5 w-3.5" />
                  Table view
                </TabsTrigger>
                <TabsTrigger value="cards">
                  <LayoutGrid aria-hidden="true" className="h-3.5 w-3.5" />
                  Card view
                </TabsTrigger>
              </TabsList>
            </div>
          </CardContent>
        </Card>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No records match these filters"
            description="Adjust the search term, department or record state to see more of the fictional roster. Nothing was queried from an external system."
            action={
              <Button variant="secondary" onClick={clearFilters}>
                <X aria-hidden="true" className="h-4 w-4" />
                Clear all filters
              </Button>
            }
          />
        ) : (
          <>
            <TabsContent value="table" className="mt-0 focus-visible:outline-none">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="overflow-hidden rounded-xl border border-white/[0.06] bg-navy/80 shadow-panel"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>MRN</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Age / sex</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Classification</TableHead>
                      <TableHead>Acuity</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="whitespace-nowrap text-cyan-300 mono-nums">
                          {p.mrn}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2.5">
                            <Avatar
                              name={p.displayName}
                              tone="slate"
                              className="h-7 w-7 text-[10px]"
                            />
                            <span className="font-medium text-slate-100">{p.displayName}</span>
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-slate-300 mono-nums">
                          {p.age} <span className="text-slate-500">/ {p.sex}</span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-slate-300">
                          {departmentName(p.departmentId)}
                        </TableCell>
                        <TableCell>
                          <ClassificationPill value={p.classification} size="sm" />
                        </TableCell>
                        <TableCell>
                          <AcuityBadge value={p.acuity} />
                        </TableCell>
                        <TableCell>
                          <StateChip value={p.state} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-slate-400 mono-nums">
                          {registeredAgo(p)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Open record for ${p.displayName}`}
                          >
                            <Link href={`/console/patients/${p.id}`} title="Open record">
                              <ArrowRight aria-hidden="true" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            </TabsContent>

            <TabsContent value="cards" className="mt-0 focus-visible:outline-none">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              >
                {filtered.map((p) => (
                  <motion.div key={p.id} variants={riseItem} className="h-full">
                    <Card className="h-full transition-colors hover:border-cyan-400/30">
                      <CardContent className="flex h-full flex-col gap-3 p-4">
                        <div className="flex items-start gap-3">
                          <Avatar name={p.displayName} tone="blue" className="h-10 w-10 text-xs" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[15px] font-semibold text-slate-50">
                              {p.displayName}
                            </p>
                            <p className="truncate text-xs text-cyan-300 mono-nums">{p.mrn}</p>
                          </div>
                          <span className="shrink-0 text-xs text-slate-400 mono-nums">
                            {p.age}/{p.sex}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <ClassificationPill value={p.classification} size="sm" />
                          <AcuityBadge value={p.acuity} />
                          <StateChip value={p.state} />
                        </div>

                        <dl className="space-y-1.5 border-t border-white/[0.06] pt-3 text-xs">
                          <div className="flex items-baseline justify-between gap-3">
                            <dt className="label-caps shrink-0">Department</dt>
                            <dd className="truncate text-slate-300">
                              {departmentName(p.departmentId)}
                            </dd>
                          </div>
                          <div className="flex items-baseline justify-between gap-3">
                            <dt className="label-caps shrink-0">Pathway</dt>
                            <dd className="truncate text-slate-300">{p.pathway}</dd>
                          </div>
                          <div className="flex items-baseline justify-between gap-3">
                            <dt className="label-caps shrink-0">Registered</dt>
                            <dd className="truncate text-slate-400 mono-nums">
                              {registeredAgo(p)}
                            </dd>
                          </div>
                        </dl>

                        <Button asChild variant="outline" size="sm" className="mt-auto w-full">
                          <Link href={`/console/patients/${p.id}`}>
                            Open record
                            <ArrowRight aria-hidden="true" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </>
        )}
      </Tabs>

      <p className="text-center text-[11px] text-slate-600">
        {DEMO_BANNER} · Registry values are generated locally — no external system was contacted.
      </p>
    </div>
  );
}
