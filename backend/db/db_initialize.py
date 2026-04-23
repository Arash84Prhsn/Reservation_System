import sqlite3
import os

# Database path
DB_PATH = 'database/app.db'

def get_connection():
    """Get a database connection"""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_tables():
    """Create all tables if they don't exist"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT UNIQUE,
            association TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            CHECK (email IS NOT NULL OR phone IS NOT NULL)
        )
    ''')
    
    # Seats table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS seats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            seat_number INTEGER UNIQUE NOT NULL,
            seat_type TEXT NOT NULL,
            is_reservable BOOLEAN DEFAULT 1
        )
    ''')
    
    # Reservations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            seat_id INTEGER NOT NULL,
            reservation_date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            cancelled_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (seat_id) REFERENCES seats(id),
            CHECK (start_time < end_time),
            CHECK (time(start_time) >= '08:00' AND time(end_time) <= '14:00')
        )
    ''')
    
    # Indexes for faster queries
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_reservations_user_date ON reservations(user_id, reservation_date)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_reservations_seat_date_time ON reservations(seat_id, reservation_date, start_time)')
    
    conn.commit()
    conn.close()
    print("Tables created successfully!")

def seed_seats():
    """Insert the 10 seats into the database"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if seats already exist
    cursor.execute('SELECT COUNT(*) FROM seats')
    count = cursor.fetchone()[0]
    
    if count == 0:
        seats = [
            (1, 'manager', 0),
            (2, 'optimization', 1),
            (3, 'optimization', 1),
            (4, 'byol', 1),
            (5, 'byol', 1),
            (6, 'byol', 1),
            (7, 'normal', 1),
            (8, 'normal', 1),
            (9, 'normal', 1),
            (10, 'normal', 1)
        ]
        
        cursor.executemany('''
            INSERT INTO seats (seat_number, seat_type, is_reservable)
            VALUES (?, ?, ?)
        ''', seats)
        
        conn.commit()
        print(f"Seeded {len(seats)} seats successfully!")
    else:
        print(f"Seats already exist ({count} seats found), skipping seed.")
    
    conn.close()

def create_app_db():
    """Create the app.db file if it doesn't exist"""
    conn = get_connection()
    conn.close()
    print(f"app.db created at {DB_PATH}")

# Initialize everything when this file is run directly
if __name__ == "__main__":
    create_app_db()
    init_tables()
    seed_seats()
    print("\nDatabase setup complete!")