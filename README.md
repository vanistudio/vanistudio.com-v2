<div align="center">

# VaniStudio

**Website chính thức của Vani Studio — thiết kế và phát triển phần mềm.**

[![Version](https://img.shields.io/badge/version-1.0.50-blue?style=flat-square)](package.json)
[![License](https://img.shields.io/badge/license-Non--Commercial-red?style=flat-square)](LICENSE)

</div>

---

## Tech Stack

<div align="center">

### Core Runtime

[![Core](https://skillicons.dev/icons?i=bun,ts)](https://skillicons.dev)

### Frontend

[![Frontend](https://skillicons.dev/icons?i=react,vite,tailwind,css)](https://skillicons.dev)

### Backend

[![Backend](https://skillicons.dev/icons?i=elysia,postgres)](https://skillicons.dev)

### Tools & Services

[![Tools](https://skillicons.dev/icons?i=github,git)](https://skillicons.dev)

</div>

| Layer | Công nghệ |
|---|---|
| **Runtime** | Bun |
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, shadcn/ui, Radix UI, Framer Motion |
| **Backend** | ElysiaJS |
| **Database** | PostgreSQL, Drizzle ORM |
| **Auth** | GitHub OAuth, Google OAuth, JWT |
| **UI** | Lucide Icons, Iconify, Sonner, Recharts |

---

## Cài đặt

```bash
cp .env.example .env
bun install
bun db:push
```

## Development

```bash
bun run dev        # Backend (auto-reload)
bun run dev:fe     # Frontend (Vite HMR)
bun run db:studio  # Database viewer
```

## Production

```bash
bun run build:fe   # Build frontend
bun run start      # Start server
```

## Scripts

| Script | Mô tả |
|---|---|
| `bun dev` | Chạy backend với `--watch` |
| `bun dev:fe` | Chạy Vite dev server |
| `bun build:fe` | Build frontend production |
| `bun start` | Chạy production server |
| `bun db:push` | Sync schema → database |
| `bun db:generate` | Generate migration |
| `bun db:migrate` | Chạy migration |
| `bun db:studio` | Mở Drizzle Studio |

---

<div align="center">
  <sub>Built with ❤️ by <strong>Vani Studio</strong></sub>
</div>