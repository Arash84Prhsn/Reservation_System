# Authentication Feature Documentation

## Overview
The Authentication feature handles user registration, login, session management, and protecting private routes within the application.

## Directory Structure (`src/features/auth/`)
- `components/`: Contains UI forms (`NewSignInForm`, `NewSignUpForm`).
- `hooks/`: React hooks containing form logic and API integrations (`use-login-form`, `use-register-form`, `use-logout`).

## Global State (`src/context/AuthContext.tsx`)
The `AuthContext` provides global access to the current authenticated user's state. 
- It initializes by fetching the user's profile from the backend on mount.
- It exposes `user`, `isUserInitialized`, `login`, and `logout` to the rest of the application.

## Authentication Flow
1. **Login**: 
   - User submits credentials via `NewSignInForm`.
   - The backend sets an `HttpOnly` session cookie upon success.
   - The UI updates `AuthContext` with the user data and redirects to `/` (the admin dashboard).
2. **Persistence**:
   - The `HttpOnly` cookie is automatically sent with every request to the backend.
   - On page refresh, `AuthContext` fetches `/api/users/profile` to restore the session.
3. **Logout**:
   - Calling the `logout` endpoint destroys the session cookie on the backend.
   - The `AuthContext` clears the user state, and the user is redirected to `/signin`.

## Route Guards
Private routes (everything under `/`) are protected by the `AdminLayout` component (`app/(admin)/layout.tsx`).
- If `isUserInitialized` is true but `user` is null, the guard redirects the user to `/signin`.
- While `isUserInitialized` is false, a full-screen loading skeleton is shown.
