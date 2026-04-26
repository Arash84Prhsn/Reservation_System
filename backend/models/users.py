from sqlalchemy import Column, Integer, String, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from backend.models import Base
from datetime import datetime

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=True)
    phone = Column(String, unique=True, nullable=True)
    association = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    reservations = relationship("Reservation", back_populates="user", cascade="all, delete-orphan")
    
    # Table-level constraints
    __table_args__ = (
        CheckConstraint('email IS NOT NULL OR phone IS NOT NULL', name='check_email_or_phone'),
    )
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'phone': self.phone,
            'association': self.association,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    def get_reservation_limit(self):
        """Get max reservations per day based on association"""
        limits = {
            None: 1,
            'A': 1,
            'B': 2,
            'C': 3
        }
        return limits.get(self.association, 1)
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"