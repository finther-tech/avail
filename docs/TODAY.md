# Avail - Today's Progress & Next Steps (Feb 6 → Feb 7)

> Last updated: February 6, 2026
> Status: Core features built, ready for testing

---

## ✅ What We Built Today

### Files Created

```
avail/
├── README.md                    # Project overview
├── .env.example                 # Environment template
├── docs/
│   ├── CLAUDE.md                # Full blueprint
│   ├── DEPLOYMENT.md            # Deployment guide
│   └── TODAY.md                 # This file
└── src/
    ├── routes/
    │   ├── +page.svelte                     # Home page
    │   └── room/[id]/
    │       ├── +page.svelte                 # Room status (FREE/BUSY)
    │       ├── +page.server.ts              # Server-side data loading
    │       ├── book/
    │       │   ├── +page.svelte             # Booking form
    │       │   └── +page.server.ts          # Booking action
    │       └── ask/
    │           ├── +page.svelte             # AI chat interface
    │           └── +page.server.ts          # Z.ai integration
    └── lib/
        ├── db/
        │   ├── supabase.ts                  # Supabase client
        │   └── queries.ts                   # Database functions
        └── ai/
            └── zai.ts                        # Z.ai API integration
```

### Features Working

| Page | URL | Functionality |
|------|-----|---------------|
| Home | `/` | Select room (Alpha, Bravo) |
| Room Status | `/room/alpha` | Shows availability, current/next booking |
| Booking Form | `/room/alpha/book` | Manual booking with date/time picker |
| AI Assistant | `/room/alpha/ask` | Natural language booking |

---

## 🎯 Tomorrow's Tasks (Feb 7)

### Priority 1: Get Supabase Running

1. **Create Supabase account**
   - Go to https://supabase.com
   - Sign up with GitHub

2. **Create a new project**
   - Name: `avail-db`
   - Region: Closest to you
   - Save the database password!

3. **Run the SQL schema**

   In Supabase SQL Editor, run:

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
   INSERT INTO rooms (id, name) VALUES ('alpha', 'Alpha Room'), ('bravo', 'Bravo Room');
   INSERT INTO companies (id, name) VALUES ('finther', 'Finther'), ('divfex', 'Divfex');
   ```

4. **Get your Supabase credentials**

   Go to Project Settings → API:
   - Copy `Project URL`
   - Copy `anon public` key

---

### Priority 2: Set Up Environment Variables

1. **`.env.local` is already created!** Just edit it:

   ```bash
   cd /home/lit/litrepo/avail
   nano .env.local
   # or use your preferred editor
   ```

2. **Replace the placeholder values** with your real keys:

   ```env
   # Z.ai API - GET A NEW KEY! (revoke the exposed one)
   ZAI_API_KEY=your_new_zai_api_key_here
   ZAI_BASE_URL=https://api.z.ai/api/paas/v4/
   ZAI_MODEL=glm-4.7

   # Supabase - from your Supabase project settings
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **🔴 IMPORTANT: Revoke your exposed API key**

   Go to https://z.ai → API Keys → Delete: `a5c2498162f7433b8c7d9802f3fbd637.p0XYnIuuGJvdCPp3`
   Then create a new one.

---

### Priority 3: Test the App

1. **Start the dev server**

   ```bash
   cd /home/lit/litrepo/avail
   npm run dev
   ```

   Open http://localhost:5173

2. **Test each page:**

   | Test | Expected |
   |------|----------|
   | Visit `/` | See Alpha & Bravo room cards |
   | Visit `/room/alpha` | See "FREE NOW" (no bookings yet) |
   | Visit `/room/alpha/book` | See booking form |
   | Submit booking form | Booking created in Supabase |
   | Visit `/room/alpha` again | See "BUSY" with your booking |
   | Visit `/room/alpha/ask` | AI chat interface |

3. **Check Supabase:**

   Go to Table Editor → `bookings` → should see your booking.

---

### Priority 4: Deploy to Vercel (Optional)

If everything works locally, deploy:

1. **Push to GitHub**

   ```bash
   cd /home/lit/litrepo/avail
   git add .
   git commit -m "Initial Avail implementation"
   git push -u origin main
   ```

2. **Connect to Vercel**

   - Go to https://vercel.com
   - Import your GitHub repo
   - Add environment variables (same as `.env.local`)
   - Deploy!

3. **Get your live URL**

   Vercel will give you: `https://avail-xxx.vercel.app`

---

## 📝 Quick Commands Reference

```bash
# Start dev server
npm run dev

# Check for errors
npm run check

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Room not found" | Supabase tables not created - run SQL schema |
| "Failed to create booking" | Check `.env.local` has correct API keys |
| AI not responding | Check Z.ai API key is valid (and not the exposed one!) |
| Port 5173 in use | Vite will auto-switch to 5174, 5175, etc. |
| Supabase connection error | Verify SUPABASE_URL and SUPABASE_ANON_KEY |

---

## 📂 Project Structure Reminder

```
avail/                          # /home/lit/litrepo/avail
├── src/
│   ├── routes/                 # Pages (SvelteKit file-based routing)
│   │   ├── +page.svelte        # Home page at /
│   │   └── room/[id]/          # Dynamic routes for /room/alpha, /room/bravo
│   └── lib/                    # Shared code
│       ├── db/                 # Database stuff
│       └── ai/                 # Z.ai integration
├── docs/                       # Documentation
│   ├── CLAUDE.md               # Full blueprint
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── TODAY.md                # This file
├── .env.example                # Copy this to .env.local
└── .env.local                  # YOUR ACTUAL KEYS (don't commit!)
```

---

## 🎯 End Goal

By end of Feb 7, you should have:

- [x] App running locally
- [ ] Supabase database set up
- [ ] Bookings working end-to-end
- [ ] AI assistant responding
- [ ] Deployed to Vercel (optional)

---

## 💡 Notes

- **Dev server currently running on port 5174**
- All code is in git - ready to push
- Z.ai API integration is complete - just needs valid key
- Supabase integration is complete - just needs database

---

## 🔗 Useful Links

- Supabase: https://supabase.com
- Z.ai: https://z.ai
- Vercel: https://vercel.com
- SvelteKit docs: https://svelte.dev/docs/kit

---

**Good luck! See you tomorrow.** 🚀
