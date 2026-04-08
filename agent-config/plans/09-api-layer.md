# Phase 9 — API Layer (Vercel Serverless) (Week 5–12, parallel)

[← Back to Master Tracker](./tracker.md)

Structure and standards for the serverless backend API.

## API Structure (`/app/api/`)

```
/api/auth/[...nextauth]         — NextAuth handler
/api/users                      — CRUD users (SA, CEO)
/api/projects                   — CRUD projects (CEO)
/api/projects/[id]/members      — Assign members
/api/projects/[id]/gantt        — Gantt task CRUD
/api/designs                    — Design queue CRUD (CTO, CDO)
/api/designs/[id]/release       — Release design (CTO, CDO)
/api/materials                  — Material CRUD (CMO)
/api/costs                      — Cost estimation (CMO)
/api/progress                   — Progress updates (COO)
/api/deviations                 — Deviation CRUD (COO)
/api/notifications              — List + mark read
/api/audit-logs                 — Query logs
/api/features                   — Feature flag matrix (SA)
/api/upload                     — Vercel Blob signed URL
```

## API Conventions
- All routes validate session role before execution
- Zod schemas for all request bodies
- Standardised response: `{ data, error, meta }`
- Rate limiting via Vercel Edge middleware
