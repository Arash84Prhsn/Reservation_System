from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
import os

# Database path (matches your existing setup)
DB_PATH = 'database/RESERVATION_DATABASE.db'

# Create engine
engine = create_engine(f'sqlite:///{DB_PATH}', echo=False)

# Create session factory
SessionLocal = sessionmaker(bind=engine)
scopedSession = scoped_session(sessionmaker(bind=engine))

def get_db_connection():
    """Get a database connection"""
    return SessionLocal()

def get_db_scoped_session():
    return scopedSession

def init_db():
    """Create all tables from models (if they don't exist)"""
    from backend.models import DeclarativeBase
    DeclarativeBase.metadata.create_all(engine)
    print("Database initialized from ORM models!")