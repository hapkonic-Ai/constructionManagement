# Phase 2 — CEO Dashboard & Project Management (Week 5–7)

[← Back to Master Tracker](./tracker.md)

Central oversight and orchestration for CEO-level accounts.

## 2.1 CEO Dashboard
**Route**: `/ceo`

Widgets:
- Active projects count, total members, pending deviations, budget health
- Recent activity feed across all projects

## 2.2 Project Creation & Assignment
- Create project: Title, description, start date, end date, budget ceiling
- Assign team members per project (select from all users by role)
- Each project gets a dedicated workspace URL: `/projects/[projectId]`

## 2.3 Gantt Chart View
- Library: `@dhtmlx/trial-react-gantt` or `gantt-task-react`
- Tasks pulled from `GanttTask` table
- Displays: task name, assigned member, start/end, % progress
- Visual indicators: delays (red), on-track (green), deviations (amber)
- CEO can view but not edit (COO updates feed into this)

## 2.4 People Progress View
- Per-member activity summary across all projects
- Tasks completed, updates submitted, deviations raised
- Links through to individual audit logs

## 2.5 Audit Log Access
- Full log viewer for all employee actions
- Filterable by: user, project, action type, date range
- Exportable as CSV
