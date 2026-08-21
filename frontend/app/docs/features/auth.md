# Authentication Feature

## Overview

The authentication feature contains registration, sign-in, sign-out, session restoration, and route protection.

```text
src/features/auth/
├── api/
│   └── auth.service.ts
├── components/
│   ├── NewSignInForm.tsx
│   └── NewSignUpForm.tsx
└── hooks/
    ├── use-login-form.ts
    ├── use-register-form.ts
    └── use-logout.ts
```

## Login Flow

1. The user submits username and password.
2. `use-login-form` calls `login()`.
3. The shared API client sends `POST /api/auth/login` with credentials enabled.
4. On success, the returned user object is stored by `AuthContext` in React state and `localStorage` under `auth_user`.
5. The user is redirected to `/`.

The server session/cookie is the authentication mechanism. The local `auth_user` value exists to restore frontend display state after reload; it is not treated as an authentication token.

## Registration Flow

The registration form collects username, email, Iranian mobile number, password, and association type. Client-side validation prevents blank/invalid input before `POST /api/auth/register` is sent. Successful registration initializes the user context and redirects to the main reservation screen.

## Session Restoration

`AuthContext` reads `auth_user` once in the browser. JSON parsing is guarded so malformed local storage cannot crash the application. The context exposes `isUserInitialized` so protected pages can wait until restoration is complete.

## Logout

`useLogout()`:

1. calls `POST /api/auth/logout`;
2. clears the local authentication context/storage;
3. clears the React Query cache;
4. redirects with `router.replace("/signin")`;
5. reports failures/success through user-facing toasts.

## Global 401 Handling

If any API request returns HTTP 401, the shared HTTP client clears local authentication state, dispatches `auth:logout`, and redirects to `/signin` in the browser. The handler is protected from server-side execution.

## Association Status

The backend association values are represented by the `AssociationStatus` enum. `parseAssociationStatus()` tolerates common formatting differences, and `getAssociationStatusLabel()` converts them to Persian labels for the UI.
