# Laboratory Reservation System — Frontend

A responsive web frontend for reserving laboratory seats and workstations at the **Financial Technologies Laboratory, Ferdowsi University of Mashhad**.

This repository contains the frontend developed as an undergraduate Computer Science project by **Amin Mohammadzadeh**, supervised by **Dr. Ghanbari**.

## Project Scope

The project focuses on the **frontend application**. It connects to an existing backend API for authentication, availability checks, reservation creation, cancellation, and profile management. Backend implementation is outside the scope of this repository.

## Main Features

- User registration, sign-in, sign-out, and protected routes
- Responsive desktop and mobile reservation experiences
- Desktop weekly calendar with seat selection and color-coded availability
- Mobile laboratory seat map with time-slot selection
- Two-step reservation flow: validation first, final confirmation second
- Viewing and cancelling active reservations
- User profile viewing and editing
- Persian (RTL) user interface with Jalali date support
- Centralized API client and consistent error handling
- React Query caching and invalidation for server state

## Technology Stack

- **Next.js 14** with App Router
- **React 18**
- **TypeScript**
- **Tailwind CSS 4**
- **TanStack React Query**
- **FullCalendar** for the desktop weekly schedule
- **react-multi-date-picker / react-date-object** for Jalali date handling
- **Sonner** for user notifications
- **Lucide React / React Icons** for interface icons

## Repository Structure

```text
Front_Reservation_System/
├── README.md
├── .env.example
├── database/                  # Local database-related files supplied with the project
└── frontend/
    └── app/
        ├── docs/              # Frontend architecture and feature documentation
        ├── public/            # Fonts, logos, and static images
        ├── src/
        │   ├── app/           # Next.js routes and layouts
        │   ├── features/      # Auth, reservation, and profile features
        │   └── shared/        # Shared UI, contexts, layouts, and API utilities
        ├── package.json
        └── README.md          # Frontend-specific setup notes
```

## Prerequisites

For Ubuntu, the recommended setup is:

- Node.js **20 LTS**
- npm **10+**
- A running backend server compatible with this frontend API contract

You can verify your environment with:

```bash
node --version
npm --version
```

## Configuration

The frontend reads the backend origin from:

```env
NEXT_PUBLIC_API_BASE=http://localhost:5000
```

The API client automatically appends `/api` to this base URL. For example:

```text
NEXT_PUBLIC_API_BASE=http://localhost:5000
+ /api/auth/login
= http://localhost:5000/api/auth/login
```

From the frontend directory, create the local environment file from the repository example:

```bash
cd frontend/app
cp ../../.env.example .env.local
```

If your backend runs on another host or port, edit `.env.local` accordingly.

> `NEXT_PUBLIC_*` variables are visible in browser bundles. Do not place secrets, private keys, or passwords in them.

## Installation and Development

From the project root:

```bash
cd frontend/app
npm ci
npm run dev
```

Then open:

```text
http://localhost:3000
```

The backend must also be running and must allow the frontend origin to send authenticated requests. The frontend uses `credentials: "include"` because authentication is session/cookie based.

## Production Build

```bash
cd frontend/app
npm ci
npm run typecheck
npm run build
npm run start
```

## Available Commands

```bash
npm run dev        # Start the Next.js development server
npm run build      # Create a production build
npm run start      # Start the production server
npm run lint       # Run Next.js ESLint checks
npm run typecheck  # Run TypeScript without emitting files
```

## Main Routes

| Route | Purpose |
|---|---|
| `/` | Main reservation interface |
| `/signin` | User sign-in |
| `/signup` | User registration |
| `/profile` | User profile and account editing |
| `/reserve-list` | Active reservations, mainly used by the mobile navigation |
| `/help` | Reservation rules and usage guide |

Unknown routes are handled by a project-branded Persian 404 page.

## Reservation Flow

The reservation process is intentionally split into two backend calls:

1. The user selects a seat, date, reservation type, and time range.
2. `make_reservation` validates the request and may return a warning.
3. The frontend displays a final confirmation modal.
4. `final_reservation_submission` commits the reservation.
5. Relevant React Query caches are invalidated so the calendar and reservation list refresh.

This prevents the UI from treating a locally selected time range as a confirmed reservation before the backend validates it.

## Responsive Design

The application uses two purpose-built experiences:

- **Desktop / large screens (1024 px and above):** seat list + weekly FullCalendar view + reservation list.
- **Mobile / tablet (below 1024 px):** graphical seat map + time-slot grid + bottom navigation.

## Documentation

Additional technical documentation is available in:

- `frontend/app/docs/architecture.md`
- `frontend/app/docs/features/auth.md`
- `frontend/app/docs/features/reservation.md`

## Troubleshooting

### The frontend opens but API calls fail

Check that `.env.local` contains the correct backend URL and restart `npm run dev` after changing environment variables.

### Login succeeds on the backend but the browser is not authenticated

Because the project uses cookie/session authentication, check the backend CORS and cookie settings. The backend must allow credentials from the frontend origin.

### `npm ci` reports that the lock file is out of sync

Use the supplied `package.json` and `package-lock.json` together. Avoid manually editing dependency versions in only one of them.

### A page immediately redirects to `/signin`

Protected routes require a valid authenticated session and a locally initialized user context. Sign in again if the server session has expired.

## Academic Project Information

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
