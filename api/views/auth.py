import time 
import secrets

import pyotp
from __main__ import socketio
from flask import Blueprint, request

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
        user = db.get_entry(USER_TABLE, request.json.get("login").lower(), "name")

        if settings := (db.get_entry(USER_SETTING_TABLE, user.id) if user else db.get_entry(USER_SETTING_TABLE, request.json.get("login").lower(), "email")):
            user = user if user else db.get_entry(USER_TABLE, settings.id)
            user_secrets = db.get_entry(USER_SECRET_TABLE, settings.id)
            
            if not (password := request.json.get("password")) or Security.hash_passwd(password, user_secrets.password.split("$")[0]) == user_secrets.password:
                # User not verified, has to pass a verification code
                if user.verified == 0:
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
                "login": "Login or password is invalid.",
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
        
        if db.get_entry(USER_SETTING_TABLE, email, "email"):
            return ({"errors": {"email": "Email is already registered"}}, 409)
        
        if db.get_entry(USER_TABLE, username, "name"):
            return ({"errors": {"username": "Username is already taken"}}, 409)
        
        if len(password) < 6:
            return ({"errors": {"password": "Password must have at least 6 characters"}}, 400)
        
        current_time = time.time() 
        id = Functions.create_id(current_time)
        verify_code = secrets.token_hex(3).upper()

        Mailing.send_verification(email, username, verify_code)

        db.insert_entry(USER_TABLE, User(id, username, "generic", current_time))
        db.insert_entry(USER_SETTING_TABLE, UserSettings(id, email))
        db.insert_entry(USER_SECRET_TABLE, UserSecrets(id, Security.hash_passwd(password), secrets.token_hex(32), verify_code))
        
        return 200
    
    @auth.route("/verify", methods=["POST"])
    @Decorators.manage_database
    @Decorators.ticket_auth
    def verify(db, user, option):
        if not (code := request.json.get("code")):
            return ({"errors": {"code": "No code."}}, 400)
        
        if not (user_secrets := db.get_entry(USER_SECRET_TABLE, user.id)):
            return 401
        
        if option == "verify":
            if user_secrets.verify_code.upper() != code.upper():
                return ({"errors": {"code": "Invalid code."}}, 400)
            
            db.update_entry(USER_TABLE, user.id, "verified", 1)
            db.update_entry(USER_SECRET_TABLE, user.id, "verify_code", "")

            return ({
                "token": Security.gen_token(user_secrets.id, user_secrets.secret), 
                "mfa": True if user_secrets.mfa_code else False,
                "verified": True
            }, 200)
        
        if option == "mfa":
            if not pyotp.TOTP(user_secrets.mfa_code).verify(code):
                return ({"errors": {"code": "Invalid two-factor code"}}, 400)

            return ({
                "token": Security.gen_token(user_secrets.id, user_secrets.secret), 
                "mfa": True if user_secrets.mfa_code else False,
                "verified": True
            }, 200)          

        return ({"errors": {"option": "Invalid option"}}, 400)

    @auth.route("/confirm-email", methods=["GET"])
    @Decorators.manage_database
    @Decorators.ticket_auth
    def confirm_email(db, user, option):
        if not option.startswith("email-new|"):
            return 403

        email = option[10:].lower()
        
        if db.get_entry(USER_SETTING_TABLE, email, "email"):
            return ({"errors": {"email": "Email is already registered!"}}, 406)

        user_settings = db.get_entry(USER_SETTING_TABLE, user.id)
        user_secrets = db.get_entry(USER_SECRET_TABLE, user.id)

        Mailing.send_email_recovery(user_settings.email, email, user.name, Security.gen_token(user.id, user_secrets.secret, f"email-old|{user_settings.email}"))
        db.update_entry(USER_SETTING_TABLE, user.id, "email", email)

        socketio.emit("user_change", {"setting": "email", "content": email}, to=user.id)
        return 200