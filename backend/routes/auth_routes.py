from flask import Blueprint, request, jsonify, session;
from backend.services.user_services import UserServices
from email_validator import validate_email

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
    dotinRelation = data.get('dotin_relation')

    # check the fields to make sure they are actually entered by the user
    if not username:
        return jsonify({'success' : False, 'message' : 'username required'}), 400
    
    if not password:
        return jsonify({'success' : False, 'message' : 'password required'}), 400
    
    if not email and not phone:
        return jsonify({'success' : False, 'message' : 'email or phone number is needed'}), 400
    
    if association and association == "Dotin" and not dotinRelation:
        return jsonify({'success' : False,
                        'message' : "Relationship with Dotin must be specified"}), 400
    
    # Make sure the username follows the rules
    validUsername, msg = UserServices.validate_username(username)
    if not validUsername:
        return jsonify({'success' : False, 'message' : msg}), 400
    
    # In the case that the user has decided to provide an email address make sure to validate it
    if email:
        valid = validate_email(email)
        if not valid:
            return jsonify({'success' : False,
                            'message' : "Email is not valid. Please enter a valid structure"}), 400
        
    if phone:
        valid, phone_msg = UserServices.validate_phone_number(phone)
        if not valid:
            return jsonify({"success" : False,
                            'message' : phone_msg}), 400


    # Check the password to make sure it's secure enough
    is_valid, msg = UserServices.validate_password(password)
    if not is_valid:
        return jsonify({'success' : False, 'message' : msg}), 400
    
    if UserServices.username_exists(username):
        return jsonify({'success' : False, 'message' : "Username already exists"}), 409
    
    if email and UserServices.email_exists(email):
        return jsonify({'success' : False, 'message' : "Email already exists"}), 409
    
    if phone and UserServices.phone_exists(phone):
        return jsonify({'success' : False, 'message' : "Phone number already exists"}), 409
    
    try:
        newUser = UserServices.create_user(
            username=username,
            password=password,
            email=email,
            phone=phone,
            association=association,
            dotin_relation=dotinRelation
        )

        return jsonify({
            'success' : True,
            'message' : 'Registration successful! You can now log in to your new account.',
            'data' : {
                'username' : newUser.username,
                'association' : newUser.association,
                'email' : email,
                'phone' : phone
            }
        }), 201
    
    except Exception as e:
        return jsonify({'success' : False, 'message' : str(e)}), 500


# The login api. this is what should be called when somebody presses on the login button.
@auth_bp.route('/login', methods=['POST'])
def login():
    
    data = request.get_json()
    
    # Validate input exists
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400
    
    user = UserServices.get_user_byUsername(username)
    
    if not user or not UserServices.verify_password(password, user.password_hash):
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
    
    # Set session
    session['logged_in'] = True
    session['user_id'] = user.id
    session['username'] = user.username
    session['email'] = user.email
    session['phone'] = user.phone
    session['association'] = user.association
    session['dotin_relation'] = user.dotin_relation
    
    # Update last login
    UserServices.update_last_login(user.id)
    
    # Return success
    return jsonify({
        'success': True,
        'message': 'Logged in successfully',
        'data': {
            'username': user.username,
            'association': user.association,
            'dotin_relation' : user.dotin_relation,
            'email' : user.email,
            'phone' : user.phone
        }
    }), 200
    
# The log out route. This is what should be fethced when the user wants to log ot of their account.
@auth_bp.route('/logout', methods=['POST'])
def logout(): 
    # Firstly check that the user is actually logged in
    if not session.get('logged_in'):
        return jsonify({'success' : False, 'message' : 'You are not logged in'}), 401
    # for logging out simply clear out the current session
    session.clear()
    return jsonify({'success' : True, 'message' : 'Logged out successfully'}), 200

