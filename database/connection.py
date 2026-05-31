from sqlalchemy import create_engine, text
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

def init_roles():
    """Create default roles if they don't exist"""
    from database import get_db_connection
    
    conn = get_db_connection()
    
    default_roles = [
        ('admin', 'Full system access, can manage users, events, and all reservations'),
        ('event_manager', 'Can create, edit, and delete events'),
        ('user', 'Regular user with standard reservation privileges'),
    ]
    
    created_count = 0
    for role_name, description in default_roles:
        existing = conn.execute(text("SELECT * FROM roles WHERE name = :name"), {'name': role_name}).fetchone()
        if not existing:
            conn.execute(
                text("INSERT INTO roles (name, description) VALUES (:name, :description)"),
                {'name': role_name, 'description': description}
            )
            created_count += 1
    
    conn.commit()
    conn.close()
    
    if created_count > 0:
        print(f"Created {created_count} default roles")
    else:
        print("Roles already exist, skipping seed.")