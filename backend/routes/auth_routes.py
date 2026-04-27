from flask import Blueprint, request, jsonify, session;
from backend.services.user_services import UserService
from database import get_db_session

# Create the blueprint that will be registered in app.py
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# ====<ROUTES>====

# the register api, This is what should be called when somebody needs to register a new account
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # get information
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    phone = data.get('phone')
    association = data.get('association')

    if not email and phone :
        return jsonify({
            'success' : False,
            'message' : 'Either email or phone number is required'
        }), 400
    
    if not username



# The login api. this is what should be called when somebody presses on the login button.
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate input exists
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400
    
    
    user = UserService.get_user_by_username(username)
    
    
    if not user or not UserService.verify_password(password, user.password_hash):
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
    
    # Set session
    session['logged_in'] = True
    session['user_id'] = user.id
    session['username'] = user.username
    session['association'] = user.association
    
    # Update last login
    UserService.update_last_login(user.id)
    
    # Return success
    return jsonify({
        'success': True,
        'message': 'Logged in successfully',
        'data': {
            'username': user.username,
            'association': user.association,
            'email' : user.email,
            'phone' : user.phone
        }
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout(): 
    # for logging out simply clear out the current session
    session.clear()
    return jsonify({'success' : True, 'message' : 'logged out successfully'}), 200

