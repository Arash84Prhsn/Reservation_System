from flask import Blueprint, request, jsonify, session;
from backend.services.user_services import UserServices


# Create the blueprint that will be registered in app.py
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# ====<ROUTES>====

# the register api, This is what should be called when somebody needs to register a new account
@auth_bp.route('/register', methods=['POST'])
def register():
    data : dict = request.get_json()

    # get information
    username : str = data.get('username')
    password : str = data.get('password')
    email : str = data.get('email')
    phone : str = data.get('phone')
    association : str = data.get('association')

    # Make email lowercase
    if email:
        email = email.lower().strip()
    
    # Make the username lowercase
    if username:
        username = username.lower().strip()

    # check the fields to make sure they are actually entered by the user
    if not username:
        return jsonify({'success' : False, 'message' : 'نام کاربری را وارد نکردید'}), 400
    
    if not password:
        return jsonify({'success' : False, 'message' : 'پسورد را وارد نکردید'}), 400
    
    if not email and not phone:
        return jsonify({'success' : False, 'message' : 'ایمیل یا شماره تلفن همراه باید وارد شود'}), 400
    
    # Make sure the username follows the rules
    validUsername, msg = UserServices.validate_username(username)
    if not validUsername:
        return jsonify({'success' : False, 'message' : msg}), 400
    
    # In the case that the user has decided to provide an email address make sure to validate it
    if email:
        valid = UserServices.validate_email(email)
        if not valid:
            return jsonify({'success' : False,
                            'message' : "Email is not valid. Please enter a valid structure"}), 400
    
    # In the case that the user has provided a phone number make sure it is formatted right.
    if phone:
        valid, phone_msg = UserServices.validate_phone_number(phone)
        if not valid:
            return jsonify({"success" : False,
                            'message' : phone_msg}), 400


    # Check the password to make sure it's secure enough
    pass_is_valid, msg = UserServices.validate_password(password)
    if not pass_is_valid:
        return jsonify({'success' : False, 'message' : msg}), 400
    
    valid, msg = UserServices.username_email_phone_exists(username, email, phone)
    if not valid :
        return jsonify({'success' : False,
                        'message' : msg}), 409
    
    try:
        newUser = UserServices.create_user(
            username=username,
            password=password,
            email=email,
            phone=phone,
            association=association,
        )

        return jsonify({
            'success' : True,
            'message' : 'Registration successful! You can now log in to your new account.',
            'data' : {
                'id' : newUser.id,
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
    
    data : dict = request.get_json()
    
    # Validate input exists
    username : str = data.get('username')
    password : str = data.get('password')

    if username:
        username = username.lower().strip()
    
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
    
    # Update last login
    UserServices.update_last_login(user.id)
    
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
    
# The log out route. This is what should be fethced when the user wants to log ot of their account.
@auth_bp.route('/logout', methods=['POST'])
def logout(): 
    # Firstly check that the user is actually logged in
    if not session.get('logged_in'):
        return jsonify({'success' : False, 'message' : 'You are not logged in'}), 401
    # for logging out simply clear out the current session
    session.clear()
    return jsonify({'success' : True, 'message' : 'Logged out successfully'}), 200

