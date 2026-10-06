"use client";

import * as React from "react";
import { useSystemStore } from "@/lib/store/system-store";
import { useQueueStore } from "@/lib/store/queue-store";

/**
 * Drives the simulated queue board.
 *
 * ⚠ This is a local timer mutating local state only. There is no connection
 *   to any hospital, queue, appointment or notification system.
 */
export function SimulationDriver() {
  const simulationRunning = useSystemStore((s) => s.simulationRunning);
  const speed = useSystemStore((s) => s.speed);
  const bump = useSystemStore((s) => s.bump);
  const simulateTick = useQueueStore((s) => s.simulateTick);

  React.useEffect(() => {
    if (!simulationRunning || speed === 0) return;
    const interval = Math.max(900, 4200 / speed);
    const id = window.setInterval(() => {
      simulateTick(speed);
      bump();
    }, interval);
    return () => window.clearInterval(id);
  }, [simulationRunning, speed, simulateTick, bump]);

  return null;
}
