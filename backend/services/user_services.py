from backend.models import User;
from database.connection import get_db_session;
from datetime import datetime;
import re
import bcrypt


class UserServices:
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
    def validate_username(username):
        """
        Ensures that the uername is valid and follows certain rules
        
        :param username: The username that must be validated
        """
        if not username:
            return False, "username cannot be nothing"
        if len(username) < 3 :
            return False, "Username must be at least 3 characters long"
        if len(username) >= 20 :
            return False, "Username cannot be longer that 20 characters"
        
        pattern = r'^[a-zA-Z0-9_\s\u0600-\u06FF]{3,20}$'
        if not re.match(pattern, username):
            return False, "Username can only contain English/Persian letters, numbers, and underscore (no spaces, dashes, or special characters)"

        return True, "Username is valid"
    
    @staticmethod
    def validate_phone_number(phone):
        """
        Basic phone number validation.
        Accepts any phone number with 8-15 digits, optional leading '+'.
        """
        if not phone:
            return False, "Phone number is required"
        
        # Remove spaces, dashes, parentheses
        cleaned = re.sub(r'[\s\-\(\)]', '', phone)
        
        # Check length
        if len(cleaned) < 8:
            return False, "Phone number must be at least 8 digits"
        
        if len(cleaned) > 15:
            return False, "Phone number must be at most 15 digits"
        
        # Check format (optional leading +, then digits)
        if not re.match(r'^\+?[0-9]+$', cleaned):
            return False, "Phone number can only contain digits and optional leading '+'"
        
        return True, "Valid phone number"



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
        """
        Returns user object identified by the id.
        
        :param user_id: the id by which the `User` object will be retrived
        :return: the found `User` object. None if not found.
        """
        session = get_db_session()
        user = session.query(User).filter_by(id=user_id).first()
        session.close()
        return user;

    @staticmethod
    def get_user_byUsername(name):
        """
        Returns user object identified by the username
        
        :param name: the username by which the `User` object will be retrived
        :return: the found `User` object. None if not found.
        """
        session = get_db_session()
        user = session.query(User).filter_by(username=name).first()
        session.close()
        return user;

    @staticmethod
    def get_user_byEmail(mail):
        """
        Returns user object identified by the email
        
        :param mail: the email by which the `User` object will be retrived
        :return: the found `User` object. None if not found.
        """
        session = get_db_session()
        user = session.query(User).filter_by(email=mail).first()
        session.close()
        return user;

    @staticmethod
    def get_user_byPhone(ph):
        """
        Returns user object identified by the phone number
        
        :param ph: the phone number by which the `User` object will be retrived.
        :return: the found `User` object. None if not found.
        """
        session = get_db_session()
        user = session.query(User).filter_by(phone=ph).first()
        session.close()
        return user;

    @staticmethod
    def update_last_login(user_id):
        """
        Updates the last login time of a user identified by their ID
        
        :param user_id: The id of the `User` object that we want to update.
        """
        user = UserServices.get_user_byID(user_id)

        if user:
            session = get_db_session()
            user = session.merge(user)
            user.last_login = datetime.now()
            session.commit()
            session.close();

    @staticmethod
    def create_user(username, password, email=None, phone=None, association = None, dotin_relation = None):
        """
        Creates a new user in the database. the ID is set automatically. Either `email` or `phone`
        is required for creating a new `User` object. Raises an error in case something goes wrong.

        :param username: Required. The username of the new `User` object.
        :param password: Required. The password of the new `User` object.
        :param email: Email of the new `User` object.
        :param phone: Phone number of the new `User` object.
        :param association: The association of the new `User` object.
        :param dotin_relation: if the association is `Dotin` then this must be specified
        :returns: The newly created `User` object
        """
        session = get_db_session()

        try:
            # Hash the password first
            password_hash = UserServices.hash_password(password)

            # Now attempt creating said new user
            newUser = User(
                username=username,
                password_hash=password_hash,
                email=email,
                phone=phone,
                association=association,
                dotin_relation=dotin_relation
            )

            session.add(newUser)
            session.commit()
            # This refresh gives the user their ID
            session.refresh(newUser)

            return newUser
        
        except Exception as e:
            session.rollback()
            raise e
        
        finally:
            session.close();