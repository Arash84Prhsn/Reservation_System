from sqlalchemy import Column, Integer, String, DateTime, Date, Time, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from backend.models import Base
from datetime import datetime

class Reservation(Base):
    __tablename__ = 'reservations'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    seat_id = Column(Integer, ForeignKey('seats.id'), nullable=False)
    reservation_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    reservation_type = Column(String, nullable=False)
    status = Column(String, default='active')  # 'active', 'cancelled'
    created_at = Column(DateTime, default=datetime.now)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="reservations")
    seat = relationship("Seat", back_populates="reservations")
    
    # Table-level constraints
    __table_args__ = (
        CheckConstraint('start_time < end_time', name='check_start_before_end'),
        CheckConstraint("time(start_time) >= '08:00' AND time(end_time) <= '14:00'", name='check_time_window'),
    )
    
    def to_dict(self):
        """Convert reservation to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else None,
            'seat_id': self.seat_id,
            'seat_type': self.seat.seat_type if self.seat else None,
            'reservation_date': self.reservation_date.isoformat(),
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'reservation_type' : self.reservation_type,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None
        }
    
    def cancel(self):
        """Cancel this reservation"""
        self.status = 'cancelled'
        self.cancelled_at = datetime.now()
    
    def is_cancellable(self):
        """Check if reservation can still be cancelled"""
        from datetime import datetime, date, time
        now = datetime.now()
        reservation_datetime = datetime.combine(self.reservation_date, self.start_time)
        return now < reservation_datetime and self.status == 'active'
    
    def duration_minutes(self):
        """Get reservation duration in minutes"""
        if self.start_time and self.end_time:
            start_minutes = self.start_time.hour * 60 + self.start_time.minute
            end_minutes = self.end_time.hour * 60 + self.end_time.minute
            return end_minutes - start_minutes
        return 0
    
    def __repr__(self):
        return f"<Reservation(id={self.id}, user_id={self.user_id}, seat_id={self.seat_id}, date={self.reservation_date})>"