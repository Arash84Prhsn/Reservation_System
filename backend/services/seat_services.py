from database import get_db_connection
from backend.models.seats import Seat
from backend.models.reservations import Reservation
from datetime import datetime, date, time, timedelta
from sqlalchemy import and_

class SeatServices:

    # ============ BASIC QUERIES ============
    
    @staticmethod
    def get_all_seats():
        """Returns all seats in the database"""
        with get_db_connection() as session:
            seats = session.query(Seat).all()
        return seats

    @staticmethod
    def get_reservable_seats():
        """Returns all seats that can be reserved (excludes manager seat)"""
        with get_db_connection() as session:
            seats = session.query(Seat).filter(Seat.is_reservable == True).all()
        return seats

    @staticmethod
    def get_seat_by_id(seat_id):
        """Get a specific seat by its ID"""
        with get_db_connection() as session:
            seat = session.query(Seat).filter(Seat.id == seat_id).first()
        return seat

    @staticmethod
    def get_seats_by_type(seat_type):
        """Get all seats of a specific type (dotin, laptop, optimization, manager)"""
        with get_db_connection() as session:
            seats = session.query(Seat).filter(Seat.seat_type == seat_type).all()
        return seats

    # ============ DOTIN RESTRICTION LOGIC ============
    
    @staticmethod
    def can_reserve_dotin_seat(user_association, reservation_date):
        """
        Check if a user can reserve a dotin seat.
        
        Rules:
        - PhD, Master's, and Dotin users can ALWAYS reserve dotin seats
        - Other users can ONLY reserve dotin seats if the reservation is within the next 2 days
        
        :param user_association: User's association (Student, PhD student, Dotin, etc.)
        :param reservation_date: Date of the reservation
        :return: Boolean (True if allowed, False if not)
        """
        # Always allowed associations
        always_allowed = ['PhD student', "Master's student", 'Dotin']
        
        if user_association in always_allowed:
            return True
        
        # For other associations, check if within next 2 days
        today = date.today()
        days_ahead = (reservation_date - today).days
        
        # Next 2 days means tomorrow (1) or day after tomorrow (2)
        return 1 <= days_ahead <= 2

    @staticmethod
    def get_reservable_seats_for_user(user_association, reservation_date):
        """
        Returns all seats that a specific user can reserve on a given date.
        Filters out dotin seats if the user isn't allowed.
        
        :param user_association: User's association
        :param reservation_date: Date of the reservation
        :return: List of Seat objects the user can reserve
        """
        all_reservable = SeatServices.get_reservable_seats()
        
        if SeatServices.can_reserve_dotin_seat(user_association, reservation_date):
            # User can reserve all seats including dotin
            return all_reservable
        else:
            # User cannot reserve dotin seats
            return [seat for seat in all_reservable if seat.seat_type != 'dotin']

    # ============ AVAILABILITY CHECKS ============

    @staticmethod
    def is_seat_available(seat_id, reservation_date, start_time, end_time):
        """
        Check if a specific seat is available for a given time slot.
        
        Returns True if available, False if already booked.
        """
        with get_db_connection() as session:
            overlapping = session.query(Reservation).filter(
                and_(
                    Reservation.seat_id == seat_id,
                    Reservation.reservation_date == reservation_date,
                    Reservation.status == 'active',
                    Reservation.start_time < end_time,
                    Reservation.end_time > start_time
                )
            ).first()
            
            return overlapping is None

    @staticmethod
    def get_available_seats_for_time(user_association, reservation_date, start_time, end_time):
        """
        Returns all seats that are:
        1. Reservable by the user (based on dotin restrictions)
        2. Free for the given time slot
        
        :param user_association: User's association
        :param reservation_date: Date of the reservation
        :param start_time: Start time of the reservation
        :param end_time: End time of the reservation
        :return: List of available Seat objects
        """
        # Get seats the user is allowed to reserve
        allowed_seats = SeatServices.get_reservable_seats_for_user(user_association, reservation_date)
        
        with get_db_connection() as session:
            # Get IDs of seats that are booked for this time slot
            booked_seat_ids = session.query(Reservation.seat_id).filter(
                and_(
                    Reservation.reservation_date == reservation_date,
                    Reservation.status == 'active',
                    Reservation.start_time < end_time,
                    Reservation.end_time > start_time
                )
            ).all()
            
            booked_ids = [row[0] for row in booked_seat_ids]
        
        # Filter available seats from allowed seats
        available = [seat for seat in allowed_seats if seat.id not in booked_ids]
        
        return available

    # ============ SEAT AVAILABILITY SUMMARY ============

    @staticmethod
    def get_seat_availability_summary(user_association, reservation_date):
        """
        Returns a summary of which seats are available for the entire day.
        Useful for frontend to display seat map.
        
        :param user_association: User's association
        :param reservation_date: Date to check
        :return: List of dicts with seat info and availability
        """
        allowed_seats = SeatServices.get_reservable_seats_for_user(user_association, reservation_date)
        
        with get_db_connection() as session:
            # Get all active reservations for this date
            reservations = session.query(Reservation).filter(
                and_(
                    Reservation.reservation_date == reservation_date,
                    Reservation.status == 'active'
                )
            ).all()
            
            # Group reservations by seat_id
            booked_counts = {}
            for r in reservations:
                booked_counts[r.seat_id] = booked_counts.get(r.seat_id, 0) + 1
        
        summary = []
        for seat in allowed_seats:
            summary.append({
                'seat_id': seat.id,
                'seat_type': seat.seat_type,
                'is_reservable': seat.is_reservable,
                'is_available': seat.id not in booked_counts,
                'reservation_count': booked_counts.get(seat.id, 0)
            })
        
        return summary

    # ============ VALIDATION ============

    @staticmethod
    def seat_exists(seat_id):
        """Check if a seat exists"""
        seat = SeatServices.get_seat_by_id(seat_id)
        return seat is not None

    @staticmethod
    def is_reservable_seat(seat_id):
        """Check if a seat can be reserved (not manager seat)"""
        seat = SeatServices.get_seat_by_id(seat_id)
        return seat is not None and seat.is_reservable

    @staticmethod
    def get_seat_type(seat_id):
        """Get the type of a seat"""
        seat = SeatServices.get_seat_by_id(seat_id)
        return seat.seat_type if seat else None

    # ============ SEAT TYPE COUNTS ============

    @staticmethod
    def get_seat_counts_by_type():
        """Returns counts of seats by type"""
        seats = SeatServices.get_all_seats()
        counts = {}
        for seat in seats:
            counts[seat.seat_type] = counts.get(seat.seat_type, 0) + 1
        return counts