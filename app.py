from flask import Flask
from flask_cors import CORS
from flask_admin import Admin
from flask_admin.theme import Bootstrap4Theme
from flask_admin.contrib.sqla import ModelView
from backend.models import *
from database.connection import get_db_connection
from database.connection import init_db
from database.seed import seed_seats
from backend.routes import blueprints

# initialize the app
app = Flask(__name__)
CORS(app)
admin = Admin(app, name="Reservation service administration", theme=Bootstrap4Theme(swatch="sandstone"))
app.secret_key = "c995897f9499dc39986fad92f8e02a28cfb01b4d4aae2a0e53b0cabccd4ba49b"

# register all the blueprints specified in the backend/routes/__init__.py
for bp in blueprints:
    app.register_blueprint(bp)

# Initialize the tables and seed the tables (in case they aren't)
init_db()
seed_seats()

# Connect the admin page to the models
db_session = get_db_connection()
admin.add_view(ModelView(User, db_session, endpoint='admin_user_view', name='Users'))
admin.add_view(ModelView(Seat, db_session, endpoint='admin_seat_view', name='Seats'))
admin.add_view(ModelView(Reservation, db_session, endpoint='admin_reservation_view', name='Reservations'))
admin.add_view(ModelView(Event, db_session, endpoint='admin_event_view', name='Events'))

# if this file is run directly then start the backend app
if __name__ == '__main__':
    app.run(debug=True, port=5000)