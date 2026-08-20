# Frontend Architecture

## Overview

The frontend is a **Next.js 14 App Router** application written in TypeScript. The code is organized around business features so authentication, reservation, and profile logic remain separated from reusable UI and infrastructure.

## Main Structure

```text
src/
├── app/                         # Routes, layouts, providers, global CSS
├── features/
│   ├── auth/                    # Login, registration, logout
│   ├── reservation/             # Desktop/mobile booking experiences
│   └── user-profile/            # Profile display and update flow
└── shared/
    ├── components/              # Reusable form/UI components
    ├── context/                 # Auth, theme, responsive layout state
    ├── icons/                   # SVG icons used by the application
    ├── layout/                  # Sidebar, headers, mobile navigation
    └── lib/                     # API client, React Query, utilities
```

## State Management

| State | Tool | Examples |
|---|---|---|
| Server state | TanStack React Query | schedules, reservations, profile data |
| Global UI/session state | React Context | authenticated user, responsive navigation, theme |
| Component state | React state/hooks | selected seat, form values, modal state |

Reservation and profile queries use feature-owned query-key factories so invalidation remains predictable after mutations.

## API Layer

All HTTP requests go through `src/shared/lib/api/core/http.ts`.

The backend origin is configured with:

```env
NEXT_PUBLIC_API_BASE=http://localhost:5000
```

`makeApiUrl()` appends `/api` and the endpoint path. For example, `/auth/login` becomes:

```text
http://localhost:5000/api/auth/login
```

The shared client:

- sends `credentials: "include"` for cookie/session authentication;
- JSON-encodes request bodies;
- supports query parameters without overwriting existing URL queries;
- converts non-2xx responses to `HttpError`;
- performs a guarded browser-side logout/redirect on HTTP 401.

The frontend intentionally fails with a clear configuration error if `NEXT_PUBLIC_API_BASE` is missing instead of silently calling an incorrect relative API URL.

## Protected Layout

Routes in `src/app/(admin)/` are protected by the shared admin layout. It waits for both:

1. authentication state to be restored from local storage; and
2. viewport mode to be initialized.

If no user exists, it redirects to `/signin`. Waiting for viewport initialization also prevents a desktop/mobile layout flash during hydration.

## Responsive Strategy

The application uses the same breakpoint in JavaScript and Tailwind:

- **Desktop:** `1024px` and wider (`lg`)
- **Mobile/tablet:** below `1024px`

Desktop uses the sidebar/header plus the weekly calendar and seat list. Mobile/tablet uses the compact top bar, bottom navigation, graphical seat map, and time-slot selector.

## Localization and Dates

The interface is Persian and RTL. Jalali date presentation is handled with `react-multi-date-picker` and `react-date-object` while backend requests use Gregorian `YYYY-MM-DD` dates.

Important helpers live in `src/features/reservation/utils/date.ts`:

- `toPersianDateObject()`
- `dateStringToPersianDateObject()`
- `formatDateForApi()`
- `formatTimeForApi()`
- `formatPersianDate()` / `formatPersianTime()`

## Branding and Error Handling

The application uses the Financial Technologies Laboratory logo and the project green/orange visual language throughout the shell, authentication screens, help page, and custom 404 page. Unknown routes are handled by `NotFoundView`, with actions back to the reservation home page or help page.
