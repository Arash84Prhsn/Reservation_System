# Reservation Feature

## Overview

Reservation is the main business feature. Desktop and mobile/tablet use different interfaces but share the same typed API service, query cache, reservation types, and final confirmation flow.

```text
src/features/reservation/
├── api/                         # Reservation API types and functions
├── components/
│   ├── desktop/                 # FullCalendar, seat list, reservation list
│   ├── mobile/                  # Seat map, detail panel, time slots
│   └── shared/                  # Confirmation modal and color legend
├── config/                      # Seat layout and reservation options
├── hooks/                       # React Query and URL-state hooks
├── types/
├── utils/                       # Date and seat-map helpers
└── queryKeys.ts
```

## Two-Step Booking Flow

A reservation is not treated as final immediately after the user selects a range.

```text
seat/date/time/type selected
        │
        ▼
POST /reservation/make_reservation
        │  validates request and may return a warning
        ▼
FinalReservationModal
        │  explicit user confirmation
        ▼
POST /reservation/final_reservation_submission
        │
        ▼
React Query invalidation → refreshed calendar/list
```

This keeps backend validation authoritative and gives the user a clear review step before committing a reservation.

## Desktop Experience

The desktop home screen combines:

- **right side:** `SeatList` for choosing Dotin, optimization, laptop, or manager seats;
- **center:** `HomeCalendar` based on FullCalendar time-grid;
- **left side:** the user's upcoming reservation summary.

After a seat is chosen, `useWeeklyScheduleIntervals` fetches the requested week's data. `mapScheduleIntervalsToCalendarEvents()` converts backend events/reservations into stable FullCalendar events using backend reservation IDs where available.

The calendar distinguishes laboratory events, reservations by other users, and the current user's reservations with separate project colors. The selected date and seat are synchronized with URL search parameters so refreshes/bookmarks preserve the view.

## Mobile/Tablet Experience

The mobile home screen uses a proportional laboratory seat map. Seat positions are calculated in a virtual coordinate system and converted to percentage-based CSS so the map scales with screen width.

When a reservable seat is selected:

1. the detail panel requests the seat's available dates/times;
2. the user selects a reservation type and date;
3. `TimeSlotGrid` shows free, occupied, system-only, and laboratory-event slots;
4. the user selects a start/end range;
5. the shared two-step confirmation flow is used.

Manager seats are displayed but disabled for normal reservation selection.

## Seat and Reservation Types

Seat types used by the API:

- `dotin`
- `optimization`
- `laptop`
- `manager`

Reservation types:

- `only running programs`
- `dorsan desk`
- `internship`
- `project`

Available reservation-type choices are filtered by seat type in `config/reservation-options.ts`.

## Active Reservations and Cancellation

`ReserveList` loads active reservations with `useActiveReservations`. Users can view their upcoming bookings and request cancellation through `useCancelReservationById`. Successful mutations invalidate the relevant React Query caches so the UI refreshes without a manual reload.

## Main API Endpoints Used by the UI

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/reservation/make_reservation` | Validate a proposed reservation |
| POST | `/reservation/final_reservation_submission` | Commit the confirmed reservation |
| POST | `/reservation/weekly_schedule_intervals` | Desktop weekly schedule |
| POST | `/reservation/weekly_schedule_timeslots` | Mobile day/time-slot schedule |
| POST | `/reservation/open_dates_for_user` | Bookable dates for a seat type |
| GET | `/reservation/get_user_active_reservations` | Current user's active reservations |
| PUT | `/reservation/cancel_reservation_by_id` | Cancel a reservation |

## Color Legend

`ColorLegend` is available from the reservation screen as a compact help control. It explains the schedule colors and can remember when the user chooses not to automatically show the guide again.
