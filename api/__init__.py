from flask import Flask
from flask_socketio import SocketIO

# GLOBAL VARIABLES
ADDR = "127.0.0.1" # 192.168.0.194 | 127.0.0.1
PORT = 5000

app = Flask("main")
socketio = SocketIO(app, ping_interval=45, ping_timeout=10)


"""API MODULE"""
from .views import *
from .database import *
from .websocket import *
