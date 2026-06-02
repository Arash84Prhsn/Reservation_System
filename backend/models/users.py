from sqlalchemy import Column, Integer, String, DateTime, CheckConstraint, Boolean, ForeignKey
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
    role_id = Column(Integer, ForeignKey('roles.id'), nullable=False, default=3) # 3 is the user role
    created_at = Column(DateTime, default=datetime.now)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    reservations = relationship("Reservation", back_populates="user", cascade="all, delete-orphan")
    events = relationship("Event", back_populates='user')
    role = relationship("Role", back_populates="users")
    
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
    
     # ============ ROLE METHODS ============
    
    def has_role(self, role_name):
        """Check if user has a specific role by role_id"""
        # Map role_id to role names (you could cache this)
        role_map = {
            1: 'admin',
            2: 'event_manager', 
            3: 'user'
        }
        role = role_map.get(self.role_id)
        return role == role_name
    
    def is_admin_role(self):
        """Check if user is an admin"""
        return self.has_role('admin')
    
    def is_event_manager_role(self):
        """Check if user is an event manager"""
        return self.has_role('event_manager')
    
    def is_user_role(self):
        """Check if user is a regular user"""
        return self.has_role('user')
    
    
    def __repr__(self):
        return f"""user_id={self.id}\n
        username='{self.username}'
        association='{self.association}'
        is_dotin='{self.isDotinAssociate()}'
        """