"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  openId: string | null;
  setOpenId: (id: string | null) => void;
}

const AccordionContext = React.createContext<AccordionContextValue>({
  openId: null,
  setOpenId: () => {},
});

function Accordion({
  children,
  className,
  defaultValue = null,
}: {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string | null;
}) {
  const [openId, setOpenId] = React.useState<string | null>(defaultValue);
  return (
    <AccordionContext.Provider value={{ openId, setOpenId }}>
      <div className={cn("divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-navy/70", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-4", className)} data-state="item">{children}</div>;
}

function AccordionTrigger({
  id,
  children,
  className,
  icon,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  const { openId, setOpenId } = React.useContext(AccordionContext);
  const open = openId === id;
  return (
    <button
      type="button"
      onClick={() => setOpenId(open ? null : id)}
      aria-expanded={open}
      className={cn(
        "flex w-full items-center justify-between gap-3 py-4 text-left text-sm font-medium text-slate-200 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40",
        className,
      )}
    >
      <span className="flex items-center gap-3">{children}</span>
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 text-slate-400 transition-transform duration-300",
          open && "rotate-45 border-cyan/40 text-cyan-300",
        )}
      >
        {icon ?? (
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M8 3v10M3 8h10" strokeLinecap="round" />
          </svg>
        )}
      </span>
    </button>
  );
}

function AccordionContent({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { openId } = React.useContext(AccordionContext);
  const open = openId === id;
  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className={cn("overflow-hidden", className)}>
        <div className="pb-4 text-sm text-slate-400">{children}</div>
      </div>
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
