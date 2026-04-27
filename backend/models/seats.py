from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from backend.models import Base

class Seat(Base):
    __tablename__ = 'seats'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    seat_number = Column(Integer, unique=True, nullable=False)
    seat_type = Column(String, nullable=False)  # 'manager', 'optimization', 'byol', 'normal'
    is_reservable = Column(Boolean, default=True)
    
    # Relationships
    reservations = relationship("Reservation", back_populates="seat")
    
    def to_dict(self):
        """Convert seat to dictionary"""
        return {
            'id': self.id,
            'seat_number': self.seat_number,
            'seat_type': self.seat_type,
            'is_reservable': self.is_reservable
        }
    
    def is_available_for_reservation(self):
        """Check if seat can be reserved"""
        return self.is_reservable and self.seat_type != 'manager'
    
    def __repr__(self):
        return f"<Seat(seat_number={self.seat_number}, type='{self.seat_type}')>"
    