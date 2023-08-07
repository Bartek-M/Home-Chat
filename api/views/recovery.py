import secrets

from flask import Blueprint, request
from flask_socketio import disconnect

from .. import socketio
from ..utils import *
from ..database import *


class Recovery:
    """
    Recovery api class
    /api/recovery/
    """
    recovery = Blueprint("recovery", __name__)

    @recovery.route("/email", methods=["POST"])
    @Decorators.manage_database
    @Decorators.ticket_auth
    def restore_email(db, user, option):
        if not option.startswith("email-old|"):
            return 403
        
        email = option[10:].lower()
        
        if db.get_entry(USER_SETTING_TABLE, email, "email"):
            return ({"errors": {"email": "Email is already registered!"}}, 406)
        
        db.update_entry(USER_SETTING_TABLE, user.id, "email", email)
        socketio.emit("user_change", {"setting": "email", "content": email}, to=user.id)
        return ({"email": email}, 200)

    @recovery.route("/password", methods=["POST"])
    @Decorators.manage_database
    @Decorators.ticket_auth
    def restore_password(db, user, option):
        if option != "passw":
            return 403
        
        if not (password := request.json.get("password")):
            return ({"errors": {"password": "No password provided"}}, 400)
    
        if len(password) < 6:
            return ({"errors": {"password": "Password must have at least 6 characters"}}, 400)
        
        secret = secrets.token_hex(32)

        db.update_entry(USER_SECRET_TABLE, user.id, "password", Security.hash_passwd(password))
        db.update_entry(USER_SECRET_TABLE, user.id, "secret", secret)
        db.update_entry(USER_SECRET_TABLE, user.id, "sent_time", None)

        if (socketio.server.manager.rooms and socketio.server.manager.rooms["/"].get(user.id, {})):
            socketio.emit("logout", {"reason": "password changed"}, to=user.id)

            for sid in socketio.server.manager.rooms["/"].get(user.id, {}).copy():
                disconnect(sid=sid, namespace="/")
        
        return ({"user_login": user.name}, 200)
    
    @recovery.route("/forgot-password", methods=["POST"])
    @Decorators.manage_database
    def forgot_password(db):
        user = db.get_entry(USER_TABLE, request.json.get("login").lower(), "name")
        user_settings = (db.get_entry(USER_SETTING_TABLE, user.id) if user else db.get_entry(USER_SETTING_TABLE, request.json.get("login").lower(), "email"))

        if not user_settings:
            return ({"errors": {"login": "Login is invalid."}}, 400)
        
        user = user if user else db.get_entry(USER_TABLE, user_settings.id)
        user_secrets = db.get_entry(USER_SECRET_TABLE, user_settings.id)
        
        current_time = time.time()

        if int(current_time - (float(user_secrets.sent_time) if user_secrets.sent_time else 0)) < 300: # Only allow for resend after 5 minutes from earlier email; time in seconds
            return ({"errors": {"resend": "Wait 5 minutes from previous email!"}}, 406)
        
        Mailing.send_password_recovery(user_settings.email, user.name, Security.gen_token(user.id, user_secrets.secret, "passw"))
        db.update_entry(USER_SECRET_TABLE, user.id, "sent_time", str(current_time))
        return 200
    
    @recovery.route("/mfa", methods=["POST"])
    @Decorators.manage_database
    @Decorators.ticket_auth
    def restore_mfa(db, user, option):
        if option != "mfa-reset":
            return 403
        
        user_settings = db.get_entry(USER_SETTING_TABLE, user.id)

        if not user_settings.mfa_enabled:
            return 200

        db.update_entry(USER_SETTING_TABLE, user.id, "mfa_enabled", 0)
        db.update_entry(USER_SECRET_TABLE, user.id, "mfa_code", None)

        socketio.emit("user_change", {"setting": "mfa_enabled", "content": 0}, to=user.id)
        return 200
    
    @recovery.route("/no-mfa-access", methods=["POST"])
    @Decorators.manage_database
    @Decorators.ticket_auth
    def no_mfa_access(db, user, option):
        if option != "mfa":
            return 403
        
        user_settings = db.get_entry(USER_SETTING_TABLE, user.id)

        if not user_settings.mfa_enabled:
            return ({"errors": {"mfa": "2FA is not enabled"}}, 406)

        user_secrets = db.get_entry(USER_SECRET_TABLE, user.id)
        current_time = time.time()

        if int(current_time - (float(user_secrets.sent_time) if user_secrets.sent_time else 0)) < 300: # Only allow for resend after 5 minutes from earlier email; time in seconds
            return ({"errors": {"resend": "Wait 5 minutes from previous email!"}}, 406)
        
        Mailing.send_mfa_reset(user_settings.email, user.name, Security.gen_token(user.id, user_secrets.secret, "mfa-reset"))
        db.update_entry(USER_SECRET_TABLE, user.id, "sent_time", str(current_time))
        return 200