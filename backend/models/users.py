from sqlalchemy import Column, Integer, String, DateTime, CheckConstraint, Boolean
from sqlalchemy.orm import relationship
from backend.models import DeclarativeBase
from datetime import datetime

class User(DeclarativeBase):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False) # This is the hashed password not the pass itself
    email = Column(String, unique=True, nullable=True)
    phone = Column(String, unique=True, nullable=True)
    association = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    reservations = relationship("Reservation", back_populates="user", cascade="all, delete-orphan")
    events = relationship("Event", back_populates='user')
    
    # Table-level constraints
    __table_args__ = (
        CheckConstraint('email IS NOT NULL OR phone IS NOT NULL', name='check_email_or_phone'),
    )

    def isDotinAssociate(self) :
        """
        A function that checks if the association of the user is `Dotin` related or not.

        :returns: `True` if the association is in the `Dotin` associates list and `False` otherwise.
        """
        dotin_associations = ["Dotin employee",
                              "DataScience competitions",
                              "Dotin associate"]
        
        return self.association in dotin_associations
    
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
    
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"