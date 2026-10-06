"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Mini sparkline (pure SVG — no chart lib needed) ─────────────────── */

export function Sparkline({
  data,
  className,
  stroke = "#22D3EE",
  fill = true,
  width = 96,
  height = 30,
}: {
  data: number[];
  className?: string;
  stroke?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 4) - 2]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const id = `spark-${stroke.replace("#", "")}-${data.length}-${Math.round(data[0])}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      width={width}
      height={height}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${id})`} />}
      <motion.path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2.5} fill={stroke} />
    </svg>
  );
}

/* ── Delta indicator ─────────────────────────────────────────────────── */

export function Delta({
  value,
  suffix = "%",
  invert = false,
  className,
}: {
  value: number;
  suffix?: string;
  invert?: boolean;
  className?: string;
}) {
  const positive = value > 0;
  const neutral = value === 0;
  const good = invert ? !positive : positive;
  const Icon = neutral ? Minus : positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold mono-nums",
        neutral
          ? "bg-white/[0.05] text-slate-400"
          : good
            ? "bg-emerald-400/10 text-emerald-300"
            : "bg-amber-400/10 text-amber-300",
        className,
      )}
      title={`${value > 0 ? "+" : ""}${value}${suffix} vs previous window`}
    >
      <Icon className="h-3 w-3" />
      {`${value > 0 ? "+" : ""}${value}${suffix}`}
    </span>
  );
}

/* ── Metric card ─────────────────────────────────────────────────────── */

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaInvert?: boolean;
  icon: LucideIcon;
  tone?: "cyan" | "blue" | "mint" | "amber" | "red" | "slate";
  spark?: number[];
  caption?: string;
  className?: string;
  index?: number;
}

const TONES: Record<string, { icon: string; ring: string; spark: string }> = {
  cyan: { icon: "text-cyan-300 bg-cyan-400/10 border-cyan-400/25", ring: "from-cyan-400/10", spark: "#22D3EE" },
  blue: { icon: "text-blue-400 bg-blue-500/10 border-blue-500/25", ring: "from-blue-500/10", spark: "#3B82F6" },
  mint: { icon: "text-emerald-300 bg-emerald-400/10 border-emerald-400/25", ring: "from-emerald-400/10", spark: "#34D399" },
  amber: { icon: "text-amber-300 bg-amber-400/10 border-amber-400/25", ring: "from-amber-400/10", spark: "#FBBF24" },
  red: { icon: "text-red-400 bg-red-500/10 border-red-500/25", ring: "from-red-500/10", spark: "#EF4444" },
  slate: { icon: "text-slate-300 bg-white/[0.05] border-white/10", ring: "from-white/5", spark: "#94A3B8" },
};

export function MetricCard({
  label,
  value,
  unit,
  delta,
  deltaInvert,
  icon: Icon,
  tone = "cyan",
  spark,
  caption,
  className,
  index = 0,
}: MetricCardProps) {
  const t = TONES[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.06] bg-navy/80 p-4 shadow-panel transition-colors hover:border-white/[0.12]",
        className,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent opacity-60", t.ring)} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label-caps truncate">{label}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-semibold tracking-tight text-slate-50 mono-nums">
              {value}
            </span>
            {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
          </div>
          <div className="mt-2 flex items-center gap-2">
            {typeof delta === "number" && <Delta value={delta} invert={deltaInvert} />}
            {caption && <span className="truncate text-[11px] text-slate-500">{caption}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border transition-transform group-hover:scale-105",
              t.icon,
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          {spark && <Sparkline data={spark} stroke={t.spark} width={78} height={26} />}
        </div>
      </div>
    </motion.div>
  );
}
