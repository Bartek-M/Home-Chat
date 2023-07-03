from flask import Blueprint


class Restore:
    """
    Restoring api class
    /api/restore/
    """

    restore = Blueprint("restore", __name__)
