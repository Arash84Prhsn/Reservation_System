# Reservation System - Frontend Architecture

## Overview
This project is built using **Next.js (App Router)** and follows a modular Feature-Sliced Design pattern to maintain code organization and scalability.

## Directory Structure

```text
frontend/app/
├── src/
│   ├── app/                # Next.js App Router (Pages & Layouts)
│   ├── features/           # Feature Modules (Auth, Reservation, User Profile)
│   ├── components/         # Shared UI Components (Buttons, Modals, Forms)
│   ├── layout/             # Global Layouts (Sidebar, Header)
│   ├── lib/                # Shared utilities and API services
│   └── context/            # React Contexts (AuthContext, SidebarContext)
├── docs/                   # Project Documentation
```

## Core Architectural Principles

1. **Feature-Driven Structure**: 
   Logic is grouped by feature rather than file type. For example, everything related to reservations (components, hooks, types, constants) lives inside `src/features/reservation/`.

2. **State Management**:
   - **Server State**: Managed via `TanStack Query` (React Query) for caching, invalidation, and data synchronization.
   - **Client State**: Local state via `useState/useReducer`, and global state via React Context (e.g., `AuthContext`).

3. **Routing & Authentication**:
   - Next.js App Router is used for defining pages.
   - Private routes (like `/calendar`) are wrapped in `(admin)/layout.tsx` which enforces an authentication guard. Unauthenticated users are redirected to `/signin`.

4. **API Integration**:
   - All external API calls are encapsulated inside `src/lib/api/services/`.
   - Components do not make API calls directly; they use custom hooks (e.g., `useActiveReservations`) that wrap React Query.

5. **Styling & UI**:
   - Tailwind CSS for rapid styling.
   - `clsx` and `tailwind-merge` (via `lib/utils.ts`) are used to merge Tailwind classes cleanly.
