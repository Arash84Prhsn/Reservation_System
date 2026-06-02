# backend/routes/__init__.py
from .auth_routes import auth_bp
from .user_routes import user_bp
from .seat_routes import seat_bp
from .reservation_routes import reservation_bp
from .admin_routes import admin_auth_bp

# List all blueprints here so that in app.py we can just run a for loop and register blueprints
# in the list
blueprints = [auth_bp, reservation_bp, seat_bp, user_bp, admin_auth_bp];