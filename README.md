# Laboratory Reservation System — Frontend

A responsive web frontend for reserving laboratory seats and workstations at the **Financial Technologies Laboratory, Ferdowsi University of Mashhad**.

This repository contains the frontend developed as an undergraduate Computer Science project by **Amin Mohammadzadeh**, supervised by **Dr. Ghanbari**.

## 1. Project Overview

The application provides a reservation interface for laboratory seats and systems. Users can authenticate, inspect seat schedules, create reservations, review their active reservations, cancel reservations, and manage profile information.

The frontend is connected to an existing backend API. Reservation rules, availability, conflicts, authentication sessions, and final reservation persistence are validated by the backend.

## 2. Project Scope

This project is specifically the **frontend application**.

Frontend responsibilities include:

- presenting laboratory seats and reservation schedules;
- providing desktop and mobile reservation workflows;
- collecting and validating user input before API submission;
- communicating with backend reservation/authentication/profile endpoints;
- displaying reservation conflicts and backend warnings;
- keeping server state synchronized through React Query;
- providing responsive RTL/Persian user interfaces;
- presenting active reservations and cancellation actions;
- handling loading, validation, API error, and empty states.

Backend implementation, database business rules, API authorization rules, and server-side reservation policy are outside the frontend scope.

## 3. Implemented Features

### Authentication

- User registration
- User sign-in
- User sign-out
- Protected application routes
- Cookie/session-based authenticated API requests

### Reservation — Desktop

- Seat selection
- Weekly FullCalendar schedule
- Navigation between weeks and days
- Existing reservation visualization
- Previous schedule inspection by navigating to earlier weeks
- Color-coded reservation states
- New reservation selection directly on the calendar
- Reservation type selection
- Start/end time selection
- Two-step reservation validation and confirmation
- Viewing existing reservation details
- Cancellation of the current user's reservations
- System-only reservation overlap support where permitted by project rules

### Reservation — Mobile

- Graphical laboratory seat map
- Seat selection
- Date selection without limiting the user only to currently reservable/open dates
- Backend-driven daily/weekly time-slot schedule
- Visibility of past/current schedule information returned by the backend
- Past time slots remain visible but cannot be selected for a new reservation
- Color-coded free, occupied, system-only, user-owned, and laboratory-event slots
- Range selection across valid consecutive slots
- Reservation type selection
- Two-step reservation confirmation

### User Account

- User profile display
- Username update
- Email update
- Phone number update

### General UI

- Responsive desktop/mobile layouts
- Persian RTL interface
- Jalali/Persian date presentation where appropriate
- Project-specific 404 page
- Loading/error/empty states
- Toast notifications
- Help page and reservation guidance

## 4. Reservation Color Meaning

The schedule uses different visual states so users can distinguish reservation ownership and type.

Typical meaning:

- **Green:** reservation belonging to the current user
- **Orange:** reservation belonging to another user
- **Gray:** system-only reservation such as Dorsan Desk or computation/running-program use
- **Red:** laboratory meeting/event
- **Light/available state:** free time slot

The exact availability decision is still validated by the backend before final submission.

## 5. Reservation Workflow

The reservation process intentionally uses two backend steps.

1. The user selects a seat, date, reservation type, start time, and end time.
2. The frontend sends the selection to `make_reservation`.
3. The backend validates reservation rules and possible conflicts.
4. The frontend displays the returned reservation information and any warning in a final confirmation modal.
5. After user confirmation, the frontend sends the validated reservation to `final_reservation_submission`.
6. React Query caches are invalidated/refetched so active reservations and schedules are refreshed.

This prevents a local calendar selection from being treated as a confirmed reservation before backend validation.

## 6. Responsive Reservation Design

The project uses two purpose-built interfaces rather than simply shrinking the same desktop view.

### Desktop / Large Screens

For screens at the desktop breakpoint, the interface focuses on a weekly calendar. This is useful for comparing multiple days, viewing existing reservations, and selecting a precise time range.

### Mobile / Tablet

The mobile interface focuses on the physical seat map first, followed by the selected seat's schedule and time-slot grid. Users can select any date to inspect schedule information returned by the backend, including past dates. Past slots are visible for context but are not selectable for new reservations.

## 7. Intentional Scope Decisions and Features Not Included Yet

A production reservation platform can contain many more features than the current academic/project version. The absence of the following features should be understood as a **product/team scope decision for the current version**, not as an unfinished frontend implementation.

### 7.1 Editing an Existing Reservation

**Status: intentionally not implemented in the current product flow.**

A common reservation system allows a user to edit the date, time, seat, or reservation type of an existing reservation. The current project deliberately uses a simpler and safer workflow:

1. cancel the existing reservation;
2. create a new reservation with the desired values.

This avoids introducing a separate edit API flow, edit-specific conflict rules, partial-update behavior, and additional reservation state synchronization. If the team later decides to support editing, it should be implemented with a dedicated backend contract and corresponding frontend flow.

### 7.2 Personal Reservation History

**Status: not included in the current release.**

The current `My Reservations`/active-reservation flow is focused on reservations that are still active and actionable. There is no dedicated user-facing page for a complete historical list of the user's expired/cancelled/completed reservations.

The schedule itself can display historical occupancy data returned by the backend (desktop by navigating previous weeks; mobile by selecting past dates), but this is different from a dedicated **personal reservation history** feature.

A future history feature could include:

- completed reservations;
- cancelled reservations;
- previous seat/date/time information;
- filtering by date or reservation type;
- pagination for long histories.

This feature requires an appropriate backend history endpoint/data contract in addition to frontend UI.

### 7.3 Recurring Reservations

**Status: outside the current agreed scope.**

The current flow creates individual reservations. Weekly or recurring reservations would require additional product rules such as recurrence limits, conflict handling for each occurrence, bulk cancellation, and backend support.

### 7.4 Reservation Notifications and Reminders

**Status: outside the current agreed scope.**

The application currently shows immediate in-app feedback for actions, but it does not provide scheduled email/SMS/push reminders for upcoming reservations or cancellation changes. Such notifications require backend/background-job infrastructure and a product decision about channels and timing.

### 7.5 Waitlist / Queue for Occupied Slots

**Status: outside the current agreed scope.**

There is no waiting-list workflow when a desired seat/time is occupied. Adding this would require queue priority rules, notification behavior, expiration rules, and server-side state management.

## 8. Why Scope Matters

The frontend implements the flows supported by the agreed project requirements and backend APIs. Features such as editing, complete history, recurring bookings, notifications, waitlists, and administrative management affect more than UI: they require product rules, backend endpoints, database behavior, permissions, and testing across the whole system.

For that reason, features not present in the current version should be evaluated as **out-of-scope or future product capabilities**, rather than assumed to be missing frontend work.

## 9. Technology Stack

- **Next.js 14** — App Router
- **React 18**
- **TypeScript**
- **Tailwind CSS 4**
- **TanStack React Query** — server-state fetching/caching/invalidation
- **FullCalendar** — desktop weekly reservation schedule
- **react-multi-date-picker / react-date-object** — date and Persian calendar handling
- **Sonner** — toast notifications
- **Lucide React / React Icons** — interface icons

## 10. Repository Structure

```text
Front_Reservation_System/
├── README.md
├── .env.example
├── database/                  # Database-related files supplied with the project
└── frontend/
    └── app/
        ├── docs/              # Frontend architecture and feature documentation
        ├── public/            # Fonts, logos, and static images
        ├── src/
        │   ├── app/           # Next.js routes and layouts
        │   ├── features/
        │   │   ├── auth/
        │   │   ├── reservation/
        │   │   └── user-profile/
        │   └── shared/        # Shared UI, contexts, layouts, API client, utilities
        ├── package.json
        └── README.md          # Frontend quick-start notes
```

## 11. Prerequisites

Recommended Ubuntu environment:

- Node.js **20 LTS**
- npm **10+**
- Running backend compatible with this frontend's API contract

Check versions with:

```bash
node --version
npm --version
```

## 12. Environment Configuration

The frontend reads the backend base URL from:

```env
NEXT_PUBLIC_API_BASE=http://localhost:5000
```

The API client appends `/api` to the configured base.

Example:

```text
NEXT_PUBLIC_API_BASE=http://localhost:5000
+ /api/auth/login
= http://localhost:5000/api/auth/login
```

Create the local environment file:

```bash
cd frontend/app
cp ../../.env.example .env.local
```

Then edit `.env.local` if the backend runs at a different host/port.

> `NEXT_PUBLIC_*` values are exposed to browser bundles. Never place passwords, secret keys, or private credentials in these variables.

## 13. Installation and Development

From the project root:

```bash
cd frontend/app
npm ci
npm run dev
```

Open:

```text
http://localhost:3000
```

The backend must be running and configured to allow credentialed requests from the frontend origin. The frontend uses `credentials: "include"` for session/cookie authentication.

## 14. Production Validation

Before submission or deployment:

```bash
cd frontend/app
npm ci
npm run typecheck
npm run lint
npm run build
```

To start the production build:

```bash
npm run start
```

## 15. Available Commands

```bash
npm run dev        # Start Next.js development server
npm run build      # Create a production build
npm run start      # Start the production server
npm run lint       # Run Next.js ESLint checks
npm run typecheck  # Run TypeScript checks without emitting files
```

## 16. Main Routes

| Route | Purpose |
|---|---|
| `/` | Main reservation interface |
| `/signin` | User sign-in |
| `/signup` | User registration |
| `/profile` | User profile and account editing |
| `/reserve-list` | Active reservations |
| `/help` | Reservation rules and user guidance |

Unknown routes are handled by the project-specific 404 page.

## 17. Technical Documentation

Additional documentation is available in:

- `frontend/app/docs/architecture.md`
- `frontend/app/docs/features/auth.md`
- `frontend/app/docs/features/reservation.md`

## 18. Troubleshooting

### Frontend opens but API requests fail

Check `.env.local`, confirm the backend is running, and restart `npm run dev` after environment changes.

### Authentication succeeds server-side but the frontend is not authenticated

Check backend cookie settings and CORS. The backend must allow credentials from the frontend origin.

### `npm ci` says the lock file is out of sync

Use the repository's `package.json` and `package-lock.json` together. Do not update only one of them manually.

### Protected page redirects to `/signin`

The route requires a valid session. Sign in again if the server session has expired.

### A past mobile date shows no slots

The mobile UI requests schedule data from the backend for the selected date/week. If the backend does not return that day, the frontend cannot display historical slot information for it.

## 19. Academic Project Information

- **Student:** Amin Mohammadzadeh
- **Program:** Computer Science
- **Supervisor:** Dr. Ghanbari
- **Client / Laboratory:** Financial Technologies Laboratory, Ferdowsi University of Mashhad
- **Project:** Laboratory Reservation System — Frontend

This repository is prepared as an academic project deliverable.
# Financial Technologies Lab Reservation System

A comprehensive reservation system for managing the fintech lab seats with support for multiple seat types, user associations, and complex reservation rules.

## Table of Contents

- [Financial Technologies Lab Reservation System](#financial-technologies-lab-reservation-system)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [Key Features](#key-features)
  - [Features](#features)
    - [User Features](#user-features)
    - [Reservation Features](#reservation-features)
    - [Admin Features](#admin-features)
    - [Technical Features](#technical-features)
  - [Tech Stack](#tech-stack)
    - [Backend](#backend)
    - [Frontend](#frontend)
    - [Database](#database)

---

## Overview

The Financial Technologies Lab Reservation System is a full-stack web application designed to manage seat reservations in a computer lab with 10 seats across 4 different types. The system supports multiple user associations, complex reservation rules, and administrative controls for managing users, seats, reservations, and events.

### Key Features

- **User Management**: Registration, login, profile management with role-based access control
- **Seat Management**: 10 seats across 4 types (Dotin, Optimization, Laptop, Manager)
- **Reservation System**: Weekly scheduling with 15-minute time slots, 8:00 AM - 2:00 PM operating hours
- **Event Management**: Admins can create events that override reservations
- **Admin Panel**: Full-featured admin interface for managing all aspects of the system
- **Analytics**: Real-time statistics on seat usage, user activity, and reservation trends

---

## Features

### User Features

- User registration with Persian/English username support
- Secure password hashing with bcrypt
- Session-based authentication
- Profile management (update username, email, phone)
- Association-based reservation limits (Dotin affiliates have special privileges)
- First-time user guide flow

### Reservation Features

- Weekly schedule viewing (intervals and timeslots)
- 15-minute time slot increments
- Operating hours: 8:00 AM - 2:00 PM
- Operating days: Saturday - Wednesday (Thursday/Friday closed)
- Daily limit: 2 reservations per user
- System-only reservations (computer only, seat remains free)
- Dotin seat restrictions (current week: all users, next week: Dotin affiliates only)
- Conflict checking with warnings
- Multiple reservation types (internship, project, only running programs, dorsan desk)
- Cancel reservations by ID or by providing all details

### Admin Features

- Full CRUD operations for users, seats, reservations, and events
- Custom event creation with Persian date picker
- Seat schedule viewer with color-coded slots
- Comprehensive analytics dashboard
- Role-based access (admin, event_manager, user)
- Custom admin theme with branding

### Technical Features

- SQLAlchemy ORM with SQLite database
- RESTful API with OpenAPI 3.0 documentation
- CORS support for frontend integration
- Background scheduler for automated tasks
- Session-based authentication with secure cookies

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.13+ | Core programming language |
| Flask | 3.1.3 | Web framework |
| SQLAlchemy | 2.0.50 | ORM for database operations |
| Flask-CORS | 6.0.2 | Cross-Origin Resource Sharing |
| Flask-Admin | Latest | Admin panel interface |
| APScheduler | 3.11.2 | Background task scheduling |
| bcrypt | 4.1.0 | Password hashing |
| jdatetime | 5.2.0 | Persian date handling |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | Latest | React framework |
| Tailwind CSS | Latest | Styling |
| TypeScript | Latest | Type safety |

### Database

| Technology | Purpose |
|------------|---------|
| SQLite | Lightweight relational database |

---
