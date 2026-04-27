from backend.models import User;
from database.connection import get_db_session;
from datetime import datetime;
import bcrypt


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
    def validate_password(password):
        """Checks to see if the password is up to the security standards. The passwords are required
        to be at least 8 charachters long, contain an uppercase letter, contain a lowercase letter
        and contain a number."""

        if len(password) < 8:
            return False, 'The password must be at least 8 characters long'
        if not any(c.isupper() for c in password):
            return False, 'The password must contain at least one upper case character'
        if not any(c.islower() for c in password):
            return False, 'The password must contain at least one lower case character'
        if not any(c.isdigit() for c in password):
            return False, 'The password must contain at least one number'
        
        return True, 'valid';

    @staticmethod
    def username_exists(name):
        """Checks to see if a user name exists in the database"""
        with get_db_session() as session:
            exists_query = session.query(User).filter_by(username=name).exists()
            return session.query(exists_query).scalar();
             
    @staticmethod
    def email_exists(email):
        """Checks to see if the email is already inside of the database"""
        with get_db_session() as session:
            exists_query = session.query(User).filter_by(email=email).exists()
            return session.query(exists_query).scalar();

    @staticmethod
    def phone_exists(phone):
        """Checks to see if the phone number already exists in the database"""
        with get_db_session() as session:
            exists_query = session.query(User).filter_by(phone=phone).exists()
            return session.query(exists_query).scalar();
            
    @staticmethod
    def get_user_byID(user_id):
        """Returns the user object identified through its ID."""
        session = get_db_session()
        user = session.query(User).filter_by(id=user_id).first()
        session.close()
        return user;

    @staticmethod
    def get_user_byUsername(name):
        """Returns user object identified by the username"""
        session = get_db_session()
        user = session.query(User).filter_by(username=name).first()
        session.close()
        return user;

    @staticmethod
    def get_user_byEmail(mail):
        """Returns user object identified by the email"""
        session = get_db_session()
        user = session.query(User).filter_by(email=mail).first()
        session.close()
        return user;

    @staticmethod
    def get_user_byPhone(ph):
        """Returns user object identified by the phone number"""
        session = get_db_session()
        user = session.query(User).filter_by(phone=ph).first()
        session.close()
        return user;

    @staticmethod
    def update_last_login(user_id):
        """Updates the last login time of a user identified by their ID"""
        user = UserService.get_user_byID(user_id)

        if user:
            session = get_db_session()
            user.last_login = datetime.now()
            session.commit()
            session.close();
    
