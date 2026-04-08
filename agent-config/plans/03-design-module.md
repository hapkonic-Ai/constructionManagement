# Phase 3 — CTO & CDO: Design Module (Week 6–8)

[← Back to Master Tracker](./tracker.md)

Module for the CTO and CDO to sequence and release technical and creative designs.

## 3.1 Design Queue (Sequential Release)
**Route**: `/design`

- Designs are created and queued in order (order index)
- Only one design released to COO/CMO at a time (parallel downstream work)
- Status flow: `draft → ready → released → acknowledged`
- CEO sees full queue; COO/CMO see only the currently released design

## 3.2 Design Creation Interface
- CTO and CDO share this interface (same permissions)
- Create design: title, description, attachments (drawings, specs), tag (technical/creative)
- Set design order in queue
- Mark design as "Ready" to notify relevant roles

## 3.3 Design Timeline Builder
- Visual timeline editor: add milestones, set durations, add dependencies
- Output stored in `DesignTimeline` table
- Visible to CEO in project overview

## 3.4 Notifications
- When design is marked "ready", push notification (in-app) to COO, CMO, CFO
- Dashboard badge counts for pending design acknowledgements
