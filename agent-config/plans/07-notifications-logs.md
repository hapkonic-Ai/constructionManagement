# Phase 7 — Notifications, Logs & Cross-Role Features (Week 10–11)

[← Back to Master Tracker](./tracker.md)

Cross-role interaction systems including global notifications and project-wide activity feeds.

## 7.1 In-App Notification System
- Notification bell in top nav for all roles
- Event triggers:
  - Design marked ready → COO, CMO, CFO
  - Cost estimate submitted → CFO
  - Deviation raised → CEO, CFO
  - Fund allocated → CMO, COO
  - Timeline change approved → all project members
- Stored in DB; mark as read

## 7.2 Global Audit Log (All Roles)
- Every create/update/delete action writes to `AuditLog`
- Actor, action verb, entity, timestamp, before/after snapshot (JSON)
- CEO and SuperAdmin can view full log
- Each role can view their own log

## 7.3 Project Feed (Per Project)
- Unified activity timeline per project visible to all assigned members
- Chronological: updates, deviations, design releases, fund moves
