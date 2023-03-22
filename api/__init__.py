"""API MODULE"""
from .api import api, Auth, Channels, Users, Images
from .funcs import Functions
from .database import *

auth = Auth.auth
channels = Channels.channels
users = Users.users
images = Images.images

print("[API] loaded")