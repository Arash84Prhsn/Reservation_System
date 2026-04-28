from flask import Blueprint, request, jsonify, session;
from database import get_db_session;


seat_bp = Blueprint('seats', __name__, url_prefix='/api/seats')
