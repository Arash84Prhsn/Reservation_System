from flask import Blueprint, request, jsonify, session
from backend.services.reservation_services import ReservationServices
from backend.services.seat_services import SeatServices
from datetime import datetime, date, time

reservation_bp = Blueprint('reservations', __name__, url_prefix='/api/reservations')

# ==================== HELPER FUNCTIONS ====================

def login_required():
    """Check if user is logged in"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    return None

# ==================== RESERVATION ENDPOINTS ====================

@reservation_bp.route('/available-weeks', methods=['GET'])
def get_available_weeks():
    """
    Get the weeks that are available for reservations.
    Frontend uses this to populate date pickers.
    """
    # Check authentication
    auth_error = login_required()
    if auth_error:
        return auth_error
    
    weeks = ReservationServices.get_available_weeks()
    
    return jsonify({
        'success': True,
        'data': weeks
    })

@reservation_bp.route('/available-seats', methods=['GET'])
def get_available_seats():
    """
    Get available seats for a specific date and time slot.
    Query params: date, start_time, end_time (optional - if not provided, returns all seats with availability summary)
    """
    auth_error = login_required()
    if auth_error:
        return auth_error
    
    user_id = session['user_id']
    user_association = session.get('association')
    
    # Get query parameters
    reservation_date_str = request.args.get('date')
    start_time_str = request.args.get('start_time')
    end_time_str = request.args.get('end_time')
    
    if not reservation_date_str:
        return jsonify({'success': False, 'message': 'Date is required'}), 400
    
    try:
        reservation_date = date.fromisoformat(reservation_date_str)
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # If time slot provided, return available seats for that slot
    if start_time_str and end_time_str:
        try:
            start_time = time.fromisoformat(start_time_str)
            end_time = time.fromisoformat(end_time_str)
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid time format. Use HH:MM:SS'}), 400
        
        # Validate time slot
        if not ReservationServices.is_valid_time_slot(start_time, end_time):
            return jsonify({'success': False, 'message': 'Reservations only allowed between 8:00 and 14:00'}), 400
        
        if not ReservationServices.is_valid_duration(start_time, end_time):
            return jsonify({'success': False, 'message': 'Minimum reservation duration is 15 minutes'}), 400
        
        # Get available seats
        available_seats = SeatServices.get_available_seats_for_time(
            user_association, reservation_date, start_time, end_time
        )
        
        return jsonify({
            'success': True,
            'data': {
                'date': reservation_date_str,
                'start_time': start_time_str,
                'end_time': end_time_str,
                'available_seats': [seat.to_dict() for seat in available_seats]
            }
        })
    
    # Otherwise, return seat availability summary for the entire day
    else:
        summary = SeatServices.get_seat_availability_summary(user_association, reservation_date)
        
        return jsonify({
            'success': True,
            'data': {
                'date': reservation_date_str,
                'seats': summary
            }
        })

@reservation_bp.route('/time-slots', methods=['GET'])
def get_available_time_slots():
    """
    Get all available time slots for a specific seat and date.
    Query params: seat_id, date
    """
    auth_error = login_required()
    if auth_error:
        return auth_error
    
    user_id = session['user_id']
    user_association = session.get('association')
    
    seat_id = request.args.get('seat_id')
    reservation_date_str = request.args.get('date')
    
    if not seat_id or not reservation_date_str:
        return jsonify({'success': False, 'message': 'seat_id and date are required'}), 400
    
    try:
        reservation_date = date.fromisoformat(reservation_date_str)
        seat_id = int(seat_id)
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid date or seat_id format'}), 400
    
    # Check if user can book this seat
    can_book, error_msg = ReservationServices.can_user_book_seat(user_id, seat_id, reservation_date)
    if not can_book:
        return jsonify({'success': False, 'message': error_msg}), 403
    
    # Generate all possible time slots (15-minute increments from 8:00 to 14:00)
    all_slots = []
    slot_start = time(8, 0)
    slot_end = time(14, 0)
    
    current = slot_start
    while current < slot_end:
        # Calculate end time (current + 15 minutes)
        current_min = current.hour * 60 + current.minute
        end_min = current_min + 15
        end = time(end_min // 60, end_min % 60)
        
        # Check if this seat is available for this slot
        is_available = SeatServices.is_seat_available(seat_id, reservation_date, current, end)
        
        all_slots.append({
            'start_time': current.strftime('%H:%M:%S'),
            'end_time': end.strftime('%H:%M:%S'),
            'is_available': is_available
        })
        
        # Move to next 15-minute increment
        current_min += 15
        current = time(current_min // 60, current_min % 60)
    
    return jsonify({
        'success': True,
        'data': {
            'seat_id': seat_id,
            'date': reservation_date_str,
            'slots': all_slots
        }
    })

@reservation_bp.route('/', methods=['GET'])
def get_my_reservations():
    """Get all reservations for the current user"""
    auth_error = login_required()
    if auth_error:
        return auth_error
    
    user_id = session['user_id']
    
    # Get query params for filtering
    status = request.args.get('status', 'active')
    reservation_date_str = request.args.get('date')
    
    if reservation_date_str:
        try:
            reservation_date = date.fromisoformat(reservation_date_str)
            reservations = ReservationServices.get_user_reservations_by_date(user_id, reservation_date)
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid date format'}), 400
    else:
        reservations = ReservationServices.get_user_reservations(user_id, status)
    
    return jsonify({
        'success': True,
        'data': {
            'count': len(reservations),
            'reservations': [r.to_dict() for r in reservations]
        }
    })

@reservation_bp.route('/stats', methods=['GET'])
def get_reservation_stats():
    """Get reservation statistics for the current user"""
    auth_error = login_required()
    if auth_error:
        return auth_error
    
    user_id = session['user_id']
    stats = ReservationServices.get_user_reservation_stats(user_id)
    
    return jsonify({
        'success': True,
        'data': stats
    })

@reservation_bp.route('/', methods=['POST'])
def create_reservation():
    """Create a new reservation"""
    auth_error = login_required()
    if auth_error:
        return auth_error
    
    data = request.get_json()
    user_id = session['user_id']
    
    # Extract fields
    seat_id = data.get('seat_id')
    reservation_date = data.get('reservation_date')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    
    # Validate required fields
    if not all([seat_id, reservation_date, start_time, end_time]):
        return jsonify({'success': False, 'message': 'seat_id, reservation_date, start_time, and end_time are required'}), 400
    
    try:
        seat_id = int(seat_id)
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid seat_id format'}), 400
    
    # Create reservation
    success, message, reservation = ReservationServices.create_reservation(
        user_id, seat_id, reservation_date, start_time, end_time
    )
    
    if success:
        return jsonify({
            'success': True,
            'message': message,
            'data': reservation.to_dict()
        }), 201
    else:
        return jsonify({'success': False, 'message': message}), 400

@reservation_bp.route('/<int:reservation_id>', methods=['DELETE'])
def cancel_reservation(reservation_id):
    """Cancel a reservation"""
    auth_error = login_required()
    if auth_error:
        return auth_error
    
    user_id = session['user_id']
    
    success, message = ReservationServices.cancel_reservation(reservation_id, user_id)
    
    if success:
        return jsonify({'success': True, 'message': message})
    else:
        return jsonify({'success': False, 'message': message}), 400

@reservation_bp.route('/<int:reservation_id>', methods=['GET'])
def get_reservation(reservation_id):
    """Get a specific reservation by ID"""
    auth_error = login_required()
    if auth_error:
        return auth_error
    
    user_id = session['user_id']
    reservation = ReservationServices.get_reservation_by_id(reservation_id)
    
    if not reservation:
        return jsonify({'success': False, 'message': 'Reservation not found'}), 404
    
    # Check if reservation belongs to user
    if reservation.user_id != user_id:
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    
    return jsonify({
        'success': True,
        'data': reservation.to_dict()
    })

@reservation_bp.route('/daily-schedule', methods=['GET'])
def get_daily_schedule():
    """
    Get all reservations for a specific date (for admin/debug).
    Query param: date
    """
    auth_error = login_required()
    if auth_error:
        return auth_error
    
    reservation_date_str = request.args.get('date')
    
    if not reservation_date_str:
        return jsonify({'success': False, 'message': 'Date is required'}), 400
    
    try:
        reservation_date = date.fromisoformat(reservation_date_str)
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid date format'}), 400
    
    reservations = ReservationServices.get_daily_schedule(reservation_date)
    
    return jsonify({
        'success': True,
        'data': {
            'date': reservation_date_str,
            'total_reservations': len(reservations),
            'reservations': [r.to_dict() for r in reservations]
        }
    })