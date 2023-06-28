from flask import request, jsonify

from ..database import *
from .functions import Functions
from .security import Security


class Decorators:
    @staticmethod
    def manage_database(func):
        """
        Manage database decorator
        :param func: Function to run
        :return: Wrapper function
        """
        def wrapper(*args, **kwargs):
            with Database() as db:
                kwargs["db"] = db
                resp = func(*args, **kwargs)
            
            data, code = resp if isinstance(resp, tuple) else ({}, resp)

            if message := Functions.match_code(code):
                data["message"] = message

            return jsonify(data), code
        
        wrapper.__name__ = func.__name__
        return wrapper
    
    @staticmethod
    def auth(func):
        """
        Authenticate user tokens decorator
        :param func: Function to run
        :return: Wrapper function
        """
        def wrapper(*args, **kwargs):
            verify_code, verify_id, verify_option = Security.verify_token(kwargs["db"], request.headers.get("Authentication"))

            if verify_option and verify_code == "correct":
                return 403
            
            if verify_code == "correct":
                kwargs["user_id"] = verify_id
                return func(*args, **kwargs)
            
            if verify_code == "expired" or verify_code == "signature":
                return 403
            
            if verify_code == "invalid":
                return 401
            
            return None
        
        wrapper.__name__ = func.__name__
        return wrapper
    
    @staticmethod
    def ticket_auth(func):
        """
        Authenticate user tickets decorator
        :param func: Function tu run
        :return: Wrapper function
        """
        def wrapper(*args, **kwargs):
            verify_code, verify_id, verify_option = Security.verify_token(kwargs["db"], request.json.get("ticket"))

            if not verify_option and verify_code == "correct":
                return 403
            
            if verify_code == "correct":
                kwargs["user_id"] = verify_id
                kwargs["option"] = verify_option

                return func(*args, **kwargs)
            
            if verify_code == "expired" or verify_code == "signature":
                return 403
            
            if verify_code == "invalid":
                return 401
 
            return None
        
        wrapper.__name__ = func.__name__
        return wrapper