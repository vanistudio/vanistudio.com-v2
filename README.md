# VaniStudio

Website of Vani Studio.

## Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Elysia, Bun
- **Database**: PostgreSQL, Drizzle ORM

## Setup

```bash
cp .env.example .env
bun install
```

## Development

```bash
bun run dev        # backend
bun run dev:fe     # frontend
bun run db:push    # sync schema to database
bun run db:studio  # open database viewer
```

## Build

```bash
bun run build:fe
bun run start
```