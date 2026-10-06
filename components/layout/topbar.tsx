"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Command,
  Gauge,
  Home,
  Pause,
  Play,
  Rocket,
  Search,
} from "lucide-react";
import { cn, formatClock } from "@/lib/utils";
import { useSystemStore, type SimulationSpeed } from "@/lib/store/system-store";
import { useQueueStore, selectCounts } from "@/lib/store/queue-store";
import { NAV_GROUPS } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { DemoTag, SignalDot } from "@/components/shared/status";

const SPEEDS: SimulationSpeed[] = [0, 1, 2, 4];

export function Topbar() {
  const pathname = usePathname();
  const { simulationRunning, speed, setSpeed, toggleRunning, tick } = useSystemStore();
  const counts = useQueueStore(selectCounts);
  const [now, setNow] = React.useState<Date | null>(null);
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const label = React.useMemo(() => {
    for (const g of NAV_GROUPS) {
      const hit = g.items.find((i) => i.href === pathname);
      if (hit) return { group: g.label, page: hit.label };
    }
    if (pathname.startsWith("/console/patients/")) return { group: "Clinical", page: "Patient Record" };
    return { group: "Platform", page: "MedScan AI" };
  }, [pathname]);

  return (
    <header className="glass-bar sticky top-0 z-30">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="hidden min-w-0 items-center gap-2 sm:flex">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            <Home className="h-3.5 w-3.5" />
            <span>MedScan AI</span>
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-xs text-slate-500">{label.group}</span>
          <span className="text-slate-700">/</span>
          <span className="truncate text-xs font-semibold text-slate-200">{label.page}</span>
        </div>

        {/* Search (visual only) */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="group ml-auto hidden h-9 w-full max-w-[260px] items-center gap-2 rounded-lg border border-white/10 bg-midnight/60 px-3 text-left text-xs text-slate-500 transition-colors hover:border-cyan/40 hover:text-slate-300 md:flex lg:ml-0"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1">Search demo board…</span>
          <kbd className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {/* Simulation transport controls */}
          <div className="flex h-9 items-center gap-1 rounded-lg border border-white/10 bg-midnight/60 px-1.5">
            <button
              type="button"
              onClick={toggleRunning}
              aria-label={simulationRunning ? "Pause simulation" : "Resume simulation"}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                simulationRunning
                  ? "bg-cyan/15 text-cyan-300 hover:bg-cyan/25"
                  : "bg-amber-400/15 text-amber-300 hover:bg-amber-400/25",
              )}
            >
              {simulationRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <div className="hidden items-center gap-0.5 sm:flex">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  aria-label={`Simulation speed ${s}x`}
                  className={cn(
                    "h-7 rounded-md px-1.5 text-[10px] font-bold mono-nums transition-colors",
                    speed === s
                      ? "bg-white/[0.09] text-cyan-300"
                      : "text-slate-500 hover:text-slate-300",
                  )}
                >
                  {s === 0 ? "0×" : `${s}×`}
                </button>
              ))}
            </div>
            <span className="hidden border-l border-white/10 pl-2 pr-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:inline">
              Sim
            </span>
          </div>

          {/* Live clock */}
          <div className="hidden h-9 items-center gap-2 rounded-lg border border-white/10 bg-midnight/60 px-3 lg:flex">
            <SignalDot tone={simulationRunning ? "mint" : "amber"} pulse={simulationRunning} />
            <span className="text-xs font-semibold text-slate-300 mono-nums">
              {now ? formatClock(now) : "--:--:--"}
            </span>
            <span className="text-[10px] text-slate-600">· tick {tick}</span>
          </div>

          {/* Queue counters */}
          <Link
            href="/console/queue"
            className="hidden h-9 items-center gap-2 rounded-lg border border-white/10 bg-midnight/60 px-3 transition-colors hover:border-cyan/40 xl:flex"
            title="Simulated waiting count"
          >
            <Gauge className="h-3.5 w-3.5 text-cyan-300" />
            <span className="text-xs font-semibold text-slate-200 mono-nums">{counts.waiting}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">waiting</span>
          </Link>

          <Button asChild size="sm" variant="cyan" className="hidden sm:inline-flex">
            <Link href="/console/intake">
              <Rocket className="h-3.5 w-3.5" />
              New intake
            </Link>
          </Button>

          <div className="flex h-9 items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/[0.07] px-2.5">
            <Command className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden text-[9.5px] font-bold uppercase leading-none tracking-[0.14em] text-amber-300 sm:inline">
              Demo mode
            </span>
          </div>
        </div>
      </div>

      {/* Persistent demo strip */}
      <motion.div
        initial={false}
        className="flex items-center justify-center gap-2 border-t border-amber-400/20 bg-gradient-to-r from-amber-400/[0.06] via-amber-400/[0.03] to-amber-400/[0.06] px-4 py-1"
      >
        <DemoTag className="border-none bg-transparent px-0 py-0" />
        <span className="hidden text-[10px] text-amber-200/70 sm:inline">
          · Fictional patients · Mock analytics · No real clinical systems connected
        </span>
      </motion.div>

      {searchOpen && <CommandPalette onClose={() => setSearchOpen(false)} />}
    </header>
  );
}

/* ── Lightweight visual command palette ──────────────────────────────── */

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = React.useState("");
  const results = React.useMemo(() => {
    const all = NAV_GROUPS.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })));
    if (!q.trim()) return all;
    const needle = q.toLowerCase();
    return all.filter(
      (i) => i.label.toLowerCase().includes(needle) || i.hint.toLowerCase().includes(needle),
    );
  }, [q]);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-midnight/85 px-4 pt-[14vh] backdrop-blur-sm">
      <button type="button" aria-label="Close search" onClick={onClose} className="absolute inset-0" />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-navy shadow-panel">
        <div className="flex items-center gap-3 border-b border-white/8 px-4">
          <Search className="h-4 w-4 text-cyan-300" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to a module…"
            className="h-12 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
          <kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-500">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {results.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-cyan/[0.08]"
            >
              <r.icon className="h-4 w-4 text-slate-400" />
              <span className="flex-1">
                <span className="block text-sm text-slate-200">{r.label}</span>
                <span className="block text-[11px] text-slate-500">{r.hint}</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-600">{r.group}</span>
            </Link>
          ))}
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-slate-500">No matching module.</p>
          )}
        </div>
      </div>
    </div>
  );
}
