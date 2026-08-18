# Authentication Feature

## 1. Overview

The `auth` feature handles everything related to a user's identity: registration, login, session persistence, and route protection. It is the entry point of the entire application.

---

## 2. Directory Structure

```
src/features/auth/
├── api/
│   ├── auth.service.ts     # API wrappers: register(), login(), logout()
│   └── index.ts            # Public barrel export
├── components/
│   ├── NewSignInForm.tsx   # Login form UI + logic
│   └── NewSignUpForm.tsx   # Registration form UI + logic
└── hooks/
    ├── use-login-form.ts   # Login form state and submission handler
    ├── use-register-form.ts # Register form state, validation, submission
    └── use-logout.ts       # Logout mutation + redirect logic
```

---

## 3. Authentication Flow

### 3.1 Login

```
User submits form
       │
       ▼
use-login-form.ts ──► login() in auth.service.ts
       │
       ▼
apiFetch POST /auth/login
       │
  (on success)
       ▼
Backend sets HttpOnly session cookie
       │
       ▼
AuthContext.login(userData)  ← stores user in localStorage for UI
       │
       ▼
router.push("/")
```

**Key detail:** The session is maintained server-side via a `HttpOnly` cookie. The `localStorage` entry (`auth_user`) is a UI convenience only — it is used to restore user context after a page reload without making another API call. It does **not** contain any token or sensitive credential.

### 3.2 Registration

1. User fills out `NewSignUpForm` (username, email, phone, password, association type).
2. `use-register-form.ts` calls `register()` from `auth.service.ts`.
3. On success, the user is automatically logged in (the backend sets the cookie) and redirected to `/`.
4. The `AssociationStatus` enum maps user types (e.g., `"Bachelor student"`, `"Dotin employee"`) to their Persian labels via `getAssociationStatusLabel()`.

### 3.3 Session Persistence

`AuthContext` restores the session on every page load:

```ts
useEffect(() => {
  const storedUser = localStorage.getItem("auth_user");
  if (storedUser) setUser(JSON.parse(storedUser));
  setIsUserInitialized(true);  // triggers the route guard
}, []);
```

### 3.4 Logout

- `use-logout.ts` calls `POST /auth/logout`.
- The backend invalidates the session cookie.
- `AuthContext.logout()` clears `localStorage` and sets `user` to `null`.
- The user is redirected to `/signin`.

### 3.5 Unauthorized Auto-Logout (401 Handler)

If **any** API call in the app returns `HTTP 401`, the `apiFetch` wrapper in `http.ts` automatically:
1. Shows a toast: *"نشست شما منقضی شده است. لطفاً دوباره وارد شوید."*
2. Clears `localStorage`.
3. Dispatches a DOM event: `window.dispatchEvent(new Event("auth:logout"))`.
4. The `AuthContext` listens to this event and clears the `user` state.
5. Redirects to `/signin`.

This global handler means **no component needs to handle 401 errors manually**.

---

## 4. Route Guards

All protected pages live under `src/app/(admin)/`. The shared `AdminLayout` (`layout.tsx`) acts as the guard:

```ts
useEffect(() => {
  if (!isUserInitialized) return;  // still loading from localStorage
  if (!user) router.replace("/signin");
}, [user, isUserInitialized]);
```

While `isUserInitialized` is `false`, a full-screen spinner is shown. Once initialized:
- `user !== null` → renders the page normally.
- `user === null` → redirects to `/signin`.

---

## 5. API Reference

All functions are in `src/features/auth/api/auth.service.ts`.

| Function | Method | Endpoint | Description |
|---|---|---|---|
| `register(input)` | POST | `/auth/register` | Creates a new user account |
| `login(input)` | POST | `/auth/login` | Authenticates and sets session cookie |
| `logout()` | POST | `/auth/logout` | Destroys the server-side session |

### Types

```ts
type RegisterInput = {
  username: string;
  email: string;
  password: string;
  phone: string;
  association: AssociationStatus;
};

type LoginInput = {
  username: string;
  password: string;
};

type User = {
  id: number;
  email: string;
  username: string;
  phone?: string;
  association?: string;
};
```

### `AssociationStatus` Enum

| Enum Value | API String | Persian Label |
|---|---|---|
| `DotinEmployee` | `"Dotin employee"` | کارمند داتین |
| `DotinAssociate` | `"Dotin associate"` | همکار داتین |
| `BachelorStudent` | `"Bachelor student"` | دانشجوی کارشناسی |
| `MasterStudent` | `"Master's student"` | دانشجوی ارشد |
| `PhDStudent` | `"PhD student"` | دانشجوی دکتری |
| `DataScienceCompetitions` | `"Data science competitions"` | مسابقات علوم داده |
| `RelatedCompany` | `"Related Company"` | شرکت مرتبط |

---

## 6. `AuthContext` API

```ts
const { user, isAuthenticated, login, logout, isUserInitialized } = useAuth();
```

| Property | Type | Description |
|---|---|---|
| `user` | `User \| null` | The currently logged-in user, or `null` |
| `isAuthenticated` | `boolean` | Shorthand: `!!user` |
| `isUserInitialized` | `boolean` | True once the session check from localStorage is complete |
| `login(user)` | `void` | Sets user in state and localStorage |
| `logout()` | `void` | Clears user from state and localStorage |
