# Run & Test Guide (All Roles) — 2026-04-08

## 1. Install + DB Sync
```bash
npm install
cd packages/db
npx prisma generate
npx prisma db push
npx prisma db seed
```

## 2. Start App
From repo root:
```bash
npm run dev
```
Open: `http://localhost:3000/login`

## 3. Sample Login Accounts (Seeded)
All sample users use password:
```text
hapkoniv123
```

- SuperAdmin (SA): `admin@hapkoniv.com`
- CEO: `ceo@hapkoniv.com`
- CTO: `cto@hapkoniv.com`
- CDO: `cdo@hapkoniv.com`
- COO: `coo@hapkoniv.com`
- CMO: `cmo@hapkoniv.com`
- CFO: `cfo@hapkoniv.com`

## 4. Role Routing Smoke Test
1. Log in as each role.
2. Verify automatic redirect after login:
   - SA -> `/superadmin`
   - CEO -> `/ceo`
   - CTO -> `/cto`
   - CDO -> `/cdo`
   - COO -> `/coo`
   - CMO -> `/cmo`
   - CFO -> `/cfo`
3. Try opening another role route (example: CFO opens `/cto`) and confirm redirect back to allowed home route.

## 5. API Smoke Tests (Role-based)
Use browser or Postman while logged in.

### SuperAdmin / CEO
- `GET /api/users`
- `GET /api/projects`
- `GET /api/audit-logs`

### CTO/CDO
- `GET /api/designs`
- `POST /api/designs`
- `POST /api/designs/:id/release`

### COO
- `GET /api/progress`
- `POST /api/progress`
- `GET /api/deviations`
- `POST /api/deviations`

### CMO
- `GET /api/materials`
- `POST /api/materials`
- `GET /api/costs`
- `POST /api/costs`

### CFO
- `GET /api/costs`
- `GET /api/deviations`
- `PATCH /api/deviations`

### All roles
- `GET /api/notifications`
- `PATCH /api/notifications`
- `GET /api/features`

## 6. Password Reset Test
1. Open `/forgot-password`
2. Enter seeded email (for example `coo@hapkoniv.com`)
3. Copy demo reset link shown on screen
4. Open link and set new password
5. Log in with updated password

## 7. Build Validation
```bash
cd apps/web
npm run lint
npm run build
```
Expected:
- lint: warnings allowed, no errors
- build: success

## 8. Notes
- `/api/upload` is an MVP placeholder: it verifies auth and env token but does not yet issue real signed Blob URLs.
- Full production deployment should still follow `deployment-plan-2026-04-08.md` after this test pass.
