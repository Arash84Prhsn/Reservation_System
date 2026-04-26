from flask import Flask, render_template
from flask_cors import CORS
from database.connection import init_db

app = Flask(__name__)
CORS(app)

# Initialize database when app starts
init_db()

@app.route('/')
def home():
    return "<h1>Reservation System is running!</h1>"

if __name__ == '__main__':
    print("Starting Reservation System...")
    app.run(debug=True, port=5000)