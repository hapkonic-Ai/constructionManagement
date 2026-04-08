# Velocity Nexus — Project Orchestration Platform
## Multiphase Development Plan

> **Brand Identity**: Velocity Nexus | Neutral palette: Slate, Stone, Zinc, with Amber as the sole accent.
> **Deployment Target**: Vercel (Frontend) + Vercel Serverless / Edge Functions (Backend API)
> **Stack**: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma ORM · PostgreSQL (Neon/Supabase) · NextAuth.js · Vercel Blob (media)

---

## Role Hierarchy Overview

| Role | Short Code | Primary Domain |
|---|---|---|
| SuperAdmin | SA | Platform control, role & feature management |
| CEO | CEO | Projects, people, logs, Gantt oversight |
| CTO | CTO | Technical design, timeline creation |
| CDO | CDO | Creative design, timeline creation |
| COO | COO | Onsite progress updates, deviation decisions |
| CMO | CMO | Raw materials, cost estimation, labour |
| CFO | CFO | Finance, fund allocation, billing, budget |

---

## Phase 0 — Foundation & Architecture (Week 1–2)

### 0.1 Repository & Project Setup
- Initialise monorepo: `apps/web` (Next.js) and `packages/db` (Prisma schema)
- Configure Vercel project, environment variables, and preview deployments
- Set up ESLint, Prettier, Husky pre-commit hooks
- Configure TypeScript strict mode project-wide

### 0.2 Database Schema Design (Prisma)
Core tables and relationships:

```
User            — id, name, email, role, avatarUrl, createdAt
Project         — id, title, description, status, ceoId, createdAt
ProjectMember   — id, projectId, userId, role (local scoped)
Design          — id, projectId, creatorId, title, status (pending/ready), order, releasedAt
DesignTimeline  — id, designId, milestones[], estimatedDays
Material        — id, projectId, name, quantity, unitCost, totalCost, cmOId
LabourCost      — id, projectId, category, estimatedCost, cmOId
ProgressUpdate  — id, projectId, cooId, note, attachments[], createdAt
Deviation       — id, projectId, cooId, type(timeline|cost), delta, reason, approvedAt
BudgetAllocation— id, projectId, cfOId, allocated, spent, remaining, updatedAt
GanttTask       — id, projectId, title, startDate, endDate, progress, assignedTo, parentId
AuditLog        — id, actorId, action, entity, entityId, metadata, createdAt
Feature         — id, name, code (for feature-flag system)
RoleFeature     — id, roleCode, featureCode, enabled
```

### 0.3 Authentication Strategy (NextAuth.js)
- Credentials provider (email + password) with bcrypt
- JWT session strategy (stateless, Vercel-friendly)
- Middleware-based route protection by role
- Session includes: `userId`, `role`, `name`, `avatarUrl`

### 0.4 Feature Flag System (SuperAdmin Controlled)
- `Feature` table enumerates all gated UI features by code
- `RoleFeature` maps roles to enabled features
- A `useFeature(code)` hook on the client checks session role against DB flags
- SuperAdmin UI manages this matrix in real time

---

## Phase 1 — Auth, SuperAdmin & User Management (Week 3–4)

### 1.1 Authentication Pages
- `/login` — Email/password login, role-aware redirect post-auth
- `/forgot-password` — Email reset flow
- Role-based middleware: each route prefix guarded (`/ceo/*`, `/cfo/*`, etc.)

### 1.2 SuperAdmin Panel
**Route**: `/superadmin`

Features:
- **User Management**: Create users, assign roles, upload profile photo (Vercel Blob), set display name
- **Role Feature Matrix**: Grid UI — rows = roles, columns = features, toggle cells to enable/disable
- **Audit Log Viewer**: Full platform-wide activity feed with filters by role, user, date, action type
- **System Health**: Active users, projects count, storage usage

### 1.3 User Profile System
- Each user has: Name, Role badge, Avatar (uploaded photo), Bio, Contact
- Profile page at `/profile/[userId]`
- Users can edit their own profile (avatar, bio)
- CEO and SuperAdmin can view all profiles

---

## Phase 2 — CEO Dashboard & Project Management (Week 5–7)

### 2.1 CEO Dashboard
**Route**: `/ceo`

Widgets:
- Active projects count, total members, pending deviations, budget health
- Recent activity feed across all projects

### 2.2 Project Creation & Assignment
- Create project: Title, description, start date, end date, budget ceiling
- Assign team members per project (select from all users by role)
- Each project gets a dedicated workspace URL: `/projects/[projectId]`

### 2.3 Gantt Chart View
- Library: `@dhtmlx/trial-react-gantt` or `gantt-task-react`
- Tasks pulled from `GanttTask` table
- Displays: task name, assigned member, start/end, % progress
- Visual indicators: delays (red), on-track (green), deviations (amber)
- CEO can view but not edit (COO updates feed into this)

### 2.4 People Progress View
- Per-member activity summary across all projects
- Tasks completed, updates submitted, deviations raised
- Links through to individual audit logs

### 2.5 Audit Log Access
- Full log viewer for all employee actions
- Filterable by: user, project, action type, date range
- Exportable as CSV

---

## Phase 3 — CTO & CDO: Design Module (Week 6–8)

### 3.1 Design Queue (Sequential Release)
**Route**: `/design`

- Designs are created and queued in order (order index)
- Only one design released to COO/CMO at a time (parallel downstream work)
- Status flow: `draft → ready → released → acknowledged`
- CEO sees full queue; COO/CMO see only the currently released design

### 3.2 Design Creation Interface
- CTO and CDO share this interface (same permissions)
- Create design: title, description, attachments (drawings, specs), tag (technical/creative)
- Set design order in queue
- Mark design as "Ready" to notify relevant roles

### 3.3 Design Timeline Builder
- Visual timeline editor: add milestones, set durations, add dependencies
- Output stored in `DesignTimeline` table
- Visible to CEO in project overview

### 3.4 Notifications
- When design is marked "ready", push notification (in-app) to COO, CMO, CFO
- Dashboard badge counts for pending design acknowledgements

---

## Phase 4 — CMO: Materials & Cost Estimation (Week 7–9)

### 4.1 CMO Dashboard
**Route**: `/cmo`

### 4.2 Material Planning
- Per-project: add raw materials (name, quantity, unit, unit cost)
- Auto-calculate total material cost
- Edit/delete line items
- Submit to CFO for fund allocation

### 4.3 Labour Cost Estimation
- Add labour categories (skilled, unskilled, specialist)
- Set estimated headcount and daily rate
- Duration pulled from design timeline
- Auto-estimate total labour cost

### 4.4 Cost Summary View
- Aggregated: material + labour + misc = total project cost estimate
- Status: submitted / approved by CFO / revision requested
- Version history of cost estimates

---

## Phase 5 — COO: Onsite Monitoring (Week 8–10)

### 5.1 COO Dashboard
**Route**: `/coo`

### 5.2 Progress Updates
- Per-project: submit daily/weekly progress note
- Attach photos/documents (Vercel Blob)
- Progress percentage input (feeds into Gantt)
- Update log visible to CEO

### 5.3 Timeline Changes
- COO can propose timeline adjustments (push/pull task dates)
- Stored as `Deviation` with type `timeline`
- CEO notified; change reflected in Gantt pending approval

### 5.4 Deviation Management
- COO is the sole authority to declare deviations
- Deviation form: type (timeline / cost), delta amount/days, reason, supporting docs
- Deviation status: raised → reviewed by CEO → resolved
- CFO notified on cost deviations for reallocation

---

## Phase 6 — CFO: Finance & Budget (Week 9–11)

### 6.1 CFO Dashboard
**Route**: `/cfo`

Overview widgets: Total budget allocated, total spent, remaining, pending requests

### 6.2 Fund Allocation
- View CMO cost estimation requests per project
- Approve and allocate specific budget amounts
- Partial allocation with notes (e.g., "Phase 1 only")

### 6.3 Budget Adjustments (COO-triggered)
- When COO raises cost deviation, CFO sees alert
- Can reallocate funds between line items or request CEO approval for over-budget

### 6.4 Finance Ledger
- Per-project transaction log: allocation events, spending entries, reallocation events
- Running balance per project
- Summary exportable as CSV/PDF report

### 6.5 Billing Management
- Invoice creation per project (client-facing)
- Payment status tracking
- Integration-ready (Razorpay / Stripe webhook receiver, pluggable)

---

## Phase 7 — Notifications, Logs & Cross-Role Features (Week 10–11)

### 7.1 In-App Notification System
- Notification bell in top nav for all roles
- Event triggers:
  - Design marked ready → COO, CMO, CFO
  - Cost estimate submitted → CFO
  - Deviation raised → CEO, CFO
  - Fund allocated → CMO, COO
  - Timeline change approved → all project members
- Stored in DB; mark as read

### 7.2 Global Audit Log (All Roles)
- Every create/update/delete action writes to `AuditLog`
- Actor, action verb, entity, timestamp, before/after snapshot (JSON)
- CEO and SuperAdmin can view full log
- Each role can view their own log

### 7.3 Project Feed (Per Project)
- Unified activity timeline per project visible to all assigned members
- Chronological: updates, deviations, design releases, fund moves

---

## Phase 8 — UI/UX Polish & Design System (Week 11–12)

### 8.1 Design Language — Velocity Nexus
- **Palette**: Primary `zinc-900`, Surface `stone-100/stone-950`, Accent `amber-500`
- **Typography**: Display — `DM Serif Display`; Body — `DM Sans`; Mono — `JetBrains Mono`
- **Radius**: `rounded-xl` for cards, `rounded-md` for inputs
- **Shadows**: Subtle layered `shadow-sm` on cards, `shadow-lg` on modals
- **Motion**: Framer Motion — page transitions (slide-in), toast micro-animations, Gantt bar animations

### 8.2 Shared Component Library (`/components/ui`)
- `<RoleBadge role={...} />` — pill with role colour coding
- `<Avatar src={...} name={...} size={...} />` — fallback initials
- `<GanttChart tasks={[...]} />`
- `<CostTable items={[...]} editable={bool} />`
- `<DeviationCard deviation={...} />`
- `<NotificationPanel />`
- `<AuditLogTable logs={[...]} />`
- `<StatCard label title value delta />`

### 8.3 Responsive Design
- Mobile-first; all dashboards usable on tablet (COO onsite use case)
- Sidebar collapses to bottom nav on mobile
- Photo upload works on mobile camera

---

## Phase 9 — API Layer (Vercel Serverless) (Week 5–12, parallel)

### API Structure (`/app/api/`)

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
/api/budget                     — Fund allocation (CFO)
/api/budget/[id]/adjust         — Reallocation (CFO)
/api/notifications              — List + mark read
/api/audit-logs                 — Query logs
/api/features                   — Feature flag matrix (SA)
/api/upload                     — Vercel Blob signed URL
```

### API Conventions
- All routes validate session role before execution
- Zod schemas for all request bodies
- Standardised response: `{ data, error, meta }`
- Rate limiting via Vercel Edge middleware

---

## Phase 10 — Testing & Deployment (Week 12–13)

### 10.1 Testing
- Unit: Vitest for utility functions and Prisma query helpers
- Integration: API route tests with mocked Prisma client
- E2E: Playwright — one flow per role (login → primary action → verify)

### 10.2 Vercel Deployment
- `main` branch → production
- `dev` branch → preview (staging)
- Environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`
- Database: Neon (PostgreSQL, serverless-compatible with Prisma)
- Media: Vercel Blob for avatars, design attachments, COO photos

### 10.3 Seed Data
- SuperAdmin account seeded on first deploy
- Demo projects with all roles assigned for client demo

---

## Delivery Milestone Summary

| Phase | Deliverable | Week |
|---|---|---|
| 0 | Repo, DB schema, auth strategy | 1–2 |
| 1 | Auth, SuperAdmin, user profiles | 3–4 |
| 2 | CEO dashboard, projects, Gantt | 5–7 |
| 3 | CTO/CDO design module | 6–8 |
| 4 | CMO materials & cost | 7–9 |
| 5 | COO onsite monitoring & deviations | 8–10 |
| 6 | CFO finance & budget | 9–11 |
| 7 | Notifications, audit logs, feeds | 10–11 |
| 8 | UI polish, design system | 11–12 |
| 9 | Full API layer (parallel) | 5–12 |
| 10 | Testing, seeding, Vercel deploy | 12–13 |

**Total estimated timeline: 13 weeks (solo or small team)**

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Auth | NextAuth.js v5 |
| ORM | Prisma |
| Database | Neon PostgreSQL |
| File Storage | Vercel Blob |
| Deployment | Vercel |
| Charts | gantt-task-react, Recharts |
| Validation | Zod |
| Testing | Vitest + Playwright |

---

*Velocity Nexus — Internal Project Intelligence Platform*
*Plan version 1.0*