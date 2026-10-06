import type { Department, DepartmentId } from "@/lib/types";

/**
 * Fictional departments for the MedScan AI demo.
 * No real facility, service line or organisation is represented.
 */
export const DEPARTMENTS: Department[] = [
  {
    id: "emergency",
    code: "EMR",
    name: "Emergency Intake",
    floor: "Ground · Zone A",
    lead: "Dr. Ilse Brandt",
    staffOnDuty: 14,
    staffPlanned: 16,
    capacity: 32,
    occupancy: 26,
    capacityState: "ELEVATED",
    averageWait: 18,
    openBays: 5,
    totalBays: 12,
    downstream: ["imaging", "laboratory", "cardiology"],
    kpi: 88,
    trend: [62, 66, 64, 71, 76, 74, 81, 86, 84, 88],
  },
  {
    id: "imaging",
    code: "IMG",
    name: "Diagnostic Imaging",
    floor: "Level 1 · Zone B",
    lead: "Dr. Marcus Oyelaran",
    staffOnDuty: 9,
    staffPlanned: 10,
    capacity: 24,
    occupancy: 19,
    capacityState: "OPTIMAL",
    averageWait: 24,
    openBays: 4,
    totalBays: 8,
    downstream: ["laboratory"],
    kpi: 93,
    trend: [70, 72, 75, 73, 78, 82, 85, 88, 91, 93],
  },
  {
    id: "cardiology",
    code: "CAR",
    name: "Cardiac Care Unit",
    floor: "Level 3 · Zone C",
    lead: "Dr. Priya Raghunathan",
    staffOnDuty: 11,
    staffPlanned: 12,
    capacity: 18,
    occupancy: 15,
    capacityState: "ELEVATED",
    averageWait: 12,
    openBays: 2,
    totalBays: 6,
    downstream: ["imaging", "laboratory"],
    kpi: 90,
    trend: [80, 82, 79, 83, 85, 84, 87, 89, 88, 90],
  },
  {
    id: "neurology",
    code: "NEU",
    name: "Neuro Observations",
    floor: "Level 4 · Zone C",
    lead: "Dr. Soren Vasquez",
    staffOnDuty: 7,
    staffPlanned: 9,
    capacity: 16,
    occupancy: 14,
    capacityState: "AT_CAPACITY",
    averageWait: 31,
    openBays: 1,
    totalBays: 5,
    downstream: ["imaging"],
    kpi: 76,
    trend: [88, 86, 84, 81, 79, 78, 77, 76, 75, 76],
  },
  {
    id: "orthopedics",
    code: "ORT",
    name: "Ortho & Trauma",
    floor: "Level 1 · Zone A",
    lead: "Dr. Hana Lindqvist",
    staffOnDuty: 8,
    staffPlanned: 8,
    capacity: 20,
    occupancy: 11,
    capacityState: "OPTIMAL",
    averageWait: 15,
    openBays: 6,
    totalBays: 9,
    downstream: ["imaging"],
    kpi: 95,
    trend: [84, 86, 88, 89, 90, 92, 93, 94, 95, 95],
  },
  {
    id: "pediatrics",
    code: "PED",
    name: "Pediatric Wing",
    floor: "Level 2 · Zone D",
    lead: "Dr. Amara Okonkwo",
    staffOnDuty: 10,
    staffPlanned: 10,
    capacity: 22,
    occupancy: 13,
    capacityState: "OPTIMAL",
    averageWait: 14,
    openBays: 5,
    totalBays: 8,
    downstream: ["laboratory", "imaging"],
    kpi: 92,
    trend: [78, 80, 83, 85, 86, 88, 90, 91, 92, 92],
  },
  {
    id: "oncology",
    code: "ONC",
    name: "Infusion & Oncology",
    floor: "Level 5 · Zone E",
    lead: "Dr. Tobias Renner",
    staffOnDuty: 12,
    staffPlanned: 13,
    capacity: 26,
    occupancy: 21,
    capacityState: "ELEVATED",
    averageWait: 22,
    openBays: 3,
    totalBays: 14,
    downstream: ["laboratory"],
    kpi: 87,
    trend: [74, 76, 78, 80, 82, 84, 85, 86, 87, 87],
  },
  {
    id: "laboratory",
    code: "LAB",
    name: "Laboratory Services",
    floor: "Lower · Zone B",
    lead: "Nadia Ferreira",
    staffOnDuty: 15,
    staffPlanned: 16,
    capacity: 40,
    occupancy: 27,
    capacityState: "OPTIMAL",
    averageWait: 9,
    openBays: 12,
    totalBays: 18,
    downstream: [],
    kpi: 96,
    trend: [90, 91, 92, 93, 94, 94, 95, 96, 96, 96],
  },
];

export const departmentById = (id: DepartmentId): Department =>
  DEPARTMENTS.find((d) => d.id === id) ?? DEPARTMENTS[0];

export const departmentName = (id: DepartmentId) => departmentById(id).name;

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((d) => ({
  value: d.id,
  label: d.name,
  code: d.code,
}));

export function departmentLoadPct(d: Department) {
  return Math.round((d.occupancy / d.capacity) * 100);
}

export function totalOccupancy() {
  const occ = DEPARTMENTS.reduce((s, d) => s + d.occupancy, 0);
  const cap = DEPARTMENTS.reduce((s, d) => s + d.capacity, 0);
  return { occ, cap, pct: Math.round((occ / cap) * 100) };
}
