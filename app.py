from flask import Flask, render_template, jsonify
from backend.routes.auth_routes import auth

app = Flask(__name__, static_folder='static', template_folder='/frontend/templates');
app.register_blueprint(auth, url_prefix = "auth");

# Serve your main HTML page
@app.route("/")
def index():
    return render_template("index.html")


# API endpoints
@app.route("/api/message")
def get_users():
    return jsonify({"message": "Hello World!"})

if __name__ == "__main__":
    app.run(port=5000)