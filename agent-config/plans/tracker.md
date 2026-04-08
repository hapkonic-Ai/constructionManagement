# Velocity Nexus — Project Orchestration Tracker

This is the central tracking and context hub for the Velocity Nexus project. Use this file as the primary source of truth for the platform's role hierarchy, tech stack, and overall development progress.

## Project Context
- **Brand Identity**: Velocity Nexus | Palette: Slate, Stone, Zinc, with Amber accents.
- **Deployment**: Vercel (Frontend + Serverless/Edge)
- **Stack**: Next.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL (Neon/Supabase), NextAuth.js, Vercel Blob.

### Role Hierarchy Reference

| Role | Code | Primary Domain |
|---|---|---|
| SuperAdmin | SA | Platform control, feature flags |
| CEO | CEO | Overall project/people oversight |
| CTO | CTO | Technical timeline creation |
| CDO | CDO | Creative timeline creation |
| COO | COO | Onsite progress & deviations |
| CMO | CMO | Materials & cost estimation |
| CFO | CFO | Finance, budget, billing |

---

## Development Roadmap & Status

| Phase | Plan Document | Timeline | Status |
|---|---|---|---|
| **0** | [00-foundation.md](./00-foundation.md) | Week 1–2 | [~] IN PROGRESS (Neon + Prisma baseline done) |
| **1** | [01-auth-admin.md](./01-auth-admin.md) | Week 3–4 | [x] COMPLETED (auth pages + role routing + superadmin + profiles) |
| **2** | [02-ceo-dashboard.md](./02-ceo-dashboard.md) | Week 5–7 | [~] IN PROGRESS (UI largely mock, projects now DB-backed) |
| **3** | [03-design-module.md](./03-design-module.md) | Week 6–8 | [ ] PENDING |
| **4** | [04-materials-costs.md](./04-materials-costs.md) | Week 7–9 | [ ] PENDING |
| **5** | [05-onsite-monitoring.md](./05-onsite-monitoring.md) | Week 8–10 | [ ] PENDING |
| **6** | [06-finance-budget.md](./06-finance-budget.md) | Week 9–11 | [ ] PENDING |
| **7** | [07-notifications-logs.md](./07-notifications-logs.md) | Week 10–11 | [ ] PENDING |
| **8** | [08-ui-polish.md](./08-ui-polish.md) | Week 11–12 | [ ] PENDING |
| **9** | [09-api-layer.md](./09-api-layer.md) | Week 5–12 | [~] IN PROGRESS (`/api/projects` + `/api/projects/[id]` added) |
| **10** | [10-testing-deployment.md](./10-testing-deployment.md) | Week 12–13 | [~] IN PROGRESS (lint runs, Neon env configured, seed done) |

---

## Current Priorities
> [!NOTE]
> Priority updated on 2026-04-08: finish replacing remaining mock data pages with DB/API-backed data and complete missing Phase 9 routes.

*Plan version 1.0 (Orchestrated)*
