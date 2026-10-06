import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Sidebar, MobileSidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SimulationDriver } from "@/components/layout/simulation-driver";
import { DEMO_BANNER } from "@/lib/types";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-midnight">
      {/* Command-center backdrop */}
      <div className="pointer-events-none fixed inset-0 bg-command-grid opacity-[0.55]" />
      <div className="pointer-events-none fixed inset-0 bg-radial-fade" />
      <div className="pointer-events-none fixed inset-0 bg-radial-cyan" />

      <Sidebar />
      <MobileSidebar />

      <div className="relative lg:pl-[264px]">
        <Topbar />
        <main className="mx-auto w-full max-w-[1520px] px-4 py-6 pb-24 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="mx-auto w-full max-w-[1520px] border-t border-white/[0.06] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
              <p>
                <span className="font-semibold text-slate-400">{DEMO_BANNER}</span> — MedScan AI is a
                front-end prototype. All patients, clinical values, queues and analytics are fictional
                and generated locally in the browser.
              </p>
            </div>
            <Link
              href="/"
              className="shrink-0 text-xs font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
            >
              Exit to overview →
            </Link>
          </div>
        </footer>
      </div>

      <SimulationDriver />
    </div>
  );
}
