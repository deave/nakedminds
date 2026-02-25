# Deploy Naked Minds Circle to Vercel

## Prerequisites
- A [Vercel](https://vercel.com) account
- A PostgreSQL database (options below)

## Step 1: Set up a PostgreSQL database

**Option A — Vercel Postgres (easiest)**
1. Go to your Vercel dashboard → Storage → Create Database → Postgres
2. Copy the `DATABASE_URL` connection string

**Option B — Neon (free tier)**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a project, copy the connection string

**Option C — Supabase**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a project → Settings → Database → Connection string (URI)

## Step 2: Deploy to Vercel

### From the command line:
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Deploy (from the project root)
vercel

# Follow the prompts — select your team/account, confirm settings
```

### Or push to GitHub and connect:
1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Vercel auto-detects Next.js — no config needed

## Step 3: Set environment variables

In Vercel dashboard → your project → Settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` to generate |
| `NEXTAUTH_URL` | Your deployed URL, e.g. `https://nakedminds.vercel.app` |

## Step 4: Push the database schema

```bash
# From your local machine, with DATABASE_URL pointing to production:
DATABASE_URL="your-production-db-url" npx prisma db push
```

Or add it as a build step in Vercel (Settings → General → Build Command):
```
prisma generate && prisma db push && next build
```

## Step 5: Seed the first admin user

```bash
DATABASE_URL="your-production-db-url" npx tsx prisma/seed.ts
```

This creates:
- **Admin**: admin@nakedminds.app / password123
- **Members**: alice@example.com, bob@example.com / password123
- An unused invite for newmember@example.com

> Change these passwords immediately after first login.

## Step 6: Redeploy

After setting env vars, trigger a redeploy:
```bash
vercel --prod
```

Your app should now be live at your Vercel URL.
