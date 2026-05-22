from database.connection import get_db_connection
from backend.models.seats import Seat

def seed_seats():
    """Insert the 10 seats into the database if they don't exist"""
    session = get_db_connection()
    
    # Check if seats already exist
    if session.query(Seat).count() == 0:
        seats = [
            Seat(id=1, seat_type='manager', seat_number=1, is_reservable=False),
            Seat(id=2, seat_type='dotin', seat_number=1, is_reservable=True),
            Seat(id=3, seat_type='dotin', seat_number=2, is_reservable=True),
            Seat(id=4, seat_type='dotin', seat_number=3, is_reservable=True),
            Seat(id=5, seat_type='dotin', seat_number=4, is_reservable=True),
            Seat(id=6, seat_type='optimization', seat_number=1, is_reservable=True),
            Seat(id=7, seat_type='optimization', seat_number=2, is_reservable=True),
            Seat(id=8, seat_type='laptop', seat_number=1, is_reservable=True),
            Seat(id=9, seat_type='laptop', seat_number=2, is_reservable=True),
            Seat(id=10, seat_type='laptop', seat_number=3, is_reservable=True)
        ]
        
        for seat in seats:
            session.add(seat)
        
        session.commit()
        print(f"Seeded {len(seats)} seats successfully!")
    else:
        print(f"Seats already exist ({session.query(Seat).count()} seats found), skipping seed.")
    
    session.close();