/**
 * MedScan AI — shared domain types for the DEMO prototype.
 *
 * ⚠ All types describe SIMULATED clinical operations data only.
 *   Patients, staff, departments and clinical values are entirely fictional.
 */

/* ── Safety & classification ─────────────────────────────────────────── */

/**
 * The ONLY output the simulated decision-support module is permitted to emit.
 * It is a *workflow routing* label — never a diagnosis.
 */
export const WORKFLOW_CLASSES = ["ROUTINE", "PRIORITY", "IMMEDIATE CLINICAL REVIEW"] as const;
export type WorkflowClassification = (typeof WORKFLOW_CLASSES)[number];

export const CLASSIFICATION_DISCLAIMER = "Decision-support only — clinician review required.";
export const DEMO_BANNER = "DEMO / SIMULATED CLINICAL OPERATIONS";

/* ── Intake ──────────────────────────────────────────────────────────── */

export type AcuityBand = 1 | 2 | 3 | 4 | 5;
export type Modality = "CT" | "MRI" | "X-RAY" | "ULTRASOUND" | "LAB" | "VITALS" | "NONE";
export type Sex = "F" | "M" | "X";

export interface IntakeVitals {
  systolic: number;
  diastolic: number;
  heartRate: number;
  spo2: number;
  temp: number;
  respRate: number;
}

export interface IntakeSubmission {
  id: string;
  createdAt: number;
  /** Fictional identifier — no real person is represented. */
  mrn: string;
  displayName: string;
  age: number;
  sex: Sex;
  departmentId: DepartmentId;
  modality: Modality;
  arrivalMode: "WALK_IN" | "AMBULANCE" | "TRANSFER" | "REFERRAL";
  chiefComplaint: string;
  symptomDuration: string;
  vitals: IntakeVitals;
  flags: string[];
  classification: WorkflowClassification;
  confidence: number;
  reasons: string[];
  assignedQueueId: string | null;
  clinicianReviewed: boolean;
}

/* ── Queue ───────────────────────────────────────────────────────────── */

export type QueueStage =
  | "REGISTERED"
  | "TRIAGE"
  | "IMAGING"
  | "LAB"
  | "CONSULT"
  | "DISCHARGE";

export type QueueStatus = "WAITING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETE";

export interface QueueTicket {
  id: string;
  ticketCode: string;
  mrn: string;
  displayName: string;
  age: number;
  sex: Sex;
  departmentId: DepartmentId;
  stage: QueueStage;
  status: QueueStatus;
  classification: WorkflowClassification;
  acuity: AcuityBand;
  arrivalAt: number;
  elapsedMinutes: number;
  waitMinutes: number;
  estimatedMinutes: number;
  zone: string;
  clinician: string | null;
  note: string;
}

/* ── Departments ─────────────────────────────────────────────────────── */

export type DepartmentId =
  | "emergency"
  | "imaging"
  | "cardiology"
  | "neurology"
  | "orthopedics"
  | "pediatrics"
  | "oncology"
  | "laboratory";

export type CapacityState = "OPTIMAL" | "ELEVATED" | "AT_CAPACITY" | "DIVERTING";

export interface Department {
  id: DepartmentId;
  code: string;
  name: string;
  floor: string;
  lead: string;
  staffOnDuty: number;
  staffPlanned: number;
  capacity: number;
  occupancy: number;
  capacityState: CapacityState;
  averageWait: number;
  openBays: number;
  totalBays: number;
  downstream: DepartmentId[];
  kpi: number;
  trend: number[];
}

/* ── Fictional patients ──────────────────────────────────────────────── */

export type PatientState = "ACTIVE" | "DISCHARGED" | "OBSERVATION" | "ADMITTED";

export interface MockPatient {
  id: string;
  mrn: string;
  displayName: string;
  age: number;
  sex: Sex;
  state: PatientState;
  departmentId: DepartmentId;
  classification: WorkflowClassification;
  acuity: AcuityBand;
  registeredAt: number;
  fictionalNote: string;
  encounterId: string;
  pathway: string;
  allergies: string[];
  careTeam: string[];
  coverage: string;
  lastUpdated: number;
}

export interface TimelineEvent {
  id: string;
  at: number;
  actor: string;
  role: string;
  title: string;
  detail: string;
  kind: "INTAKE" | "ASSESS" | "IMAGING" | "LAB" | "HANDOFF" | "REVIEW" | "DISPOSITION";
}

/* ── Analytics ───────────────────────────────────────────────────────── */

export interface HourlyVolume {
  hour: string;
  arrivals: number;
  discharges: number;
  waitIndex: number;
}

export interface DepartmentLoad {
  name: string;
  occupancy: number;
  wait: number;
  throughput: number;
}

export interface TrendPoint {
  label: string;
  intake: number;
  priority: number;
  immediate: number;
}

export interface ClassificationSplit {
  name: string;
  value: number;
  color: string;
}

export interface ModalityUtilization {
  modality: string;
  scheduled: number;
  completed: number;
  utilization: number;
}

/* ── Activity feed & alerts ──────────────────────────────────────────── */

export type ActivitySeverity = "INFO" | "NOTICE" | "ACTION" | "URGENT";

export interface ActivityEvent {
  id: string;
  at: number;
  severity: ActivitySeverity;
  source: string;
  message: string;
}

/* ── Clinical pathways (simulated orchestration) ─────────────────────── */

export type StepState = "DONE" | "ACTIVE" | "QUEUED" | "BLOCKED";

export interface PathwayStep {
  id: string;
  label: string;
  owner: string;
  state: StepState;
  duration: string;
  detail: string;
}

export interface Pathway {
  id: string;
  code: string;
  name: string;
  departmentId: DepartmentId;
  cohort: number;
  adherence: number;
  averageCycle: string;
  steps: PathwayStep[];
}
