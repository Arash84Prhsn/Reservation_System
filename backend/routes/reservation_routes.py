from flask import Blueprint, request, jsonify, session
from backend.services.reservation_services import ReservationServices
from backend.services.seat_services import SeatServices
from backend.services.user_services import UserServices
from datetime import datetime, date, time, timedelta

reservation_bp = Blueprint('reservation', __name__, url_prefix='/api/reservation')

# =====<GETTING THE SCHEDULES>=====

@reservation_bp.route("/get_user_active_reservations", methods=["GET"])
def get_user_acitve_reservations():
    if not UserServices.is_user_logged_in():
        return jsonify({"success" : False,
                        "message" : "User is not logged in"}), 401
    
    
    user_id = session.get("user_id")
    d = {}
    d['reservations'] = ReservationServices.get_user_active_reservations(user_id)
    d['success'] = True

    return jsonify(d), 200
    

# Interval style schedules are here
@reservation_bp.route("/weekly_schedule_intervals", methods=["POST"])
def weekly_schedule_intervals():
    data: dict = request.get_json()

    date_of_week = data.get("date")
    seat_type = data.get("seat_type")
    seat_number = data.get("seat_number")

    date_of_week = date.fromisoformat(date_of_week)
    if not date_of_week:
        return jsonify({"success" : False,
                        "message" : "date for the week was not given"}), 400
    
    start_of_week_date = ReservationServices.get_week_start_date(date_of_week)

    results = ReservationServices.get_weekly_schedule_intervals_in_dates(start_of_week_date,
                                                                         seat_type,
                                                                         seat_number)
    
    results["success"] = True
    return jsonify(results), 200

@reservation_bp.route("/current_week_schedule_intervals", methods=["POST"])
def current_week_schedule_intervals():
    data: dict = request.get_json()

    seat_type: str = data.get("seat_type")
    seat_number = data.get("seat_number")
    date_of_week = date.today()

    if not seat_type:
        return jsonify({"success" : False,
                        "message" : "seat_type was not given"}), 400
    if not seat_number:
        return jsonify({"success" : False,
                        "message" : "seat_number was not given"}), 400
    
    seat_type = seat_type.lower().strip()
    start_of_week_date = ReservationServices.get_week_start_date(date_of_week)

    results = ReservationServices.get_weekly_schedule_intervals_in_dates(start_of_week_date,
                                                                         seat_type,
                                                                         seat_number)
    
    results["success"] = True
    return jsonify(results)


 # Time slot schedules are here:
@reservation_bp.route('/current_week_schedule_timeslots', methods=["POST"])
def get_this_week_schedule_timeslots():
    if not session.get('logged_in') :
        return jsonify({"success" : False,
                        "message" : "User is not logged in"}), 401
    
    data: dict = request.get_json()
    seat_type: str = data.get("seat_type")
    seat_number = data.get("seat_number")

    if not seat_type:
        return jsonify({"success" : False,
                        "message" : "seat_type must be specified"}), 400

    seat_type = seat_type.lower().strip()

    if not seat_number:
        return jsonify({"success" : False,
                        "message" : "seat_number must be specified"}), 400
    
    if not SeatServices.validate_seat_type(seat_type):
        return jsonify({"success" : False,
                        "message" : "Invalid seat_type has been given"}), 400
    
    d = date.today()
    schedule = ReservationServices.get_weekly_schedule_timeslots_in_dates(d,seat_type, seat_number)
    schedule["success"] = True
    return jsonify(schedule)

@reservation_bp.route('/weekly_schedule_timeslots', methods=["POST"])
def get_week_schedule_by_date():
    if not session.get('logged_in') :
        return jsonify({"success" : False,
                        "message" : "User is not logged in"}), 401
    
    data: dict = request.get_json()

    date_str = data.get("date")
    seat_type: str = data.get("seat_type")
    seat_number = data.get("seat_number")

    if not date_str:
        return jsonify({"success" : False,
                        "message" : "date must be specified"}), 400
    
    if not seat_type:
        return jsonify({"success" : False,
                        "message" : "seat_type must be specified"}), 400

    seat_type = seat_type.lower().strip()

    if not seat_number:
        return jsonify({"success" : False,
                        "message" : "seat_number must be specified"}), 400

    if seat_type not in ['dotin', 'optimization', 'laptop', 'manager']:
        return jsonify({"success" : False,
                        "message" : "Invalid seat_type has been given"}), 400

    try:
        d = date.fromisoformat(date_str)
        schedule = ReservationServices.get_weekly_schedule_timeslots_in_dates(d, seat_type, seat_number)
        schedule["success"] = True
        return jsonify(schedule)
    
    except ValueError:
        return jsonify({
            'success': False,
            'message': 'Invalid date format. Please use YYYY-MM-DD'
        }), 400
    
# ========<MAKING RESERVATIONS>========

@reservation_bp.route("/is_next_week_open", methods=["GET"])
def is_next_week_open():
    return jsonify({"success" : True,
                    "next_week_open" : ReservationServices.is_it_past_tuesday_12()}), 200

@reservation_bp.route("/is_user_dotin", methods=["GET"])
def is_user_dotin():
    if not UserServices.is_user_logged_in():
        return jsonify({"success" : False,
                        "message" : "User is not logged in"}), 401
        
    user_id = session.get("user_id")
    user = UserServices.get_user_byID(user_id)

    return user.isDotinAssociate()

@reservation_bp.route("/open_dates_for_user", methods=["POST"])
def open_dates_for_user():
    if not UserServices.is_user_logged_in():
        return jsonify({"success" : False,
                        "message" : "User is not logged in"}), 401
    
    data: dict = request.get_json()
    seat_type: str = data.get("seat_type")
    if not seat_type :
        return jsonify({"success" : False,
                        "message" : "seat_type was not given"}), 400
    
    seat_type = seat_type.lower().strip()
    user_id = session.get("user_id")
    if not SeatServices.validate_seat_type(seat_type):
        return jsonify({"success" : False,
                        "message" : "invalid seat_type was given"}), 400

    list_of_dates = ReservationServices.get_possible_reservation_dates(user_id, seat_type)
    
    # Make the dates iso format
    for i in range(len(list_of_dates)):
        list_of_dates[i] = list_of_dates[i].isoformat()

    d = {'success' : True, "dates" : list_of_dates}
    return jsonify(d), 200

@reservation_bp.route("/has_user_hit_reservation_limit", methods=["POST"])
def has_user_hit_reservation_limit():
    if not UserServices.is_user_logged_in():
        return jsonify({"suceess" : False,
                        "message" : "User is not logged in"}), 401
    
    data: dict = request.get_json()
    user_id = session.get("user_id")
    reservation_date = data.get("reservation_date")

    if not reservation_date:
        return jsonify({"success" : False,
                        "message" : "date must be specified"}), 400
    
    reservation_date = date.fromisoformat(reservation_date)

    d = {"success" : True,
         "has_hit_limit" : ReservationServices.has_hit_daily_reservation_limit(user_id, reservation_date)}
    
    return jsonify(d), 200


@reservation_bp.route("/make_reservation", methods=["POST"])
def make_reservation():
    if not UserServices.is_user_logged_in():
        return jsonify({"success" : False,
                        "message" : "User is not logged in"}), 401
    
    data: dict = request.get_json()
    reservation_date = data.get("reservation_date")
    reservation_type: str = data.get("reservation_type")
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    seat_type: str = data.get("seat_type")
    seat_number = data.get("seat_number")
    user_id = session.get("user_id")

    # Make sure the values are not null and have actually been taken from the request
    exists, msg = ReservationServices.check_fields_existence(reservation_type=reservation_type,
                                                             reservation_date=reservation_date,
                                                             start_time=start_time,
                                                             end_time=end_time)
    if not exists:
        return jsonify({"success" : False,
                        "message" : msg}), 400
    
    # Make sure the give strings are lowerd so no db issues occur
    reservation_type = reservation_type.lower().strip()    
    seat_type = seat_type.lower().strip()

    # Get the proper time and date objects
    reservation_date = date.fromisoformat(reservation_date)
    start_time = time.fromisoformat(start_time)
    end_time = time.fromisoformat(end_time)
    
    # Make sure the give time interval is valid and follows our rules
    valid, msg = ReservationServices.is_valid_reservation_time(start_time, end_time)
    if not valid:
        return jsonify({"success" : False,
                        "message" : msg}), 400
    
    # Validate the seat type
    if not SeatServices.validate_seat_type(seat_type):
        return jsonify({"success" : False,
                        "message" : "The given seat type is invalid"}), 400
    
    # Make sure the given date is even in the list of possible reservations
    possible = ReservationServices.is_date_possibly_reservable(reservation_date, user_id, seat_type)
    if not possible:
        return jsonify({"success" : False,
                        "message" : "The given date is not accessible for reservations"}), 400
    
    # Make sure the reservation_type is valid
    is_reservation_type_valid = ReservationServices.is_reservation_type_valid(reservation_type)
    if not is_reservation_type_valid:
        return jsonify({"success" : False,
                        "message" : "The given reservation_type is not valid"}), 400
    
    
    # Make sure the seat_number is in the correct range for the corresponding type
    is_seat_number_valid = SeatServices.is_seat_number_valid(seat_type, seat_number)
    if not is_seat_number_valid:
        return jsonify({"success" : False,
                        "message" : "The given seat_number is out of range"}), 400
        
    status = ReservationServices.check_reservation_for_conflicts(
        reservation_date,
        start_time,
        end_time,
        reservation_type,
        seat_type,
        seat_number
    )

    if not status.get("success"):
        return jsonify(status), 400
    
    status["reservation_info"] = {"start_time" : start_time.isoformat(),
                                  "end_time" : end_time.isoformat(),
                                  "reservation_type" : reservation_type,
                                  "reservation_date" : reservation_date.isoformat(),
                                  "seat_type" : seat_type,
                                  "seat_number" : seat_number}

    return jsonify(status), 200;

reservation_bp.route("/cancel_reservation_with_all_info", methods=["PUT"])
def cancel_reservation_with_all_info():
    if not UserServices.is_user_logged_in():
        return jsonify({"success" : False,
                        "message" : "User is not logged in"}), 401
    
    data: dict = request.get_json()
    reservation_date: str = data.get("reservation_date")
    reservation_type: str = data.get("reservation_type")
    start_time: str = data.get("start_time")
    seat_type: str = data.get("seat_type")
    seat_number = data.get("seat_number")
    user_id = session.get("user_id")

    exists, msg = ReservationServices.check_fields_existence(
        reservation_date=reservation_date,
        start_time=start_time,
        seat_type=seat_type,
        seat_number=seat_number
        )
    
    if not exists:
        return jsonify({"success" : False,
                        "message" : msg}), 400
    
    reservation_date = date.fromisoformat(reservation_date)
    start_time = time.fromisoformat(start_time)
    seat_id = SeatServices.get_seat_id_by_type_number(seat_type, seat_number)

    reservation_id = ReservationServices.find_reservation_id(reservation_date, start_time,
                                                             reservation_type, user_id, seat_id)
    if not reservation_id:
        return jsonify({"success" : False,
                        "messaage" : "رزرو مورد نظر موجود نمی باشد"})
    
    success, msg = ReservationServices.cancel_reservation(reservation_id)

    if not success:
        return jsonify({"success" : False,
                       "message" : msg}), 400
    
    return jsonify({"success" : True,
                    "message" : msg}), 200

reservation_bp.route("/cancel_reservation_by_id", methods=["PUT"])
def cancel_reservation_by_id():
    if not UserServices.is_user_logged_in():
        return jsonify({"success" : False,
                        "message" : "User is not logged in"}), 401
    
    data: dict = request.get_json()

    reservation_id = data.get("reservation_id")

    if not reservation_id:
        return jsonify({"success" : False,
                        "messaage" : "رزرو مورد نظر موجود نمی باشد"})

    success, msg = ReservationServices.cancel_reservation(reservation_id)
    if not success:
        return jsonify({"success" : False,
                       "message" : msg}), 400
    
    return jsonify({"success" : True,
                    "message" : msg}), 200
