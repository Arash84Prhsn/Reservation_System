from database import get_db_connection
from backend.models.seats import Seat
from backend.models.reservations import Reservation
from backend.models.events import Event
from backend.models.users import User
from datetime import datetime, date, time, timedelta
from sqlalchemy import select

class SeatServices:

    # ============<BASIC QUERIES>============
    
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
    def get_seat_id_by_type_number(seat_type, seat_number):
        """
        Returns the id of the specific seat
        
        :param seat_type: The seat_type
        :param seat_number: The seat_id
        """

        with get_db_connection() as conn:
            stmnt = select(Seat.id).where(Seat.seat_type == seat_type,
                                          Seat.seat_number == seat_number)
            
            id = conn.execute(stmnt).scalar()
            return id


    @staticmethod
    def get_seats_by_type(seat_type):
        """Get all seats of a specific type (dotin, laptop, optimization, manager)"""
        with get_db_connection() as session:
            seats = session.query(Seat).filter(Seat.seat_type == seat_type).all()
        return seats

    # ============<VALIDATION>============

    @staticmethod
    def validate_seat_type(seat_type: str):
        VALID_SEAT_TYPES = ['dotin', 'optimization', 'laptop', 'manager']
        seat_type = seat_type.lower().strip()
        return seat_type in VALID_SEAT_TYPES
    
    @staticmethod
    def is_seat_number_valid(seat_type, seat_number):
        if seat_type == 'dotin':
            return 1 <= seat_number <=4
        if seat_type == 'optimization':
            return 1 <= seat_number <=2
        if seat_type == 'laptop':
            return 1 <= seat_number <=3
        if seat_type == 'manager':
            return seat_number == 1
        
    
    # ============<SCHEDULES>============

    @staticmethod
    def get_seat_schedule_for_day(seat_type, seat_number, date_of_day):
        """
        Retruns a dict of two keys, "reservations" & "events". the value for which is a 
        list of dicts that contain information for the reservations or the events respectively.
        
        :param seat_type: The seat type
        :param seat_number: The seat Number
        :param date_of_day: The date in question
        """

        results = {"events" : [], "reservations" : []}

        seat_id = SeatServices.get_seat_id_by_type_number(seat_type, seat_number)

        with get_db_connection() as conn:

            # Get the list of events
            stmnt = select(Event.start_time, Event.end_time).where(Event.date == date_of_day,
                                                                   Event.status == "active")
            
            events_of_day = conn.execute(stmnt).all()

            for row in events_of_day:
                start_time = row["start_time"].isoformat()
                end_time = row["end_time"].isoformat()

                results["events"].append({"start_time" : start_time,
                                          "end_time" : end_time})
            
            stmnt = select(Reservation.start_time, Reservation.end_time,
                           User.id, Reservation.reservation_type).join(
                             User, Reservation.user_id == User.id  
                           ).where(
                               Reservation.user_id == User.id,
                               Reservation.seat_id == seat_id,
                               Reservation.status == "active",
                               Reservation.reservation_date == date_of_day
                           )
            
            reservations_of_day = conn.execute(stmnt).all()

            for row in reservations_of_day:
                id = row["id"]
                reservation_type = row["reservation_type"]
                start_time = row["start_time"].isoformat()
                end_time = row["end_time"].isoformat()

                results["reservations"].append({"start_time" : start_time,
                                                "end_time" : end_time,
                                                "reserved_by" : id,
                                                "reservation_type" : reservation_type})

            return results
                
            

