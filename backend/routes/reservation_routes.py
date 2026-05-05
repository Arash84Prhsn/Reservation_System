from flask import Blueprint, request, jsonify, session;
from backend.services.user_services import UserService

reservation_bp = Blueprint('reservations', __name__, url_prefix='/api/reservations')

@reservation_bp.route('/reservableSeats/<string:date>')
def reservableSeats(date):
    """
    Will return a list of booleans that shows which seats are available for reservation for the
    corresponding logged in user.
    
    :param date: The date for which the reservation status of the seats must be given
    """
    # Firstly check that the user is logged in
    if not session.get('logged_in'):
        return jsonify({'success' : False,
                        'message' : "User must be logged in to make reservations"}), 401
    
    user = UserService.get_user_byID(session.get('user_id'))
    
    # In the case that the user was missing (This should not happen, but just in case)
    if not user:
        return jsonify({'success' : False,
                        'message' : "User not found."}), 404
    
