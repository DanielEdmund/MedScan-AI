import { z } from "zod";

/**
 * Intake form schema — SIMULATED data only.
 * Validation here checks shape and plausibility of prototype inputs;
 * it performs no clinical validation of any kind.
 */

export const vitalsSchema = z.object({
  systolic: z
    .number({ required_error: "Required", invalid_type_error: "Required" })
    .min(50, "Outside demo range")
    .max(260, "Outside demo range"),
  diastolic: z
    .number({ required_error: "Required", invalid_type_error: "Required" })
    .min(30, "Outside demo range")
    .max(160, "Outside demo range"),
  heartRate: z
    .number({ required_error: "Required", invalid_type_error: "Required" })
    .min(20, "Outside demo range")
    .max(240, "Outside demo range"),
  spo2: z
    .number({ required_error: "Required", invalid_type_error: "Required" })
    .min(50, "Outside demo range")
    .max(100, "Max 100"),
  temp: z
    .number({ required_error: "Required", invalid_type_error: "Required" })
    .min(30, "Outside demo range")
    .max(45, "Outside demo range"),
  respRate: z
    .number({ required_error: "Required", invalid_type_error: "Required" })
    .min(4, "Outside demo range")
    .max(70, "Outside demo range"),
});

export const intakeSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Enter a fictional name")
    .max(60, "Keep under 60 characters"),
  age: z
    .number({ required_error: "Required", invalid_type_error: "Required" })
    .min(0, "Must be 0+")
    .max(120, "Must be 120 or less"),
  sex: z.enum(["F", "M", "X"], { required_error: "Select an option" }),
  departmentId: z.string({ required_error: "Select a department" }).min(1, "Select a department"),
  modality: z.enum(["CT", "MRI", "X-RAY", "ULTRASOUND", "LAB", "VITALS", "NONE"], {
    required_error: "Select an option",
  }),
  arrivalMode: z.enum(["WALK_IN", "AMBULANCE", "TRANSFER", "REFERRAL"], {
    required_error: "Select an option",
  }),
  chiefComplaint: z
    .string()
    .trim()
    .min(4, "Describe the reported concern")
    .max(180, "Keep under 180 characters"),
  symptomDuration: z
    .string()
    .trim()
    .min(2, "e.g. '2 hours' or '3 days'")
    .max(60, "Keep under 60 characters"),
  vitals: vitalsSchema,
  flags: z.array(z.string()),
  acknowledged: z.boolean().refine((v) => v === true, {
    message: "Confirm this record is simulated",
  }),
});

export type IntakeFormValues = z.infer<typeof intakeSchema>;

export const DEFAULT_INTAKE_VALUES: IntakeFormValues = {
  displayName: "",
  age: 34,
  sex: "X",
  departmentId: "",
  modality: "NONE",
  arrivalMode: "WALK_IN",
  chiefComplaint: "",
  symptomDuration: "",
  vitals: {
    systolic: 118,
    diastolic: 76,
    heartRate: 74,
    spo2: 98,
    temp: 36.8,
    respRate: 16,
  },
  flags: [],
  acknowledged: false,
};

export const INTAKE_FLAGS: Array<{ id: string; label: string; hint: string }> = [
  { id: "chest", label: "Chest discomfort reported", hint: "Recorded verbatim at intake" },
  { id: "breathlessness", label: "Breathlessness reported", hint: "Recorded verbatim at intake" },
  { id: "fall", label: "Recent fall reported", hint: "Recorded verbatim at intake" },
  { id: "escalation", label: "Coordinator escalation flag", hint: "Set manually by operations" },
  { id: "paediatric", label: "Paediatric routing", hint: "Sequences to the paediatric lane" },
];

export interface IntakeStep {
  id: string;
  title: string;
  caption: string;
  fields: Array<keyof IntakeFormValues | `vitals.${string}`>;
}

export const INTAKE_STEPS: IntakeStep[] = [
  {
    id: "subject",
    title: "Fictional subject",
    caption: "Invent a demo identity — never enter real personal data.",
    fields: ["displayName", "age", "sex"],
  },
  {
    id: "encounter",
    title: "Encounter",
    caption: "Where the simulated subject presents and what they report.",
    fields: ["departmentId", "modality", "arrivalMode", "chiefComplaint", "symptomDuration"],
  },
  {
    id: "observations",
    title: "Simulated observations",
    caption: "Prototype values only — no device or monitor is connected.",
    fields: [
      "vitals.systolic",
      "vitals.diastolic",
      "vitals.heartRate",
      "vitals.spo2",
      "vitals.temp",
      "vitals.respRate",
      "flags",
    ],
  },
  {
    id: "review",
    title: "Review & route",
    caption: "Confirm the packet, then run the workflow classifier.",
    fields: ["acknowledged"],
  },
];
