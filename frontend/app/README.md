# Reservation System Frontend

This directory contains the Next.js frontend for the Financial Technologies Laboratory reservation system.

For the full project overview, architecture, features, and academic project information, see [`../../README.md`](../../README.md).

## Quick Start on Ubuntu

```bash
cd frontend/app
cp ../../.env.example .env.local
npm ci
npm run dev
```

Open `http://localhost:3000` in your browser.

The backend must be running at the address configured by `NEXT_PUBLIC_API_BASE`. The frontend automatically calls endpoints under `${NEXT_PUBLIC_API_BASE}/api/...` and sends cookies with `credentials: "include"`.

## Validation Before Submission

```bash
npm run typecheck
npm run lint
npm run build
```

## Frontend Source Layout

```text
src/
├── app/                 # Next.js routes and layouts
├── features/
│   ├── auth/            # Authentication UI, hooks, and API service
│   ├── reservation/     # Desktop/mobile booking flows
│   └── user-profile/    # Profile display and update flow
└── shared/
    ├── components/      # Reusable UI components
    ├── context/         # Auth, theme, and responsive-layout state
    ├── layout/          # Desktop/mobile navigation shell
    └── lib/             # API client, errors, React Query, utilities
```

Technical documentation is available under [`docs/`](docs/).
