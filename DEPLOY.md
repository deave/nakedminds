# Deploy Naked Minds Circle to Vercel

## Prerequisites
- A [Vercel](https://vercel.com) account
- A PostgreSQL database (options below)

## Step 1: Set up a PostgreSQL database

**Option A — Vercel Postgres (easiest)**
1. Go to your Vercel dashboard → Storage → Create Database → Postgres
2. Copy the `DATABASE_URL` (pooled) and `DIRECT_URL` (non-pooled) connection strings

**Option B — Neon (free tier)**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a project, copy the pooled and direct connection strings

**Option C — Supabase**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a project → Settings → Database → Connection string (URI)

> **Note on connection pooling:** Many serverless-friendly Postgres providers give you two URLs — a **pooled** URL (for `DATABASE_URL`) and a **direct** URL (for `DIRECT_URL`). The pooled URL is used at runtime; the direct URL is used for schema migrations. If your provider only gives one URL, use it for both.

## Step 2: Deploy to Vercel

### Option A — Push to GitHub and connect (recommended):
1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Vercel auto-detects Next.js — no config needed
5. Add environment variables (see Step 3) before deploying

### Option B — From the command line:
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Deploy (from the project root)
vercel

# Follow the prompts — select your team/account, confirm settings
```

## Step 3: Set environment variables

In Vercel dashboard → your project → Settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string (pooled if available) |
| `DIRECT_URL` | Your PostgreSQL direct connection string (non-pooled) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` to generate |
| `NEXTAUTH_URL` | Your deployed URL, e.g. `https://nakedminds.vercel.app` |

> **Tip:** On Vercel, `NEXTAUTH_URL` is auto-detected via the `VERCEL_URL` env var. You may still want to set it explicitly if you're using a custom domain.

## Step 4: Database schema

The build command automatically runs `prisma db push` to sync the schema with your database. No manual migration step is needed — just deploy and the schema will be created.

## Step 5: Seed the first admin user

```bash
DATABASE_URL="your-production-db-url" npx tsx prisma/seed.ts
```

This creates:
- **Admin**: admin@nakedminds.app / password123
- **Members**: alice@example.com, bob@example.com / password123
- An unused invite for newmember@example.com

> **Change these passwords immediately after first login.**

## Step 6: Production deploy

```bash
vercel --prod
```

Or if using GitHub integration, merge to your main branch and Vercel will auto-deploy.

Your app should now be live at your Vercel URL.
