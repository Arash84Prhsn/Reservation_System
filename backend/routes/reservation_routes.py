from flask import Blueprint, request, jsonify;

reservation_bp = Blueprint('reservations', __name__, url_prefix='/api/reservations')