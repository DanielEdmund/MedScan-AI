"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  CircleAlert,
  Info,
  Lock,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CLASSIFICATION_DISCLAIMER, type WorkflowClassification } from "@/lib/types";

/* ── Classification pill — text + icon + colour, never colour alone ──── */

const CLASS_STYLE: Record<
  WorkflowClassification,
  { className: string; icon: React.ElementType; short: string; dot: string }
> = {
  ROUTINE: {
    className: "border-emerald-400/35 bg-emerald-400/10 text-emerald-300",
    icon: BadgeCheck,
    short: "Routine",
    dot: "bg-emerald-400",
  },
  PRIORITY: {
    className: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    icon: AlertTriangle,
    short: "Priority",
    dot: "bg-amber-400",
  },
  "IMMEDIATE CLINICAL REVIEW": {
    className: "border-red-500/40 bg-red-500/10 text-red-300",
    icon: Siren,
    short: "Immediate review",
    dot: "bg-red-500",
  },
};

export function ClassificationPill({
  value,
  size = "default",
  className,
  showIcon = true,
}: {
  value: WorkflowClassification;
  size?: "sm" | "default";
  className?: string;
  showIcon?: boolean;
}) {
  const cfg = CLASS_STYLE[value];
  const Icon = cfg.icon;
  return (
    <span
      title={value}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-semibold uppercase tracking-wider",
        size === "sm"
          ? "px-1.5 py-0.5 text-[10px]"
          : "px-2 py-1 text-[11px]",
        cfg.className,
        className,
      )}
    >
      {showIcon && <Icon className="h-3 w-3 shrink-0" />}
      <span className="truncate">{size === "sm" ? cfg.short : value}</span>
    </span>
  );
}

/* ── Acuity band ─────────────────────────────────────────────────────── */

export function AcuityBadge({ value, className }: { value: 1 | 2 | 3 | 4 | 5; className?: string }) {
  const tone =
    value === 1
      ? "border-red-500/45 bg-red-500/15 text-red-300"
      : value <= 2
        ? "border-amber-400/40 bg-amber-400/12 text-amber-300"
        : value === 3
          ? "border-cyan-400/35 bg-cyan-400/10 text-cyan-300"
          : "border-white/12 bg-white/[0.05] text-slate-300";
  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-md border text-[11px] font-bold mono-nums",
        tone,
        className,
      )}
      title={`Simulated acuity band ${value}`}
    >
      {value}
    </span>
  );
}

/* ── Live signal dot ─────────────────────────────────────────────────── */

const DOT_TONE: Record<string, string> = {
  cyan: "text-cyan-400",
  mint: "text-emerald-400",
  amber: "text-amber-400",
  red: "text-red-500",
  slate: "text-slate-400",
  blue: "text-blue-500",
};

export function SignalDot({
  tone = "cyan",
  pulse = true,
  className,
  label,
}: {
  tone?: keyof typeof DOT_TONE;
  pulse?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", DOT_TONE[tone], className)}>
      <span className={cn("status-signal bg-current", !pulse && "animate-none", !pulse && "after:hidden")} />
      {label && <span className="text-xs font-medium text-slate-300">{label}</span>}
    </span>
  );
}

/* ── Severity / status badge ─────────────────────────────────────────── */

const SEVERITY: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  INFO: { label: "Info", className: "text-slate-300 border-white/12 bg-white/[0.05]", icon: Info },
  NOTICE: {
    label: "Notice",
    className: "text-cyan-300 border-cyan-400/35 bg-cyan-400/10",
    icon: Info,
  },
  ACTION: {
    label: "Action",
    className: "text-amber-300 border-amber-400/40 bg-amber-400/10",
    icon: CircleAlert,
  },
  URGENT: {
    label: "Urgent",
    className: "text-red-400 border-red-500/40 bg-red-500/10",
    icon: Siren,
  },
};

export function SeverityBadge({
  value,
  className,
}: {
  value: keyof typeof SEVERITY | string;
  className?: string;
}) {
  const cfg = SEVERITY[value] ?? SEVERITY.INFO;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        cfg.className,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

/* ── Stage / status chips ────────────────────────────────────────────── */

export function StageChip({ stage }: { stage: string }) {
  const map: Record<string, string> = {
    REGISTERED: "border-white/12 text-slate-300 bg-white/[0.04]",
    TRIAGE: "border-cyan-400/35 text-cyan-300 bg-cyan-400/10",
    IMAGING: "border-blue-500/35 text-blue-400 bg-blue-500/10",
    LAB: "border-violet-400/35 text-violet-300 bg-violet-400/10",
    CONSULT: "border-amber-400/35 text-amber-300 bg-amber-400/10",
    DISCHARGE: "border-emerald-400/35 text-emerald-300 bg-emerald-400/10",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        map[stage] ?? map.REGISTERED,
      )}
    >
      {stage}
    </span>
  );
}

export function QueueStatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; dot: string }> = {
    WAITING: { label: "Waiting", cls: "text-amber-300 border-amber-400/35", dot: "bg-amber-400" },
    IN_PROGRESS: { label: "In progress", cls: "text-cyan-300 border-cyan-400/35", dot: "bg-cyan-400" },
    ON_HOLD: { label: "On hold", cls: "text-slate-300 border-white/15", dot: "bg-slate-400" },
    COMPLETE: { label: "Complete", cls: "text-emerald-300 border-emerald-400/35", dot: "bg-emerald-400" },
  };
  const m = map[status] ?? map.WAITING;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        m.cls,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

/* ── Required safety disclaimer ──────────────────────────────────────── */

export function DecisionSupportDisclaimer({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.07] text-cyan-100",
        compact ? "px-2.5 py-1.5" : "px-3.5 py-2.5",
        className,
      )}
    >
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
      <p className={cn("font-medium", compact ? "text-[11px]" : "text-xs leading-relaxed")}>
        {CLASSIFICATION_DISCLAIMER}
        {!compact && (
          <span className="mt-1 block text-cyan-100/70">
            Output is a workflow routing label only — not a diagnosis, not a treatment
            recommendation, and not a substitute for clinical judgement.
          </span>
        )}
      </p>
    </div>
  );
}

/* ── Demo / simulation banner ────────────────────────────────────────── */

export function DemoTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300",
        className,
      )}
    >
      <Lock className="h-3 w-3" />
      Demo / Simulated Clinical Operations
    </span>
  );
}

/* ── Freshness label ─────────────────────────────────────────────────── */

export function Freshness({ at, className }: { at: number; className?: string }) {
  return (
    <span className={cn("text-[11px] text-slate-500 mono-nums", className)}>
      {relativeTime(Math.max(0, (Date.now() - at) / 60_000))}
    </span>
  );
}

/* ── Animated numeric readout ────────────────────────────────────────── */

export function LiveValue({
  value,
  suffix,
  className,
}: {
  value: string | number;
  suffix?: string;
  className?: string;
}) {
  return (
    <span className={cn("mono-nums tabular-nums", className)}>
      <motion.span key={String(value)} initial={{ opacity: 0.3, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
        {value}
      </motion.span>
      {suffix && <span className="ml-0.5 text-slate-500">{suffix}</span>}
    </span>
  );
}
