from flask import Flask
from database.connection import init_db

app = Flask(__name__)

# Initialize database when app starts
init_db()

@app.route('/')
def home():
    return "<h1>Reservation System is running!</h1>"

if __name__ == '__main__':
    print("Starting Reservation System...")
    app.run(debug=True, port=5000)