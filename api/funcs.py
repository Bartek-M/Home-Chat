from flask import jsonify, abort, request
from base64 import b64encode, b64decode
from .database import *
import secrets
import hashlib
import time
import re

# CONSTANTS
TABLES = {
    "name": USER_TABLE, 
    "visibility": USER_TABLE,
    "email": USER_SETTING_TABLE,
    "phone": USER_SETTING_TABLE,
    "password": USER_SECRET_TABLE,
    "auth_code": USER_SECRET_TABLE
}

EMAIL_REGEX = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'


class Functions:
    @staticmethod
    def create_id(creation_time):
        """
        Create unique ID
        :param creation_time: Epoch creation time
        :return: Creation time(int)
        """
        return (int((creation_time - 1155909600) * 1000) << 23) + random.SystemRandom().getrandbits(22)
    
    @staticmethod
    def verify_email(email):
        """
        Verify user email
        :param email: Email to verify
        :return: True if correct, False if incorrect
        """
        if re.fullmatch(EMAIL_REGEX, email):
            return True

        return False
    
    @staticmethod
    def manage_database(func):
        """
        Manage database decorator
        :param func: Function to run
        :return: Wrapper function
        """
        def wrapper(*args, **kwargs):
            db = Database()
            kwargs["db"] = db
            data, code = func(*args, **kwargs)
            db.close()

            if not data:
                abort(404)

            return jsonify(data), code   
        
        wrapper.__name__ = func.__name__
        return wrapper
    

class Security:
    @staticmethod
    def hash_passwd(passw: str, salt=secrets.token_hex(16)):
        """
        Hash user password
        :param passw: User password
        :param salt: Salt for additional encryption
        :return: Secured password (str)
        """
        return f"{salt}${hashlib.sha256((salt + passw).encode()).hexdigest()}"
    
    @staticmethod
    def gen_token(id: str, secret: str):
        """
        Generate token for specific user
        :param id: User ID
        :param secret: User secret
        :return: Secure access token
        """
        id = b64encode(id.encode("UTF-8")).decode("UTF-8")
        now = b64encode(str(int(time.time())).encode("UTF-8")).decode("UTF-8")
        hmac = hashlib.sha256(f"{id}|{now}|{secret}".encode("UTF-8")).hexdigest()

        return f"{id}.{now}.{hmac}"
    
    @staticmethod
    def verify_token(db, token: str):
        """
        Verify specific token
        :param token: Token you want to verify
        :return: "correct" / "expired" / "signature" / "invalid"
        """
        if not token:
            return ("invalid", None)

        if len(token := token.split(".")) != 3:
            return ("invalid", None)
        
        try:
            id = b64decode(token[0].encode("UTF-8")).decode("UTF-8")
            generated = b64decode(token[1].encode("UTF-8")).decode("UTF-8")
            hmac = token[2]
        except:
            return ("invalid", None)
        
        if not (user_secrets := db.get_entry(USER_SECRET_TABLE, id)):
            return ("invalid", None)
        
        if hashlib.sha256(f"{token[0]}|{token[1]}|{user_secrets.secret}".encode("UTF-8")).hexdigest() != hmac:
            return ("signature", id)
        
        if int(time.time()) - int(generated) > 31_536_000: # Tokens are expired after one year (365 days); time in seconds
            return ("expired", id)

        return ("correct", id)
    
    @staticmethod
    def auth(func):
        """
        Authenticate user tokens decorator
        :param func: Function to run
        :return: Wrapper function
        """
        def wrapper(*args, **kwargs):
            verify_code, verify_id = Security.verify_token(kwargs["db"], request.headers.get("Authentication", None))

            if verify_code == "correct":
                kwargs["user_id"] = verify_id
                return func(*args, **kwargs)
            elif verify_code == "expired":
                return ({"message": "403 Forbidden"}, 403)
            elif verify_code == "signature":
                return ({"message": "403 Forbidden"}, 403)
            elif verify_code == "invalid":
                return ({"message": "401 Unauthorized"}, 401)
            
            return (None, None)
        
        wrapper.__name__ = func.__name__
        return wrapper