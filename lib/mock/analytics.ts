import type {
  ActivityEvent,
  ClassificationSplit,
  DepartmentLoad,
  HourlyVolume,
  ModalityUtilization,
  TrendPoint,
} from "@/lib/types";
import { DEPARTMENTS } from "@/lib/mock/departments";

/* ── Hourly flow (last 14 simulated hours) ───────────────────────────── */

const ARRIVALS = [18, 14, 11, 9, 12, 21, 33, 47, 58, 64, 61, 55, 49, 44];
const DISCHARGES = [12, 10, 8, 7, 9, 15, 24, 35, 44, 52, 57, 53, 47, 41];
const WAIT_INDEX = [22, 20, 18, 17, 19, 24, 29, 34, 38, 42, 40, 37, 33, 30];

export const HOURLY_VOLUME: HourlyVolume[] = ARRIVALS.map((_, i) => {
  const hour = (new Date().getHours() - 13 + i + 24) % 24;
  return {
    hour: `${String(hour).padStart(2, "0")}:00`,
    arrivals: ARRIVALS[i],
    discharges: DISCHARGES[i],
    waitIndex: WAIT_INDEX[i],
  };
});

/* ── 7-day trend ─────────────────────────────────────────────────────── */

export const WEEKLY_TREND: TrendPoint[] = [
  { label: "Mon", intake: 412, priority: 96, immediate: 14 },
  { label: "Tue", intake: 438, priority: 104, immediate: 11 },
  { label: "Wed", intake: 401, priority: 88, immediate: 9 },
  { label: "Thu", intake: 476, priority: 121, immediate: 18 },
  { label: "Fri", intake: 523, priority: 138, immediate: 21 },
  { label: "Sat", intake: 389, priority: 82, immediate: 12 },
  { label: "Sun", intake: 342, priority: 71, immediate: 8 },
];

/* ── Classification split (simulated workflow routing) ───────────────── */

export const CLASSIFICATION_SPLIT: ClassificationSplit[] = [
  { name: "Routine", value: 2_486, color: "#34D399" },
  { name: "Priority", value: 704, color: "#FBBF24" },
  { name: "Immediate clinical review", value: 118, color: "#EF4444" },
];

/* ── Department load comparison ──────────────────────────────────────── */

export const DEPARTMENT_LOAD: DepartmentLoad[] = DEPARTMENTS.map((d) => ({
  name: d.code,
  occupancy: Math.round((d.occupancy / d.capacity) * 100),
  wait: d.averageWait,
  throughput: Math.round(d.capacity * (d.kpi / 100)),
}));

/* ── Modality utilisation (simulated) ────────────────────────────────── */

export const MODALITY_UTILIZATION: ModalityUtilization[] = [
  { modality: "CT", scheduled: 148, completed: 136, utilization: 92 },
  { modality: "MRI", scheduled: 74, completed: 61, utilization: 82 },
  { modality: "X-RAY", scheduled: 212, completed: 205, utilization: 97 },
  { modality: "ULTRASOUND", scheduled: 96, completed: 79, utilization: 82 },
  { modality: "LAB", scheduled: 540, completed: 528, utilization: 98 },
];

/* ── Cycle-time distribution (minutes) ───────────────────────────────── */

export const CYCLE_TIME_BUCKETS = [
  { bucket: "0–15", count: 142 },
  { bucket: "15–30", count: 318 },
  { bucket: "30–45", count: 402 },
  { bucket: "45–60", count: 297 },
  { bucket: "60–90", count: 186 },
  { bucket: "90+", count: 74 },
];

/* ── Rolling KPI series ──────────────────────────────────────────────── */

export const THROUGHPUT_SERIES = [
  { t: "W1", value: 61 },
  { t: "W2", value: 64 },
  { t: "W3", value: 63 },
  { t: "W4", value: 68 },
  { t: "W5", value: 72 },
  { t: "W6", value: 70 },
  { t: "W7", value: 75 },
  { t: "W8", value: 79 },
];

export const WAIT_DISTRIBUTION = [
  { name: "Under 10m", value: 34, fill: "#34D399" },
  { name: "10–20m", value: 28, fill: "#22D3EE" },
  { name: "20–40m", value: 22, fill: "#FBBF24" },
  { name: "40m+", value: 16, fill: "#EF4444" },
];

/* ── Live activity feed ──────────────────────────────────────────────── */

const MINUTE = 60_000;

export const ACTIVITY_SEED: ActivityEvent[] = [
  {
    id: "ac-1",
    at: Date.now() - 2 * MINUTE,
    severity: "ACTION",
    source: "Decision Support",
    message: "Workflow classification emitted for ticket A-114 — immediate clinical review. Clinician sign-off pending.",
  },
  {
    id: "ac-2",
    at: Date.now() - 6 * MINUTE,
    severity: "INFO",
    source: "Imaging",
    message: "CT bay 3 released. Two queued tickets offered re-sequencing.",
  },
  {
    id: "ac-3",
    at: Date.now() - 11 * MINUTE,
    severity: "NOTICE",
    source: "Neurology",
    message: "Observation bay count at 1 of 5 — coordination board flagged elevated load.",
  },
  {
    id: "ac-4",
    at: Date.now() - 17 * MINUTE,
    severity: "INFO",
    source: "Laboratory",
    message: "Simulated panel worklist cleared for 9 tickets in the demo queue.",
  },
  {
    id: "ac-5",
    at: Date.now() - 24 * MINUTE,
    severity: "ACTION",
    source: "Intake",
    message: "Terminal 07 submitted a new simulated intake — routed to priority lane.",
  },
  {
    id: "ac-6",
    at: Date.now() - 33 * MINUTE,
    severity: "NOTICE",
    source: "Flow Coordination",
    message: "Downstream capacity check proposed for Emergency Intake → Imaging.",
  },
  {
    id: "ac-7",
    at: Date.now() - 41 * MINUTE,
    severity: "URGENT",
    source: "Emergency Intake",
    message: "Wait index crossed the local action threshold — coordinator notified.",
  },
  {
    id: "ac-8",
    at: Date.now() - 52 * MINUTE,
    severity: "INFO",
    source: "Pathways",
    message: "Rapid Cardiac Assessment adherence steady at 91% across the demo cohort.",
  },
];

/* ── Operational alerts (mock, never colour-only) ────────────────────── */

export interface OpsAlert {
  id: string;
  severity: "ACTION" | "NOTICE" | "URGENT";
  title: string;
  detail: string;
  department: string;
  age: string;
}

export const OPS_ALERTS: OpsAlert[] = [
  {
    id: "al-1",
    severity: "ACTION",
    title: "Re-sequence suggested for Imaging lane",
    detail: "Three routine tickets waiting beyond the local target window.",
    department: "Diagnostic Imaging",
    age: "4m",
  },
  {
    id: "al-2",
    severity: "NOTICE",
    title: "Staffing gap on Neuro Observations",
    detail: "7 of 9 planned roles marked on duty in the simulated rota.",
    department: "Neuro Observations",
    age: "18m",
  },
  {
    id: "al-3",
    severity: "URGENT",
    title: "Wait index above local threshold",
    detail: "Emergency Intake wait index at 38 against a demo threshold of 35.",
    department: "Emergency Intake",
    age: "26m",
  },
];

export const HEADLINE_KPI = {
  census: 141,
  waiting: 37,
  avgCycle: 34,
  occupancy: 76,
  reviewed: 96,
};
