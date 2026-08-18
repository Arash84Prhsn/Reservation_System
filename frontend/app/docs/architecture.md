# Frontend Architecture

## 1. Overview

The frontend is a **Next.js 14 (App Router)** application written in TypeScript. It follows a [Feature-Sliced Design (FSD)](https://feature-sliced.design/) inspired architecture, which keeps business logic co-located, prevents cross-feature coupling, and scales cleanly as the product grows.

---

## 2. Directory Structure

```
frontend/app/
├── docs/                         # ← You are here
│   ├── README.md                 # Documentation index
│   ├── architecture.md           # This file
│   ├── future-recommendations.md
│   └── features/                 # Per-feature documentation
├── public/
│   └── videos/                   # Instructional video assets for /help page
└── src/
    ├── app/                      # Next.js App Router (pages & layouts)
    │   ├── (admin)/              # Protected routes (requires login)
    │   │   ├── layout.tsx        # AdminLayout: auth guard + shell
    │   │   ├── page.tsx          # Home dashboard (/)
    │   │   ├── calendar/         # /calendar
    │   │   ├── reserve-list/     # /reserve-list
    │   │   ├── profile/          # /profile
    │   │   └── help/             # /help
    │   ├── (full-width-pages)/   # Public routes (auth pages, error)
    │   │   └── (auth)/           # /signin, /signup
    │   ├── layout.tsx            # Root layout (Providers wrapper)
    │   ├── providers.tsx         # React Query, Theme, Auth, Sidebar providers
    │   └── globals.css           # Global Tailwind CSS + custom colors
    ├── features/                 # Isolated business domains
    │   ├── auth/
    │   ├── reservation/
    │   └── user-profile/
    └── shared/                   # Domain-agnostic, reusable code
        ├── components/           # Generic UI: Button, Modal, Input, Alert...
        ├── context/              # Global React Contexts
        ├── hooks/                # Generic hooks (useModal, useLocalStorage...)
        ├── icons/                # Centralized SVG icon exports
        ├── layout/               # App shell: Sidebar, Header, BottomNav...
        └── lib/
            ├── api/core/         # apiFetch wrapper, error handling, config
            └── utils.ts          # cn(), toPersianDigits()
```

### Layer Import Rules (FSD)

| Layer | Can import from |
|---|---|
| `app/` | `features/`, `shared/` |
| `features/auth` | `shared/` only |
| `features/reservation` | `shared/` only |
| `features/user-profile` | `shared/`, `features/auth` (for types) |
| `shared/` | Nothing in `features/` or `app/` |

> ⚠️ **Critical Rule:** A feature must **never** import from another feature's internal implementation. Cross-feature data (e.g., `User` type) must be exposed through that feature's public `api/index.ts` barrel.

---

## 3. State Management Strategy

| State Type | Tool | Where |
|---|---|---|
| **Server state** (API data) | TanStack Query (React Query) | Feature-level hooks |
| **Global client state** | React Context | `shared/context/` |
| **Local UI state** | `useState` / `useReducer` | Inside components |

### React Query Cache Keys

Each feature owns its query keys in a `queryKeys.ts` file:

- `src/features/reservation/queryKeys.ts`
- `src/features/user-profile/queryKeys.ts`

This prevents key collisions and makes cache invalidation predictable.

---

## 4. API Layer

All HTTP requests flow through a single typed wrapper: `src/shared/lib/api/core/http.ts`.

### `apiFetch<T>(path, options)`

```ts
// Example usage inside a service function
export async function get_user_active_reservations() {
  const res = await apiFetch<GetUserActiveReservationsResponse>(
    "/reservation/get_user_active_reservations",
    { method: "GET" },
  );
  if (!res.success) throw new HttpError(...);
  return res;
}
```

**What `apiFetch` handles automatically:**

1. **Base URL** — prepends `NEXT_PUBLIC_API_URL` via `makeApiUrl()`.
2. **Query params** — accepts a `query` object and appends it as URL search params.
3. **JSON body** — auto-stringifies the `body` object and sets `Content-Type: application/json`.
4. **Credentials** — always sends `credentials: "include"` (required for session cookies).
5. **401 handling** — on unauthorized, dispatches `auth:logout` event, clears local storage, and redirects to `/signin`.
6. **Error parsing** — throws an `HttpError` with a user-facing Persian message extracted from the response body.

---

## 5. Responsive Layout Strategy

The app renders **two completely different UIs** depending on screen size:

| Viewport | Navigation | Main Content |
|---|---|---|
| Desktop (`lg+`) | Collapsible sidebar (`AppSidebar`) + top `AppHeader` | `HomeCalendar` + `SeatList` |
| Mobile (`< lg`) | Top bar (`MobileTopBar`) + Bottom nav (`MobileBottomNavBar`) | Interactive `SeatMap` |

The `useSidebar()` context hook exposes `isMobile` (a boolean derived from `window.innerWidth < 1024`) which all layout and feature components use to conditionally render the correct UI.

---

## 6. Date & Localization

The app is **fully localized for Persian (Farsi)**:

- **Calendar:** All dates are displayed in the **Jalali (Shamsi)** calendar using `react-multi-date-picker`.
- **Numerals:** All numbers are converted to Persian digits using `toPersianDigits()` from `shared/lib/utils.ts`.
- **Time:** The `formatPersianTime()` utility in `features/reservation/utils/date.ts` converts `"HH:mm"` strings to Persian digit format.
- **API contract:** The backend expects **Gregorian** dates. The `formatDateForApi()` function converts Persian `DateObject` back to `"YYYY-MM-DD"` before every API call.

```
UI (Jalali) ──formatDateForApi()──► API (Gregorian)
API (Gregorian) ──dateStringToPersianDateObject()──► UI (Jalali)
```

---

## 7. Theming

Dark/Light mode is managed by the `ThemeContext` and persisted in `localStorage`.

Custom color tokens (defined in `globals.css` and `tailwind.config.ts`) use the `res-` prefix:

| Token | Description |
|---|---|
| `res-green-900` | Primary brand dark green |
| `res-green-success` | Success state / "my reservation" |
| `res-red` | Lab event (disabled slot) |
| `res-orange` | Reserved by others |
