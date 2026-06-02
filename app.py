from flask import Flask
from flask_cors import CORS
from backend.models import *
from database.connection import get_db_connection
from database.connection import init_db, init_roles
from database.seed import seed_admin_and_manager_users
from database.seed import seed_seats, seed_users, seed_reservations_for_current_week
from database.seed import delete_all_reservations
from backend.routes import blueprints
from backend.services.scheduledTasks import init_scheduler
from backend.admin import init_admin
from backend.admin.views import UserModelView, ReservationModelView, EventModelView, SeatModelView

# initialize the app
app = Flask(__name__, template_folder="backend/templates")

# CORS setup
CORS(app, 
     supports_credentials=True,
     origins=["http://localhost:3000", "http://localhost:5000", "http://127.0.0.1:3000"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     expose_headers=["Content-Type", "Set-Cookie"]
)

# Initialize the admin page settings
admin = init_admin(app=app)

# Set the secret key for the app here
app.secret_key = "c995897f9499dc39986fad92f8e02a28cfb01b4d4aae2a0e53b0cabccd4ba49b"

# register all the blueprints specified in the backend/routes/__init__.py
for bp in blueprints:
    app.register_blueprint(bp)

# Initialize the tables and seed the tables (in case they aren't)
init_db()
init_roles()
seed_admin_and_manager_users()
seed_seats()

# Seed the Mock data. TODO: REMOVE FOR PRODUCTION
seed_users() 
delete_all_reservations() 
seed_reservations_for_current_week() 

# Connect the admin page to the models
db_session = get_db_connection()

# Add views for the tables
admin.add_view(UserModelView(User, db_session, endpoint='admin_user_view', name='Users'))
admin.add_view(SeatModelView(Seat, db_session, endpoint='admin_seat_view', name='Seats'))
admin.add_view(ReservationModelView(Reservation, db_session, endpoint='admin_reservation_view', name='Reservations'))
admin.add_view(EventModelView(Event, db_session, endpoint='admin_event_view', name='Events'))

# Finally init the scheduled tasks
init_scheduler(app=app)

# if this file is run directly then start the backend app
if __name__ == '__main__':
    app.run(debug=True, port=5000)