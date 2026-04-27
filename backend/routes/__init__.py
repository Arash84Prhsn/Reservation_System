# backend/routes/__init__.py
from .auth_routes import auth_bp
from .reservation_routes import reservation_bp

# List all blueprints for easy registration
blueprints = [auth_bp, reservation_bp]