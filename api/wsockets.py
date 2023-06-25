import time

from __main__ import socketio
from .utils.functions import Functions

@socketio.on("connect")
def connection():
    print("USER CONNECTED")

@socketio.on("message")
def message(data):
    if not isinstance(data, dict):
        return 
    
    create_time = time.time()
    id = Functions.create_id(create_time)

    socketio.send({
        "id": id,
        "time": create_time,
        **data,
    })