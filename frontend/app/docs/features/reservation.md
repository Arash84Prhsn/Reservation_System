# Reservation Feature Documentation

## Overview
The Reservation feature is the core module of the application, allowing users to view lab seat availability and book time slots on specific seats (PCs or Laptops).

## Directory Structure (`src/features/reservation/`)
- `components/`
  - `desktop/`: Contains desktop-specific views (`HomeCalendar`, `SeatList`, `ReserveList`).
  - `mobile/`: Contains mobile-specific views (`SeatMap`, `SeatDetailPanel`, `TimeSlotGrid`).
  - `shared/`: Components shared across platforms (`FinalReservationModal`, `ColorLegend`).
- `config/`: Constants and configuration maps (e.g., `SeatMap.config.ts`, `reservation-options.ts`).
- `hooks/`: React Query hooks for fetching and mutating reservation data.
- `types/`: Shared TypeScript interfaces (`DesktopSeat`, `CalendarEvent`).
- `utils/`: Helper functions (e.g., Persian date parsing, interval mapping).

## Reservation Flow (Two-Step Process)

Booking a reservation requires two steps to prevent race conditions and ensure users agree to potential conflicts.

1. **Validation Step (`make_reservation`)**:
   - The user selects a date, time, and seat.
   - The `useMakeReservation` hook calls the backend to validate the request.
   - If the request is invalid (e.g., outside working hours), the API returns an error.
   - If valid, the API returns the parsed `reservation_info` and a `warning` (if there are scheduling conflicts, such as overlapping with a "System Only" reservation).

2. **Confirmation Step (`final_reservation_submission`)**:
   - The user is presented with the `FinalReservationModal` showing the summary and any warnings.
   - Upon confirmation, the `useFinalReservationSubmission` hook commits the reservation to the database.
   - React Query queries are invalidated to refresh the UI.

## Working Hours
- The system enforces working hours between **08:00 and 14:00**.
- The `utils/date.ts` module contains strict validation functions to ensure time selections adhere to this rule.
