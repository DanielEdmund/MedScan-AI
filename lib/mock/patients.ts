import type {
  MockPatient,
  PatientState,
  QueueTicket,
  TimelineEvent,
  WorkflowClassification,
} from "@/lib/types";

/**
 * ⚠ FICTIONAL DATA ONLY.
 * Every name, identifier and clinical value below is invented for the
 * MedScan AI prototype. No real patient or record is represented.
 */

const FIRST = [
  "Nova", "Arlen", "Vesper", "Cassian", "Liora", "Theron", "Isolde", "Rennick",
  "Elowen", "Dax", "Marisol", "Corwin", "Tamsin", "Oberon", "Sable", "Ingrid",
  "Lucan", "Nadia", "Fintan", "Seraphine", "Kael", "Ottilie", "Bram", "Yara",
  "Leander", "Mira", "Oswin", "Petra", "Rhoan", "Sylvie", "Tiberius", "Wren",
];

const LAST = [
  "Vance", "Okoro", "Lindqvist", "Marchetti", "Delacroix", "Halvorsen", "Ibarra",
  "Kowalski", "Nakamura", "Prescott", "Ravenscroft", "Solberg", "Thorne",
  "Ustinov", "Valdez", "Whitlock", "Xu", "Yamamoto", "Zeller", "Ashford",
  "Beaumont", "Castellan", "Duval", "Eriksen", "Fairhurst", "Grimaldi",
];

const PATHWAYS = [
  "Standard Imaging Pathway",
  "Rapid Cardiac Assessment",
  "Neuro Observation Pathway",
  "Pediatric Triage Pathway",
  "Ortho Trauma Pathway",
  "Laboratory Work-up",
  "Infusion Session Pathway",
  "Discharge Readiness Pathway",
];

const ALLERGY_POOL: string[][] = [
  ["Penicillin"],
  ["Latex"],
  ["No known allergies recorded"],
  ["Contrast agent (simulated)"],
  ["Sulfonamides"],
  ["No known allergies recorded"],
  ["Shellfish (simulated)"],
];

const TEAM = [
  "Dr. Ilse Brandt",
  "Dr. Marcus Oyelaran",
  "Dr. Priya Raghunathan",
  "Dr. Soren Vasquez",
  "Dr. Hana Lindqvist",
  "Dr. Amara Okonkwo",
  "Dr. Tobias Renner",
  "N. Ferreira, RN",
  "J. Aldridge, RN",
  "K. Mbeki, RN",
];

/** Small deterministic PRNG so the mock roster is stable across renders. */
function prng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

export function buildPatientRoster(count = 24): MockPatient[] {
  const rand = prng(90210);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length) % arr.length];
  const states: PatientState[] = ["ACTIVE", "OBSERVATION", "ADMITTED", "DISCHARGED"];
  const classes: WorkflowClassification[] = [
    "ROUTINE",
    "ROUTINE",
    "PRIORITY",
    "ROUTINE",
    "PRIORITY",
    "IMMEDIATE CLINICAL REVIEW",
    "ROUTINE",
    "PRIORITY",
  ];
  const depts = [
    "emergency", "imaging", "cardiology", "neurology",
    "orthopedics", "pediatrics", "oncology", "laboratory",
  ] as const;

  return Array.from({ length: count }, (_, i) => {
    const id = i + 1;
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    const dept = depts[Math.floor(rand() * depts.length) % depts.length];
    const classification = pick(classes);
    return {
      id: `pt-${String(id).padStart(3, "0")}`,
      mrn: `MSA-${String(48210 + id * 7).padStart(6, "0")}`,
      displayName: name,
      age: 6 + Math.floor(rand() * 78),
      sex: (["F", "M", "X"] as const)[Math.floor(rand() * 3) % 3],
      state: states[Math.floor(rand() * states.length) % states.length],
      departmentId: dept,
      classification,
      acuity: (classification === "IMMEDIATE CLINICAL REVIEW"
        ? 1
        : classification === "PRIORITY"
          ? 2 + Math.floor(rand() * 2)
          : 3 + Math.floor(rand() * 3)) as MockPatient["acuity"],
      registeredAt: Date.now() - Math.floor(rand() * 720) * 60_000,
      fictionalNote: "Simulated encounter — fictional subject, no real record.",
      encounterId: `ENC-${String(31000 + id * 13)}`,
      pathway: pick(PATHWAYS),
      allergies: pick(ALLERGY_POOL),
      careTeam: [pick(TEAM), pick(TEAM), pick(TEAM)].filter(
        (v, idx, a) => a.indexOf(v) === idx,
      ),
      coverage: ["Group Plan A", "Group Plan B", "Self-funded (simulated)"][
        Math.floor(rand() * 3) % 3
      ],
      lastUpdated: Date.now() - Math.floor(rand() * 90) * 60_000,
    } satisfies MockPatient;
  });
}

export const PATIENTS = buildPatientRoster(24);

export const patientById = (id: string) => PATIENTS.find((p) => p.id === id);

/* ── Simulated encounter timeline ────────────────────────────────────── */

const TIMELINE_TEMPLATES: Array<Omit<TimelineEvent, "id" | "at">> = [
  {
    actor: "Intake Terminal 04",
    role: "Registration",
    title: "Simulated registration completed",
    detail: "Fictional demographics validated against demo roster. No external system contacted.",
    kind: "INTAKE",
  },
  {
    actor: "N. Ferreira, RN",
    role: "Triage",
    title: "Baseline observations recorded",
    detail: "Demo vitals captured on the simulated workflow board.",
    kind: "ASSESS",
  },
  {
    actor: "Imaging Control",
    role: "Diagnostic Imaging",
    title: "Study queued for review",
    detail: "Mock modality slot reserved. No device or PACS connection exists.",
    kind: "IMAGING",
  },
  {
    actor: "Laboratory Services",
    role: "Pathology",
    title: "Panel added to worklist",
    detail: "Simulated laboratory order — values are invented sample data.",
    kind: "LAB",
  },
  {
    actor: "Dr. Ilse Brandt",
    role: "Clinician",
    title: "Decision-support summary acknowledged",
    detail: "Clinician retains full authority. Output is workflow routing only.",
    kind: "REVIEW",
  },
  {
    actor: "Charge Desk",
    role: "Coordination",
    title: "Handoff proposed to next department",
    detail: "Downstream capacity checked on the demo coordination board.",
    kind: "HANDOFF",
  },
  {
    actor: "Flow Coordinator",
    role: "Operations",
    title: "Disposition pathway drafted",
    detail: "Draft only — requires clinician sign-off inside the prototype.",
    kind: "DISPOSITION",
  },
];

export function buildTimeline(patientId: string, seed = 7): TimelineEvent[] {
  const rand = prng(patientId.length * 977 + seed);
  const count = 5 + Math.floor(rand() * 3);
  let at = Date.now() - Math.floor(rand() * 45 + 5) * 60_000;
  const events: TimelineEvent[] = [];
  for (let i = 0; i < count; i++) {
    const tpl = TIMELINE_TEMPLATES[i % TIMELINE_TEMPLATES.length];
    at -= Math.floor(rand() * 22 + 4) * 60_000;
    events.push({ ...tpl, id: `${patientId}-ev-${i}`, at });
  }
  return events.reverse();
}

/* ── Initial queue board seed ────────────────────────────────────────── */

const QUEUE_NOTES = [
  "Awaiting modality slot allocation",
  "Observation bay reassigned by charge desk",
  "Simulated transport requested",
  "Coordinator reviewing downstream capacity",
  "Hold pending demo lab panel",
  "Re-assessment window opened",
  "Priority lane merge proposed",
  "Discharge paperwork drafted (simulated)",
];

export function buildQueueSeed(): QueueTicket[] {
  const rand = prng(1337);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length) % arr.length];
  const classes: WorkflowClassification[] = [
    "ROUTINE", "PRIORITY", "ROUTINE", "IMMEDIATE CLINICAL REVIEW",
    "PRIORITY", "ROUTINE", "ROUTINE", "PRIORITY", "ROUTINE", "IMMEDIATE CLINICAL REVIEW",
    "ROUTINE", "PRIORITY",
  ];
  const stages = ["REGISTERED", "TRIAGE", "IMAGING", "LAB", "CONSULT", "DISCHARGE"] as const;
  const statuses = [
    "WAITING", "WAITING", "IN_PROGRESS", "WAITING", "IN_PROGRESS", "ON_HOLD",
    "WAITING", "IN_PROGRESS", "WAITING", "IN_PROGRESS", "WAITING", "COMPLETE",
  ] as const;
  const zones = ["A1", "A2", "B1", "B2", "C1", "C2", "D1"];

  return classes.map((classification, i) => {
    const arrivalAt = Date.now() - Math.floor(rand() * 74 + 4) * 60_000;
    const elapsed = Math.round((Date.now() - arrivalAt) / 60_000);
    const acuity =
      classification === "IMMEDIATE CLINICAL REVIEW"
        ? 1
        : classification === "PRIORITY"
          ? 2 + Math.floor(rand() * 2)
          : 3 + Math.floor(rand() * 3);
    return {
      id: `q-${String(i + 1).padStart(3, "0")}`,
      ticketCode: `A-${String(101 + i)}`,
      mrn: `MSA-${String(48210 + (i + 1) * 7).padStart(6, "0")}`,
      displayName: `${pick(FIRST)} ${pick(LAST)}`,
      age: 9 + Math.floor(rand() * 74),
      sex: (["F", "M", "X"] as const)[Math.floor(rand() * 3) % 3],
      departmentId: pick([
        "emergency", "imaging", "cardiology", "neurology",
        "orthopedics", "pediatrics", "laboratory",
      ] as const),
      stage: pick(stages),
      status: statuses[i % statuses.length],
      classification,
      acuity: acuity as QueueTicket["acuity"],
      arrivalAt,
      elapsedMinutes: elapsed,
      waitMinutes: Math.max(1, Math.round(elapsed * (0.25 + rand() * 0.5))),
      estimatedMinutes: 8 + Math.floor(rand() * 46),
      zone: pick(zones),
      clinician: rand() > 0.42 ? pick(TEAM) : null,
      note: pick(QUEUE_NOTES),
    } satisfies QueueTicket;
  });
}
