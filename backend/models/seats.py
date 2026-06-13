from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from backend.models import DeclarativeBase

class Seat(DeclarativeBase):
    __tablename__ = 'seats'
    
    id = Column(Integer, primary_key=True, autoincrement=True) # the Primary key id column
    seat_type = Column(String, nullable=False)  # 'manager', 'optimization', 'dotin', 'laptop'
    seat_number = Column(Integer, nullable=False) # The seat number for a type (e.g. dotin 2)
    is_reservable = Column(Boolean, default=True) 
    
    # Relationships
    reservations = relationship("Reservation", back_populates="seat")
    
    def to_dict(self):
        """Convert seat to dictionary"""
        return {
            'id': self.id,
            'seat_type': self.seat_type,
            'seat_number' : self.seat_number,
            'is_reservable': self.is_reservable
        }
    
    def is_available_for_reservation(self):
        """Check if seat can be reserved"""
        return self.is_reservable and self.seat_type != 'manager'

    def __repr__(self):
        return f"{self.seat_type} {self.seat_number}"