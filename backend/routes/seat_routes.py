from flask import Blueprint, request, jsonify, session;
from database import get_db_connection;
from backend.models.enums import SEAT_COUNTS


seat_bp = Blueprint('seats', __name__, url_prefix='/api/seats')

@seat_bp.route("/get_seat_types_and_counts", methods=['GET'])
def get_seat_types_and_counts():
    d = {}
    d['success'] = True
    d['seat_types'] = SEAT_COUNTS
    return jsonify(d)