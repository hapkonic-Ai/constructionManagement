# Phase 10 — Testing & Deployment (Week 12–13)

[← Back to Master Tracker](./tracker.md)

Final validation and production launch strategy.

## 10.1 Testing
- Unit: Vitest for utility functions and Prisma query helpers
- Integration: API route tests with mocked Prisma client
- E2E: Playwright — one flow per role (login → primary action → verify)

## 10.2 Vercel Deployment
- `main` branch → production
- `dev` branch → preview (staging)
- Environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`
- Database: Neon (PostgreSQL, serverless-compatible with Prisma)
- Media: Vercel Blob for avatars, design attachments, COO photos

## 10.3 Seed Data
- SuperAdmin account seeded on first deploy
- Demo projects with all roles assigned for client demo
