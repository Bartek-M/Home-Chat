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
    def restore_email(db):
        if not (ticket := request.args.get("ticket")):
            return 400
        
        code, user_id, email = Security.verify_token(db, ticket)

        if code in ["expired", "signature"]:
            return 403

        if code != "correct" or not user_id or not email:
            return 401
        
        if db.get_entry(USER_SETTING_TABLE, email, "email"):
            return ({"errors": {"email": "Email is already registered!"}}, 406)
        
        db.update_entry(USER_SETTING_TABLE, user_id, "email", email)
        socketio.emit("user_change", {"setting": "email", "content": email}, to=user_id)
        return 200

    @recovery.route("/password")
    def restore_password():
        return 200
    
    @recovery.route("/mfa")
    def restore_mfa():
        return 200


"""
Send email with possible recovery after:
- password change
- email change

Send email to new email before changing it in order to verify it and then change it.
"""