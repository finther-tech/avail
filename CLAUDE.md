# Avail — Meeting Room Availability & Booking System  
Blueprint / Work Decomposition (No Code)

---

## 0. System Identity (Locked)

- **System name:** Avail
- **Rooms:** Alpha, Bravo
- **Companies (current):** Finther, Divfex
- **Core principle:** Availability first, booking second, AI assists but never decides

---

## 1. Problem Statement (What Avail Solves)

Current issues:
- Meeting rooms shared across companies
- Booking visibility is unclear
- Manual paper signs are unreliable
- Conflicts happen because there is no single source of truth
- People do not know whether a room is free without asking

Non-problems:
- We are NOT replacing company calendars
- We are NOT building a new calendar product
- We are NOT automating decisions without human confirmation

---

## 2. Core Design Principles

1. **Single source of truth**
   - Each room has its own calendar
   - If the calendar says busy, the room is busy

2. **Public visibility**
   - Anyone can check room status
   - No login required to view availability

3. **Simple booking**
   - Booking must work in under 30 seconds
   - Manual form booking always exists

4. **AI is assistive**
   - AI explains, suggests, and interprets
   - AI never blocks or forces actions

5. **Growth-safe**
   - Works with 2 companies now
   - Can support more rooms and companies later

---

## 3. Mental Model (Very Important)

- The **room owns the calendar**
- People borrow time from the room
- Companies do not compete in logic
- Availability is purely time-based

Repeat this when designing:
> “Calendar answers what is true.  
> System enforces rules.  
> AI explains why.”

---

## 4. System Actors

- **User**
  - Any staff from Finther or Divfex
  - Guests (read-only)

- **Room**
  - Alpha
  - Bravo

- **Calendar**
  - One per room
  - Starts empty
  - Contains only room bookings

- **AI Assistant**
  - Optional helper
  - Stateless
  - No authority

---

## 5. Room Calendar Logic (Conceptual)

For each room:
- There is exactly one calendar
- The calendar starts empty
- Each booking = one calendar event

Event contains:
- Start time
- End time
- Title
- Company (Finther or Divfex)
- Metadata: “Booked via Avail”

Availability rule:
- If any event overlaps the requested time, the room is busy
- No company priority logic in V1

---

## 6. User Flows (End-to-End)

### 6.1 Check Room Status (Most Common Flow)

1. User scans QR code for Alpha or Bravo
2. Avail opens a web page
3. Page shows:
   - Room name
   - FREE or BUSY
   - Busy until time (if applicable)
   - Next booking (if any)
4. No AI required
5. No login required

Outcome:
- Instant clarity
- No human coordination needed

---

### 6.2 Simple Booking (No AI)

1. User clicks “Book room”
2. User fills:
   - Start time
   - Duration
   - Meeting title
   - Company
3. System checks room calendar
4. If no conflict:
   - Booking is created
   - Room becomes BUSY
5. If conflict:
   - Booking is rejected
   - User is informed

Outcome:
- Deterministic
- Reliable
- Transparent

---

### 6.3 Conflict Handling (With AI)

Trigger:
- User attempts to book a conflicting time

System behavior:
1. System detects conflict (rule-based)
2. System sends conflict facts to AI
3. AI returns:
   - Plain-language explanation
   - Suggested alternative slots
4. User chooses an alternative or cancels

Important:
- AI does not decide availability
- AI only explains and suggests

---

### 6.4 AI-Assisted Booking (Wow Feature)

1. User clicks “Ask Avail”
2. User types natural language:
   - “Quick sync with Divfex tomorrow morning 30 minutes”
3. AI interprets intent:
   - Date
   - Time window
   - Duration
   - Title
4. System shows a pre-filled booking form
5. User confirms or edits
6. Booking proceeds via normal rules

Outcome:
- AI feels powerful
- User remains in control

---

### 6.5 AI Q&A (Read-Only Intelligence)

Examples:
- “Is Alpha free now?”
- “When is the next 1-hour slot today?”
- “Why can’t I book 2–3 PM?”

System behavior:
- System computes facts
- AI formats human-friendly answers

AI never invents availability.

---

## 7. Permissions Model (V1)

- Anyone:
  - Can view room status
  - Can see company name of booking

- Booking:
  - Allowed via Avail interface only
  - No direct calendar edits by users

- Cancellation:
  - Handled later (not V1 focus)

---

## 8. What AI Does (Strict Scope)

AI Responsibilities:
- Interpret natural language into booking intent
- Explain conflicts clearly
- Suggest alternative time slots
- Answer availability questions

AI Non-Responsibilities:
- Checking availability
- Creating bookings without confirmation
- Cancelling bookings
- Enforcing company policy
- Acting as the source of truth

Failure rule:
- If AI is unavailable, Avail still works fully without it

---

## 9. Non-Goals (Explicit)

Avail will NOT:
- Replace Google Calendar usage in companies
- Decide priority between Finther and Divfex
- Auto-cancel meetings
- Predict human behavior
- Store meeting content
- Require accounts in V1

---

## 10. Growth Path (Future-Safe, Not Implemented)

Later phases may include:
- More rooms
- More companies
- Usage analytics
- Fairness insights
- Local AI models
- Server deployment

These do not affect V1 logic.

---

## 11. Definition of Success (V1)

Avail is successful if:
- Anyone can tell if Alpha or Bravo is free in under 5 seconds
- Bookings never conflict
- AI explanations feel helpful, not risky
- Boss understands it without explanation
- System still works if AI is disabled

---

## 12. Guiding Question for Every Decision

Before adding anything, ask:
> “Does this reduce confusion or speed up booking?”

If no, do not build it.

---

## 13. Final Reminder

Avail is:
- Infrastructure
- Calm
- Predictable
- Assistive

Not:
- A chatbot product
- An AI demo
- A calendar replacement

---

## 14. Technical Implementation (V1)

### 14.1 Technology Stack (Final)

**Frontend:**
- SvelteKit 5 (modern, fast, great DX)
- TypeScript for type safety
- TailwindCSS for styling

**Backend:**
- Vercel Edge Functions (serverless, fast)
- Supabase Postgres (free tier, professional)

**AI Integration:**
- Z.ai API (GLM-4.7 model)
- OpenAI-compatible API format
- Graceful degradation when AI is unavailable

**Hosting:**
- Vercel (free tier generous)
- Custom domain later

**Why this stack:**
- **All free infrastructure** (except domain later)
- SvelteKit + Vercel = best developer experience
- Supabase = professional database without server management
- Deploy to production with one git push

---

### 14.2 Data Model

```sql
-- Rooms
CREATE TABLE rooms (
    id TEXT PRIMARY KEY,  -- 'alpha', 'bravo'
    name TEXT NOT NULL,
    calendar_id TEXT,  -- Google Calendar ID or internal
    qr_code_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies
CREATE TABLE companies (
    id TEXT PRIMARY KEY,  -- 'finther', 'divfex'
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings
CREATE TABLE bookings (
    id TEXT PRIMARY KEY,  -- UUID
    room_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    title TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Index for fast availability checks
CREATE INDEX idx_bookings_room_time ON bookings(room_id, start_time, end_time);
```

---

### 14.3 API Structure

**Public endpoints (no auth required):**

```
GET  /                    # Home/room selection
GET  /room/{room_id}       # Room status page
GET  /api/room/{room_id}/status      # Current availability
GET  /api/room/{room_id}/bookings    # List bookings (optional date range)
```

**Booking endpoints:**

```
POST /api/room/{room_id}/book        # Create booking
GET  /api/room/{room_id}/available   # Check availability for time slot
```

**AI endpoints:**

```
POST /api/ai/parse           # Parse natural language to booking intent
POST /api/ai/explain         # Explain conflict in plain language
POST /api/ai/ask             # General Q&A about availability
```

**Webhook/monitoring (future):**

```
GET  /health                 # Health check
GET  /metrics                # Usage metrics (future)
```

---

### 14.4 Core Logic: Availability Check

```python
def is_room_available(room_id: str, start: datetime, end: datetime) -> bool:
    """
    Check if room is available for the given time slot.
    Room is busy if ANY existing booking overlaps.
    """
    query = """
        SELECT COUNT(*) FROM bookings
        WHERE room_id = ?
        AND (
            (start_time < ? AND end_time > ?)  -- Existing overlaps new start
            OR (start_time >= ? AND start_time < ?)  -- Existing starts during new
        )
    """
    count = db.execute(query, room_id, end, start, start, end).fetchone()
    return count == 0
```

**Overlap rule visualized:**
```
Existing:  |-------|
New A:        |-----|  ← Overlap (ends during)
New B:    |-----|       ← Overlap (starts during)
New C:    |-----------|  ← Overlap (covers existing)
New D:          |---|  ← Overlap (inside existing)
New E:      |       |  ← Overlap (encloses existing)

All these = BUSY
Only completely separate slots = FREE
```

---

### 14.5 AI Integration (Z.ai API)

**Z.ai API Details:**
```
Base URL:  https://api.z.ai/api/paas/v4/
Model:     glm-4.7
Headers:   Authorization: Bearer YOUR_API_KEY
Format:    OpenAI-compatible
```

**Pattern 1: Natural Language Parser (TypeScript/SvelteKit)**

```typescript
// src/lib/ai/parse-intent.ts
interface BookingIntent {
  title: string;
  date: string;        // YYYY-MM-DD
  start_time: string;  // HH:MM
  duration_minutes: number;
  confidence: number;
  ambiguity: string[];
}

export async function parseBookingIntent(
  text: string,
  roomId: string
): Promise<BookingIntent> {
  const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_ZAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'glm-4.7',
      messages: [
        {
          role: 'system',
          content: 'Parse booking requests into JSON. Current time: ' + new Date().toISOString()
        },
        {
          role: 'user',
          content: `Parse this booking for room ${roomId}: "${text}"`
        }
      ]
    })
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
```

**Pattern 2: Conflict Explainer**

```typescript
// src/lib/ai/explain-conflict.ts
export async function explainConflict(
  requestedStart: Date,
  requestedEnd: Date,
  conflictingBookings: Booking[]
): Promise<string> {
  const facts = formatConflictFacts(requestedStart, requestedEnd, conflictingBookings);

  const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_ZAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'glm-4.7',
      messages: [
        {
          role: 'user',
          content: `Explain why this booking cannot be made:\n\nRequested: ${requestedStart} to ${requestedEnd}\nConflicts: ${facts}\n\nBe concise. Suggest 3 alternative slots.`
        }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

**Pattern 3: Graceful Degradation**

```typescript
// src/lib/ai/with-fallback.ts
export async function aiExplainOrFallback(conflictData: ConflictData): Promise<string> {
  try {
    return await explainConflict(conflictData.requestedStart, conflictData.requestedEnd, conflictData.conflicts);
  } catch (error) {
    // Fallback to template-based explanation
    return genericConflictMessage(conflictData);
  }
}

function genericConflictMessage(data: ConflictData): string {
  return `Room is already booked during that time. Conflicting booking: ${data.conflicts[0].title}`;
}
```

---

### 14.6 Frontend Architecture (SvelteKit)

**Page 1: Room Status (/room/[id]/+page.svelte)**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  $: status = data.is_available ? 'FREE NOW' : 'BUSY';
  $: statusClass = data.is_available ? 'status-free' : 'status-busy';
</script>

<div class="room-status">
  <h1>{data.room.name}</h1>

  <div class="status-indicator {statusClass}">
    {status}
  </div>

  {#if !data.is_available && data.current_booking}
    <p>Free in {data.minutes_until_free} minutes</p>
    <p>Booked until {data.current_booking.end_time}</p>
  {/if}

  {#if data.next_booking}
    <p>Next: {data.next_booking.title} at {data.next_booking.start_time}</p>
  {/if}

  <a href="/room/{data.room.id}/book">Book This Room</a>
  <a href="/room/{data.room.id}/ask">Ask Avail</a>
</div>

<style>
  .status-free { background: #22c55e; color: white; }
  .status-busy { background: #ef4444; color: white; }
  .status-indicator {
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
  }
</style>
```

**Page 2: Booking Form (/room/[id]/book/+page.svelte)**

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;

  let date = '';
  let startTime = '';
  let duration = 30;
  let title = '';
  let company = 'finther';
</script>

<div class="booking-page">
  <h1>Book {data.room.name}</h1>

  {#if form?.error}
    <div class="error">{form.error}</div>
  {/if}

  {#if form?.success}
    <div class="success">Booking created!</div>
  {/if}

  <form method="POST" use:enhance>
    <label>
      Date
      <input type="date" name="date" bind:value={date} required />
    </label>

    <label>
      Start Time
      <input type="time" name="start_time" bind:value={startTime} required />
    </label>

    <label>
      Duration (minutes)
      <input type="number" name="duration" bind:value={duration} min="15" step="15" required />
    </label>

    <label>
      Meeting Title
      <input type="text" name="title" bind:value={title} required />
    </label>

    <label>
      Company
      <select name="company" bind:value={company} required>
        <option value="finther">Finther</option>
        <option value="divfex">Divfex</option>
      </select>
    </label>

    <button type="submit">Confirm Booking</button>
  </form>

  <div class="ai-assist">
    <h2>Or ask Avail:</h2>
    <a href="/room/{data.room.id}/ask">Use AI Assistant</a>
  </div>
</div>
```

**Load Function (Server-side data fetching)**

```typescript
// src/routes/room/[id]/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const roomId = params.id;

  // Fetch room data and status from Supabase
  const room = await getRoom(roomId);
  const currentBooking = await getCurrentBooking(roomId);
  const nextBooking = await getNextBooking(roomId);

  return {
    room,
    is_available: !currentBooking,
    current_booking: currentBooking,
    next_booking: nextBooking,
    minutes_until_free: currentBooking
      ? calculateMinutesUntil(currentBooking.end_time)
      : 0
  };
};
```

**Form Action (Booking creation)**

```typescript
// src/routes/room/[id]/book/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request, params }) => {
    const data = await request.formData();
    const roomId = params.id;

    const booking = {
      room_id: roomId,
      date: data.get('date'),
      start_time: data.get('start_time'),
      duration: Number(data.get('duration')),
      title: data.get('title'),
      company: data.get('company')
    };

    // Check availability
    const isAvailable = await checkAvailability(roomId, booking.start_time, booking.end_time);

    if (!isAvailable) {
      return fail(400, { error: 'Room is already booked for this time slot' });
    }

    // Create booking
    await createBooking(booking);

    return { success: true };
  }
};
```

---

### 14.7 Deployment (Vercel + Supabase)

**Production Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Browser                              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│  SvelteKit on Vercel (your custom domain)                   │
│  ├─ Static routes: /, /room/{id}  (cached globally)         │
│  └─ API routes: /api/*  (edge functions)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    ┌─────────┐ ┌──────────┐ ┌─────────────┐
    │Supabase │ │  Z.ai    │ │ Vercel      │
    │Postgres │ │  API     │ │ Edge Cache  │
    └─────────┘ └──────────┘ └─────────────┘
```

**Deployment Steps:**

1. Create GitHub repository
2. Connect to Vercel (auto-deploys on push)
3. Create Supabase project and run schema
4. Add environment variables to Vercel
5. Deploy!

**Full guide:** See `DEPLOYMENT.md`

---

### 14.8 Security Considerations (V1)

- No authentication = anyone can book (acceptable for V1)
- Rate limiting per IP to prevent abuse
- Input validation on all endpoints
- CSRF protection for forms
- SQL injection prevention (parameterized queries only)
- AI API key stored in environment variable only

---

### 14.9 Development Phases

**Phase 1 - Core (MVP):**
- [ ] Room status page
- [ ] Manual booking form
- [ ] SQLite backend
- [ ] Availability checking logic

**Phase 2 - AI Enhancement:**
- [ ] Natural language parsing
- [ ] Conflict explanations
- [ ] Alternative suggestions

**Phase 3 - Polish:**
- [ ] QR code generation
- [ ] Mobile responsive design
- [ ] Error handling edge cases

**Phase 4 - Integration (Optional):**
- [ ] Google Calendar sync
- [ ] Company calendar integration

---

End of blueprint.
