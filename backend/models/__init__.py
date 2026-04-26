from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Import all models so Base knows about them
from .users import User
from .seats import Seat
from .reservations import Reservation

# Export models for easy access
__all__ = ['Base', 'User', 'Seat', 'Reservation']