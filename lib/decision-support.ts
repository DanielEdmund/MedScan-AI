import type { WorkflowClassification } from "@/lib/types";

export interface ClassificationFactor {
  label: string;
  observed: string;
  reference: string;
  level: "STANDARD" | "ELEVATED" | "HIGH";
}

export interface ClassificationResult {
  classification: WorkflowClassification;
  confidence: number;
  score: number;
  factors: ClassificationFactor[];
  reasons: string[];
  disclaimer: string;
  generatedAt: number;
  statement: string;
}

/**
 * ────────────────────────────────────────────────────────────────────────
 *  MedScan AI — SIMULATED WORKFLOW CLASSIFIER (decision-support concept)
 * ────────────────────────────────────────────────────────────────────────
 *
 *  This module is a front-end prototype of a *routing* heuristic.
 *  It does NOT diagnose, does NOT prescribe, does NOT recommend treatment
 *  and does NOT determine disease. It only organises the supplied
 *  information into a workflow label so the demo queue can be sequenced.
 *
 *  Permitted outputs:
 *    ROUTINE | PRIORITY | IMMEDIATE CLINICAL REVIEW
 *
 *  Every result must be rendered with:
 *    "Decision-support only — clinician review required."
 * ────────────────────────────────────────────────────────────────────────
 */

/** Local demo thresholds — arbitrary prototype values, not clinical limits. */
const THRESHOLDS = {
  spo2Low: 94,
  hrHigh: 110,
  hrLow: 48,
  sbpHigh: 170,
  sbpLow: 92,
  tempHigh: 38.4,
  rrHigh: 24,
} as const;

export interface VitalsInput {
  systolic: number;
  diastolic: number;
  heartRate: number;
  spo2: number;
  temp: number;
  respRate: number;
}

export interface ClassifierInput {
  vitals: VitalsInput;
  arrivalMode: "WALK_IN" | "AMBULANCE" | "TRANSFER" | "REFERRAL";
  symptomDuration: string;
  departmentId: string;
  flags: string[];
}

export type FactorLevel = "STANDARD" | "ELEVATED" | "HIGH";

export interface ClassificationFactor {
  label: string;
  observed: string;
  reference: string;
  level: FactorLevel;
}

export function classifyWorkflow(input: ClassifierInput): ClassificationResult {
  const { vitals, arrivalMode, symptomDuration, flags } = input;
  const factors: ClassificationFactor[] = [];
  const reasons: string[] = [];
  let score = 0;

  const add = (
    label: string,
    observed: string,
    reference: string,
    level: FactorLevel,
    weight: number,
    reason: string,
  ) => {
    factors.push({ label, observed, reference, level });
    reasons.push(reason);
    score += weight;
  };

  if (vitals.spo2 < THRESHOLDS.spo2Low) {
    add(
      "Oxygen saturation",
      `${vitals.spo2}%`,
      `≥ ${THRESHOLDS.spo2Low}%`,
      vitals.spo2 < 91 ? "HIGH" : "ELEVATED",
      vitals.spo2 < 91 ? 40 : 22,
      `Recorded saturation ${vitals.spo2}% sits below the local demo threshold of ${THRESHOLDS.spo2Low}%.`,
    );
  }

  if (vitals.heartRate > THRESHOLDS.hrHigh) {
    add(
      "Heart rate",
      `${vitals.heartRate} bpm`,
      `≤ ${THRESHOLDS.hrHigh} bpm`,
      vitals.heartRate > 135 ? "HIGH" : "ELEVATED",
      vitals.heartRate > 135 ? 34 : 18,
      `Recorded heart rate ${vitals.heartRate} bpm is outside the local demo band.`,
    );
  } else if (vitals.heartRate < THRESHOLDS.hrLow) {
    add(
      "Heart rate",
      `${vitals.heartRate} bpm`,
      `≥ ${THRESHOLDS.hrLow} bpm`,
      "ELEVATED",
      20,
      `Recorded heart rate ${vitals.heartRate} bpm is below the local demo band.`,
    );
  }

  if (vitals.systolic > THRESHOLDS.sbpHigh || vitals.systolic < THRESHOLDS.sbpLow) {
    const high = vitals.systolic > THRESHOLDS.sbpHigh;
    add(
      "Systolic pressure",
      `${vitals.systolic} mmHg`,
      high ? `≤ ${THRESHOLDS.sbpHigh} mmHg` : `≥ ${THRESHOLDS.sbpLow} mmHg`,
      "ELEVATED",
      high ? 20 : 24,
      `Recorded systolic value ${vitals.systolic} mmHg is outside the local demo band.`,
    );
  }

  if (vitals.temp >= THRESHOLDS.tempHigh) {
    add(
      "Temperature",
      `${vitals.temp}°C`,
      `< ${THRESHOLDS.tempHigh}°C`,
      vitals.temp >= 39.5 ? "HIGH" : "ELEVATED",
      vitals.temp >= 39.5 ? 26 : 12,
      `Recorded temperature ${vitals.temp}°C exceeds the local demo threshold.`,
    );
  }

  if (vitals.respRate > THRESHOLDS.rrHigh) {
    add(
      "Respiratory rate",
      `${vitals.respRate}/min`,
      `≤ ${THRESHOLDS.rrHigh}/min`,
      vitals.respRate > 28 ? "HIGH" : "ELEVATED",
      vitals.respRate > 28 ? 30 : 15,
      `Recorded respiratory rate ${vitals.respRate}/min is above the local demo band.`,
    );
  }

  if (arrivalMode === "AMBULANCE" || arrivalMode === "TRANSFER") {
    add(
      "Arrival mode",
      arrivalMode === "AMBULANCE" ? "Ambulance" : "Transfer",
      "Walk-in / referral",
      "ELEVATED",
      18,
      `Arrival recorded as ${arrivalMode.toLowerCase()} in the simulated intake.`,
    );
  }

  const rapid = /^(rapid|sudden|acute|minutes|immediate)/i.test(symptomDuration.trim());
  if (rapid) {
    add(
      "Reported onset",
      symptomDuration,
      "Gradual onset",
      "ELEVATED",
      14,
      "Reported onset described as rapid in the simulated intake form.",
    );
  }

  if (flags.includes("escalation")) {
    add(
      "Manual escalation flag",
      "Set",
      "Not set",
      "HIGH",
      30,
      "A coordinator manually set the escalation flag during intake.",
    );
  }
  if (flags.includes("fall")) {
    add("Recent fall flag", "Set", "Not set", "ELEVATED", 14, "A recent-fall flag was recorded during intake.");
  }
  if (flags.includes("breathlessness")) {
    add("Breathlessness flag", "Set", "Not set", "ELEVATED", 12, "A breathlessness flag was recorded during intake.");
  }
  if (flags.includes("chest")) {
    add("Chest discomfort flag", "Set", "Not set", "HIGH", 26, "A chest-discomfort flag was recorded during intake.");
  }
  if (flags.includes("paediatric")) {
    add("Paediatric routing", "Set", "Standard adult flow", "ELEVATED", 6, "Paediatric routing requested for queue sequencing.");
  }

  if (factors.length === 0) {
    factors.push({
      label: "All recorded inputs",
      observed: "Within local demo bands",
      reference: "Prototype thresholds",
      level: "STANDARD",
    });
    reasons.push("No input crossed a local demo threshold during simulated intake.");
  }

  const classification: WorkflowClassification =
    score >= 45 ? "IMMEDIATE CLINICAL REVIEW" : score >= 18 ? "PRIORITY" : "ROUTINE";

  // Confidence is a presentation artefact of the prototype only.
  const confidence = Math.min(97, Math.max(58, 62 + Math.round(score * 0.55) + factors.length * 3));

  return {
    classification,
    confidence,
    score,
    factors,
    reasons,
    disclaimer: "Decision-support only — clinician review required.",
    generatedAt: Date.now(),
    statement:
      "Organised the submitted intake information into a workflow routing label. No diagnosis, treatment or clinical determination is made.",
  };
}

export const CLASSIFICATION_GUIDE: Array<{
  key: WorkflowClassification;
  title: string;
  meaning: string;
}> = [
  {
    key: "ROUTINE",
    title: "Routine",
    meaning: "Proceed through the standard simulated workflow lane.",
  },
  {
    key: "PRIORITY",
    title: "Priority",
    meaning: "Offer an earlier slot in the demo queue for clinician assessment.",
  },
  {
    key: "IMMEDIATE CLINICAL REVIEW",
    title: "Immediate clinical review",
    meaning: "Flag the ticket to the charge desk for prompt human review now.",
  },
];
