"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Progress ────────────────────────────────────────────────────────── */

interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
  barClassName?: string;
  indicator?: "auto" | "cyan" | "blue" | "mint" | "amber" | "red";
}

function progressTone(pct: number, forced?: ProgressProps["indicator"]) {
  if (forced && forced !== "auto") return forced;
  if (pct >= 92) return "red";
  if (pct >= 78) return "amber";
  if (pct >= 45) return "cyan";
  return "mint";
}

const toneMap: Record<string, string> = {
  cyan: "bg-cyan-400",
  blue: "bg-blue-500",
  mint: "bg-emerald-400",
  amber: "bg-amber-400",
  red: "bg-red-500",
};

function Progress({ value = 0, max = 100, className, barClassName, indicator }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const tone = progressTone(pct, indicator);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]",
        className,
      )}
    >
      <motion.div
        className={cn("h-full rounded-full", toneMap[tone], barClassName)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

/* ── Separator ───────────────────────────────────────────────────────── */

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "shrink-0 bg-white/8",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
    />
  );
}

/* ── Switch ──────────────────────────────────────────────────────────── */

function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "border-cyan/50 bg-cyan/30" : "border-white/12 bg-white/[0.07]",
        className,
      )}
    >
      <motion.span
        className={cn(
          "ml-0.5 block rounded-full shadow-lg",
          checked ? "bg-cyan-300" : "bg-slate-400",
        )}
        style={{ height: 18, width: 18 }}
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 520, damping: 32 }}
      />
    </button>
  );
}

/* ── Checkbox ────────────────────────────────────────────────────────── */

function Checkbox({
  checked,
  onCheckedChange,
  className,
  disabled,
  "aria-label": ariaLabel,
}: {
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const state = !!checked;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!state)}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[5px] border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight disabled:cursor-not-allowed disabled:opacity-50",
        state
          ? "border-cyan/60 bg-cyan/80 text-midnight"
          : "border-white/20 bg-midnight/60 hover:border-white/40",
        className,
      )}
      style={{ height: 18, width: 18 }}
    >
      <svg
        viewBox="0 0 16 16"
        className={cn("h-3 w-3 transition-opacity", state ? "opacity-100" : "opacity-0")}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 8.5l3.2 3.2L13 4.5" />
      </svg>
    </button>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────────── */

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/[0.06]", className)}
      {...props}
    />
  );
}

/* ── Animated stagger container ──────────────────────────────────────── */

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const riseItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export {
  Progress,
  Separator,
  Switch,
  Checkbox,
  Skeleton,
  stagger,
  riseItem,
  progressTone,
  toneMap,
};
