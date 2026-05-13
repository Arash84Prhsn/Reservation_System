from flask import Blueprint, session, jsonify, request
from backend.models import User
from database import get_db_session
from backend.services.user_services import UserServices
from email_validator import validate_email

user_bp = Blueprint('user', __name__, url_prefix='/api/user')

@user_bp.route('/is_logged_in', methods=['GET'])
def is_logged_in():
    if not session.get('logged_in'):
        return jsonify({'success' : True, 'authenticated' : False}), 200
    
    return jsonify({'success' : True, 'authenticated' : True}), 200

@user_bp.route('/id', methods=['GET'])
def get_id():
    # Gives the ID of the currently logged in user. raises error if user is not logged in
    if not session.get('logged_in'):
        return jsonify({'success' : False,
                        'message' : "User is not logged in"}), 401
    
    return jsonify({'success' : True,
                    'id' : session.get('user_id')}), 200

@user_bp.route('/session_info', methods=['GET'])
def get_session_info():
    # Returns the current session as a json if a user is logged in, else raises 401
    if not session.get('logged_in'):
        return jsonify({'success' : False,
                        'message' : "Session is empty"}), 401
    
    session_data = {
        'logged_in': session.get('logged_in'),
        'user_id': session.get('user_id'),
        'username': session.get('username'),
        'email': session.get('email'),
        'phone': session.get('phone'),
        'association': session.get('association'),
        'dotin_relation': session.get('dotin_relation')}
    
    return jsonify(session_data)

@user_bp.route('/profile', methods=['GET'])
def get_user_profile():
    # Returns the information of the currently logged in user, raises 401 if user is not logged in
    # First check that a session is active
    if not session.get('logged_in'):
        return jsonify({'success' : False,
                        'message' : 'User is not logged in'}), 401
    
    # Now that the user is logged in retrive him by ID and then return his information.
    userID = session.get('user_id')
    user = UserServices.get_user_byID(userID)
    
    # if somehow the user does not exist
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    return jsonify({'success' : True,
                    'data' : {
                        'username' : user.username,
                        'id' : user.id,
                        'email' : user.email,
                        'phone' : user.phone,
                        'association' : user.association,
                        'dotin_relation' : user.dotin_relation}}), 200

@user_bp.route('/profile/<int:id>', methods=['GET'])
def get_profile_by_id(id):
    # Returns the information of the user with the given id.
    #First check that the id exists in the database.
    user = UserServices.get_user_byID(id) # returns `None` if the user is not founc
    if not user :
        return jsonify({'success' : False,
                        'message' : "userID does not exist in the database"}), 404 #not found
    
    return jsonify({'success' : True,
                    'data' : {
                        'username' : user.username,
                        'id' : user.id,
                        'email' : user.email,
                        'phone' : user.phone,
                        'association' : user.association,
                        'dotin_relation' : user.dotin_relation}}), 200

@user_bp.route('/updateEmail', methods=['PUT'])
def update_email():
    #Firstly check that the user is logged in all the update operations are for users that are logged in
    if not session.get('logged_in') :
        return jsonify({'success' : False,
                        'message' : "User must be logged in to update information"}), 401
    
    data = request.get_json()
    newEmail = data.get('email')
    # Verify the structure of the email string(Sot that it is like an email.)
    if not newEmail:
        return jsonify({'success' : False,
                        'message' : "Field cannot be empty."}), 400
    valid = validate_email(newEmail)
    if not valid:
        return jsonify({'success' : False,
                        'message' : "Pleas enter a valid email structure"}), 400
    # Ensure that this email does not exist in the database
    if UserServices.email_exists(newEmail):
        return jsonify({'success' : False,
                        'message' : "This email is connected to an account already."}), 400
    
    # update the email
    conn = get_db_session()
    userID = session.get('user_id')
    user = UserServices.get_user_byID(userID)
    user = conn.merge(user)
    user.email = newEmail
    session['email'] = newEmail
    conn.commit()
    conn.close()
    
    return jsonify({'success' : True,
                    'message' : "Your Email has been updated successfully",
                    'newEmail' : newEmail}), 200

@user_bp.route('/updateUsername', methods=["PUT"])
def update_username() :
    if not session.get('logged_in'):
        return jsonify({'success' : False,
                        'message' : "User must be logged in to update information"}), 401
    
    data = request.get_json()
    newUsername = data.get('username')

    if not newUsername:
        return jsonify({'success' : False,
                        'message' : "Field cannot be empty"}), 400
    
    if UserServices.username_exists(newUsername):
        return jsonify({'success' : False,
                        'message' : "Username already exists. Choose another"}), 400
    
    valid, msg = UserServices.validate_username(newUsername)
    if not valid:
        return jsonify({'success': False,
                        'message' : msg}), 400
    
    # Update the username
    user = UserServices.get_user_byID(session.get('user_id'))
    conn = get_db_session()
    user = conn.merge(user)
    user.username = newUsername
    session['username'] = newUsername
    conn.commit()
    conn.close()

    return jsonify({'success' : True,
                    'message' : "Your username has been updated successfully",
                    'newUsername' : newUsername}), 200

    

@user_bp.route('/updatePhone', methods=['PUT'])
def update_phone():
    """Update the phone number of the currently logged in user"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': "User must be logged in to update information"}), 401
    
    data = request.get_json()
    newPhone = data.get('phone')
    
    if not newPhone:
        return jsonify({'success': False, 'message': "Phone field cannot be empty"}), 400
    
    # Use the new validation
    valid, msg = UserServices.validate_phone_number(newPhone)
    if not valid:
        return jsonify({'success': False, 'message': msg}), 400
    
    # Ensure this phone number does not exist in the database
    if UserServices.phone_exists(newPhone):
        return jsonify({'success': False, 'message': "This phone number is connected to an account already"}), 409
    
    # Update the phone number
    conn = get_db_session()
    try:
        userID = session.get('user_id')
        user = UserServices.get_user_byID(userID)
        user = conn.merge(user)
        user.phone = newPhone
        session['phone'] = newPhone
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500
    finally:
        conn.close()
    
    return jsonify({
        'success': True,
        'message': "Your phone number has been updated successfully",
        'newPhone': newPhone
    }), 200