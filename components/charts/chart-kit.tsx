"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

/* ── Shared dark-theme tokens for Recharts ───────────────────────────── */

export const AXIS = {
  stroke: "rgba(148,163,184,0.25)",
  tick: { fill: "#64748B", fontSize: 11, fontFamily: "var(--font-jetbrains)" },
} as const;

export const GRID = {
  stroke: "rgba(148,163,184,0.08)",
  strokeDasharray: "3 3",
} as const;

export const CYAN = "#22D3EE";
export const BLUE = "#3B82F6";
export const MINT = "#34D399";
export const AMBER = "#FBBF24";
export const RED = "#EF4444";
export const VIOLET = "#A78BFA";

interface TooltipEntry {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

function ChartTooltip({
  active,
  payload,
  label,
  unit = "",
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-navy/95 px-3 py-2 shadow-panel backdrop-blur-sm">
      {label !== undefined && (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <p key={i} className="flex items-center gap-2 text-xs text-slate-200">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: entry.color ?? CYAN }}
            />
            <span className="text-slate-400">{entry.name}</span>
            <span className="ml-auto font-semibold mono-nums">
              {entry.value}
              {unit}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

/* ── Chart frame ─────────────────────────────────────────────────────── */

export function ChartFrame({
  children,
  className,
  height = 260,
  note,
}: {
  children: React.ReactNode;
  className?: string;
  height?: number;
  note?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div style={{ height }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              {children as React.ReactElement}
            </ResponsiveContainer>
          </div>
      {note && <p className="mt-2 text-[11px] text-slate-500">{note}</p>}
    </div>
  );
}

/* ── Ready-made charts ───────────────────────────────────────────────── */

export function FlowAreaChart({
  data,
  xKey,
  series,
  height = 260,
  note,
}: {
  data: any[];
  xKey: string;
  series: Array<{ key: string; color: string; name: string }>;
  height?: number;
  note?: string;
}) {
  return (
    <ChartFrame height={height} note={note}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid {...GRID} vertical={false} />
        <XAxis dataKey={xKey} {...AXIS} tickLine={false} axisLine={false} />
        <YAxis {...AXIS} tickLine={false} axisLine={false} width={44} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(34,211,238,0.35)" }} />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ChartFrame>
  );
}

export function GroupedBarChart({
  data,
  xKey,
  series,
  height = 260,
  note,
  stacked = false,
}: {
  data: any[];
  xKey: string;
  series: Array<{ key: string; color: string; name: string }>;
  height?: number;
  note?: string;
  stacked?: boolean;
}) {
  return (
    <ChartFrame height={height} note={note}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={2}>
        <CartesianGrid {...GRID} vertical={false} />
        <XAxis dataKey={xKey} {...AXIS} tickLine={false} axisLine={false} />
        <YAxis {...AXIS} tickLine={false} axisLine={false} width={44} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(34,211,238,0.06)" }} />
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color}
            radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
            stackId={stacked ? "a" : undefined}
            maxBarSize={26}
          />
        ))}
      </BarChart>
    </ChartFrame>
  );
}

export function TrendLineChart({
  data,
  xKey,
  series,
  height = 260,
  note,
}: {
  data: any[];
  xKey: string;
  series: Array<{ key: string; color: string; name: string; dashed?: boolean }>;
  height?: number;
  note?: string;
}) {
  return (
    <ChartFrame height={height} note={note}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid {...GRID} vertical={false} />
        <XAxis dataKey={xKey} {...AXIS} tickLine={false} axisLine={false} />
        <YAxis {...AXIS} tickLine={false} axisLine={false} width={44} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(34,211,238,0.35)" }} />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            strokeDasharray={s.dashed ? "5 4" : undefined}
            dot={{ r: 3, strokeWidth: 0, fill: s.color }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ChartFrame>
  );
}

export function DonutChart({
  data,
  height = 240,
  note,
  centerLabel,
  centerValue,
}: {
  data: Array<{ name: string; value: number; color: string }>;
  height?: number;
  note?: string;
  centerLabel?: string;
  centerValue?: string;
}) {
  return (
    <div className="w-full">
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={3}
              stroke="none"
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={34}
              formatter={(value) => (
                <span className="text-[11px] text-slate-400">{value}</span>
              )}
            />
            {centerValue && (
              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                className="fill-slate-50"
                style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--font-jetbrains)" }}
              >
                {centerValue}
              </text>
            )}
            {centerLabel && (
              <text
                x="50%"
                y="57%"
                textAnchor="middle"
                className="fill-slate-500"
                style={{ fontSize: 10, letterSpacing: 1.5 }}
              >
                {centerLabel.toUpperCase()}
              </text>
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
      {note && <p className="mt-2 text-[11px] text-slate-500">{note}</p>}
    </div>
  );
}

export function HorizontalBars({
  data,
  height = 260,
  note,
  color = CYAN,
}: {
  data: Array<{ label: string; value: number; sub?: string }>;
  height?: number;
  note?: string;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="w-full">
      <div className="space-y-2.5" style={{ minHeight: height }}>
        {data.map((d, i) => (
          <div key={d.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-[11.5px] text-slate-300">{d.label}</span>
              <span className="text-[11px] font-semibold text-slate-400 mono-nums">
                {d.value}
                {d.sub && <span className="ml-1 font-normal text-slate-600">{d.sub}</span>}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(d.value / max) * 100}%`,
                  background: `linear-gradient(90deg, ${color}55, ${color})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {note && <p className="mt-3 text-[11px] text-slate-500">{note}</p>}
    </div>
  );
}
