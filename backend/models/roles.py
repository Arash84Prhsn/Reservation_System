from sqlalchemy import Column, Integer, String, DateTime, CheckConstraint, Boolean, Text
from sqlalchemy.orm import relationship
from backend.models import DeclarativeBase
from datetime import datetime


class Role(DeclarativeBase):
    __table_name__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.now)