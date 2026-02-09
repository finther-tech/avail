# Avail Deployment Guide

Complete guide to deploy Avail to production using free infrastructure.

---

## Prerequisites

- [ ] GitHub account (free)
- [ ] Vercel account (free) - https://vercel.com
- [ ] Z.ai account with API key - https://z.ai
- [ ] Domain (optional, buy later)

---

## Technology Stack

```
Frontend:     SvelteKit 5
Backend:      Vercel Edge Functions (serverless)
Database:     Supabase Postgres (free tier)
AI:           Z.ai API (GLM-4.7 model)
Hosting:      Vercel (free tier)
Domain:       Your custom domain → Vercel
```

---

## Step 1: Set Up Z.ai API

### 1.1 Get Your API Key (Properly)

1. Go to https://z.ai and login
2. Navigate to **API Keys** section
3. Create a new API key
4. **Copy it somewhere safe** - never share in chat!

### 1.2 Z.ai API Details

**IMPORTANT:** If you're using the **GLM Coding Plan**, use the coding endpoint!

```
# For GLM Coding Plan:
Base URL:  https://api.z.ai/api/coding/paas/v4/

# For General Plan (if you have regular credits):
Base URL:  https://api.z.ai/api/paas/v4/

Model:     glm-4.7 (or glm-4.6, glm-4.5)
Headers:   Authorization: Bearer YOUR_API_KEY
```

### 1.3 Test Your API Key

**For GLM Coding Plan:**
```bash
curl -X POST "https://api.z.ai/api/coding/paas/v4/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "glm-4.7",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**For General Plan:**
```bash
curl -X POST "https://api.z.ai/api/paas/v4/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "glm-4.7",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## Step 2: Set Up Supabase (Database)

### 2.1 Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub (recommended)
4. Create new organization

### 2.2 Create Database Project

1. Click **"New Project"**
2. Settings:
   - Name: `avail-db`
   - Database Password: (generate strong password, save it!)
   - Region: Choose closest to you
3. Wait for project to provision (~2 minutes)

### 2.3 Get Database Credentials

1. Go to **Project Settings** → **Database**
2. Save these values (you'll need them):
   - Connection string (URI format)
   - Database password
   - Project URL

### 2.4 Run Schema Setup

In Supabase SQL Editor (left sidebar), run:

```sql
-- Rooms table
CREATE TABLE rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    calendar_id TEXT,
    qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES rooms(id),
    company_id TEXT NOT NULL REFERENCES companies(id),
    title TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast availability checks
CREATE INDEX idx_bookings_room_time ON bookings(room_id, start_time, end_time);

-- Insert initial data
INSERT INTO rooms (id, name) VALUES ('alpha', 'Alpha Room');
INSERT INTO rooms (id, name) VALUES ('bravo', 'Bravo Room');

INSERT INTO companies (id, name) VALUES ('finther', 'Finther');
INSERT INTO companies (id, name) VALUES ('divfex', 'Divfex');
```

### 2.3 Enable API Access

1. Go to **Project Settings** → **API**
2. Find **Project URL** and **anon public** key
3. Save both - you'll need them for Vercel env vars

---

## Step 3: Set Up GitHub Repository

### 3.1 Create Repository

1. Go to GitHub → **New repository**
2. Name: `avail`
3. Make it **Public** (easier with Vercel free tier)
4. Don't initialize with README (we have files already)

### 3.2 Push Your Code

```bash
cd /home/lit/litrepo/avail

# Initialize git if not already
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Avail blueprint"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/avail.git

# Push
git push -u origin main
```

---

## Step 4: Deploy to Vercel

### 4.1 Connect GitHub to Vercel

1. Go to https://vercel.com and login
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Find and select your `avail` repository
5. Click **"Import"**

### 4.2 Configure Vercel Project

#### Framework Preset
- **Framework**: SvelteKit
- **Root Directory**: `./` (leave as default)

#### Environment Variables (CRITICAL!)

Add these in **Environment Variables** section:

| Name | Value | Environment |
|------|-------|-------------|
| `ZAI_API_KEY` | Your Z.ai API key | Production, Preview, Development |
| `ZAI_BASE_URL` | `https://api.z.ai/api/coding/paas/v4/` (Coding Plan) or `https://api.z.ai/api/paas/v4/` (General Plan) | Production, Preview, Development |
| `ZAI_MODEL` | `glm-4.7` | Production, Preview, Development |
| `PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Production, Preview, Development |
| `PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `DATABASE_URL` | Your Supabase connection string | Production, Preview, Development |

### 4.3 Deploy

1. Click **"Deploy"**
2. Wait for build (~2-3 minutes)
3. Get your Vercel URL: `https://avail-xxx.vercel.app`

---

## Step 5: Add Your Custom Domain (Optional, Later)

### 5.1 Buy Domain

- Any registrar: Namecheap, GoDaddy, Google Domains, etc.
- Example: `availapp.com`

### 5.2 Connect to Vercel

1. In Vercel project → **Settings** → **Domains**
2. Add your domain
3. Vercel will give you DNS records to add
4. Update your domain's DNS settings
5. Wait for SSL (automatic)

---

## Step 6: Generate QR Codes for Rooms

Once deployed:

1. Room Alpha QR: `https://your-domain.vercel.app/room/alpha`
2. Room Bravo QR: `https://your-domain.vercel.app/room/bravo`

Use any free QR code generator:
- https://qr-code-generator.com
- https://www.qrcode-generator.com

Print and stick on room doors!

---

## Environment Variables Reference

### For Local Development

Create `.env.local` file:

```env
# Z.ai (use coding endpoint for Coding Plan)
ZAI_API_KEY=your_api_key_here
ZAI_BASE_URL=https://api.z.ai/api/coding/paas/v4/
ZAI_MODEL=glm-4.7

# Supabase
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### NEVER Commit `.env.local`

Add to `.gitignore`:
```
.env.local
.env*.local
```

---

## Using Z.ai API in Code

### SvelteKit Server-side (Edge Function)

```typescript
// src/routes/api/ai/parse/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
  const { text, roomId } = await request.json();

  const response = await fetch(`${env.ZAI_BASE_URL}chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.ZAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.ZAI_MODEL || 'glm-4.7',
      messages: [
        {
          role: 'system',
          content: 'You are a booking assistant. Parse booking requests into JSON.'
        },
        {
          role: 'user',
          content: text
        }
      ]
    })
  });

  const data = await response.json();
  return json(data);
};
```

---

## Free Tier Limits

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| Vercel | Free | 100GB bandwidth/month, edge functions |
| Supabase | Free | 500MB DB, 1GB file storage, 2GB bandwidth/month |
| GitHub | Free | Unlimited public repos |
| Z.ai | Paid | Check your plan for usage limits |

**This should be more than enough for Avail V1!**

---

## Troubleshooting

### Build Fails on Vercel

1. Check **Build Logs** in Vercel dashboard
2. Make sure all env vars are set
3. Check `package.json` has correct build script

### Database Connection Fails

1. Verify Supabase project is active
2. Check `DATABASE_URL` is correct
3. Ensure SQL schema was run

### API Calls Fail

1. Check Z.ai API key is valid
2. Verify you have credits in Z.ai account
3. Check base URL is correct

---

## Next Steps

After deployment:

1. [ ] Test room status pages
2. [ ] Create a test booking
3. [ ] Test AI natural language parsing
4. [ ] Generate QR codes
5. [ ] Set up monitoring (Vercel Analytics)

---

## Cost Summary

| Item | Cost |
|------|------|
| Vercel Hosting | **FREE** |
| Supabase Database | **FREE** |
| GitHub Repository | **FREE** |
| Z.ai API | Check your plan |
| Domain (later) | ~$10-15/year |

**Total for V1: $0 + your Z.ai subscription** ✨

---

End of deployment guide.
