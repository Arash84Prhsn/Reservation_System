from database import get_db_connection
from backend.models.reservations import Reservation
from backend.models.seats import Seat
from backend.models.users import User
from backend.services.seat_services import SeatServices
from backend.services.user_services import UserServices
from datetime import datetime, date, time, timedelta
from sqlalchemy import and_, or_, func
import jdatetime

class ReservationServices:

    # ====<Date utility functions are defined here>====
    
    # it must be noted all the functionality here is done using Gregorian calendars and the datetime
    # class Date object. The calendar conversion functions exist solely for API responses

    @staticmethod
    def gregorian_to_persian(gregorianDate):
        """
        Convert the given gregorian date to the equivalent persian(Jalali) date
        
        :param gregorianDate: The date in gregorian format

        :return: The given date converted to the corresponding persian date as a `jdatetime` class
        `Date` object
        """
        return jdatetime.date.fromgregorian(date=gregorianDate)
    
    @staticmethod
    def persian_to_gregorian(persianDate):
        """
        Convert a Persian (Jalali) date to Gregorian.
        
        :param persianDate: A jdatetime.date object, or a tuple/list of (year, month, day)
        :return: datetime.date object
        :raises TypeError: If input type is not recognized
        """
        if isinstance(persianDate, jdatetime.date):
            return persianDate.togregorian()
        
        if isinstance(persianDate, (tuple, list)) and len(persianDate) == 3:
            year, month, day = persianDate
            return jdatetime.date(year, month, day).togregorian()
        
        raise TypeError(
            f"Expected jdatetime.date or (year, month, day), "
            f"got {type(persianDate).__name__}"
        )
    
    @staticmethod
    def get_current_week_start():
        """Returns the start date of the current week (Saturday)"""
        today = date.today()
        # Saturday is weekday 5 (Monday=0, Saturday=5, Sunday=6)
        days_since_saturday = (today.weekday() - 5) % 7
        week_start = today - timedelta(days=days_since_saturday)
        return week_start

    @staticmethod
    def get_next_week_start():
        """Returns the start date of next week (next Saturday)"""
        return ReservationServices.get_current_week_start() + timedelta(days=7)

    @staticmethod
    def get_possible_reservation_dates():
        """
        Returns an array of all the valid dates for user reservations\\
        Current week: Saturday to Wednesday (can't book Thu/Fri)\\
        Next week: Saturday to Wednesday if it is past Tuesday 12 PM this week\\
        Cannot book today or past.
        """

        # Get today's date and the exact datetime right now
        today = date.today()
        currentDateTime = datetime.now()

        # Get the datetime object for This week's Tuesday 12PM
        thisTuesday12PM = datetime.combine(
            ReservationServices.get_current_week_start()+timedelta(3),
            time(12,0,0) # 12PM
        )

        # Saturday dates of this week and the next
        currentWeekStartDate = ReservationServices.get_current_week_start()
        nextWeekStartDate = ReservationServices.get_next_week_start()
        
        # Get the dates for this week's and the next weeks wednesdays
        currentWeekEndDate = currentWeekStartDate + timedelta(days=4)  
        nextWeekEndDate = nextWeekStartDate + timedelta(days=4) 
        
        # array of our possible reservation Dates (arr of Date objects)
        allowed_dates = []
        
        # Current week (only if we haven't passed current week Tuesday 12 PM)
        if currentDateTime < thisTuesday12PM:
            start = today + timedelta(days=1)
            end = currentWeekEndDate

            while start <= end:
                allowed_dates.append(start)
                start = start + timedelta(days=1)
        
        # Next week is also allowed
        else :
            start = today + timedelta(days=1)
            end = nextWeekEndDate
            
            while start <= end:
                # skip Thursdays and Fridays
                if start.weekday() == 3 or start.weekday() == 4:
                    start = start + timedelta(days=1)
                    continue
                
                allowed_dates.append(start)
                start = start + timedelta(days=1)
        
        return allowed_dates

    @staticmethod
    def is_date_possibly_reservable(reservation_date):
        """Check if a specific date is in the list of possible reservations"""
        reservables = ReservationServices.get_possible_reservation_dates()
        return reservation_date in reservables

    @staticmethod
    def get_available_weeks():
        """
        Returns list of available weeks for frontend

        :returns: an example object in the returned array would be like the following dict:\
        {"week_name": "current_week", "start_date": "2026-05-20", "end_date": "2026-05-24",
        available_dates: ["2026-05-23","2026-05-24"]}
        """
        today = date.today()
        current_week_start = ReservationServices.get_current_week_start()
        next_week_start = ReservationServices.get_next_week_start()
        
        weeks = []
        
        # Current week
        current_end = current_week_start + timedelta(days=4)  # Wednesday
        if today <= current_end:
            weeks.append({
                'week_name': 'current_week',
                'start_date': current_week_start.isoformat(),
                'end_date': current_end.isoformat(),
                'available_dates': [
                    (current_week_start + timedelta(days=i)).isoformat()
                    for i in range(5)  # Sat, Sun, Mon, Tue, Wed
                    if current_week_start + timedelta(days=i) > today
                ]
            })
        
        # Next week
        next_end = next_week_start + timedelta(days=4)
        weeks.append({
            'week_name': 'next_week',
            'start_date': next_week_start.isoformat(),
            'end_date': next_end.isoformat(),
            'available_dates': [
                (next_week_start + timedelta(days=i)).isoformat()
                for i in range(5)
            ]
        })
        
        return weeks

    # ====<Validation operations>====

    @staticmethod
    def is_8_14_time_interval(start_time, end_time):
        """
        Check if the given time interval is within the allowed range (8:00-14:00)\n
        additionally the start_time must be less than the end time
        
        :param start_time: The start time of the interval. is a `time` object
        :param end_time: The end time of the interval. is a `time` object
        :returns: `True` or `False` depending on the given criteria
        """
        start_valid = start_time >= time(8, 0) and start_time <= time(14, 0)
        end_valid = end_time >= time(8, 0) and end_time <= time(14, 0)
        start_less_than_end = start_time < end_time
        return start_valid and end_valid and start_less_than_end

    @staticmethod
    def is_valid_duration(start_time: time, end_time: time):
        """Check if duration is at least 15 minutes"""
        start_min = start_time.hour * 60 + start_time.minute
        end_min = end_time.hour * 60 + end_time.minute
        return (end_min - start_min) >= 15

    @staticmethod
    def is_quarter_increment(time_obj: time):
        """Check if time is in 15-minute increments (00, 15, 30, 45)"""
        return time_obj.minute % 15 == 0

    # ============ RESERVATION CREATION ============

    @staticmethod
    def has_hit_daily_reservation_limit(user_id, reservation_date):
        """
        Returns `True` if the user has made 2 reservations in the `reservation_date`. Returns 
        `False` otherwise

        :param user_id: the id of the user
        :param reservation_date: the date for which the reservation will be counted
        """
        conn = get_db_connection()

        queryResult = conn.select


    @staticmethod
    def check_seat_conflict(seat_id, reservation_date, start_time, end_time):
        """Check if a seat is already booked for the given time slot"""
        session = get_db_connection()
        try:
            conflicting = session.query(Reservation).filter(
                and_(
                    Reservation.seat_id == seat_id,
                    Reservation.reservation_date == reservation_date,
                    Reservation.status == 'active',
                    Reservation.start_time < end_time,
                    Reservation.end_time > start_time
                )
            ).first()
            return conflicting is not None
        finally:
            session.close()

    @staticmethod
    def can_user_book_seat(user_id, seat_id, reservation_date):
        """
        Check if user is allowed to book this specific seat based on dotin restrictions.
        """
        session = get_db_connection()
        try:
            user = session.query(User).filter(User.id == user_id).first()
            seat = session.query(Seat).filter(Seat.id == seat_id).first()
            
            if not user or not seat:
                return False, "User or seat not found"
            
            # If not a dotin seat, always allowed
            if seat.seat_type != 'dotin':
                return True, ""
            
            # Check dotin restriction
            can_reserve = SeatServices.can_reserve_dotin_seat(user.association, reservation_date)
            if not can_reserve:
                return False, "Dotin seats can only be reserved by PhD, Master's, or Dotin members, or within 2 days ahead"
            
            return True, ""
        finally:
            session.close()

    @staticmethod
    def create_reservation(user_id, seat_id, reservation_date, start_time, end_time):
        """
        Create a new reservation after all validations.
        
        Returns: (success, message, reservation_object)
        """
        # Parse inputs if they're strings
        if isinstance(reservation_date, str):
            reservation_date = date.fromisoformat(reservation_date)
        if isinstance(start_time, str):
            start_time = time.fromisoformat(start_time)
        if isinstance(end_time, str):
            end_time = time.fromisoformat(end_time)
        
        # 1. Check if date is reservable
        if not ReservationServices.is_date_possibly_reservable(reservation_date):
            return False, "This date is not available for reservations", None
        
        # 2. Check time window (8:00-14:00)
        if not ReservationServices.is_8_14_time_interval(start_time, end_time):
            return False, "Reservations only allowed between 8:00 and 14:00", None
        
        # 3. Check minimum duration
        if not ReservationServices.is_valid_duration(start_time, end_time):
            return False, "Minimum reservation duration is 15 minutes", None
        
        # 4. Check quarter increments
        if not ReservationServices.is_quarter_increment(start_time) or not ReservationServices.is_quarter_increment(end_time):
            return False, "Time must be in 15-minute increments (:00, :15, :30, :45)", None
        
        # 5. Check start < end
        if start_time >= end_time:
            return False, "Start time must be before end time", None
        
        # 6. Check daily limit
        under_limit, remaining = ReservationServices.has_hit_daily_reservation_limit(user_id, reservation_date)
        if not under_limit:
            return False, f"You have reached your daily reservation limit", None
        
        # 7. Check seat conflict
        if ReservationServices.check_seat_conflict(seat_id, reservation_date, start_time, end_time):
            return False, "This seat is already reserved for that time", None
        
        # 8. Check dotin seat restriction
        can_book, error_msg = ReservationServices.can_user_book_seat(user_id, seat_id, reservation_date)
        if not can_book:
            return False, error_msg, None
        
        # 9. Create reservation
        session = get_db_connection()
        try:
            new_reservation = Reservation(
                user_id=user_id,
                seat_id=seat_id,
                reservation_date=reservation_date,
                start_time=start_time,
                end_time=end_time,
                status='active'
            )
            session.add(new_reservation)
            session.commit()
            session.refresh(new_reservation)
            return True, "Reservation created successfully", new_reservation
        except Exception as e:
            session.rollback()
            return False, f"Database error: {str(e)}", None
        finally:
            session.close()

    # ============ RESERVATION QUERIES ============

    @staticmethod
    def get_user_reservations(user_id, status='active'):
        """Get all reservations for a user"""
        session = get_db_connection()
        try:
            query = session.query(Reservation).filter(Reservation.user_id == user_id)
            if status:
                query = query.filter(Reservation.status == status)
            reservations = query.order_by(Reservation.reservation_date, Reservation.start_time).all()
            return reservations
        finally:
            session.close()

    @staticmethod
    def get_user_reservations_by_date(user_id, reservation_date):
        """Get all reservations for a user on a specific date"""
        session = get_db_connection()
        try:
            reservations = session.query(Reservation).filter(
                and_(
                    Reservation.user_id == user_id,
                    Reservation.reservation_date == reservation_date,
                    Reservation.status == 'active'
                )
            ).all()
            return reservations
        finally:
            session.close()

    @staticmethod
    def get_reservation_by_id(reservation_id):
        """Get a specific reservation by ID"""
        session = get_db_connection()
        try:
            reservation = session.query(Reservation).filter(Reservation.id == reservation_id).first()
            return reservation
        finally:
            session.close()

    @staticmethod
    def get_daily_schedule(reservation_date):
        """Get all active reservations for a specific date"""
        session = get_db_connection()
        try:
            reservations = session.query(Reservation).filter(
                and_(
                    Reservation.reservation_date == reservation_date,
                    Reservation.status == 'active'
                )
            ).order_by(Reservation.start_time).all()
            return reservations
        finally:
            session.close()

    # ============ RESERVATION CANCELLATION ============

    @staticmethod
    def cancel_reservation(reservation_id, user_id):
        """
        Cancel a reservation.
        Returns: (success, message)
        """
        session = get_db_connection()
        try:
            reservation = session.query(Reservation).filter(
                and_(
                    Reservation.id == reservation_id,
                    Reservation.user_id == user_id
                )
            ).first()
            
            if not reservation:
                return False, "Reservation not found"
            
            if reservation.status != 'active':
                return False, "Reservation is already cancelled"
            
            # Check if can cancel (not started yet)
            now = datetime.now()
            reservation_datetime = datetime.combine(reservation.reservation_date, reservation.start_time)
            if now >= reservation_datetime:
                return False, "Cannot cancel reservation after start time"
            
            reservation.status = 'cancelled'
            reservation.cancelled_at = datetime.now()
            session.commit()
            
            return True, "Reservation cancelled successfully"
        except Exception as e:
            session.rollback()
            return False, f"Error cancelling reservation: {str(e)}"
        finally:
            session.close()

    # ============ STATISTICS ============

    @staticmethod
    def get_user_reservation_stats(user_id):
        """Get reservation statistics for a user"""
        session = get_db_connection()
        try:
            today = date.today()
            
            # Total reservations (active only)
            total = session.query(func.count(Reservation.id)).filter(
                and_(
                    Reservation.user_id == user_id,
                    Reservation.status == 'active'
                )
            ).scalar()
            
            # Reservations today
            today_count = session.query(func.count(Reservation.id)).filter(
                and_(
                    Reservation.user_id == user_id,
                    Reservation.reservation_date == today,
                    Reservation.status == 'active'
                )
            ).scalar()
            
            # Upcoming reservations
            upcoming = session.query(func.count(Reservation.id)).filter(
                and_(
                    Reservation.user_id == user_id,
                    Reservation.reservation_date > today,
                    Reservation.status == 'active'
                )
            ).scalar()
            
            # Get user's daily limit
            user = session.query(User).filter(User.id == user_id).first()
            daily_limit = user.get_reservation_seat_limit() if user else 1
            
            return {
                'total_active': total or 0,
                'today_count': today_count or 0,
                'upcoming_count': upcoming or 0,
                'daily_limit': daily_limit,
                'remaining_today': daily_limit - (today_count or 0)
            }
        finally:
            session.close()