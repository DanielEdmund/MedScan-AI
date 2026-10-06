"use client";

import * as React from "react";
import { cn, initialsOf } from "@/lib/utils";

function Avatar({
  name,
  className,
  tone = "cyan",
}: {
  name: string;
  className?: string;
  tone?: "cyan" | "blue" | "mint" | "amber" | "red" | "slate";
}) {
  const tones: Record<string, string> = {
    cyan: "from-cyan-400/30 to-blue-500/20 text-cyan-200 border-cyan-400/30",
    blue: "from-blue-500/30 to-blue-600/20 text-blue-200 border-blue-500/30",
    mint: "from-emerald-400/30 to-emerald-600/20 text-emerald-200 border-emerald-400/30",
    amber: "from-amber-400/30 to-amber-600/20 text-amber-200 border-amber-400/30",
    red: "from-red-500/30 to-red-600/20 text-red-200 border-red-500/30",
    slate: "from-slate-400/25 to-slate-600/20 text-slate-200 border-slate-400/30",
  };
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full border bg-gradient-to-br text-[11px] font-bold tracking-wide",
        tones[tone],
        className,
      )}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}

export { Avatar };
