import os
import time
import secrets

import pyotp
from flask import Blueprint, request

from .. import socketio
from ..database import *
from ..utils import *

EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")
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
        settings = (
            db.get_entry(USER_SETTING_TABLE, user.id)
            if user
            else db.get_entry(USER_SETTING_TABLE, request.json.get("login").lower(), "email")
        )

        if not settings:
            return (
                {"errors": {"login": "Login or password is invalid.", "password": "Login or password is invalid."}},
                400,
            )

        user = user if user else db.get_entry(USER_TABLE, settings.id)
        user_secrets = db.get_entry(USER_SECRET_TABLE, settings.id)

        if (
            not (password := request.json.get("password"))
            or Security.hash_passwd(password, user_secrets.password.split("$")[0]) != user_secrets.password
        ):
            return (
                {"errors": {"login": "Login or password is invalid.", "password": "Login or password is invalid."}},
                400,
            )

        # User not verified, has to pass a verification code
        if not user.verified:
            return (
                {
                    "token": None,
                    "mfa": False,
                    "verified": False,
                    "ticket": Security.gen_token(user_secrets.id, user_secrets.secret, VERIFY_ACCESS),
                },
                200,
            )

        # User has mfa enabled, has to pass mfa code
        if settings.mfa_enabled:
            return (
                {
                    "token": None,
                    "mfa": True,
                    "verified": True,
                    "ticket": Security.gen_token(user_secrets.id, user_secrets.secret, MFA_ACCESS),
                },
                200,
            )

        # User is verified and doesn't have mfa enabled
        return (
            {"token": Security.gen_token(user_secrets.id, user_secrets.secret), "mfa": False, "verified": True},
            200,
        )

    @auth.route("/register", methods=["POST"])
    @Decorators.manage_database
    def register(db):
        email = request.json.get("email").lower()
        username = request.json.get("username").lower()
        password = request.json.get("password")

        if not Functions.verify_email(email):
            return ({"errors": {"email": "Invalid email syntax"}}, 400)
        if db.get_entry(USER_SETTING_TABLE, email, "email"):
            return ({"errors": {"email": "Email is already registered"}}, 409)

        if verify_error := Functions.verify_name(username):
            return ({"errors": {"username": verify_error}}, 400)
        if db.get_entry(USER_TABLE, username, "name"):
            return ({"errors": {"username": "Username is already taken"}}, 409)

        if len(password) < 8:
            return ({"errors": {"password": "Password must have at least 8 characters"}}, 400)
        if not Security.verify_password(password):
            return (
                {
                    "errors": {
                        "password": "Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character"
                    }
                },
                400,
            )

        current_time = time.time()
        id = Functions.create_id(current_time)

        if EMAIL and PASSWORD:
            verify_code = secrets.token_hex(3).upper()
            Mailing.send_verification(email, username, verify_code)
        else:
            verify_code = "1234"

        db.insert_entry(USER_TABLE, User(id, username, "generic", current_time))
        db.insert_entry(USER_SETTING_TABLE, UserSettings(id, email))
        db.insert_entry(
            USER_SECRET_TABLE, UserSecrets(id, Security.hash_passwd(password), secrets.token_hex(32), verify_code)
        )

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
            db.update_entry(USER_SECRET_TABLE, user.id, "sent_time", None)

            return (
                {
                    "token": Security.gen_token(user_secrets.id, user_secrets.secret),
                    "mfa": True if user_secrets.mfa_code else False,
                    "verified": True,
                },
                200,
            )

        if option == "mfa":
            if not pyotp.TOTP(user_secrets.mfa_code).verify(code):
                return ({"errors": {"code": "Invalid two-factor code"}}, 400)

            return (
                {
                    "token": Security.gen_token(user_secrets.id, user_secrets.secret),
                    "mfa": True if user_secrets.mfa_code else False,
                    "verified": True,
                },
                200,
            )

        return ({"errors": {"option": "Invalid option"}}, 400)

    @auth.route("/verification-resend", methods=["POST"])
    @Decorators.manage_database
    @Decorators.ticket_auth
    def resend_verification(db, user, option):
        if option != "verify":
            return 403

        user_secrets = db.get_entry(USER_SECRET_TABLE, user.id)

        if user.verified:
            return ({"token": Security.gen_token(user.id, user_secrets.secret)}, 200)

        user_settings = db.get_entry(USER_SETTING_TABLE, user.id)
        current_time = time.time()

        if (
            int(current_time - (float(user_secrets.sent_time) if user_secrets.sent_time else 0)) < 300
        ):  # Only allow for resend after 5 minutes from earlier email; time in seconds
            return ({"errors": {"resend": "Wait 5 minutes from previous resend!"}}, 406)

        Mailing.send_verification(user_settings.email, user.name, user_secrets.verify_code)
        db.update_entry(USER_SECRET_TABLE, user.id, "sent_time", str(current_time))
        return 200

    @auth.route("/confirm-email", methods=["POST"])
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

        Mailing.send_email_recovery(
            user_settings.email,
            email,
            user.name,
            Security.gen_token(user.id, user_secrets.secret, f"email-old|{user_settings.email}"),
        )
        db.update_entry(USER_SETTING_TABLE, user.id, "email", email)
        db.update_entry(USER_SECRET_TABLE, user.id, "sent_time", None)

        socketio.emit("user_change", {"setting": "email", "content": email}, to=user.id)
        return ({"email": email}, 200)
