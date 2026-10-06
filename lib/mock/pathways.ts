import type { Pathway } from "@/lib/types";

/**
 * Simulated clinical workflow orchestration templates.
 * These are demonstration steps only — no protocol, order set or
 * clinical guideline is reproduced here.
 */
export const PATHWAYS: Pathway[] = [
  {
    id: "pw-imaging",
    code: "IMG-STD",
    name: "Standard Imaging Pathway",
    departmentId: "imaging",
    cohort: 412,
    adherence: 94,
    averageCycle: "48m",
    steps: [
      { id: "s1", label: "Intake packet received", owner: "Registration", state: "DONE", duration: "4m", detail: "Simulated registration data staged locally." },
      { id: "s2", label: "Workflow classification", owner: "Decision Support", state: "DONE", duration: "<1s", detail: "Routing label only — no diagnostic output." },
      { id: "s3", label: "Modality slot reserved", owner: "Imaging Control", state: "DONE", duration: "9m", detail: "Demo scheduler assigns a fictional slot." },
      { id: "s4", label: "Technologist review", owner: "Imaging", state: "ACTIVE", duration: "12m", detail: "Awaiting simulated technologist acknowledgement." },
      { id: "s5", label: "Radiologist read queue", owner: "Reporting", state: "QUEUED", duration: "18m", detail: "Queued in the prototype — no reporting system exists." },
      { id: "s6", label: "Disposition handoff", owner: "Flow Desk", state: "QUEUED", duration: "5m", detail: "Requires clinician sign-off." },
    ],
  },
  {
    id: "pw-cardiac",
    code: "CAR-RAPID",
    name: "Rapid Cardiac Assessment",
    departmentId: "cardiology",
    cohort: 186,
    adherence: 91,
    averageCycle: "27m",
    steps: [
      { id: "s1", label: "Priority lane entry", owner: "Triage", state: "DONE", duration: "2m", detail: "Simulated priority routing applied." },
      { id: "s2", label: "Baseline observations", owner: "Nursing", state: "DONE", duration: "6m", detail: "Fictional demo vitals captured." },
      { id: "s3", label: "Clinician review window", owner: "Cardiology", state: "ACTIVE", duration: "9m", detail: "Decision-support summary presented for review." },
      { id: "s4", label: "Observation period", owner: "Nursing", state: "QUEUED", duration: "15m", detail: "Simulated observation hold." },
      { id: "s5", label: "Disposition draft", owner: "Flow Desk", state: "QUEUED", duration: "4m", detail: "Draft pathway only." },
    ],
  },
  {
    id: "pw-neuro",
    code: "NEU-OBS",
    name: "Neuro Observation Pathway",
    departmentId: "neurology",
    cohort: 94,
    adherence: 82,
    averageCycle: "66m",
    steps: [
      { id: "s1", label: "Intake packet received", owner: "Registration", state: "DONE", duration: "5m", detail: "Local mock data." },
      { id: "s2", label: "Baseline observations", owner: "Nursing", state: "DONE", duration: "7m", detail: "Simulated values." },
      { id: "s3", label: "Imaging handoff proposed", owner: "Coordination", state: "BLOCKED", duration: "—", detail: "Blocked — downstream bay availability below threshold." },
      { id: "s4", label: "Serial reassessment", owner: "Neurology", state: "QUEUED", duration: "20m", detail: "Scheduled in prototype only." },
      { id: "s5", label: "Disposition draft", owner: "Flow Desk", state: "QUEUED", duration: "6m", detail: "Requires clinician sign-off." },
    ],
  },
  {
    id: "pw-pediatric",
    code: "PED-TRI",
    name: "Pediatric Triage Pathway",
    departmentId: "pediatrics",
    cohort: 231,
    adherence: 97,
    averageCycle: "31m",
    steps: [
      { id: "s1", label: "Guardian intake packet", owner: "Registration", state: "DONE", duration: "4m", detail: "Fictional guardian record." },
      { id: "s2", label: "Age-adjusted routing", owner: "Decision Support", state: "DONE", duration: "<1s", detail: "Routing label only — no clinical determination." },
      { id: "s3", label: "Nursing assessment", owner: "Pediatrics", state: "ACTIVE", duration: "8m", detail: "Simulated assessment step." },
      { id: "s4", label: "Clinician review window", owner: "Pediatrics", state: "QUEUED", duration: "11m", detail: "Awaiting review." },
      { id: "s5", label: "Discharge readiness", owner: "Flow Desk", state: "QUEUED", duration: "8m", detail: "Draft only." },
    ],
  },
  {
    id: "pw-lab",
    code: "LAB-WKUP",
    name: "Laboratory Work-up",
    departmentId: "laboratory",
    cohort: 638,
    adherence: 98,
    averageCycle: "22m",
    steps: [
      { id: "s1", label: "Panel added to worklist", owner: "Laboratory", state: "DONE", duration: "2m", detail: "Simulated order — invented sample values." },
      { id: "s2", label: "Specimen logged", owner: "Laboratory", state: "DONE", duration: "5m", detail: "No physical specimen exists." },
      { id: "s3", label: "Automated check pass", owner: "Laboratory", state: "ACTIVE", duration: "6m", detail: "Demo quality gate." },
      { id: "s4", label: "Reviewer acknowledgement", owner: "Pathology", state: "QUEUED", duration: "9m", detail: "Requires human acknowledgement." },
    ],
  },
];

export const pathwayById = (id: string) => PATHWAYS.find((p) => p.id === id);
