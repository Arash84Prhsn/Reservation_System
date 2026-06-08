from flask import Flask, send_from_directory, redirect, url_for, request, session
from flask_cors import CORS
from backend.models import *
from database.connection import init_db, init_roles
from database.seed import seed_admin_and_manager_users
from database.seed import seed_seats, seed_users, seed_reservations_for_current_week, seed_events_for_current_week
from database.seed import delete_all_reservations, delete_all_events
from backend.routes import blueprints
from backend.services.scheduledTasks import init_scheduler
from backend.admin import init_admin
from datetime import timedelta, datetime, timezone

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

# Session Settings:
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=12)
app.config["SESSION_PERMANENT"] = True

IDLE_TIMEOUT = timedelta(minutes=30)

@app.before_request
def enforce_idle_timeout():
    if not session.get("logged_in"):
        return

    last_activity = session.get("last_activity")

    now = datetime.now(timezone.utc)

    # If no timestamp exists → set it
    if not last_activity:
        session["last_activity"] = now.isoformat()
        return

    try:
        last_time = datetime.fromisoformat(last_activity)
    except Exception:
        session["last_activity"] = now.isoformat()
        return

    # Check inactivity
    if now - last_time > IDLE_TIMEOUT:
        session.clear()
        return redirect(url_for("admin_auth.login"))

    # update activity timestamp
    session["last_activity"] = now.isoformat()

# Initialize the admin page settings
@app.route('/static/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('backend/static/css', filename)

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
delete_all_events()
seed_events_for_current_week()

# Finally init the scheduled tasks
init_scheduler(app=app)

# if this file is run directly then start the backend app
if __name__ == '__main__':
    app.run(debug=True, port=5000)