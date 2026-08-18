# Reservation Feature

## 1. Overview

The reservation feature is the core of the application. It allows authenticated users to view seat availability and book time slots in the lab. It has **two completely separate UIs** — one for desktop (calendar-based) and one for mobile (seat map-based) — that share the same API layer and booking logic.

---

## 2. Directory Structure

```
src/features/reservation/
├── api/
│   ├── reservation.service.ts   # All API wrapper functions
│   └── index.ts                 # Public barrel export
├── components/
│   ├── desktop/
│   │   ├── HomeCalendar.tsx     # Main desktop view: FullCalendar + reservation modal
│   │   ├── SeatList.tsx         # Desktop seat selector sidebar
│   │   └── ReserveList.tsx      # "My Reservations" list + cancellation
│   ├── mobile/
│   │   ├── SeatMap.tsx          # Mobile root: renders the floor plan + orchestrates state
│   │   ├── Seat.tsx             # Individual seat button
│   │   ├── Table.tsx            # The center table element
│   │   ├── SeatDetailPanel.tsx  # Bottom sheet for time selection after seat tap
│   │   └── TimeSlotGrid.tsx     # Visual grid of available time slots
│   └── shared/
│       ├── FinalReservationModal.tsx  # Confirmation modal (both platforms)
│       └── ColorLegend.tsx            # Floating color guide button/panel
├── config/
│   ├── SeatMap.config.ts        # Seat layout constants, types, colors
│   └── reservation-options.ts   # Reservation type options + label maps
├── hooks/
│   ├── use-make-reservation.ts          # Step 1: validate reservation
│   ├── use-final-reservation-submission.ts # Step 2: commit reservation
│   ├── use-get-active-reservations.ts   # Fetch user's current reservations
│   ├── use-cancel-reservation-by-id.ts  # Cancel a reservation
│   ├── use-current-week-schedule-intervals.ts # Desktop: current week slots
│   ├── use-weekly-schedule-intervals.ts  # Desktop: arbitrary week slots
│   ├── use-weekly-schedule-timeslots.ts  # Mobile: day time slots for a seat
│   ├── use-open-dates-for-user.ts        # Fetch bookable dates for a seat type
│   └── use-reservation-params.ts        # URL search params sync for desktop
├── types/
│   └── index.ts                 # Shared types: DesktopSeat, CalendarEvent
├── utils/
│   ├── date.ts                  # Date/time helpers, Jalali conversions
│   ├── SeatMap.utils.ts         # Seat map geometry: getSeatRect, useSeatMap
│   └── mapScheduleIntervalsToCalendarEvents.ts  # API → FullCalendar event format
└── queryKeys.ts                 # React Query cache key factories
```

---

## 3. The Two-Step Reservation Flow

Booking is split into two API calls to prevent race conditions and give users a chance to review warnings before committing.

```
Step 1: Validate (/reservation/make_reservation)
  User picks: date + time + type + seat
  → API checks: working hours, no full overlaps
  → Returns: reservation_info + optional warning
                    │
                    ▼
           FinalReservationModal opens
           Shows: summary ticket + warning (if any)
                    │
                    ▼
Step 2: Commit (/reservation/final_reservation_submission)
  User clicks "تأیید نهایی"
  → API creates the reservation in the database
  → React Query invalidates active reservations cache
  → Calendar refreshes
```

### Warning System

A `warning` can exist even when the validation succeeds. This happens when the user's requested time overlaps with a **"System Only"** reservation (e.g., a batch compute job). The user is informed but can still proceed.

```ts
interface Warning {
  needed: boolean;                          // true = show the warning
  conflict_intervals: { start_time, end_time }[];  // conflicting slots
  warning_message: string;                  // message to display
}
```

---

## 4. Desktop View (Calendar)

**Component:** `HomeCalendar.tsx`  
**Library:** `@fullcalendar/react` with `timeGridPlugin`

### Flow

1. User selects a seat from `SeatList` (left sidebar).
2. `HomeCalendar` fetches events for that seat via `useCurrentWeekScheduleIntervals` or `useWeeklyScheduleIntervals`.
3. The raw schedule intervals are converted to FullCalendar's `EventInput` format by `mapScheduleIntervalsToCalendarEvents.ts`.
4. Events are color-coded:
   - 🔴 `res-red` = Lab event (disabled)
   - 🟠 `res-orange` = Reserved by another user
   - 🟢 `res-green-success` = Reserved by the current user
   - ⚪ White = Available (no event rendered)
5. When the user clicks and drags on a free slot, FullCalendar fires `select`.
6. `handleSelect` converts the JS `Date` objects → Jalali `DateObject`, validates working hours (08:00 – 14:00), and opens the inline `ReservationModal`.
7. The modal collects `reservationType` and calls `useMakeReservation`.

### Working Hours Enforcement

```ts
// src/features/reservation/utils/date.ts
export const WORKING_START_MINUTES = 8 * 60;  // 08:00
export const WORKING_END_MINUTES = 14 * 60;    // 14:00

export const isWithinWorkingHours = (time: DateObject) => {
  const minutes = time.hour * 60 + time.minute;
  return minutes >= WORKING_START_MINUTES && minutes <= WORKING_END_MINUTES;
};
```

### URL State Sync

The desktop view syncs selected seat and date to URL search params via `use-reservation-params.ts`. This means users can share or bookmark specific calendar views.

---

## 5. Mobile View (Seat Map)

**Component:** `SeatMap.tsx`  
**Pattern:** Absolute-positioned seats over a proportionally scaled canvas.

### Geometry System

The seat map uses a **virtual coordinate system** (BASE_W × BASE_H = 340 × 340 pixels). All positions are calculated in this virtual space and then converted to `%`-based CSS values so the map scales to any screen width.

```
Virtual Space (340×340)
┌──────────────────────────────────────┐
│  [Top Seats: dotin, dotin, manager]  │
│                                      │
│  [L]   ┌──────────────────┐   [R]    │
│  [a]   │                  │   [i]    │
│  [p]   │     TABLE        │   [g]    │
│  [t]   │   (220×130)      │   [h]    │
│  [o]   └──────────────────┘   [t]    │
│  [p]                            1    │
│                                      │
│  [Bottom: dotin, optim, optim, dotin]│
└──────────────────────────────────────┘
```

`getSeatRect(side, index, total)` calculates the `{x, y, w, h, rotate}` for each seat, then `toPercentStyle(rect)` converts to CSS percentages.

Vertical seats (left/right) have their labels **rotated 90°** via CSS transform so they read vertically.

### Seat Layout (from `SeatMap.config.ts`)

```ts
export const LAYOUT: Record<SeatSide, SeatTypes[]> = {
  top:    ["dotin", "dotin", "manager"],
  bottom: ["dotin", "optimization", "optimization", "dotin"],
  left:   ["laptop", "laptop"],
  right:  ["laptop"],
};
```

### Seat State Machine

Each seat has one of three states:

| Status | Appearance | Interaction |
|---|---|---|
| `available` | White, blue hover | Tappable → opens `SeatDetailPanel` |
| `selected` | Blue, scaled up | Shows active selection |
| `disabled` | Gray, no cursor | Not interactive |

> Note: `manager` type seats are always rendered as `disabled` (not reservable by regular users).

### Time Slot Selection (Mobile)

When a seat is tapped, `SeatDetailPanel` opens as a bottom drawer and:
1. Fetches available timeslots via `useWeeklyScheduleTimeslots` (returns pre-computed 30-min slots from the backend).
2. Renders them in `TimeSlotGrid` with color coding: free / reserved-by-user / reserved-by-others / event.
3. User taps a start slot, then an end slot (range selection).
4. Tapping "رزرو" calls `useMakeReservation` then shows `FinalReservationModal`.

---

## 6. Seat Types & Reservation Types

### Seat Types

| API Value | Label | Location | Notes |
|---|---|---|---|
| `dotin` | داتین | Top / Bottom | Dotin-branded workstations |
| `optimization` | بهینه‌سازی | Bottom | Optimization team systems |
| `laptop` | لپ‌تاپ | Left / Right | Laptop-only seats (no dedicated system) |
| `manager` | مدیر | Top | Not reservable, always disabled |

### Reservation Types

Available options depend on the seat type:

| Type | Label | PC seats | Laptop seats |
|---|---|---|---|
| `only running programs` | محاسبات | ✅ | ❌ |
| `dorsan desk` | درسان دسک | ✅ | ❌ |
| `internship` | کارآموزی | ✅ | ✅ |
| `project` | پروژه | ✅ | ✅ |

---

## 7. ReserveList (My Reservations)

**Component:** `ReserveList.tsx`  
**Hook:** `useActiveReservations`

Displays the user's upcoming reservations grouped by date. Each reservation shows:
- Date (Jalali), time range, seat type & number, reservation type.
- A **cancel button** that calls `useCancelReservationById`.

> **Cancellation rule:** Only future reservations can be cancelled. Today's reservations cannot be cancelled from the UI.

---

## 8. API Reference

All functions are in `src/features/reservation/api/reservation.service.ts`.

| Function | Method | Endpoint | Description |
|---|---|---|---|
| `make_reservation(input)` | POST | `/reservation/make_reservation` | Step 1: validate |
| `final_reservation_submission(input)` | POST | `/reservation/final_reservation_submission` | Step 2: commit |
| `weekly_schedule_timeslots(input)` | POST | `/reservation/weekly_schedule_timeslots` | Mobile time slots |
| `open_dates_for_user(seatType)` | POST | `/reservation/open_dates_for_user` | Bookable dates |
| `current_week_schedule_intervals(input)` | POST | `/reservation/current_week_schedule_intervals` | Desktop: this week |
| `weekly_schedule_intervals(input)` | POST | `/reservation/weekly_schedule_intervals` | Desktop: any week |
| `get_user_active_reservations()` | GET | `/reservation/get_user_active_reservations` | User's reservations |
| `cancel_reservation_by_id(id)` | PUT | `/reservation/cancel_reservation_by_id` | Cancel a reservation |

---

## 9. ColorLegend

The `ColorLegend` component is a floating help widget rendered on the home page (`/`).

- **Desktop:** A circular `?` button (bottom-left). Click expands a panel showing the calendar color guide.
- **Mobile:** Same button, but the panel slides up as a bottom sheet with a `backdrop-blur` overlay.
- On first visit, it auto-expands after 500ms to guide new users.
- Users can click "دیگر نشان نده" to persist the dismissed state to `localStorage`.
