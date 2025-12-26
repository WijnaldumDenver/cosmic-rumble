# UniRumble - Multiplayer Card Game

A fast-paced (10-15 min) crossover card game where characters/creatures from different franchises battle each other in real-time multiplayer matches.

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js Server Actions + API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js (Credentials)
- **Real-time**: Socket.io
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Package Manager**: pnpm

## Features

- ✅ User authentication with credentials
- ✅ Server-authoritative game state
- ✅ Real-time multiplayer (2-4 players)
- ✅ Card collection system
- ✅ Weekly wheel for free card unlocks
- ✅ Rank system (Bronze → Platinum)
- ✅ Penalty system (anti-rage-quit)
- ✅ Admin panel (role-based access)
- ✅ Game session management
- ✅ Turn-based battle system

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- pnpm (install with `npm install -g pnpm`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd UniRumble
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)

4. Set up the database:
```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Or run migrations
pnpm db:migrate
```

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── game/          # Game session endpoints
│   │   ├── wheel/         # Weekly wheel endpoints
│   │   └── admin/         # Admin endpoints
│   ├── auth/              # Auth pages (signin/signup)
│   ├── dashboard/         # User dashboard
│   ├── game/              # Game pages
│   ├── wheel/             # Weekly wheel page
│   └── admin/             # Admin panel
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── game/             # Game engine
│   ├── socket/           # WebSocket server
│   ├── auth.ts           # NextAuth config
│   └── prisma.ts         # Prisma client
├── prisma/               # Prisma schema
└── types/                # TypeScript types
```

## Game Rules

### Turn Structure
1. **Draw** - Draw a card
2. **Deploy** - Choose ONE: Character OR Item OR Battlefield
3. **Battle** - Attack opponents
4. **End** - End turn

### Win Conditions
- Reduce all opponents to 0 HP
- Defeat 3 enemy characters

### Battle Mechanics
- Speed determines attack order
- Defense reduces incoming damage
- Overflow damage goes to player HP
- Momentum rule: Draw card on character kill

## Development

### Database Commands
```bash
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema changes
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Prisma Studio
```

### Code Quality
- TypeScript for type safety
- Server-side validation for all game actions
- Modular architecture
- Clear separation of concerns

## Production Deployment

1. Set up PostgreSQL database (e.g., Vercel Postgres, Supabase, Railway)
2. Update `DATABASE_URL` in production environment
3. Set `NEXTAUTH_URL` to your production domain
4. Generate and set `NEXTAUTH_SECRET`
5. Deploy to Vercel, Railway, or your preferred platform

## Notes

- Game state is server-authoritative (no client trust)
- WebSocket server requires custom Next.js server setup for production
- All game actions are validated server-side
- Penalty system prevents rage-quitting abuse

## License

MIT

