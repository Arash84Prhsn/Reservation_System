from database import get_db_session
from backend.models.reservations import Reservation
from backend.models.seats import Seat
from backend.models.users import User
from backend.services.seat_services import SeatServices
from backend.services.user_services import UserServices
from datetime import datetime, date, time, timedelta
from sqlalchemy import and_, or_, func

class ReservationServices:

    # ============ DATE UTILITIES ============
    
    @staticmethod
    def get_current_week_start():
        """Returns the start date of the current week (Saturday)"""
        today = date.today()
        # Saturday is weekday 5 (Monday=0, Sunday=6, Saturday=5)
        days_since_saturday = (today.weekday() - 5) % 7
        week_start = today - timedelta(days=days_since_saturday)
        return week_start

    @staticmethod
    def get_next_week_start():
        """Returns the start date of next week (next Saturday)"""
        return ReservationServices.get_current_week_start() + timedelta(days=7)

    @staticmethod
    def get_reservation_week_range():
        """
        Returns (start_date, end_date) for allowed reservations.
        Current week: Saturday to Wednesday (can't book Thu/Fri)
        Next week: Saturday to Wednesday
        Cannot book today or past.
        """
        today = date.today()
        current_week_start = ReservationServices.get_current_week_start()
        next_week_start = ReservationServices.get_next_week_start()
        
        # Wednesday is weekday 2 (Monday=0, Tuesday=1, Wednesday=2)
        current_week_end = current_week_start + timedelta(days=4)  # Wednesday
        next_week_end = next_week_start + timedelta(days=4)        # Wednesday
        
        allowed_dates = []
        
        # Current week (only if we haven't passed Wednesday)
        if today <= current_week_end:
            # Start from max(today + 1, current_week_start)
            start = max(current_week_start, today + timedelta(days=1))
            if start <= current_week_end:
                allowed_dates.append((start, current_week_end))
        
        # Next week (always allowed if not passed)
        if today <= next_week_end:
            start = max(next_week_start, today + timedelta(days=1))
            if start <= next_week_end:
                allowed_dates.append((start, next_week_end))
        
        return allowed_dates

    @staticmethod
    def is_date_reservable(reservation_date):
        """Check if a specific date can be reserved"""
        allowed_ranges = ReservationServices.get_reservation_week_range()
        for start, end in allowed_ranges:
            if start <= reservation_date <= end:
                return True
        return False

    @staticmethod
    def get_available_weeks():
        """Returns list of available weeks for frontend"""
        today = date.today()
        current_week_start = ReservationServices.get_current_week_start()
        next_week_start = ReservationServices.get_next_week_start()
        
        weeks = []
        
        # Current week
        current_end = current_week_start + timedelta(days=4)  # Wednesday
        if today <= current_end:
            weeks.append({
                'week_name': 'Current Week',
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
            'week_name': 'Next Week',
            'start_date': next_week_start.isoformat(),
            'end_date': next_end.isoformat(),
            'available_dates': [
                (next_week_start + timedelta(days=i)).isoformat()
                for i in range(5)
            ]
        })
        
        return weeks

    # ============ TIME VALIDATION ============

    @staticmethod
    def is_valid_time_slot(start_time, end_time):
        """Check if time slot is within allowed hours (8:00-14:00)"""
        start_valid = start_time >= time(8, 0) and start_time <= time(14, 0)
        end_valid = end_time >= time(8, 0) and end_time <= time(14, 0)
        return start_valid and end_valid

    @staticmethod
    def is_valid_duration(start_time, end_time):
        """Check if duration is at least 15 minutes"""
        start_min = start_time.hour * 60 + start_time.minute
        end_min = end_time.hour * 60 + end_time.minute
        return (end_min - start_min) >= 15

    @staticmethod
    def is_quarter_increment(time_obj):
        """Check if time is in 15-minute increments (00, 15, 30, 45)"""
        return time_obj.minute % 15 == 0

    # ============ RESERVATION CREATION ============

    @staticmethod
    def check_daily_limit(user_id, reservation_date):
        """
        Check if user has reached their daily reservation limit.
        Counts distinct seats reserved on that day (not time slots).
        """
        session = get_db_session()
        try:
            # Count distinct seats reserved by this user on this date
            seat_count = session.query(func.count(Reservation.seat_id.distinct())).filter(
                and_(
                    Reservation.user_id == user_id,
                    Reservation.reservation_date == reservation_date,
                    Reservation.status == 'active'
                )
            ).scalar()
            
            user = session.query(User).filter(User.id == user_id).first()
            limit = user.get_reservation_seat_limit() if user else 1
            
            return seat_count < limit, limit - seat_count
        finally:
            session.close()

    @staticmethod
    def check_seat_conflict(seat_id, reservation_date, start_time, end_time):
        """Check if a seat is already booked for the given time slot"""
        session = get_db_session()
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
        session = get_db_session()
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
        if not ReservationServices.is_date_reservable(reservation_date):
            return False, "This date is not available for reservations", None
        
        # 2. Check time window (8:00-14:00)
        if not ReservationServices.is_valid_time_slot(start_time, end_time):
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
        under_limit, remaining = ReservationServices.check_daily_limit(user_id, reservation_date)
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
        session = get_db_session()
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
        session = get_db_session()
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
        session = get_db_session()
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
        session = get_db_session()
        try:
            reservation = session.query(Reservation).filter(Reservation.id == reservation_id).first()
            return reservation
        finally:
            session.close()

    @staticmethod
    def get_daily_schedule(reservation_date):
        """Get all active reservations for a specific date"""
        session = get_db_session()
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
        session = get_db_session()
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
        session = get_db_session()
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