import {
  make_reservation,
  ReservationType,
  SeatType,
} from "@/lib/api/services/reservation.service";
import { useState } from "react";
import { DateObject } from "react-multi-date-picker";
import { toast } from "sonner";

export function useMakeReservation() {
  const [reservationDate, setReservationDate] = useState(
    new DateObject().format("YYYY-MM-DD"),
  );
  const [reservationType, setReservationType] =
    useState<ReservationType | null>(null);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [seatType, setSeatType] = useState<SeatType | null>(null);
  const [seatNumber, setSeatNumber] = useState<number | null>(null);

  const [pending, setPending] = useState(false);

  async function makeReservation() {
    setPending(true);

    try {
      if (!reservationDate) {
        toast.error("لطفا تاریخ رزرو را انتخاب کنید");
        return;
      }

      if (!reservationType) {
        toast.error("لطفا نوع رزرو را انتخاب کنید");
        return;
      }

      if (!startTime) {
        toast.error("لطفا زمان شروع را انتخاب کنید");
        return;
      }

      if (!endTime) {
        toast.error("لطفا زمان پایان را انتخاب کنید");
        return;
      }

      if (endTime <= startTime) {
        toast.error("زمان پایان باید بعد از زمان شروع باشد");
        return;
      }

      if (!seatType) {
        toast.error("لطفا نوع صندلی را انتخاب کنید");
        return;
      }

      if (seatNumber == null) {
        toast.error("لطفا شماره صندلی را انتخاب کنید");
        return;
      }

      const { message, data } = await make_reservation({
        reservation_date: reservationDate,
        reservation_type: reservationType,
        start_time: startTime,
        end_time: endTime,
        seat_type: seatType,
        seat_number: seatNumber,
      });

      toast.success(message || "رزرو با موفقیت انجام شد");

      return data;
    } catch (err) {
      toast.error("خطا در ثبت رزرو");
      throw err;
    } finally {
      setPending(false);
    }
  }

  function resetReservationForm() {
    setReservationDate(new DateObject().format("yyyy-MM-dd"));
    setReservationType(null);
    setStartTime("");
    setEndTime("");
    setSeatType(null);
    setSeatNumber(null);
  }

  return {
    reservationDate,
    reservationType,
    startTime,
    endTime,
    seatType,
    seatNumber,
    pending,

    setReservationDate,
    setReservationType,
    setStartTime,
    setEndTime,
    setSeatType,
    setSeatNumber,

    makeReservation,
    resetReservationForm,
  };
}
