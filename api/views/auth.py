import time 
import secrets

import pyotp
from flask import Blueprint, request
from multiprocessing import Process

from ..database import *
from ..utils import *


class Auth:
    """
    Auth api class
    /api/auth/
    """
    auth = Blueprint("auth", __name__)

    @auth.route("/login", methods=["POST"])
    @Decorators.manage_database
    def login(db):
        if settings := db.get_user(request.json.get("email").lower()):
            user_secrets = db.get_entry(USER_SECRET_TABLE, settings.id)
            
            if not (password := request.json.get("password")) or Security.hash_passwd(password, user_secrets.password.split("$")[0]) == user_secrets.password:
                # User not verified, has to pass a verification code
                if db.get_entry(USER_TABLE, settings.id).verified == 0:
                    return ({
                        "token": None,
                        "mfa": False,
                        "verified": False,
                        "ticket": Security.gen_token(user_secrets.id, user_secrets.secret, VERIFY_ACCESS)
                    }, 200)

                # User has mfa enabled, has to pass mfa code
                if settings.mfa_enabled == 1:
                    return ({
                        "token": None,
                        "mfa": True,
                        "verified": True,
                        "ticket": Security.gen_token(user_secrets.id, user_secrets.secret, MFA_ACCESS),
                    }, 200)
                
                # User is verified and doesn't have mfa enabled
                return ({
                    "token": Security.gen_token(user_secrets.id, user_secrets.secret), 
                    "mfa": False,
                    "verified": True
                }, 200)

        return ({
            "errors": {
                "email": "Login or password is invalid.",
                "password": "Login or password is invalid."
            }
        }, 400)
    
    @auth.route('/register', methods=["POST"])
    @Decorators.manage_database
    def register(db):
        email = request.json.get("email").lower()
        username = request.json.get("username").lower()
        password = request.json.get("password")

        if not Functions.verify_email(email):
            return ({"errors": {"email": "Invalid email syntax"}}, 400)
        
        if db.get_user(email):
            return ({"errors": {"email": "Email is already registered"}}, 409)
        
        if db.get_user(username, "name"):
            return ({"errors": {"username": "Username is already taken"}}, 409)
        
        if len(password) < 6:
            return ({"errors": {"password": "Password must have at least 6 characters"}}, 400)
        
        current_time = time.time() 
        id = Functions.create_id(current_time)
        verify_code = "123456"
        #verify_code = secrets.token_hex(3).upper()

        #Process(target=Security.send_verification, args=(email, username, verify_code)).start()

        db.insert_entry(USER_TABLE, User(id, username, "generic", current_time))
        db.insert_entry(USER_SETTING_TABLE, UserSettings(id, email))
        db.insert_entry(USER_SECRET_TABLE, UserSecrets(id, Security.hash_passwd(password), secrets.token_hex(32), verify_code))
        
        return 200
    
    @auth.route("/verify", methods=["POST"])
    @Decorators.manage_database
    @Decorators.ticket_auth
    def verify(db, user_id, option):
        if not (code := request.json.get("code")):
            return ({"errors": {"code": "No code."}}, 400)
        
        if not (user_secrets := db.get_entry(USER_SECRET_TABLE, user_id)):
            return 401
        
        if option == "verify":
            if user_secrets.verify_code.upper() != code.upper():
                return ({"errors": {"code": "Invalid code."}}, 400)
            
            db.update_entry(USER_TABLE, user_id, "verified", 1)
            db.update_entry(USER_SECRET_TABLE, user_id, "verify_code", "")

            return ({
                "token": Security.gen_token(user_secrets.id, user_secrets.secret), 
                "mfa": True if user_secrets.mfa_code else False,
                "verified": True
            }, 200)
        
        if option == "mfa":
            if not pyotp.TOTP(user_secrets.mfa_code).verify((request.json.get("code"))):
                return ({"errors": {"code": "Invalid two-factor code"}}, 400)

            return ({
                "token": Security.gen_token(user_secrets.id, user_secrets.secret), 
                "mfa": True if user_secrets.mfa_code else False,
                "verified": True
            }, 200)          

        return ({"errors": {"option": "Invalid option"}}, 400)
