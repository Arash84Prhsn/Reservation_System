from flask import Flask
from flask_cors import CORS
from database.connection import init_db
from database.seed import seed_seats
from backend.routes import blueprints

# initialize the app
app = Flask(__name__)
CORS(app)
app.secret_key = "The-Emperor-Protects"

# register all the blueprints specified in the backend/routes/__init__.py
for bp in blueprints:
    app.register_blueprint(bp);

# Initialize database when app starts
init_db()
seed_seats()

if __name__ == '__main__':
    print("Starting Reservation System...")
    app.run(debug=True, port=5000)