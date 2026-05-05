from flask import Blueprint, session, jsonify
from backend.models import User
from database import get_db_session
from backend.services.user_services import UserService

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
    user = UserService.get_user_byID(userID)

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
    user = UserService.get_user_byID(id) # returns `None` if the user is not founc
    if not user :
        return jsonify({'success' : False,
                        'message' : "userID does not exist in the database"}), 404 #not found
    
    return jsonify({'success' : True,
                'username' : user.username,
                'id' : user.id,
                'email' : user.email,
                'phone' : user.phone,
                'association' : user.association}), 200

