from sqlalchemy import Column, Integer, String, Date, Time, CheckConstraint, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.models import DeclarativeBase
from datetime import datetime

class Event(DeclarativeBase):
    __tablename__ = 'events'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(String, default="active") # active, cancelled, over
    created_at = Column(DateTime, default=datetime.now)
    cancelled_at = Column(DateTime, nullable=True)
    

    # Relationships
    user = relationship("User", back_populates="events")

    # Tabel constraints
    __table_args__ = (
        CheckConstraint('start_time < end_time', name='check_start_before_end'),
        CheckConstraint("time(start_time) >= '08:00' AND time(end_time) <= '14:00'", name='check_time_window')
    )

    def to_dict(self):
        """Gives a dict containing all the information of the class object """
        return {
            'id' : self.id,
            'user_id' : self.user_id,
            'date' : self.date.isoformat(),
            'start_time' : self.start_time.isoformat(),
            'end_time' : self.end_time.isoformat(),
            'status' : self.status,
            'created_at' : self.created_at.isoformat(),
            'cancelled_at' : self.cancelled_at.isoformat() if self.cancelled_at else None
        }
    
    def cancel(self):
        """Cancels the event"""
        self.status = "cancelled"
        self.cancelled_at = datetime.now()

    def is_cancellable(self):
        """Checks to see if it is not too late to cancel the event"""

        now = datetime.now()
        event_datetime = datetime.combine(
            self.date,
            self.start_time
        )

        return now < event_datetime and self.status == "active"
    
    def end_event(self):
        """Ends the event and sets the status to 'over'"""
        self.status = 'over'