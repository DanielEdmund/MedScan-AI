"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Boxes,
  FlaskConical,
  LayoutGrid,
  ListOrdered,
  Radar,
  Settings2,
  ShieldCheck,
  Users,
  Workflow,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueueStore, selectCounts } from "@/lib/store/queue-store";
import { SignalDot } from "@/components/shared/status";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  hint: string;
  badge?: "live" | "count" | "attention";
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Command",
    items: [
      { href: "/console", label: "Command Center", icon: LayoutGrid, hint: "Live operations overview", badge: "live" },
      { href: "/console/queue", label: "Live Queue Board", icon: ListOrdered, hint: "Simulated queue movement", badge: "count" },
      { href: "/console/intake", label: "Patient Intake", icon: FlaskConical, hint: "Simulated intake terminal" },
    ],
  },
  {
    label: "Clinical",
    items: [
      { href: "/console/decision-support", label: "Decision Support", icon: Radar, hint: "Workflow routing assistant", badge: "attention" },
      { href: "/console/patients", label: "Patient Registry", icon: Users, hint: "Fictional demo subjects" },
      { href: "/console/pathways", label: "Pathways", icon: Workflow, hint: "Workflow orchestration" },
    ],
  },
  {
    label: "Coordination",
    items: [
      { href: "/console/departments", label: "Departments", icon: Boxes, hint: "Capacity & handoffs" },
      { href: "/console/analytics", label: "Analytics", icon: Activity, hint: "Mock operational metrics" },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/console/system", label: "System & Safety", icon: Settings2, hint: "Demo controls and guardrails" },
    ],
  },
];

function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 shadow-glow",
        className,
      )}
    >
      <Radar className="h-5 w-5 text-cyan-300" />
      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
    </span>
  );
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === item.href;
  const counts = useQueueStore(selectCounts);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50",
        active
          ? "bg-cyan/[0.09] text-cyan-200 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.22)]"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-rail"
          className="absolute -left-3 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
          transition={{ type: "spring", stiffness: 480, damping: 38 }}
        />
      )}
      <item.icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          active ? "text-cyan-300" : "text-slate-500 group-hover:text-slate-300",
        )}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge === "live" && <SignalDot tone="mint" />}
      {item.badge === "count" && (
        <span
          className={cn(
            "rounded-md border px-1.5 py-0.5 text-[10px] font-bold mono-nums",
            counts.waiting > 0
              ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
              : "border-white/10 bg-white/[0.04] text-slate-400",
          )}
        >
          {counts.waiting}
        </span>
      )}
      {item.badge === "attention" && (
        <span className="rounded-md border border-blue-500/35 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-400">
          DS
        </span>
      )}
    </Link>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-3 px-5 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50"
      >
        <BrandMark />
        <span className="min-w-0">
          <span className="block font-display text-[15px] font-semibold tracking-tight text-slate-50">
            MedScan <span className="text-cyan-300">AI</span>
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Clinical Operations
          </span>
        </span>
      </Link>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/[0.07] px-2.5 py-2">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-amber-300" />
          <span className="text-[9.5px] font-bold uppercase leading-tight tracking-[0.12em] text-amber-300">
            Demo / Simulated
            <br />
            Clinical Operations
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-none">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-3 pb-1.5 text-[9.5px] font-bold uppercase tracking-[0.2em] text-slate-600">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <div className="rounded-lg border border-white/[0.06] bg-midnight/60 p-3">
          <div className="flex items-center gap-2">
            <SignalDot tone="cyan" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
              Simulation online
            </span>
          </div>
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-slate-500">
            Local mock data only. No hospital system, device or record is connected.
          </p>
          <Link
            href="/console/system"
            onClick={onNavigate}
            className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Review guardrails →
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-white/[0.06] bg-navy/70 backdrop-blur-xl lg:block">
      <SidebarBody />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => setOpen(false), [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/15 text-cyan-200 shadow-glow backdrop-blur-xl"
      >
        <LayoutGrid className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-midnight/85 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 left-0 z-50 w-[284px] border-r border-white/10 bg-navy"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="absolute right-3 top-4 z-10 rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarBody onNavigate={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
