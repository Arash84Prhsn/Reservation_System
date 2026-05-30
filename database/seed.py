from database.connection import get_db_connection
from backend.models.seats import Seat
from backend.models.users import User
from backend.services.user_services import UserServices

def seed_seats():
    """Insert the 10 seats into the database if they don't exist"""
    conn = get_db_connection()
    
    # Check if seats already exist
    if conn.query(Seat).count() == 0:
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
            conn.add(seat)
        
        conn.commit()
        print(f"Seeded {len(seats)} seats successfully!")
    else:
        print(f"Seats already exist ({conn.query(Seat).count()} seats found), skipping seed.")
    
    conn.close()

def seed_users():
    """Insert 5 test users into the database if they don't exist"""
    conn = get_db_connection()
    
    # Check if users already exist
    if conn.query(User).count() == 0:
        users = [
            # (username, password, email, phone, association)
            ('alireza_ahmadi', 'UserPass123', 'alireza@example.com', None, 'Master\'s student'),
            ('sara_mohammadi', 'UserPass123', 'sara@example.com', None, 'PhD student'),
            ('mehdi_karimi', 'UserPass123', None, '09123456789', 'Dotin employee'),
            ('narges_hosseini', 'UserPass123', 'narges@example.com', None, 'Bachelor student'),
            ('amir_rezaei', 'UserPass123', None, '09198765432', 'Related Company')
        ]
        
        for username, password, email, phone, association in users:
            # Hash the password
            password_hash = UserServices.hash_password(password)
            
            # Create user
            new_user = User(
                username=username,
                password_hash=password_hash,
                email=email,
                phone=phone,
                association=association
            )
            conn.add(new_user)
        
        conn.commit()
        print(f"Seeded {len(users)} users successfully!")
    else:
        print(f"Users already exist ({conn.query(User).count()} users found), skipping seed.")
    
    conn.close()