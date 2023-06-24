import time
from __main__ import socketio

@socketio.on("connect")
def connection():
    print("USER CONNECTED")

@socketio.on("message")
def message(data):
    if not isinstance(data, dict):
        return 
    
    data["time"] = time.time()
    socketio.send(data)