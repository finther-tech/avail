# Avail

> **Simple Meeting Room Booking for Shared Offices**

---

## 📋 What is Avail?

Avail is a meeting room availability and booking system designed for shared office spaces. It helps multiple companies coordinate room usage without conflicts or back-and-forth messages.

### Current Setup

| Rooms | Companies | Location |
|-------|-----------|----------|
| Alpha Room, Bravo Room | Finther, DGB | Level 5 |

**Live URL:** https://avail-room.vercel.app/

---

## ✨ Key Features

- **👀 Instant Availability** - See room status at a glance (Available/Occupied)
- **⚡ Quick Booking** - Book a room in under 30 seconds
- **🤖 AI Assistant** - Natural language booking with Avail AI
- **📅 Weekly Calendar** - View all bookings for the week
- **🔔 Conflict Prevention** - Automatic double-booking detection
- **📊 Analytics** - Track room usage by company and peak hours
- **🌐 No Login Required** - Anyone can view and book

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | SvelteKit 5 + TypeScript |
| Backend | Vercel Serverless Functions |
| Database | Supabase (Singapore Region) |
| AI | Z.ai API (GLM-4.7) |
| Hosting | Vercel |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase project
- Z.ai API key (for AI features)

### Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local:
# PUBLIC_SUPABASE_URL=your_supabase_url
# PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# ZAI_API_KEY=your_zai_api_key

# Run dev server
npm run dev

# Open http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
avail/
├── src/
│   ├── routes/
│   │   ├── +page.svelte          # Home (all rooms overview)
│   │   ├── room/[id]/
│   │   │   ├── +page.svelte      # Room details & weekly calendar
│   │   │   ├── book/+page.svelte # Manual booking form
│   │   │   └── ask/+page.svelte  # AI booking assistant
│   │   ├── analytics/+page.svelte # Usage analytics
│   │   └── cancel/+page.server.ts # Cancel booking action
│   ├── lib/
│   │   ├── db/
│   │   │   ├── supabase.ts       # Supabase client
│   │   │   └── queries.ts        # Database queries
│   │   ├── ai/
│   │   │   └── zai.ts            # AI integration
│   │   └── config/
│   │       └── branding.ts       # Branding config
│   └── app.html
├── static/                       # Static assets (images, etc)
├── docs/
│   ├── CLAUDE.md                 # Technical blueprint
│   └── DEPLOYMENT.md             # Deployment guide
└── README.md
```

---

## 🚢 Deployment

### Automatic (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `ZAI_API_KEY`
   - `ZAI_BASE_URL` (optional, defaults to https://api.z.ai/api/paas/v4/)
   - `ZAI_MODEL` (optional, defaults to glm-4.7)
4. Deploy!

### Manual

```bash
npm run build
vercel --prod
```

---

## 🔧 Configuration

### Rooms & Companies

Edit `src/lib/config/branding.ts`:

```typescript
// Add rooms
export const ROOM_CONFIG = {
  floor: 'Level 5',
  alpha: { capacity: 12 },
  bravo: { capacity: 8 }
  // Add more rooms here
};

// Add companies
export const COMPANIES = [
  { value: 'finther', label: 'Finther', color: '#9333ea' },
  { value: 'dgb', label: 'DGB', color: '#2563eb' }
  // Add more companies here
];
```

### Supabase Tables

Required tables:
- `rooms` (id, name, calendar_id, qr_code_url, created_at)
- `companies` (id, name, created_at)
- `bookings` (id, room_id, company_id, title, start_time, end_time, booked_by, created_at)

---

## 📖 Usage

### Check Availability
1. Visit https://avail-room.vercel.app/
2. See room status instantly on the home page

### Book a Room (Manual)
1. Click on a room
2. Click "Book This Room"
3. Fill in date, time, title, company, your name
4. Submit

### Book with AI
1. Click on a room
2. Click "Avail AI"
3. Type naturally: "Book Alpha for tomorrow 2pm to 3pm for Finther team standup"

### Cancel Booking
1. Find the booking on room page
2. Click "Cancel" button
3. Confirm

---

## 🐛 Troubleshooting

**Times showing wrong on Vercel?**
- Fixed: Times now display in user's browser timezone automatically

**Bookings not showing in weekly calendar?**
- Fixed: Calendar now properly handles timezone and next-day bookings

**AI not working?**
- Check `ZAI_API_KEY` is set in environment variables

---

## 📊 Features Roadmap

- [ ] Recurring bookings support
- [ ] Calendar integration (Google/Outlook)
- [ ] Mobile app (PWA)
- [ ] Email notifications
- [ ] Room booking reminders
- [ ] Admin dashboard
- [ ] Usage reports export

---

## 📄 License

MIT

---

## 🏆 Version

**v1.0.0** - Initial Release

- Core booking functionality
- AI assistant integration
- Real-time availability
- Weekly calendar view
- Analytics dashboard
- Timezone support (auto-detects user timezone)

---

**Built by Finther Tecnologica Sdn Bhd**
