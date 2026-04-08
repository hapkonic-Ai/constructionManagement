# Phase 1 — Auth, SuperAdmin & User Management (Week 3–4)

[← Back to Master Tracker](./tracker.md)

This phase implements user access, management, and global platform control.

## 1.1 Authentication Pages
- `/login` — Email/password login, role-aware redirect post-auth
- `/forgot-password` — Email reset flow
- Role-based middleware: each route prefix guarded (`/ceo/*`, `/cfo/*`, etc.)

## 1.2 SuperAdmin Panel
**Route**: `/superadmin`

Features:
- **User Management**: Create users, assign roles, upload profile photo (Vercel Blob), set display name
- **Role Feature Matrix**: Grid UI — rows = roles, columns = features, toggle cells to enable/disable
- **Audit Log Viewer**: Full platform-wide activity feed with filters by role, user, date, action type
- **System Health**: Active users, projects count, storage usage

## 1.3 User Profile System
- Each user has: Name, Role badge, Avatar (uploaded photo), Bio, Contact
- Profile page at `/profile/[userId]`
- Users can edit their own profile (avatar, bio)
- CEO and SuperAdmin can view all profiles
