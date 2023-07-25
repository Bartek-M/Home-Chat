import secrets

from flask import Blueprint, request
from flask_socketio import disconnect
from __main__ import socketio

from ..utils import *
from ..database import *


class Recovery:
    """
    Recovery api class
    /api/recovery/
    """
    recovery = Blueprint("recovery", __name__)

    @recovery.route("/email", methods=["GET"])
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
        return 200

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

        socketio.emit("logout", {"reason": "password changed"}, to=user.id)

        for sid in socketio.server.manager.rooms["/"].get(user.id, {}).copy():
            disconnect(sid=sid, namespace="/")
        
        return 200

    @recovery.route("/mfa")
    def restore_mfa():
        return 200