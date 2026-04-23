from flask import Flask, render_template, jsonify, request, session, flash, Blueprint;

auth = Blueprint("auth", __name__, template_folder="../../frontend/templates")

@auth.route("/signup", methods = ['POST'])
def signup():
    if request.method == "POST":
        data = request.get_json();

@auth.route("/login", methods = ['POST'])
def login():
    if request.method == 'POST' :
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        

@auth.route("/logout", methods = ['POST'])
def logout():
    session.clear()
    return jsonify({"message" : "You have logged out successfully"}), 200








