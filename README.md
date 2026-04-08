# Construction Management Platform

A Neon-backed, role-driven construction management platform built with Next.js, Prisma, and Turbo workspaces.

## What This Project Does

This app models a full executive workflow for construction programs:

- `SA` (Super Admin): access control, users, settings, platform supervision
- `CEO`: portfolio oversight, project governance, audit visibility
- `CTO` + `CDO`: design planning, sequencing, release flow, timelines
- `COO`: on-site progress, schedule deviations, operational updates
- `CMO`: materials and labour requirement planning per project
- `CFO`: budget allocation, spending controls, financial approvals

All role dashboards and APIs are wired to PostgreSQL data via Neon + Prisma.

## Monorepo Structure

- `apps/web` - Next.js web app (App Router)
- `packages/db` - Prisma schema, seed logic, shared DB client
- `packages/config` - shared config package
- `agent-config` - implementation plans and run/deployment docs

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Prisma 6 + PostgreSQL (Neon)
- NextAuth (credentials)
- Tailwind CSS 4
- Turbo workspaces

## Prerequisites

- Node.js 20+
- npm 10+
- A Neon Postgres database

## Environment Variables

You need env files in both locations:

1. `packages/db/.env` (for Prisma CLI tasks)
2. `apps/web/.env` (for runtime/build in Next.js)

Use this template:

```env
DATABASE_URL="postgresql://<user>:<pass>@<host>/<db>?sslmode=require&channel_binding=require"
NEXTAUTH_SECRET="<long-random-secret>"
NEXTAUTH_URL="http://localhost:3000"
# Optional (only needed for /api/upload)
BLOB_READ_WRITE_TOKEN=""
```

Generate a secret:

```bash
openssl rand -base64 32
```

## Local Setup

```bash
npm install

cd packages/db
npx prisma generate
npx prisma db push
npx prisma db seed

cd ../..
npm run dev
```

Open: `http://localhost:3000/login`

## Seeded Role Logins

Default password for all seeded users:

`hapkoniv123`

- `admin@hapkoniv.com` -> Super Admin (`/superadmin`)
- `ceo@hapkoniv.com` -> CEO (`/ceo`)
- `cto@hapkoniv.com` -> CTO (`/cto`)
- `cdo@hapkoniv.com` -> CDO (`/cdo`)
- `coo@hapkoniv.com` -> COO (`/coo`)
- `cmo@hapkoniv.com` -> CMO (`/cmo`)
- `cfo@hapkoniv.com` -> CFO (`/cfo`)

## Core Commands

From repo root:

```bash
npm run dev
npm run build
npm run lint
```

Workspace-specific:

```bash
npm run build --workspace @nexus/db
npm run build --workspace web
```

## Deploying To Vercel

### 1) Import Project

- Open Vercel dashboard -> `Add New...` -> `Project`
- Select this GitHub repo
- When Vercel asks for monorepo project, select `apps/web`

### 2) Build/Install Settings

Use these settings:

- Install Command: `npm install`
- Build Command:
  `cd ../.. && npm run build --workspace @nexus/db && npm run build --workspace web`
- Output Directory: leave default for Next.js

### 3) Environment Variables In Vercel

Add these in Project -> Settings -> Environment Variables:

- `DATABASE_URL` = your Neon connection string
- `NEXTAUTH_SECRET` = random secure string
- `NEXTAUTH_URL` = your Vercel domain (for production), for example `https://your-app.vercel.app`
- `BLOB_READ_WRITE_TOKEN` (optional for upload API)

### 4) Deploy

- Click `Deploy`
- After first deploy, set your final production domain and update `NEXTAUTH_URL` if needed
- Redeploy once after changing `NEXTAUTH_URL`

## Build/Deployment Troubleshooting

- `Can't reach database server ...` during build:
  - Confirm `DATABASE_URL` is set in Vercel
  - Confirm Neon project is active and reachable
  - Redeploy after updating env vars
- Auth/session issues after deploy:
  - Ensure `NEXTAUTH_SECRET` is set
  - Ensure `NEXTAUTH_URL` exactly matches production URL
- TypeScript warning about deprecated module resolution:
  - `packages/db/tsconfig.json` already includes `"ignoreDeprecations": "6.0"`

## Additional Internal Docs

- [Run/Test Guide](agent-config/plans/run-test-guide-2026-04-08.md)
- [Deployment Plan](agent-config/plans/deployment-plan-2026-04-08.md)
- [Master Plan](agent-config/super-plan-master.md)
