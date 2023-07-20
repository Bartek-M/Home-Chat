from flask import Blueprint


class Recovery:
    """
    Recovery api class
    /api/recovery/
    """

    recovery = Blueprint("recovery", __name__)

    @recovery.route("/email")
    def restore_email():
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