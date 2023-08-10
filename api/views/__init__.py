"""API VIEWS"""
from flask import Blueprint

from .auth import Auth
from .channels import Channels
from .users import Users
from .images import Images
from .recovery import Recovery

api = Blueprint("api", __name__)

auth = Auth.auth
channels = Channels.channels
users = Users.users
images = Images.images
recovery = Recovery.recovery
