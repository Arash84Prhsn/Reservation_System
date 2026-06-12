from backend.models import User;
from backend.models.enums import ASSOCIATIONS, DOTIN_ASSOCIATIONS
from flask import session
from database.connection import get_db_connection;
from datetime import datetime;
from sqlalchemy import or_, select
import re
import bcrypt


class UserServices:
    """Provides services for the user model, Things such as password hashing, verifying
    passwords, finding user objects by different attributes,..."""

    @staticmethod
    def is_user_logged_in():
        """
        Checks the session to see if anybody is logged in right now
        """

        return session.get("logged_in") is not None

    @staticmethod
    def get_logged_in_user():
        """
        Returns the currently logged in `User` object. If user is not logged in, returns `None`
        """
        if not UserServices.is_user_logged_in():
            return None
        
        user_id = session.get("user_id")
        user = UserServices.get_user_byID(user_id)

        return user
        
    @staticmethod
    def hash_password(password):
        """Hash a password with bcrypt - works on all Python versions"""
        # Convert to string if needed
        if not isinstance(password, str):
            password = str(password)
        
        # Encode to bytes (bcrypt requires bytes)
        password_bytes = password.encode('utf-8')
        
        # Hash
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        
        # Return as string for database
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(password: str, storedHash: str):
        """Checks a password against the stored hash for the password"""
        return bcrypt.checkpw(password.encode(), storedHash.encode());

    #TODO: add another check to see if the password contians non-english characters
    @staticmethod
    def validate_password(password : str):
        """
        Checks to see if the password is up to the security standards. The passwords are required
        to be at least 8 charachters long, contain an uppercase letter, contain a lowercase letter
        and contain a number.

        :param password: The password of the user. Is a string.
        :returns: `(True, 'valid')` if the password matches the required patterns, otherwise
        returns `(False, 'msg')` where `'msg'` is the corresponding error message.
        """

        pattern = r'^[a-zA-Z0-9_@]{8,20}$'

        if not re.match(pattern=pattern):
            return False, "رمز عبور فثط می‌تواند شامل حروف انگیسی، `@` و `_` باشد"

        if len(password) < 8:
            return False, 'رمز عبور باید حداقل ۸ کاراکتر باشد'
        if not any(c.isupper() for c in password):
            return False, 'رمز عبور باید حداقل شامل یک حرف بزرگ (انگلیسی) باشد'
        if not any(c.islower() for c in password):
            return False, 'رمز عبور باید حداقل شامل یک حرف کوچک (انگلیسی) باشد'
        if not any(c.isdigit() for c in password):
            return False, 'رمز عبور باید حداقل شامل یک عدد باشد'
        
        return True, 'valid'

    @staticmethod
    def validate_username(username):
        """
        Ensures that the uername is valid and follows certain rules
        
        :param username: The username that must be validated
        """
        if not username:
            return False, "نام کاریری نمیتواند خالی باشد"
        if len(username) < 3 :
            return False, "نام کاربری باید حداقل 3 کاراکتر باشد"
        if len(username) >= 20 :
            return False, "نام کاربری نمیتواند بیش از 20 کاراکتر باشد"
        
        pattern = r'^[a-zA-Z0-9_\s\u0600-\u06FF]{3,20}$'
        if not re.match(pattern, username):
            return False, "نام کاربری فقط می‌تواند شامل حروف انگلیسی/فارسی، اعداد و زیرخط (_) باشد"

        return True, "Username is valid"
    
    @staticmethod
    def validate_email(email):
        """
        Validates email format using regex.
        
        :param email: The email string to validate
        :returns: True if email format is valid, False otherwise
        """
        if not email or not isinstance(email, str):
            return False
        
        # Simple regex pattern for email validation
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        return bool(re.match(pattern, email))

    @staticmethod
    def validate_phone_number(phone):
        """
        Basic phone number validation.
        Accepts any phone number with 8-15 digits, optional leading '+'.
        """
        if not phone:
            return False, "شماره تلفن نمیتواند خالی باشد"
        
        # Remove spaces, dashes, parentheses
        cleaned = re.sub(r'[\s\-\(\)]', '', phone)
        
        # Check length
        if len(cleaned) < 8:
            return False, "شماره تلفن باید حداقل 8 رقم باشد"
        
        if len(cleaned) > 15:
            return False, "شماره تلفن حداکثر میتواند 15 رقم باشد"
        
        # Check format (optional leading +, then digits)
        if not re.match(r'^\+?[0-9]+$', cleaned):
            return False, "شماره تلفن فقط باید شامل ارقام انگلیسی باشد(علامت + در ابتدای شماره مجاز است)"
        
        return True, "Valid phone number"

    @staticmethod
    def validate_association(association : str):
        """
        A function that checks to see if the association of the user is in the list of the valid
        associations for the current reservation system.
        
        :param association: The association of the user. Is a string.
        :returns: `False` if `association` is not in the list and `True` otherwise
        """
        
        return association in ASSOCIATIONS
    
    @staticmethod
    def is_association_dotin(association: str):
        """
        Checks to see if the given association is related to the Dotin company
        
        :param association: The given association string
        :returns: True or False depending on the given association
        """
        return association in DOTIN_ASSOCIATIONS

    @staticmethod
    def username_exists(name):
        """Checks to see if a user name exists in the database"""
        with get_db_connection() as conn:
            stmnt = select(1).where(User.username == name).limit(1)
            return conn.execute(stmnt).scalar() is not None
             
    @staticmethod
    def email_exists(email : str):
        """Checks to see if the email is already inside of the database"""
        with get_db_connection() as conn:
            email = email.lower().strip()
            stmnt = select(1).where(User.email == email).limit(1)
            return conn.execute(stmnt).scalar() is not None

    @staticmethod
    def phone_exists(phone):
        """Checks to see if the phone number already exists in the database"""
        with get_db_connection() as conn:
            stmnt = select(1).where(User.phone == phone).limit(1)
            return conn.execute(stmnt).scalar() is not None
    
    @staticmethod
    def username_email_phone_exists(username, email : str, phone):
        """
        Checks to see if any of username, email or phone exist in the database.
        
        :param username: The username string
        :param email: The email string
        :param phone: The phone number as a string (not integer)
        :returns: Tuple of (exists, message)
                - exists: False if any field exists, True if all are available
                - message: Error description if exists, "All fields available" if not
                
        Example:
            >>> exists, msg = User.username_email_phone_exists("alice", "alice@email.com", "123-4567")
            >>> if not exists:
            ...     print(f"Error: {msg}")
            (False, 'Username already exists')
        """
        with get_db_connection() as conn:
        # Check username first
            if username:
                stmt = select(1).where(User.username == username).limit(1)
                if conn.execute(stmt).scalar() is not None:
                    return False, "نام کاربری توسط شخص دیگری استفاده شده است"
            
            # Check email second
            if email:
                email = email.lower().strip()
                stmt = select(1).where(User.email == email).limit(1)
                if conn.execute(stmt).scalar() is not None:
                    return False, "ایمیل توسط شخص دیگری استفاده شده است"
            
            # Check phone last
            if phone:
                stmt = select(1).where(User.phone == phone).limit(1)
                if conn.execute(stmt).scalar() is not None:
                    return False, "شماره تلفن توسط شخص دیگری استفاده شده است"
            
            return True, "All fields are available"
    @staticmethod
    def get_user_byID(user_id):
        """
        Returns user object identified by the id.
        
        :param user_id: the id by which the `User` object will be retrived
        :return: the found `User` object. None if not found.
        """
        session = get_db_connection()
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
        session = get_db_connection()
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
        session = get_db_connection()
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
        session = get_db_connection()
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
            session = get_db_connection()
            user = session.merge(user)
            user.last_login = datetime.now()
            session.commit()
            session.close();

    @staticmethod
    def create_user(username, password, email=None, phone=None, association = None):
        """
        Creates a new user in the database. the ID is set automatically. Either `email` or `phone`
        is required for creating a new `User` object. Raises an error in case something goes wrong.

        :param username: Required. The username of the new `User` object.
        :param password: Required. The password of the new `User` object.
        :param email: Email of the new `User` object.
        :param phone: Phone number of the new `User` object.
        :param association: The association of the new `User` object.
        :returns: The newly created `User` object
        """
        conn = get_db_connection()

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
            )

            conn.add(newUser)
            conn.commit()
            # This refresh gives the user their ID
            conn.refresh(newUser)

            return newUser
        
        except Exception as e:
            conn.rollback()
            raise e
        
        finally:
            conn.close();