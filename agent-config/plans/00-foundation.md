# Phase 0 — Foundation & Architecture (Week 1–2)

[← Back to Master Tracker](./tracker.md)

This phase establishes the core technical skeleton of the Velocity Nexus platform.

## 0.1 Repository & Project Setup
- Initialise monorepo: `apps/web` (Next.js) and `packages/db` (Prisma schema)
- Configure Vercel project, environment variables, and preview deployments
- Set up ESLint, Prettier, Husky pre-commit hooks
- Configure TypeScript strict mode project-wide

## 0.2 Database Schema Design (Prisma)
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

## 0.3 Authentication Strategy (NextAuth.js)
- Credentials provider (email + password) with bcrypt
- JWT session strategy (stateless, Vercel-friendly)
- Middleware-based route protection by role
- Session includes: `userId`, `role`, `name`, `avatarUrl`

## 0.4 Feature Flag System (SuperAdmin Controlled)
- `Feature` table enumerates all gated UI features by code
- `RoleFeature` maps roles to enabled features
- A `useFeature(code)` hook on the client checks session role against DB flags
- SuperAdmin UI manages this matrix in real time
