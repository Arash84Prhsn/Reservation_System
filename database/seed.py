from database.connection import get_db_connection
from backend.models.seats import Seat
from backend.models.users import User
from backend.models.roles import Role
from backend.services.user_services import UserServices
from sqlalchemy import text


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

def seed_admin_and_manager_users():
    """Seed admin and event manager users into the database"""
    from backend.models.users import User
    from backend.models.roles import Role
    from backend.services.user_services import UserServices
    
    conn = get_db_connection()
    
    # Get role IDs
    admin_role = conn.query(Role).filter_by(name='admin').first()
    event_manager_role = conn.query(Role).filter_by(name='event_manager').first()
    user_role = conn.query(Role).filter_by(name='user').first()
    
    if not admin_role or not event_manager_role or not user_role:
        print("Roles not found! Run init_roles() first.")
        conn.close()
        return
    
    # Define admin and manager users
    special_users = [
        ('admin_arash', 'Arash1212', 'poorhasaniArash@gmail.com', None, "bachelor student", admin_role),
        ('admin_amin', 'AdminPass123', 'admin2@example.com', None, "bachelor student", admin_role),
        ('rezvan najib', 'UserPass123', 'manager@example.com', None, "dotin associate", admin_role),
    ]
    
    created_count = 0
    updated_count = 0
    skipped_count = 0
    
    for username, password, email, phone, association, role in special_users:
        # Check if user already exists by username OR email
        existing_user = conn.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            if existing_user.username == username:
                # User exists by username, check if role needs update
                if existing_user.role_id != role.id:
                    existing_user.role_id = role.id
                    print(f"Updated role for existing user: {username} -> {role.name}")
                    updated_count += 1
                else:
                    print(f"User already exists with correct role: {username}")
                    skipped_count += 1
            else:
                # Email conflict - different username but same email
                print(f"Email '{email}' already used by user '{existing_user.username}', skipping...")
                skipped_count += 1
        else:
            # Create new user
            password_hash = UserServices.hash_password(password)
            new_user = User(
                username=username,
                password_hash=password_hash,
                email=email,
                phone=phone,
                association=association,
                role=role
            )
            conn.add(new_user)
            print(f"Created new user: {username} ({role.name})")
            created_count += 1
    
    conn.commit()
    conn.close()
    
    print(f"\n=== Special Users Summary ===")
    print(f"Created: {created_count} new users")
    print(f"Updated: {updated_count} existing users")
    print(f"Skipped: {skipped_count} existing users")

def seed_users():
    """Insert 5 test users into the database if they don't exist"""
    conn = get_db_connection()
    
    # Check if users already exist
    if conn.query(User).count() < 10:
        users = [
            # Original 5 users
            ('alireza_ahmadi', 'UserPass123', 'alireza@example.com', None, 'Master\'s student'),
            ('sara_mohammadi', 'UserPass123', 'sara@example.com', None, 'PhD student'),
            ('mehdi_karimi', 'UserPass123', None, '09123456789', 'Dotin employee'),
            ('narges_hosseini', 'UserPass123', 'narges@example.com', None, 'Bachelor student'),
            ('amir_rezaei', 'UserPass123', None, '09198765432', 'Related Company'),
            
            # New 10 users (Persian names with spaces)
            ('محمد رضایی', 'UserPass123', 'mohammad@example.com', None, 'Bachelor student'),
            ('زهرا کریمی', 'UserPass123', 'zahra@example.com', None, 'Master\'s student'),
            ('علی محمدی', 'UserPass123', None, '09351234567', 'Dotin employee'),
            ('فاطمه حسینی', 'UserPass123', 'fatemeh@example.com', None, 'PhD student'),
            ('رضا احمدی', 'UserPass123', None, '09361234567', 'Related Company'),
            ('مریم کاظمی', 'UserPass123', 'maryam@example.com', None, 'Bachelor student'),
            ('حسین رستمی', 'UserPass123', None, '09371234567', 'Dotin associate'),
            ('سارا موسوی', 'UserPass123', 'sara_mousavi@example.com', None, 'Master\'s student'),
            ('امیرعباس نوروزی', 'UserPass123', None, '09381234567', 'Data science competitions'),
            ('نگار مظلومی', 'UserPass123', 'negar@example.com', None, 'Bachelor student'),
        ]
        
        for username, password, email, phone, association in users:
            # Hash the password
            password_hash = UserServices.hash_password(password)
            association = association.lower().strip()
            
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

    #=============================<SEEDING RESERVATIONS>============================================

from datetime import datetime, date, time, timedelta
from backend.models.reservations import Reservation
from backend.services.seat_services import SeatServices
from backend.services.reservation_services import ReservationServices

def delete_all_reservations():
    with get_db_connection() as conn:
        stmnt = text("DELETE FROM reservations")
        conn.execute(stmnt)
        conn.commit()

def seed_reservations_for_current_week():
    """Insert test reservations for the seeded users for the current week if no reservations exist"""
    conn = get_db_connection()
    
    # Check if any reservations already exist for current week
    today = date.today()
    current_week_start = ReservationServices.get_week_start_date(today)
    current_week_end = current_week_start + timedelta(days=4)  # Wednesday
    
    existing_count = conn.query(Reservation).filter(
        Reservation.reservation_date >= current_week_start,
        Reservation.reservation_date <= current_week_end
    ).count()
    
    if existing_count > 3:
        print(f"Reservations already exist for current week ({existing_count} found), skipping seed.")
        conn.close()
        return
    
    # Define reservations for each test user
    # Each reservation: (username, seat_type, seat_number, reservation_date_offset, start_time, end_time, reservation_type)
    reservations = [
        # alireza_ahmadi (Master's student)
        ('alireza_ahmadi', 'dotin', 1, 0, '09:00', '10:00', 'internship'),
        ('alireza_ahmadi', 'optimization', 1, 1, '11:00', '12:00', 'project'),
        ('alireza_ahmadi', 'laptop', 1, 2, '08:00', '09:00', 'internship'),
        ('alireza_ahmadi', 'dotin', 2, 3, '13:00', '14:00', 'project'),
        
        # sara_mohammadi (PhD student) - 4 reservations
        ('sara_mohammadi', 'dotin', 2, 0, '08:00', '09:00', 'internship'),
        ('sara_mohammadi', 'laptop', 1, 1, '13:00', '14:00', 'project'),
        ('sara_mohammadi', 'optimization', 2, 2, '09:00', '10:00', 'internship'),
        ('sara_mohammadi', 'dotin', 3, 3, '10:00', '11:00', 'project'),
        
        # mehdi_karimi (Dotin employee) - 4 reservations
        ('mehdi_karimi', 'dotin', 3, 0, '10:00', '11:30', 'project'),
        ('mehdi_karimi', 'optimization', 2, 1, '08:00', '09:30', 'dorsan desk'),
        ('mehdi_karimi', 'dotin', 4, 2, '12:00', '13:00', 'internship'),
        ('mehdi_karimi', 'laptop', 2, 3, '12:00', '14:00', 'project'),
        
        # narges_hosseini (Bachelor student) - 4 reservations
        ('narges_hosseini', 'laptop', 2, 0, '10:00', '11:00', 'project'),
        ('narges_hosseini', 'dotin', 1, 1, '13:45', '14:00', 'internship'),
        ('narges_hosseini', 'optimization', 1, 2, '08:00', '09:00', 'project'),
        ('narges_hosseini', 'laptop', 3, 3, '11:00', '12:00', 'internship'),
        
        # amir_rezaei (Related Company) - 4 reservations
        ('amir_rezaei', 'optimization', 1, 0, '13:00', '14:00', 'internship'),
        ('amir_rezaei', 'laptop', 3, 1, '09:00', '10:30', 'project'),
        ('amir_rezaei', 'dotin', 4, 2, '08:00', '09:00', 'internship'),
        ('amir_rezaei', 'optimization', 2, 3, '12:00', '13:00', 'project'),
        
        ('محمد رضایی', 'laptop', 1, 0, '08:00', '09:00', 'internship'),
        ('محمد رضایی', 'dotin', 1, 1, '10:00', '11:00', 'project'),
        ('محمد رضایی', 'optimization', 1, 2, '13:00', '14:00', 'internship'),
        ('محمد رضایی', 'laptop', 2, 3, '09:00', '10:00', 'project'),
        
        # زهرا کریمی (Master's student)
        ('زهرا کریمی', 'dotin', 2, 0, '11:00', '12:00', 'project'),
        ('زهرا کریمی', 'laptop', 2, 1, '08:00', '09:00', 'internship'),
        ('زهرا کریمی', 'optimization', 2, 2, '10:00', '11:00', 'project'),
        ('زهرا کریمی', 'dotin', 3, 3, '13:00', '14:00', 'internship'),
        
        # علی محمدی (Dotin employee)
        ('علی محمدی', 'dotin', 4, 0, '09:00', '10:00', 'dorsan desk'),
        ('علی محمدی', 'optimization', 1, 1, '11:00', '12:00', 'internship'),
        ('علی محمدی', 'dotin', 1, 2, '13:00', '14:00', 'project'),
        ('علی محمدی', 'laptop', 1, 3, '08:00', '09:00', 'dorsan desk'),
        
        # فاطمه حسینی (PhD student)
        ('فاطمه حسینی', 'dotin', 2, 0, '12:00', '13:00', 'project'),
        ('فاطمه حسینی', 'optimization', 2, 1, '09:00', '10:00', 'internship'),
        ('فاطمه حسینی', 'dotin', 3, 2, '08:00', '09:00', 'project'),
        ('فاطمه حسینی', 'laptop', 2, 3, '11:00', '12:00', 'internship'),
        
        # رضا احمدی (Related Company)
        ('رضا احمدی', 'optimization', 1, 0, '10:00', '11:00', 'project'),
        ('رضا احمدی', 'laptop', 3, 1, '13:00', '14:00', 'internship'),
        ('رضا احمدی', 'dotin', 4, 2, '09:00', '10:00', 'project'),
        ('رضا احمدی', 'optimization', 2, 3, '08:00', '09:00', 'internship'),
        
        # مریم کاظمی (Bachelor student)
        ('مریم کاظمی', 'laptop', 1, 0, '13:00', '14:00', 'internship'),
        ('مریم کاظمی', 'dotin', 1, 1, '08:00', '09:00', 'project'),
        ('مریم کاظمی', 'laptop', 2, 2, '10:00', '11:00', 'internship'),
        ('مریم کاظمی', 'optimization', 1, 3, '12:00', '13:00', 'project'),
        
        # حسین رستمی (Dotin associate)
        ('حسین رستمی', 'dotin', 2, 0, '08:00', '09:00', 'internship'),
        ('حسین رستمی', 'optimization', 1, 1, '10:00', '11:00', 'project'),
        ('حسین رستمی', 'dotin', 3, 2, '12:00', '13:00', 'dorsan desk'),
        ('حسین رستمی', 'laptop', 1, 3, '13:45', '14:00', 'project'),
        
        # سارا موسوی (Master's student)
        ('سارا موسوی', 'laptop', 2, 0, '09:00', '10:00', 'project'),
        ('سارا موسوی', 'dotin', 4, 1, '11:00', '12:00', 'internship'),
        ('سارا موسوی', 'optimization', 2, 2, '13:00', '14:00', 'project'),
        ('سارا موسوی', 'laptop', 3, 3, '08:00', '09:00', 'internship'),
        
        # امیرعباس نوروزی (Data science competitions)
        ('امیرعباس نوروزی', 'dotin', 1, 0, '10:00', '11:00', 'project'),
        ('امیرعباس نوروزی', 'laptop', 1, 1, '12:00', '13:00', 'dorsan desk'),
        ('امیرعباس نوروزی', 'dotin', 2, 2, '08:00', '09:00', 'internship'),
        ('امیرعباس نوروزی', 'optimization', 1, 3, '13:00', '14:00', 'project'),
        
        # نگار مظلومی (Bachelor student)
        ('نگار مظلومی', 'laptop', 3, 0, '11:00', '12:00', 'project'),
        ('نگار مظلومی', 'dotin', 3, 1, '09:00', '10:00', 'internship'),
        ('نگار مظلومی', 'laptop', 2, 2, '13:00', '14:00', 'project'),
        ('نگار مظلومی', 'optimization', 1, 3, '10:00', '11:00', 'internship'),
    ]
    
    
    # Get user mapping
    users = conn.query(User).all()
    user_map = {user.username: user for user in users}
    
    # Get current week start date
    week_start = ReservationServices.get_week_start_date(today)
    
    created_count = 0
    skipped_count = 0
    
    for username, seat_type, seat_number, day_offset, start_time_str, end_time_str, res_type in reservations:
        # Check if user exists
        if username not in user_map:
            print(f"User '{username}' not found, skipping...")
            skipped_count += 1
            continue
        
        user = user_map[username]
        
        # Calculate reservation date
        reservation_date = week_start + timedelta(days=day_offset)
        
        # # Skip if date is in the past
        # if reservation_date < today:
        #     print(f"Skipping {username}'s reservation on {reservation_date} (already passed)")
        #     skipped_count += 1
        #     continue
        
        # Get seat ID
        seat_id = SeatServices.get_seat_id_by_type_number(seat_type, seat_number)
        if not seat_id:
            print(f"Seat '{seat_type} {seat_number}' not found, skipping...")
            skipped_count += 1
            continue
        
        # Parse times
        start_time = time.fromisoformat(start_time_str).replace(microsecond=0)
        end_time = time.fromisoformat(end_time_str).replace(microsecond=0)
        
        # Special handling for end_time 14:00 (which is 14:00:00)
        if end_time_str == '14:00':
            end_time = time(14, 0, 0)
        
        # Check if reservation already exists for this seat at this time
        existing = conn.query(Reservation).filter(
            Reservation.seat_id == seat_id,
            Reservation.reservation_date == reservation_date,
            Reservation.start_time == start_time,
            Reservation.status == 'active'
        ).first()
        
        if existing:
            print(f"Reservation already exists for {username} on {reservation_date} at {start_time_str}, skipping...")
            skipped_count += 1
            continue
        
        # Create reservation
        new_reservation = Reservation(
            user_id=user.id,
            seat_id=seat_id,
            reservation_date=reservation_date,
            start_time=start_time,
            end_time=end_time,
            reservation_type=res_type,
            status='active'
        )
        conn.add(new_reservation)
        created_count += 1
    
    conn.commit()
    conn.close()
    
    print(f"Seeded {created_count} reservations for current week ({skipped_count} skipped)")



# Event seeding
def seed_events_for_current_week():
    """Insert one event per day for the current week (Saturday to Wednesday)"""
    from backend.models.events import Event
    
    conn = get_db_connection()
    
    today = date.today()
    current_week_start = ReservationServices.get_week_start_date(today)
    
    # Get admin user (first user or create a system user)
    admin_user = conn.query(User).where(User.username == "rezvan najib").first()
    if not admin_user:
        print("No users found, cannot create events")
        conn.close()
        return
    
    # Check if events already exist for current week
    # week_end = current_week_start + timedelta(days=4)
    # existing_count = conn.query(Event).filter(
    #     Event.date >= current_week_start,
    #     Event.date <= week_end
    # ).count()
    
    # if existing_count > 0:
    #     print(f"Events already exist for current week ({existing_count} found), skipping seed.")
    #     conn.close()
    #     return
    

    # Events: (day_offset, start_time, end_time, description in notes)
    events = [
        (0, '10:00:00', '12:00:00'),   # Saturday
        (1, '08:00:00', '08:30:00'),   # Sunday (end of day)
        (2, '09:00:00', '10:30:00'),   # Monday
        (3, '11:00:00', '12:00:00'),   # Tuesday
        (4, '13:00:00', '14:00:00'),   # Wednesday
    ]
    
    created_count = 0
    
    for day_offset, start_time_str, end_time_str in events:
        event_date = current_week_start + timedelta(days=day_offset)
        
        # Skip if date is in the past (optional - uncomment if you want to skip)
        # if event_date < today:
        #     print(f"Skipping event on {event_date} (already passed)")
        #     continue
        
        start_time = time.fromisoformat(start_time_str).replace(microsecond=0)
        end_time = time.fromisoformat(end_time_str).replace(microsecond=0)
        
        # Check if event already exists for this date
        existing = conn.query(Event).filter(
            Event.date == event_date
        ).first()
        
        if existing:
            print(f"Event already exists on {event_date}, skipping...")
            continue
        
        new_event = Event(
            user_id=admin_user.id,
            date=event_date,
            start_time=start_time,
            end_time=end_time,
            status='active'
        )
        conn.add(new_event)
        created_count += 1
    
    conn.commit()
    conn.close()
    
    print(f"Seeded {created_count} events for current week")

def delete_all_events():
    with get_db_connection() as conn:
        stmnt = text("DELETE FROM events")
        conn.execute(stmnt)
        conn.commit()
        print("DELETED ALL FROM EVENTS")
        