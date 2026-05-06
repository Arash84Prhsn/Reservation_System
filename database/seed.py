from database.connection import get_db_session
from backend.models.seats import Seat

def seed_seats():
    """Insert the 10 seats into the database if they don't exist"""
    session = get_db_session()
    
    # Check if seats already exist
    if session.query(Seat).count() == 0:
        seats = [
            Seat(id=1, seat_type='manager', is_reservable=False),
            Seat(id=2, seat_type='optimization', is_reservable=True),
            Seat(id=3, seat_type='optimization', is_reservable=True),
            Seat(id=4, seat_type='laptop', is_reservable=True),
            Seat(id=5, seat_type='laptop', is_reservable=True),
            Seat(id=6, seat_type='laptop', is_reservable=True),
            Seat(id=7, seat_type='dotin', is_reservable=True),
            Seat(id=8, seat_type='dotin', is_reservable=True),
            Seat(id=9, seat_type='dotin', is_reservable=True),
            Seat(id=10, seat_type='dotin', is_reservable=True)
        ]
        
        for seat in seats:
            session.add(seat)
        
        session.commit()
        print(f"Seeded {len(seats)} seats successfully!")
    else:
        print(f"Seats already exist ({session.query(Seat).count()} seats found), skipping seed.")
    
    session.close();