"""API MODULE"""
from .api import api, Auth, Channels, Users, Photos
from .funcs import Functions
from .database import *

auth = Auth.auth
channels = Channels.channels
users = Users.users
photos = Photos.photos

print("[API] loaded")