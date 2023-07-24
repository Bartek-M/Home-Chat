from flask import Blueprint, request
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

    @recovery.route("/password")
    def restore_password():
        return 200
    
    @recovery.route("/mfa")
    def restore_mfa():
        return 200