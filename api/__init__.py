import os

from flask import Flask
from flask_socketio import SocketIO

# GLOBAL VARIABLES
ADDR = os.getenv("ADDRESS")
PORT = os.getenv("PORT")

if not (ADDR or PORT):
    print("Couldn't load configuration file!")
    print("It could be incorrectly formatted or it doesn't exits")
    print("\nCheckout api/CONFIG.md for further help with configuration")
    exit(1)

app = Flask("main")
socketio = SocketIO(app, ping_interval=45, ping_timeout=10, async_mode="gevent")


"""API MODULE"""
from .views import *
from .database import *
from .websocket import *
