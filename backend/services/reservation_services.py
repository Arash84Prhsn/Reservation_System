from database import get_db_connection
from backend.models.reservations import Reservation
from backend.models.seats import Seat
from backend.models.users import User
from backend.models.events import Event
from backend.services.seat_services import SeatServices
from backend.services.user_services import UserServices
from datetime import datetime, date, time, timedelta
from sqlalchemy import and_, or_, func, select, exists
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
    def get_day_of_week_from_date(date_obj : date):
        """
        Returns the day of the week for the given date as a string. e.g. `"Monday"`
        
        :param date_obj: The date object
        """
        WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        return WEEKDAYS[date_obj.weekday()]
    
    @staticmethod
    def get_week_start_date(date_obj: date = None):
        """Returns the start date of the current week (Saturday)"""
        if date_obj is None:
            date_obj = date.today()
        # Saturday is weekday 5 (Monday=0, Saturday=5, Sunday=6)
        days_since_saturday = (date_obj.weekday() - 5) % 7
        week_start = date_obj - timedelta(days=days_since_saturday)
        return week_start

    @staticmethod
    def get_next_week_start_date():
        """Returns the start date of next week (next Saturday)"""
        return ReservationServices.get_week_start_date() + timedelta(days=7)

    @staticmethod
    def is_it_past_tuesday_12():
        now = datetime.now()

        thisTuesday12PM = datetime.combine(
            ReservationServices.get_week_start_date()+timedelta(3),
            time(12,0,0) # 12PM
        )

        return now >= thisTuesday12PM

    @staticmethod
    def get_possible_reservation_dates(user_id, seat_type):
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
            ReservationServices.get_week_start_date()+timedelta(3),
            time(12,0,0) # 12PM
        )

        # Get the user
        user = UserServices.get_user_byID(user_id)

        # Saturday dates of this week and the next
        currentWeekStartDate = ReservationServices.get_week_start_date()
        nextWeekStartDate = ReservationServices.get_next_week_start_date()
        
        # Get the dates for this week's and the next weeks wednesdays
        currentWeekEndDate = currentWeekStartDate + timedelta(days=4)  
        nextWeekEndDate = nextWeekStartDate + timedelta(days=4) 
        
        # array of our possible reservation Dates (arr of Date objects)
        allowed_dates = []

        # Current week only if user is not dotin and the seat type is dotin
        if (not user.isDotinAssociate()) and seat_type == "dotin":
            start = today + timedelta(days=1)
            end = currentWeekEndDate

            while start <= end:
                allowed_dates.append(start.isoformat())
                start = start + timedelta(days=1)
        
        # Current week (only if we haven't passed current week Tuesday 12 PM)
        elif currentDateTime < thisTuesday12PM:
            start = today + timedelta(days=1)
            end = currentWeekEndDate

            while start <= end:
                allowed_dates.append(start.isoformat())
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
                
                allowed_dates.append(start.isoformat())
                start = start + timedelta(days=1)
        
        return allowed_dates

    @staticmethod
    def is_date_possibly_reservable(reservation_date, user_id, seat_type):
        """Check if a specific date is in the list of possible reservations"""
        reservables = ReservationServices.get_possible_reservation_dates(user_id, seat_type)
        return reservation_date in reservables

    @staticmethod
    def get_available_weeks():
        """
        Returns list of available weeks(current and next) and gives the start and end dates of the
        weeks in addition to the list of days that are available for reservation.

        :returns: an example object in the returned array would be like the following dict:\
        {"week_name": "current_week", "start_date": "2026-05-20", "end_date": "2026-05-24",
        available_dates: ["2026-05-23","2026-05-24"]}
        """
        today = date.today()
        current_week_start = ReservationServices.get_week_start_date()
        next_week_start = ReservationServices.get_next_week_start_date()
        
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
    
    @staticmethod
    def get_user_active_reservations(user_id):
        """
        Get all the currently active reservations for a user
        
        :param user_id: The id of the user used for identification of the user
        :returns: A list of dicts with the following stucture: {"date", "day_of_week",
        "reservation_type", "start_time", "end_time"}
        """

        with get_db_connection() as conn:
            
            stmnt = select(
                Reservation.start_time, Reservation.end_time,
                Reservation.reservation_type, Reservation.reservation_date
            ).where(
                Reservation.user_id == user_id,
                Reservation.status == "active"
            )

            rows = conn.execute(stmnt).all()
            results = []
            
            for row in rows:
                start_time: time = row['start_time']
                end_time: time = row['end_time']
                reservation_date: date = row['reservation_date']
                reservation_type: str = row['reservation_type']
                day_of_week: str = ReservationServices.get_day_of_week_from_date(reservation_date)
                start_time = start_time.isoformat()
                end_time = end_time.isoformat()
                reservation_date = reservation_date.isoformat()

                d = {'date' : reservation_date, 'day_of_week' : day_of_week,
                     'reservation_type' : reservation_type, 'start_time' : start_time,
                     'end_time' : end_time}
                
                results.append(d)
            
            return results

    


    # ====<Validation operations>====

    @staticmethod
    def is_valid_reservation_time(start_time: time, end_time: time):
        """
        Validates reservation time interval based on multiple criteria:
        1. Must be within allowed range (8:00-14:00)
        2. Start time must be less than end time
        3. Duration must be at least 15 minutes
        4. Duration must be a multiple of 15 minutes
        5. Start and end minutes must be in quarters (:00, :15, :30, :45)
        
        :param start_time: The start time of the interval (time object)
        :param end_time: The end time of the interval (time object)

        :returns: Tuple of (is_valid, message)\n
                  is_valid: True if all criteria are met, False otherwise\n
                  message: Description of the error if invalid, success message if valid
        """        
        # Check if times are provided
        if not start_time or not end_time:
            return False, "Start time and end time are required"
        
        # Check if start_time is less than end_time
        if start_time >= end_time:
            return False, "Start time must be before end time"
        
        # Check if times are within allowed range (8:00-14:00)
        start_valid = start_time >= time(8, 0) and start_time <= time(14, 0)
        end_valid = end_time >= time(8, 0) and end_time <= time(14, 0)
        
        if not start_valid:
            return False, f"Start time {start_time.strftime('%H:%M')} is outside allowed range (08:00-14:00)"
        
        if not end_valid:
            return False, f"End time {end_time.strftime('%H:%M')} is outside allowed range (08:00-14:00)"
        
        # Calculate duration in minutes
        start_min = start_time.hour * 60 + start_time.minute
        end_min = end_time.hour * 60 + end_time.minute
        duration_in_minutes = end_min - start_min
        
        # Check minimum duration
        if duration_in_minutes < 15:
            return False, f"Reservation duration must be at least 15 minutes (current: {duration_in_minutes} minutes)"
        
        # Check if duration is a multiple of 15 minutes
        if duration_in_minutes % 15 != 0:
            return False, f"Reservation duration must be in 15-minute increments (current: {duration_in_minutes} minutes)"
        
        # Check if start and end minutes are in quarters
        is_start_in_quarter = start_time.minute % 15 == 0
        is_end_in_quarter = end_time.minute % 15 == 0
        
        if not is_start_in_quarter:
            return False, f"Start time minute must be 00, 15, 30, or 45 (current: {start_time.minute:02d})"
        
        if not is_end_in_quarter:
            return False, f"End time minute must be 00, 15, 30, or 45 (current: {end_time.minute:02d})"
        
        # All validations passed
        return True, f"Valid reservation time: {duration_in_minutes} minutes from {start_time.strftime('%H:%M')} to {end_time.strftime('%H:%M')}"

    @staticmethod
    def has_hit_daily_reservation_limit(user_id, reservation_date):
        """
        Returns `True` if the user has made 2 or more reservations in the `reservation_date` date.
        Returns `False` otherwise

        :param user_id: the id of the user
        :param reservation_date: the date for which the reservation will be counted
        """
        conn = get_db_connection()

        stmnt = select(func.count()).where(Reservation.user_id == user_id,
                                           Reservation.reservation_date == reservation_date,
                                           Reservation.status == "active")
        
        count = conn.execute(stmnt).scalar()

        return count >= 2
    
    @staticmethod
    def is_reservation_type_valid(reservation_type):
        return reservation_type in ["only running programs", "internship", "project"]
    

    # ====<RESERVATION STATUS>====
    
    @staticmethod
    def get_weekly_schedule_intervals_in_dates(start_of_week_date, seat_type, seat_number):
        """
        Docstring for get_weekly_schedule_intervals_in_dates
        
        :param date_obj: The date of the the
        :param seat_type: Description
        :param seat_number: Description
        :return: Description
        """
        result = {"dates" : []}

        for i in range(5):
            date_of_day: date = start_of_week_date + timedelta(days=i)
            date_of_day = date_of_day.isoformat()
            result["dates"].append({date_of_day : SeatServices.get_seat_schedule_for_day(seat_type,
                                                                                         seat_number,
                                                                                         date_of_day)})
        return result



    @staticmethod
    def get_weekly_schedule_timeslots_in_dates(date_obj, seat_type, seat_number):
        """
        Get the weekly schedule for a specific seat for the week containing the given date.
        Week starts on SATURDAY and ends on WEDNESDAY. The status of each slot can be one of the 3
        following values:
        1. free
        2. reserved
        3. event

        In the case that the status is free or event, the "reservation_type" and the "reserved_by"
        fields are None(null)
        
        :param date_obj: The date to get the week for
        :param seat_type: Type of the seat (e.g., 'laptop', 'Dotin')
        :param seat_number: Seat number within its type
        :returns: List of objects, each containing a date and its time slots for the specific seat
        
        Example output:
        {
            "schedule": [
                {
                    'date': '2026-05-16',
                    'slots': [
                        {'timeslot_number': 1, 'start_time': '08:00', 'end_time': '08:15', 'status': 'free', ...},
                        ...
                    ]
                },
                ...
            ]
        }
        """
        from datetime import timedelta
        from sqlalchemy import select
        from backend.services.reservation_services import ReservationServices
        
        # First, get the seat ID
        with get_db_connection() as conn:
            seat_stmt = select(Seat.id).where(
                Seat.seat_type == seat_type,
                Seat.seat_number == seat_number
            )
            seat_id = conn.execute(seat_stmt).scalar()
            
            if seat_id is None:
                raise ValueError(f"Seat '{seat_type} {seat_number}' not found")
        
        # Get the start of the week (SATURDAY) for the given date
        current_week_start = ReservationServices.get_week_start_date(date_obj)
        
        # Pre-calculate all time slots (15-minute intervals from 8:00 to 14:00)
        time_slots = []
        for i in range(24):
            start_minutes = 8 * 60 + (i * 15)
            end_minutes = start_minutes + 15
            time_slots.append({
                'timeslot_number': i + 1,
                'start_time': f"{start_minutes // 60:02d}:{start_minutes % 60:02d}",
                'end_time': f"{end_minutes // 60:02d}:{end_minutes % 60:02d}",
                'start_min': start_minutes,
                'end_min': end_minutes
            })
        
        # Build date range for the week (Saturday to Wednesday)
        dates = []
        for day_index in range(5):  # 5 days: Saturday to Wednesday
            current_date = current_week_start + timedelta(days=day_index)
            dates.append({
                'date': current_date,
                'date_str': current_date.isoformat()
            })
        
        with get_db_connection() as conn:
            # Get all reservations for the specific seat for the week (implicit join)
            reservation_stmt = select(
                Reservation.reservation_date,
                Reservation.start_time,
                Reservation.end_time,
                Reservation.reservation_type,
                User.id.label('reserved_by')
            ).where(
                Reservation.user_id == User.id,
                Reservation.seat_id == seat_id,  # Filter by specific seat
                Reservation.reservation_date.in_([d['date'] for d in dates]),
                Reservation.status == 'active'
            )
            reservations = conn.execute(reservation_stmt).all()
            
            # Get all events for the week (events are not seat-specific, they affect all seats)
            # For events, we still need to show them because they block the entire workspace
            event_stmt = select(
                Event.date,
                Event.start_time,
                Event.end_time,
                User.id.label('reserved_by')
            ).where(
                Event.user_id == User.id,
                Event.date.in_([d['date'] for d in dates]),
                Event.status == 'active'
            )
            events = conn.execute(event_stmt).all()
        
        # Group reservations by date
        reservations_by_date = {}
        for res in reservations:
            date_key = res.reservation_date.isoformat()
            if date_key not in reservations_by_date:
                reservations_by_date[date_key] = []
            
            reservations_by_date[date_key].append({
                'start': res.start_time.hour * 60 + res.start_time.minute,
                'end': res.end_time.hour * 60 + res.end_time.minute,
                'type': res.reservation_type,
                'user_id': res.reserved_by
            })
        
        # Group events by date
        events_by_date = {}
        for event in events:
            date_key = event.date.isoformat()
            if date_key not in events_by_date:
                events_by_date[date_key] = []
            
            events_by_date[date_key].append({
                'start': event.start_time.hour * 60 + event.start_time.minute,
                'end': event.end_time.hour * 60 + event.end_time.minute,
                'user_id': event.reserved_by
            })
        
        # Build the result as a LIST (order guaranteed: Saturday to Wednesday)
        result = {"schedule": []}
        for day_info in dates:
            date_str = day_info['date_str']
            
            day_events = events_by_date.get(date_str, [])
            day_reservations = reservations_by_date.get(date_str, [])
            
            day_schedule = []
            for slot in time_slots:
                slot_start = slot['start_min']
                slot_end = slot['end_min']
                
                # Check for event first (higher priority - blocks the entire workspace)
                event_match = None
                for event in day_events:
                    if event['start'] < slot_end and event['end'] > slot_start:
                        event_match = event
                        break
                
                if event_match:
                    day_schedule.append({
                        'timeslot_number': slot['timeslot_number'],
                        'start_time': slot['start_time'],
                        'end_time': slot['end_time'],
                        'status': 'event',
                        'reservation_type': None,
                        'reserved_by': event_match['user_id']
                    })
                    continue
                
                # Check if this specific seat is reserved for this slot
                reservation_match = None
                for res in day_reservations:
                    if res['start'] < slot_end and res['end'] > slot_start:
                        reservation_match = res
                        break
                
                if reservation_match:
                    day_schedule.append({
                        'timeslot_number': slot['timeslot_number'],
                        'start_time': slot['start_time'],
                        'end_time': slot['end_time'],
                        'status': 'reserved',
                        'reservation_type': reservation_match['type'],
                        'reserved_by': reservation_match['user_id']
                    })
                else:
                    day_schedule.append({
                        'timeslot_number': slot['timeslot_number'],
                        'start_time': slot['start_time'],
                        'end_time': slot['end_time'],
                        'status': 'free',
                        'reservation_type': None,
                        'reserved_by': None
                    })
            
            # Append each date as an object in the list
            result['schedule'].append({
                'date': date_str,
                'slots': day_schedule
            })
        
        return result


    # ============ RESERVATION CREATION ============

    @staticmethod
    def check_fields_existence(reservation_date, reservation_type, start_time, end_time):

        if not reservation_date:
            return False, "reservation_date must be given"
        if not reservation_type:
            return False, "reservation_type must be given"
        if not start_time:
            return False, "start_time must be given"
        if not end_time:
            return False, "end_time must be given"
        
        return True, "No problems!"

    @staticmethod
    def is_reservation_system_only(reservation_type):
        SYSTEM_ONLY_RESERVATIONS = ["only running programs", "dorsan desk"]

        return reservation_type in SYSTEM_ONLY_RESERVATIONS


    @staticmethod
    def check_reservation_for_conflicts(reservation_date, start_time, end_time,
                                            reservation_type, seat_type, seat_number):
        """
        Checks for any conflicts of reservations or events. In the case that the reservation
        is only meant for running programs then any reservation conflict invalidates it. However,
        In the case that the reservation is not system only and there are JUST system_only
        reservations causing conflicts then still return True but also Give the time intervals
        where the conflict with these system only reservations has occured in the warning_message
        field. `warning["needed"]` is only True in the case that was just explained
        
        :param reservation_date: The date of the reservation
        :param start_time: the start time of the reservation, should be `time` object
        :param end_time: the end time of the reservation, should be `time` object
        :param reservation_type: The type of reservation
        """

        with get_db_connection() as conn:
            seat_id = SeatServices.get_seat_id_by_type_number(seat_type, seat_number)
            is_system_only = ReservationServices.is_reservation_system_only(reservation_type)
            
            # First check for event conflicts
            stmnt = select(1).where(
                Event.status == "active",
                Event.date == reservation_date,
                Event.start_time < end_time,
                Event.end_time > start_time
            ).limit(1)

            result = conn.execute(stmnt).first()

            if result:
                return {"success" : False,
                        "message" : "There is an event booked for that time",
                        "warning" : {"needed" : False}}
            
            # Second check for reservation conflicts
            stmnt = select(
                Reservation.start_time,
                Reservation.end_time,
                Reservation.reservation_type
            ).where(
                Reservation.reservation_date == reservation_date,
                Reservation.seat_id == seat_id,
                Reservation.status == "active",
                Reservation.start_time < end_time,
                Reservation.end_time > start_time
            )

            conflicts = conn.execute(stmnt).all()

            # If no conflicts were found then simply return True
            if not conflicts:
                return {"success" : True,
                        "message" : "This reservation is valid and can be submitted",
                        "warning" : {"needed" : False}}
            
            # If the rerservation is system only and some conflict existen then return False!
            if is_system_only:
                return {"success" : False,
                        "message" : "The reservation is in conflict with other reservations",
                        "warning" : {"needed" : False}}
            
            # Now check to see if any of the coflicts was from non system only reservations:
            non_system_conflicts = []
            for c in conflicts:
                if ReservationServices.is_reservation_system_only(c.reservation_type):
                    non_system_conflicts.append(c)

            if non_system_conflicts:
                return {"success" : False,
                        "message" : "The reservation is in conflict with other reservations",
                        "warning" : {"needed" : False}}

            # Now we know that the only reservations in conflict are system only!
            conflict_intervals = []
            for c in conflicts:
                conflict_intervals.append({"start_time" : c.start_time.isoformat(),
                                           "end_time" : c.end_time.isoformat()})
            
            return {"success" : True,
                    "message" : "Your reservations has been validated with a warning",
                    "warning" : {"conflict_intervals" : conflict_intervals,
                                 "warning_message" : "The computer will be unavailabe during these times",
                                 "needed" : True}}

            





    @staticmethod
    def is_there_seat_conflict(seat_type, seat_number, reservation_date, start_time, end_time):
        """
        Check if a seat is already booked for the given time slot. Returns True if conflict exists
        and False otherwise
        """

        with get_db_connection() as conn:
            # Find the conflict
            stmnt = select(exists().where(
                Seat.seat_type == seat_type,
                Seat.seat_number == seat_number,
                Reservation.seat_id == Seat.id,
                Reservation.reservation_date == reservation_date,
                Reservation.status == "active",
                Reservation.start_time < end_time,
                Reservation.end_time > start_time
            ))
            
            return conn.execute(stmnt).scalar()

    #TODO
    @staticmethod
    def can_user_book_seat(user_id, seat_type, seat_number, reservation_date):
        """
        Checks to see if the user is allowed to reserve the given seat in the given date

        :param user_id: id of the user
        :param seat_type: Type of the seat (e.g. Dotin, Optimization, Laptop)
        :param seat_number: Number for the seat type (e.g. Dotin 2, Optimization 1, laptop 3)
        :param reservation_date: The date of the reservation
        """

        with get_db_connection() as conn:
            user = UserServices.get_user_byID(user_id=user_id)
            user = conn.merge(user)
            
            stmnt = select()



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

    # ====<Reservation cancelling>===

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
