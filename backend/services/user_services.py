from backend.models import User;
from database.connection import get_session;
from datetime import datetime;
import bcrypt
import hashlib
import secrets

class UserService:
    """Provides simpe services for the user model, Thing such as password hashing, verifying
    passwords, finding user objects by different attributes,..."""


    @staticmethod
    def hash_password(password):
        """Hashes passwords and returns the hashed password"""
        salt = bcrypt.gensalt()
        hashedPassword = bcrypt.hashpw(password.encode(), salt)

        return hashedPassword.decode();

    @staticmethod
    def verify_password(password, storedHash):
        """Checks a password against the stored hash for the password"""
        return bcrypt.checkpw(password.encode(), storedHash.encode());

    @staticmethod
    def get_user_byID(user_id):
        """Returns the user object identified through its ID."""
        session = get_session()
        user = session.query(User).filter_by(id=user_id).first()
        session.close()
        return user;

    @staticmethod
    def get_user_byUsername(name):
        """Returns user object identified by the username"""
        session = get_session()
        user = session.query(User).filter_by(username=name).first()
        session.close()
        return user;

    @staticmethod
    def get_user_byEmail(mail):
        """Returns user object identified by the email"""
        session = get_session()
        user = session.query(User).filter_by(email=mail).first()
        session.close()
        return user;

    @staticmethod
    def get_user_byPhone(ph):
        """Returns user object identified by the phone number"""
        session = get_session()
        user = session.query(User).filter_by(phone=ph).first()
        session.close()
        return user;

    @staticmethod
    def update_user_lastLogin(user_id):
        """Updates the last login time of a user identified by their ID"""
        user = UserService.get_user_byID(user_id)

        if user:
            session = get_session()
            user.last_login = datetime.now()
            session.commit()
            session.close();
    
