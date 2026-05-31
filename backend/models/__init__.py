from sqlalchemy.orm import declarative_base

DeclarativeBase = declarative_base()

# Import all models so Base knows about them
from .users import User
from .seats import Seat
from .reservations import Reservation
from .events import Event
from .roles import Role

# Export models for easy access
__all__ = ['DeclarativeBase', 'User', 'Seat', 'Reservation', 'Event', 'Role']