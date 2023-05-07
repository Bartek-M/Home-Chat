"""API VIEWS"""
from flask import Blueprint

from ..database import *
from ..utils import Decorators

from .auth import Auth
from .channels import Channels
from .users import Users
from .images import Images

api = Blueprint("api", __name__)

auth = Auth.auth
channels = Channels.channels
users = Users.users
images = Images.images


# TEMP DATABASE VIEW
@api.route("/database")
@Decorators.manage_database
def temp_view(db):
    tables = [USER_TABLE, MESSAGE_TABLE, CHANNEL_TABLE, USER_CHANNEL_TABLE, USER_FRIENDS_TABLE, USER_SETTING_TABLE, USER_SECRET_TABLE]

    for table in tables:
        print(f"{table}:\n{db.get_all(table)}\n")    

    return 200
# TEMP DATABASE VIEW