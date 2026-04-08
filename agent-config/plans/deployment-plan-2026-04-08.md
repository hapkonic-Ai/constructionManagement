# Deployment Plan — 2026-04-08

## 1) Scope and Current State
- Environment target: Vercel + Neon PostgreSQL.
- Build status: `apps/web` production build passes.
- Database status: Prisma schema pushed to Neon and seed executed.
- Auth status:
  - Implemented: `/login`, `/register`, NextAuth credentials, JWT session, protected `/ceo/*` routes.
  - Missing for full Phase 1 parity: `/forgot-password`, role-aware redirects to non-CEO areas, non-CEO route prefixes (`/cfo`, `/cto`, `/cdo`, `/coo`, `/cmo`) and profile routes.

## 2) Go/No-Go Criteria
- GO (safe for a CEO-only pilot):
  - Only `SA/CEO` users are allowed in production sign-up/login.
  - `/ceo/*` remains primary product surface.
- NO-GO (for full multi-role launch):
  - If CFO/CTO/CDO/COO/CMO are expected at launch without their route modules and redirects.

## 3) Pre-Deployment Tasks
1. Lock auth scope for launch window:
   - Option A (recommended for immediate launch): restrict registration roles to `SA/CEO` only.
   - Option B: implement role-aware redirects + placeholder dashboards for non-CEO roles.
2. Rotate secrets before production cutover:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
3. Set Vercel environment variables for `Production`, `Preview`, and `Development`:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `BLOB_READ_WRITE_TOKEN` (if uploads are enabled in this release)
4. Add branch protection + deployment flow:
   - `dev` -> preview
   - `main` -> production

## 4) Deployment Sequence
1. Merge release branch into `dev`.
2. Verify preview deployment:
   - Login with seeded SA user (`admin@hapkoniv.com`).
   - Create a project from `/ceo/projects` and verify DB persistence.
   - Open `/api/projects` and `/api/projects/[id]` through app flows.
3. Run production DB sync (if schema changed since last run):
   - `cd packages/db && npx prisma db push`
4. Run production seed only if needed for first deploy:
   - `cd packages/db && npx prisma db seed`
5. Promote `dev` to `main`.
6. Verify production smoke checks:
   - `/login` works
   - authenticated redirect works for allowed roles
   - `/ceo/projects` read/write works
   - no auth redirect loop

## 5) Rollback Plan
1. If auth fails (login loop / 401/500 spike):
   - Revert to previous Vercel deployment immediately.
2. If DB migration causes runtime issues:
   - Roll back app deploy first, then evaluate schema rollback/migration fix.
3. Keep previous `DATABASE_URL`/secret values accessible in secure vault for emergency revert.

## 6) Post-Deploy Monitoring (first 24h)
- Track login success/failure rate.
- Track API error rates for `/api/auth/*` and `/api/projects*`.
- Track Neon connection/runtime errors.
- Verify seed/admin account access remains intact.

## 7) Next Release Items (to complete full Auth/Admin phase)
1. Implement `/forgot-password` and reset flow.
2. Add role-aware post-login routing matrix.
3. Add route modules and middleware for all role prefixes.
4. Build SuperAdmin panel (`/superadmin`) with user management + feature matrix.
5. Add profile module `/profile/[userId]`.
