from flask import Blueprint, session, jsonify, request
from backend.models import User
from database import get_db_session
from backend.services.user_services import UserServices
from email_validator import validate_email

user_bp = Blueprint('user', __name__, url_prefix='/api/user')

@user_bp.route('/id', methods=['GET'])
def get_id():
    # Gives the ID of the currently logged in user. raises error if user is not logged in
    if not session.get('logged_in'):
        return jsonify({'success' : False,
                        'message' : "User is not logged in"}), 401
    
    return jsonify({'success' : True,
                    'id' : session.get('user_id')}), 200

@user_bp.route('/session', methods=['GET'])
def get_session():
    # Returns the current session as a json if a user is logged in, else raises 401
    if not session.get('logged_in'):
        return jsonify({'success' : False,
                        'message' : "Session is empty"}), 401
    
    return jsonify(**session)

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

    return jsonify({'success' : True,
                    'username' : user.username,
                    'id' : user.id,
                    'email' : user.email,
                    'phone' : user.phone,
                    'association' : user.association}), 200

@user_bp.route('/profile/<int:id>', methods=['GET'])
def get_profile_by_id(id):
    # Returns the information of the user with the given id.
    #First check that the id exists in the database.
    user = UserServices.get_user_byID(id) # returns `None` if the user is not founc
    if not user :
        return jsonify({'success' : False,
                        'message' : "userID does not exist in the database"}), 404 #not found
    
    return jsonify({'success' : True,
                'username' : user.username,
                'id' : user.id,
                'email' : user.email,
                'phone' : user.phone,
                'association' : user.association}), 200

@user_bp.route('/updateEmail', methods=['PUT'])
def update_username():
    #Firstly check that the user is logged in all the update operations are for users that are logged in
    if not session.get('logged_in') :
        return jsonify({'success' : False,
                        'message' : "User must be logged in to update information"})
    
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

    
    userID = session.get('user_id')
    user = UserServices.get_user_byID(userID)

    conn = get_db_session()
    user = conn.merge(user)
    user.email = newEmail
    conn.commit()
    conn

