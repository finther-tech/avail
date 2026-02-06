# Avail

Meeting Room Availability & Booking System

> Availability first, booking second, AI assists but never decides.

---

## 📋 What is Avail?

Avail is a simple system for checking meeting room availability and booking rooms. It's designed for shared office spaces where multiple companies share meeting rooms.

**Rooms:** Alpha, Bravo
**Companies:** Finther, Divfex

---

## ✨ Key Features

- **Instant Status Check** - See if a room is free in under 5 seconds
- **Simple Booking** - Book a room in under 30 seconds
- **No Login Required** - Anyone can view availability
- **AI Assistant** - Natural language booking requests
- **Conflict Prevention** - Never double-book a room

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | SvelteKit 5 + TypeScript |
| Backend | Vercel Edge Functions |
| Database | Supabase (Postgres) |
| AI | Z.ai API (GLM-4.7) |
| Hosting | Vercel |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local:
# - ZAI_API_KEY=your_zai_api_key
# - SUPABASE_URL=your_supabase_url
# - SUPABASE_ANON_KEY=your_supabase_anon_key

# Run dev server
npm run dev

# Open http://localhost:5173
```

---

## 📁 Project Structure

```
avail/
├── src/
│   ├── routes/           # SvelteKit pages & API routes
│   │   ├── room/[id]/   # Room pages (Alpha, Bravo)
│   │   └── api/         # API endpoints
│   ├── lib/             # Shared code
│   │   ├── db/          # Supabase client
│   │   └── ai/          # Z.ai integration
│   └── app.html         # App layout
├── static/              # Static assets
├── docs/                # Documentation
│   ├── CLAUDE.md        # Blueprint & design
│   ├── DEPLOYMENT.md    # Deployment guide
│   └── TODAY.md         # Today's progress & next steps
└── README.md            # This file
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Blueprint & Design](./docs/CLAUDE.md) | Complete system design |
| [Deployment Guide](./docs/DEPLOYMENT.md) | How to deploy to production |
| [Today's Progress](./docs/TODAY.md) | What we did & what's next |

---

## 🚢 Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete deployment guide.

**TL;DR:**
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

---

## 📄 License

MIT

---

## 🏗 Status

🚧 Under Development

**Started:** February 6, 2026
**Current:** Core features built, testing in progress
