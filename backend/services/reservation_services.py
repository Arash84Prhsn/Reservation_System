from database import get_db_connection
from backend.models.reservations import Reservation
from backend.models.enums import RESERVATION_TYPES, SYSTEM_ONLY_RESERVATION_TYPES
from backend.models.seats import Seat
from backend.models.users import User
from backend.models.events import Event
from backend.services.seat_services import SeatServices
from backend.services.user_services import UserServices
from datetime import datetime, date, time, timedelta
from sqlalchemy import and_, or_, func, select, exists
import jdatetime

class ReservationServices:

    # =====================================<DATES UTILITIES>========================================
    
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
        Returns the day of the week for the given date as an integer, 0-6 (from Monday to Sunday)
        
        :param date_obj: The date object
        """
        WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        return date_obj.weekday()
    
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
                allowed_dates.append(start)
                start = start + timedelta(days=1)
        
        # Current week (only if we haven't passed current week Tuesday 12 PM)
        elif currentDateTime < thisTuesday12PM:
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
                Reservation.start_time,
                Reservation.end_time,
                Reservation.reservation_type,
                Reservation.reservation_date,
                Reservation.id
            ).where(
                Reservation.user_id == user_id,
                Reservation.status == "active"
            )

            rows = conn.execute(stmnt).all()
            results = []
            
            for row in rows:
                start_time: time = row[0]
                end_time: time = row[1]
                reservation_type: str = row[2]
                reservation_date: date = row[3]
                id = row[4]
                day_of_week: str = ReservationServices.get_day_of_week_from_date(reservation_date)
                start_time = start_time.isoformat()
                end_time = end_time.isoformat()
                reservation_date = reservation_date.isoformat()

                d = {'reservation_id' : id,
                     'date' : reservation_date,
                     'day_of_week' : day_of_week,
                     'reservation_type' : reservation_type,
                     'start_time' : start_time,
                     'end_time' : end_time}
                
                results.append(d)
            
            return results

    


    # ===================================<VALIDATION OPERATIONS>====================================

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
        return reservation_type in RESERVATION_TYPES
    

    # =====================================<RESERVATION STATUS>=====================================
    
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
            result["dates"].append(SeatServices.get_seat_schedule_for_day(seat_type,
                                                                          seat_number,
                                                                          date_of_day))
        return result



    @staticmethod
    def get_weekly_schedule_timeslots_in_dates(date_obj, seat_type, seat_number, current_user_id):
        """
        Get the weekly schedule for a specific seat for the week containing the given date.
        Week starts on SATURDAY and ends on WEDNESDAY. The status of each slot can be one of the 5
        following values:
        1. free
        2. reserved_by_user (current user's reservation)
        3. reserved_by_others (someone else's reservation)
        4. reserved_by_user_with_system_reservation (current user's reservation + system-only reservation)
        5. reserved_by_others_with_system_reservation (someone else's reservation + system-only reservation)
        6. event

        In the case that the status is free or event, the "reservation_type" and the "reserved_by"
        fields are None(null)
        
        :param date_obj: The date to get the week for
        :param seat_type: Type of the seat (e.g., 'laptop', 'Dotin')
        :param seat_number: Seat number within its type
        :param current_user_id: ID of the currently logged in user
        :returns: List of objects, each containing a date and its time slots for the specific seat
        """
        
        from backend.services.reservation_services import ReservationServices
        from backend.services.seat_services import SeatServices
        
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
            # Get all reservations for the specific seat for the week
            reservation_stmt = select(
                Reservation.reservation_date,
                Reservation.start_time,
                Reservation.end_time,
                Reservation.reservation_type,
                User.id.label('reserved_by'),
                Reservation.id.label('reservation_id')
            ).where(
                Reservation.user_id == User.id,
                Reservation.seat_id == seat_id,
                Reservation.reservation_date.in_([d['date'] for d in dates]),
                Reservation.status == 'active'
            )
            reservations = conn.execute(reservation_stmt).all()
            
            # Get all events for the week (events are not seat-specific, they affect all seats)
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
                'user_id': res.reserved_by,
                'reservation_id': res.reservation_id,
                'is_system_only': ReservationServices.is_reservation_system_only(res.reservation_type)
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
        
        # Build the result
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
                        'reserved_by': event_match['user_id'],
                        'reservation_id': None
                    })
                    continue
                
                # Find ALL reservations that cover this time slot
                matching_reservations = []
                for res in day_reservations:
                    if res['start'] < slot_end and res['end'] > slot_start:
                        matching_reservations.append(res)
                
                if matching_reservations:
                    # Separate regular and system-only reservations
                    regular_reservations = [r for r in matching_reservations if not r['is_system_only']]
                    system_reservations = [r for r in matching_reservations if r['is_system_only']]
                    
                    # Check if there's a system-only reservation present
                    has_system_reservation = len(system_reservations) > 0
                    
                    if regular_reservations:
                        # There is at least one regular reservation
                        # Take the first regular reservation (there should only be one)
                        regular = regular_reservations[0]
                        
                        if regular['user_id'] == current_user_id:
                            # Current user's regular reservation
                            if has_system_reservation:
                                status = 'reserved_by_user_with_system_reservation'
                            else:
                                status = 'reserved_by_user'
                        else:
                            # Someone else's regular reservation
                            if has_system_reservation:
                                status = 'reserved_by_others_with_system_reservation'
                            else:
                                status = 'reserved_by_others'
                        
                        day_schedule.append({
                            'timeslot_number': slot['timeslot_number'],
                            'start_time': slot['start_time'],
                            'end_time': slot['end_time'],
                            'status': status,
                            'reservation_type': regular['type'],
                            'reserved_by': regular['user_id'],
                            'reservation_id': regular['reservation_id']
                        })
                    elif has_system_reservation:
                        # Only system-only reservations (no regular reservations)
                        # This means the seat is effectively free for regular use
                        # But we don't show a special status for this case? 
                        # For now, treat as free since system-only doesn't block the seat
                        # If you want to show system-only reservations separately, add logic here
                        day_schedule.append({
                            'timeslot_number': slot['timeslot_number'],
                            'start_time': slot['start_time'],
                            'end_time': slot['end_time'],
                            'status': 'free',
                            'reservation_type': None,
                            'reserved_by': None,
                            'reservation_id': None
                        })
                    else:
                        # No reservations (should not happen since matching_reservations is not empty)
                        day_schedule.append({
                            'timeslot_number': slot['timeslot_number'],
                            'start_time': slot['start_time'],
                            'end_time': slot['end_time'],
                            'status': 'free',
                            'reservation_type': None,
                            'reserved_by': None,
                            'reservation_id': None
                        })
                else:
                    # No reservations at all
                    day_schedule.append({
                        'timeslot_number': slot['timeslot_number'],
                        'start_time': slot['start_time'],
                        'end_time': slot['end_time'],
                        'status': 'free',
                        'reservation_type': None,
                        'reserved_by': None,
                        'reservation_id': None
                    })
            
            result['schedule'].append({
                'date': date_str,
                'slots': day_schedule
            })
        
        return result


    # ====================================<RESERVATION CREATION>====================================

    @staticmethod
    def check_fields_existence(**kwargs):
        """
        Check if any of the provided fields are missing or empty.
        
        :param kwargs: Key-value pairs of field names and their values
        :return: Tuple of (is_valid, message)
        
        Examples:
            check_fields_existence(reservation_date=date_val, reservation_type=type_val)
            check_fields_existence(username=username, email=email, phone=phone)
            check_fields_existence(reservation_date=date_val, start_time=start, end_time=end, seat_type=stype)
        """
        
        for field_name, field_value in kwargs.items():
            if not field_value:
                return False, f"{field_name} is missing"
        
        return True, "No problems!"

    @staticmethod
    def is_reservation_system_only(reservation_type: str):
        reservation_type = reservation_type.lower().strip()
        return reservation_type in SYSTEM_ONLY_RESERVATION_TYPES


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
                        "message" : "در تایم مورد نظر جلسه‌ای است و رزرو مجاز نیست",
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
                        "message" : "این رزرو را می‌توانید نهایی کنید",
                        "warning" : {"needed" : False}}
            
            # If the rerservation is system only and some conflict exists then return False!
            if is_system_only:
                return {"success" : False,
                        "message" : "رزرو با رزرو های دیگری در تداخل است",
                        "warning" : {"needed" : False}}
            
            # Now check to see if any of the coflicts was from non system only reservations:
            non_system_conflicts = []
            for c in conflicts:
                if not ReservationServices.is_reservation_system_only(c.reservation_type):
                    non_system_conflicts.append(c)

            if non_system_conflicts:
                return {"success" : False,
                        "message" : "رزرو با رزرو های دیگری در تداخل است",
                        "warning" : {"needed" : False}}

            # Now we know that the only reservations in conflict are system only!
            conflict_intervals = []
            for c in conflicts:
                if c.end_time < end_time and c.start_time > start_time:
                    conflict_intervals.append({"start_time" : c.start_time.isoformat(),
                                            "end_time" : c.end_time.isoformat()})
                elif c.end_time < end_time:
                    conflict_intervals.append({"start_time" : start_time.isoformat(),
                                            "end_time" : c.end_time.isoformat()})
                elif c.start_time > start_time:
                    conflict_intervals.append({"start_time" : c.start_time.isoformat(),
                                            "end_time" : end_time.isoformat()})
                else:
                    conflict_intervals.append({"start_time" : start_time.isoformat(),
                                            "end_time" : end_time.isoformat()})
            
            return {"success" : True,
                    "message" : "این رزرو را با توجه به هشدار اجازه دارید که ثبت کنید",
                    "warning" : {"conflict_intervals" : conflict_intervals,
                                 "warning_message" : "سیستم در این بازه‌ های زمانی در دسترس نیست و فقط از صندلی و میز می‌توانید استفاده کنید",
                                 "needed" : True}}


    @staticmethod
    def create_reservation(reservation_date, reservation_type, start_time, end_time, user_id, seat_id):
        """
        Create a new reservation in the database.
        
        :param reservation_date: Date of the reservation
        :param reservation_type: Type of reservation (e.g., "internship", "project", "only running programs")
        :param start_time: Start time of the reservation
        :param end_time: End time of the reservation
        :param user_id: ID of the user making the reservation
        :param seat_id: ID of the seat being reserved
        :return: The created Reservation object
        """
        with get_db_connection() as conn:
            new_reservation = Reservation(
                user_id=user_id,
                seat_id=seat_id,
                reservation_date=reservation_date,
                start_time=start_time,
                end_time=end_time,
                reservation_type=reservation_type,
                status='active'
            )
            conn.add(new_reservation)
            conn.commit()
            conn.refresh(new_reservation)
            return new_reservation


    # ====================================<RESERVATION QUERIES>=====================================

    @staticmethod
    def get_reservation_by_id(reservation_id):
        """Get a reservation object by ID"""
        conn = get_db_connection()
        reservation = conn.query(Reservation).filter_by(id=reservation_id).first()
        conn.close()
        return reservation

    @staticmethod
    def find_reservation_id(reservation_date, start_time, reservation_type, user_id, seat_id):

        with get_db_connection() as conn:
            stmnt = select(Reservation.id).where(
                Reservation.user_id == user_id,
                Reservation.seat_id == seat_id,
                Reservation.reservation_date == reservation_date,
                Reservation.reservation_type == reservation_type,
                Reservation.start_time == start_time,
                Reservation.status == "active"
            )

            result = conn.execute(stmnt).scalar()

            return result
        

    @staticmethod
    def update_expired_reservations_and_events():
        """Update status of expired reservations and events to 'over'"""
        from datetime import datetime
        from sqlalchemy import update
        from database import get_db_connection
        from backend.models.reservations import Reservation
        from backend.models.events import Event
        
        now = datetime.now()
        today = now.date()
        current_time = now.time()
        
        with get_db_connection() as conn:
            # Update expired reservations
            r1 = conn.execute(
                update(Reservation).where(
                    Reservation.status == 'active',
                    Reservation.reservation_date < today
                ).values(status='over')
            )
            
            r2 = conn.execute(
                update(Reservation).where(
                    Reservation.status == 'active',
                    Reservation.reservation_date == today,
                    Reservation.end_time <= current_time
                ).values(status='over')
            )
            
            # Update expired events
            e1 = conn.execute(
                update(Event).where(
                    Event.status == 'active',
                    Event.date < today
                ).values(status='over')
            )
            
            e2 = conn.execute(
                update(Event).where(
                    Event.status == 'active',
                    Event.date == today,
                    Event.end_time <= current_time
                ).values(status='over')
            )
            
            conn.commit()
            
            return r1.rowcount + r2.rowcount, e1.rowcount + e2.rowcount

    # ===================================<RESERVATION CANCELLING>===================================

    @staticmethod
    def cancel_reservation(reservation_id, user_id):
        """
        Cancells an active reservation
        
        :param reservation_id: The id for the reservation that will be cancelled
        :returns: `(success, msg)` tuple where `success` is a boolean and `msg` is a string
        """

        reservation: Reservation = ReservationServices.get_reservation_by_id(reservation_id)

        if user_id != reservation.user_id:
            return False, "شما دسترسی به لغو رزرو دیگران را ندارید"
        
        if not reservation:
            return False, "رزرو مورد نظر موجود نمی باشد"
        
        if reservation.status != "active":
            return False, "رزرو مورد نظر فعال نیست"
        
        # Check to see if its before the reservation time!
        start_time = reservation.start_time
        reservation_date = reservation.reservation_date

        exact_reservation_datetime = datetime.combine(reservation_date, start_time)

        if datetime.now() >= exact_reservation_datetime:
            return False, "زمان مجاز کنسل این رزرو گذشته است"
        
        with get_db_connection() as conn:
            reservation = conn.merge(reservation)
            reservation.cancel()
            conn.commit()

            return True, "رزرو با موفقیعت کنسل شد"
