# Avail Architecture & Flow Guide

**Simple explanation of how everything connects together**

---

## 1. The Big Picture (Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER                                   │
│  (Opens browser, scans QR code, visits your app)                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      YOUR APP (SvelteKit)                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    FRONTEND (Svelte)                     │   │
│  │  - Pages: /room/alpha, /room/bravo, /room/*/book        │   │
│  │  - Runs in user's browser                               │   │
│  │  - Shows UI, handles forms                               │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────▼────────────────────────────────────┐   │
│  │                   BACKEND (Server)                       │   │
│  │  - API routes: /api/room/*/ask, /api/room/*/book       │   │
│  │  - Runs on Vercel Edge Functions (serverless)          │   │
│  │  - Talks to database + AI API                          │   │
│  └──┬───────────────────────────┬──────────────────────────┘   │
│     │                           │                               │
└─────┼───────────────────────────┼───────────────────────────────┘
      │                           │
      ▼                           ▼
┌──────────────────┐    ┌────────────────────────────────────┐
│   SUPABASE       │    │           Z.AI API                  │
│   (Database)     │    │  https://api.z.ai/api/coding/paas/v4│
│                  │    │                                    │
│  - Rooms         │    │  - Processes natural language       │
│  - Companies     │    │  - Parses booking requests          │
│  - Bookings      │    │  - Explains conflicts               │
└──────────────────┘    └────────────────────────────────────┘
```

---

## 2. Where Does Data Live?

### Data is ONLY in Supabase (Cloud Database)

```
SUPABASE DATABASE (Cloud)
├── Rooms table
│   ├── alpha  → "Alpha Room"
│   └── bravo  → "Bravo Room"
│
├── Companies table
│   ├── finther → "Finther"
│   └── divfex  → "Divfex"
│
└── Bookings table
    ├── id, room_id, company_id, title, start_time, end_time
    └── This is where ALL booking data is stored
```

**Important:**
- Your laptop (`npm run dev`) → connects to SAME Supabase database
- Vercel (production) → connects to SAME Supabase database
- **Both share the same data!**

### Environment Variables (How app connects to Supabase)

```
Your app needs 2 things to connect to Supabase:

1. PUBLIC_SUPABASE_URL
   → https://fngewrbarptplghwyeqq.supabase.co
   → This is your Supabase project address

2. PUBLIC_SUPABASE_ANON_KEY
   → eyJhbGci... (long token)
   → This lets your app talk to your Supabase database
```

---

## 3. Local Development Flow

```
Your Laptop
├── npm run dev
   │
   ├──→ Starts SvelteKit dev server (http://localhost:5173)
   │
   ├──→ Reads .env.local file
   │   ├── ZAI_API_KEY, ZAI_BASE_URL, ZAI_MODEL
   │   └── PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY
   │
   ├──→ When you visit /room/alpha:
   │   1. Browser requests page
   │   2. Server runs load function
   │   3. Server fetches from Supabase (using env vars)
   │   4. Server renders HTML with data
   │   5. Browser shows page
   │
   └──→ When you book a room:
       1. You fill form and submit
       2. Form sends to server action
       3. Server checks Supabase for conflicts
       4. If available: inserts booking to Supabase
       5. If booked: shows error
```

### Files that run in different places:

```
RUNS IN BROWSER (Client-side):
├── src/routes/+page.svelte
├── src/routes/room/[id]/+page.svelte
├── src/routes/room/[id]/book/+page.svelte
└── Any .svelte file (except +page.server.ts)

RUNS ON SERVER (Server-side):
├── src/routes/room/[id]/+page.server.ts    (load function)
├── src/routes/room/[id]/book/+page.server.ts (form actions)
├── src/routes/api/**/+server.ts             (API endpoints)
├── src/lib/db/queries.ts                    (database queries)
└── src/lib/ai/zai.ts                        (AI calls)
```

---

## 4. Vercel Deployment Flow

```
Your Code (GitHub)
        │
        │  git push
        ▼
    Vercel
        │
        ├──→ Detects code change
        │
        ├──→ Runs build:
        │   ├── npm run build
        │   ├── Creates optimized files
        │   └── Packages for deployment
        │
        ├──→ Deploys to Vercel Edge:
        │   ├── Frontend: CDN globally distributed
        │   └── Backend: Edge Functions (serverless)
        │
        └──→ Uses Environment Variables from Vercel Settings:
            ├── ZAI_API_KEY
            ├── ZAI_BASE_URL
            ├── ZAI_MODEL
            ├── PUBLIC_SUPABASE_URL
            └── PUBLIC_SUPABASE_ANON_KEY
```

### After Deployment:

```
User Browser → https://your-app.vercel.app/room/alpha
                    │
                    ├──→ Vercel Edge receives request
                    │
                    ├──→ Routes to correct page
                    │
                    ├──→ If server data needed:
                    │   └──→ Edge Function runs
                    │       ├── Reads Supabase URL/Key from Vercel env
                    │       ├── Fetches from Supabase
                    │       └── Returns data
                    │
                    └──→ Renders and shows page
```

---

## 5. Environment Variables Explained

### Local (`.env.local` - on your laptop)

```env
# Z.ai AI API
ZAI_API_KEY=01f12c205ad34e698404ff20783e81a4...
ZAI_BASE_URL=https://api.z.ai/api/coding/paas/v4/
ZAI_MODEL=glm-4.7

# Supabase Database
PUBLIC_SUPABASE_URL=https://fngewrbarptplghwyeqq.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Database (for direct connections, optional)
DATABASE_URL=postgresql://...
```

### Production (Vercel Dashboard)

```
Go to: Vercel Project → Settings → Environment Variables

Add the SAME values there:
- ZAI_API_KEY         → (same as .env.local)
- ZAI_BASE_URL        → (same as .env.local)
- ZAI_MODEL           → (same as .env.local)
- PUBLIC_SUPABASE_URL → (same as .env.local)
- PUBLIC_SUPABASE_ANON_KEY → (same as .env.local)
```

**Why copy to Vercel?**
- Your laptop uses `.env.local`
- Vercel uses its own environment variable settings
- **Never commit `.env.local` to GitHub!**

---

## 6. Request Flow Examples

### Example 1: User checks room status

```
1. User visits: https://your-app.com/room/alpha

2. SvelteKit routes to: src/routes/room/[id]/+page.svelte

3. Before showing page, runs +page.server.ts:
   export const load = async ({ params }) => {
     const room = await getRoom(params.id);  // ← Calls Supabase
     const bookings = await getBookings(params.id);  // ← Calls Supabase
     return { room, bookings };
   }

4. Supabase query:
   SELECT * FROM rooms WHERE id = 'alpha'
   SELECT * FROM bookings WHERE room_id = 'alpha'

5. Data flows back:
   Supabase → Server → Page → Browser → User sees status
```

### Example 2: User asks AI a question

```
1. User types: "Is alpha room free tomorrow morning?"

2. Browser sends POST to: /api/room/alpha/ask
   Body: { question: "Is alpha room free tomorrow morning?" }

3. API route (src/routes/api/room/[id]/ask/+server.ts):
   export const POST = async ({ request, params }) => {
     const { question } = await request.json();
     const answer = await askAvail(question, params.id);  // ← AI function
     return json({ answer });
   }

4. askAvail function (src/lib/ai/zai.ts):
   - Calls Z.ai API with the question
   - Z.ai processes and returns response
   - Returns answer text

5. Response flows back:
   Z.ai API → Edge Function → Browser → User sees answer
```

### Example 3: User books a room

```
1. User fills form:
   - Date: 2025-02-10
   - Time: 14:00
   - Duration: 30 minutes
   - Title: "Team Sync"
   - Company: finther

2. Form submits to: /room/alpha/book (POST)

3. Server action (src/routes/room/[id]/book/+page.server.ts):
   export const actions = {
     default: async ({ request, params }) => {
       const data = await request.formData();

       // Check if room is available
       const isAvailable = await checkAvailability(
         params.id,
         startTime,
         endTime
       );

       if (!isAvailable) {
         return fail(400, { error: 'Room already booked' });
       }

       // Create booking
       await createBooking({
         room_id: params.id,
         title: data.get('title'),
         start_time: startTime,
         end_time: endTime,
         company_id: data.get('company')
       });

       return { success: true };
     }
   }

4. checkAvailability queries Supabase:
   SELECT COUNT(*) FROM bookings
   WHERE room_id = 'alpha'
   AND (
     (start_time < '2025-02-10 14:30' AND end_time > '2025-02-10 14:00')
   )

5. If count = 0 (no conflicts), createBooking inserts:
   INSERT INTO bookings (id, room_id, company_id, title, start_time, end_time)
   VALUES (uuid(), 'alpha', 'finther', 'Team Sync', '2025-02-10 14:00', '2025-02-10 14:30')

6. Data now lives in Supabase forever (until deleted)
```

---

## 7. File Structure & What Runs Where

```
src/
├── routes/
│   ├── +page.svelte                    # Client: Home page
│   ├── room/
│   │   └── [id]/
│   │       ├── +page.svelte            # Client: Room status page
│   │       ├── +page.server.ts         # Server: Load room data from Supabase
│   │       ├── book/
│   │       │   ├── +page.svelte        # Client: Booking form
│   │       │   └── +page.server.ts     # Server: Handle booking form
│   │       └── ask/
│   │           ├── +page.svelte        # Client: AI chat UI
│   │           └── +page.server.ts     # (unused now, using API)
│   └── api/
│       └── room/
│           └── [id]/
│               └── ask/
│                   └── +server.ts      # Server: AI API endpoint
│
├── lib/
│   ├── db/
│   │   ├── supabase.ts                 # Shared: Supabase client setup
│   │   └── queries.ts                  # Server: Database queries
│   └── ai/
│       └── zai.ts                       # Server: AI API calls
│
└── app.html                             # Client: HTML template
```

---

## 8. Quick Reference

### I want to... → Where do I look?

| You want to... | Go to file |
|----------------|------------|
| Change page styling | `src/routes/**/+page.svelte` (bottom `<style>` section) |
| Change what data loads | `src/routes/**/+page.server.ts` (load function) |
| Add new API endpoint | Create `src/routes/api/your-endpoint/+server.ts` |
| Change database query | `src/lib/db/queries.ts` |
| Change AI behavior | `src/lib/ai/zai.ts` |
| Fix environment variables | `.env.local` (local) or Vercel Dashboard (production) |

### Where is my data?

| Data | Location |
|------|----------|
| Room definitions | Supabase → `rooms` table |
| Company definitions | Supabase → `companies` table |
| All bookings | Supabase → `bookings` table |
| AI responses | Not stored (stateless) |
| Environment variables | `.env.local` or Vercel settings |

### Common commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `git push` | Deploy to Vercel (if connected) |

---

## 9. Troubleshooting

### "Supabase connection error"
- Check `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`
- Make sure Supabase project is active (not paused)

### "AI not working"
- Check `ZAI_API_KEY`, `ZAI_BASE_URL`, `ZAI_MODEL`
- For Coding Plan: Use `https://api.z.ai/api/coding/paas/v4/`
- Make sure you have balance in Z.ai account

### "Works locally but not on Vercel"
- Environment variables not set in Vercel Dashboard
- Check Vercel deployment logs

### "Data not showing up"
- Check Supabase table actually has data
- Run the SQL schema setup script
- Check browser console for errors

---

End of architecture guide.
