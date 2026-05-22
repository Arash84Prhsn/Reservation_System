from flask import Flask
from flask_cors import CORS
from database.connection import init_db
from database.seed import seed_seats
from backend.routes import blueprints

# initialize the app
app = Flask(__name__)
CORS(app)
app.secret_key = "c995897f9499dc39986fad92f8e02a28cfb01b4d4aae2a0e53b0cabccd4ba49b"

# register all the blueprints specified in the backend/routes/__init__.py
for bp in blueprints:
    app.register_blueprint(bp)

# Initialize the tables and seed the tables (in case they aren't)
init_db()
seed_seats()

# if this file is run directly then start the backend app
if __name__ == '__main__':
    app.run(debug=True, port=5000)