import Link from "next/link";
import { Compass, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_BANNER } from "@/lib/types";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-midnight px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-command-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />

      <div className="relative">
        <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 shadow-glow">
          <Radar className="h-7 w-7 text-cyan-300" />
        </span>
        <p className="label-caps mb-3">Signal lost · 404</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-gradient-white">
          That module isn’t on this board.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          The route you requested does not exist in the MedScan AI prototype. Head back to the
          command center and pick a live module.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/console">
              <Compass className="h-4 w-4" />
              Command center
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to overview</Link>
          </Button>
        </div>
        <p className="mt-6 text-[10.5px] uppercase tracking-[0.16em] text-amber-300/80">
          {DEMO_BANNER}
        </p>
      </div>
    </div>
  );
}
