# MedScan AI — Clinical Operations Command Center

> **DEMO / SIMULATED CLINICAL OPERATIONS**
> A premium front-end prototype. Fictional patients, mock analytics, simulated queue movement.
> No real clinical system, device, database, API or authentication is connected.

---

## ⚠️ What this project is

MedScan AI is a **visual and interactive front-end mock** of a healthcare command-center
platform for clinics and hospitals — covering patient intake, screening workflow
classification, queue management, department coordination and clinical workflow
orchestration.

It is **not** a medical device, **not** a clinical decision system, and **not** a
production application.

### Explicitly NOT implemented

| Not implemented | Not implemented | Not implemented |
| --- | --- | --- |
| Real hospital systems | Real patient records | Real medical databases |
| Real patient identification | Real healthcare APIs | Real clinical decision systems |
| AI diagnosis / medical diagnosis | Vital-sign devices | Real queue management |
| Real appointment systems | Clinician accounts | Authentication |
| Laboratory integrations | Pharmacy integrations | Patient communication |
| Notifications | Real-time hospital infrastructure | Production backend |
| Production database | | |

All data is **local mock TypeScript data**, held in React/Zustand state for the duration
of the browser session.

---

## 🛡️ AI safety principle

The AI component is presented strictly as **decision-support and workflow assistance** —
never as an autonomous doctor.

**The system must not:**

- Diagnose patients
- Prescribe medication
- Recommend treatment
- Replace clinicians
- Claim medical certainty
- Determine a patient's disease

**It may:** organise submitted information and produce a *simulated workflow
classification*:

```
ROUTINE · PRIORITY · IMMEDIATE CLINICAL REVIEW
```

Every assessment renders:

> **Decision-support only — clinician review required.**

Enforced in code at `lib/decision-support.ts`, surfaced everywhere through
`DecisionSupportDisclaimer` in `components/shared/status.tsx`.

---

## 🎨 Colour psychology strategy

### Primary palette — Authority & Trust

| Token | Hex | Tailwind | Role |
| --- | --- | --- | --- |
| Midnight | `#07111F` | `slate-950` / `bg-midnight` | Primary background, depth, focus, clinical authority |
| Deep Navy | `#0B172A` | `slate-900` / `bg-navy` | Major surfaces and panels, command-center feel |
| Slate | `#172033` | `slate-800` | Secondary cards, structured hierarchy |

### Secondary palette — Operations & Status

| Token | Hex | Tailwind | Role |
| --- | --- | --- | --- |
| Electric Cyan | `#22D3EE` | `cyan-400` | Active states, live indicators, workflow connections, focus, selected navigation |
| Medical Blue | `#3B82F6` | `blue-500` | Primary actions, healthcare workflow elements, navigation, information |
| Mint | `#34D399` | `emerald-400` | Normal states, operational success, completed steps |
| Amber | `#FBBF24` | `amber-400` | Pending states, attention required, queue warnings |
| Alert Red | `#EF4444` | `red-500` | Genuine urgent workflow states, critical alerts — **used sparingly** |
| White | `#F8FAFC` | `slate-50` | Primary text, important numbers, headings |

**Rules enforced throughout the UI**

- Red is never used to make the interface look dramatic.
- **Colour is never used alone** — every status also carries a text label and an icon.

---

## 🧰 Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + `tailwindcss-animate` |
| UI components | shadcn/ui-style primitives (Radix UI + CVA) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts (+ custom SVG sparklines) |
| State | Zustand |
| Forms | React Hook Form + Zod |

---

## 📁 Project structure

```
MedScan AI/
├─ app/
│  ├─ layout.tsx                  Root layout, fonts, tooltips, demo label
│  ├─ globals.css                 Design tokens, surfaces, status utilities
│  ├─ page.tsx                    Landing / overview
│  └─ console/
│     ├─ layout.tsx               Sidebar + topbar + simulation driver
│     ├─ page.tsx                 Command Center (live operations overview)
│     ├─ intake/page.tsx          Multi-step simulated intake terminal
│     ├─ decision-support/page.tsx Explainable workflow classifier
│     ├─ queue/page.tsx           Live queue board (lanes + table)
│     ├─ departments/page.tsx     Department coordination & handoffs
│     ├─ patients/                Fictional patient registry + record
│     ├─ pathways/page.tsx        Workflow orchestration
│     ├─ analytics/page.tsx       Mock operational analytics
│     └─ system/page.tsx          Demo controls, guardrails, legend
│
├─ components/
│  ├─ ui/                         shadcn-style primitives
│  │   button · badge · card · input · label · select · tabs
│  │   dialog · tooltip · table · accordion · avatar · primitives
│  ├─ layout/                     sidebar · topbar · simulation-driver
│  ├─ shared/                     status · metric-card · page-header
│  ├─ charts/                     chart-kit (themed Recharts wrappers)
│  └─ landing/                    landing page sections
│
├─ lib/
│  ├─ types.ts                    Shared domain types + safety constants
│  ├─ utils.ts                    cn(), formatters, seeded PRNG
│  ├─ decision-support.ts         SIMULATED workflow classifier (explainable)
│  ├─ mock/
│  │   departments.ts             Fictional departments & capacity
│  │   patients.ts                Fictional roster, timeline, queue seed
│  │   analytics.ts               Mock charts, alerts, activity feed
│  │   pathways.ts                Simulated workflow templates
│  ├─ store/
│  │   system-store.ts            Simulation speed / running / ticks
│  │   queue-store.ts             Simulated queue + movement log
│  │   intake-store.ts            Submitted intake packets
│  └─ validation/intake.ts        Zod schema + step definitions
│
└─ tailwind.config.ts             Palette, radii, shadows, keyframes
```

---

## 🚀 Running

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

---

## 🧭 Where to look

| Goal | File |
| --- | --- |
| Understand the safety rules | `lib/decision-support.ts`, `app/console/system/page.tsx` |
| See the classifier explain itself | `app/console/decision-support/page.tsx` |
| Watch simulated queue movement | `components/layout/simulation-driver.tsx`, `lib/store/queue-store.ts` |
| Design tokens & palette | `tailwind.config.ts`, `app/globals.css` |
| Shared status vocabulary | `components/shared/status.tsx` |

---

## ⚕️ Data notice

Every name, identifier, observation, queue ticket, pathway, alert and analytics figure in
this prototype is **invented**. Any resemblance to a real person, facility or record is
coincidental. Do not enter real personal or clinical information.
