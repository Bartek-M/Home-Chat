from flask import request
from flask_socketio import join_room, disconnect, rooms

from . import socketio
from .database import *
from .utils import *


# Dictionary of login users with their currently opened channels
user_rooms = {}

# Connect and Disconnect events
@socketio.on("connect")
@Decorators.manage_database
def connection(auth, db):
    if not auth:
        return disconnect()

    verify_code, verify_user, verify_option = Security.verify_token(db, auth.get("token"))

    if verify_code != "correct" or verify_option:
        return disconnect()

    join_room(verify_user.id)

    for channel_id in db.get_user_stuff(verify_user.id, "channels").keys():
        join_room(channel_id)

    user_rooms[request.sid] = [verify_user.id,] # [user_id, open_channel_id]
    print(f"[WEBSOCKET CONNECTION] {verify_user.name} - {verify_user.id }")

@socketio.on("disconnect")
@Decorators.manage_database
def disconnection(db):
    if not (user_room := user_rooms.get(request.sid)):
        return
    
    del user_rooms[request.sid] # Delete user rooms entry

    if len(user_room) != 2:
        return
    
    user_id = user_room[0]
    channel_id = user_room[1]

    if not (updated_time := Functions.update_notifications(db, request.sid, user_id, channel_id)):
        return
    
    socketio.emit("channel_change", {"channel_id": channel_id, "setting": "notifications", "content": updated_time}, to=user_id)


# Set opened channel and Mark as read events
@socketio.on("set_opened_channel")
def set_opened_channel(*args):
    if not args or not args[0]:
        return
    
    if not (user_room := user_rooms.get(request.sid)):
        return
    
    user_id = user_room[0]
    channel_id = args[0].get("channel")

    if (not channel_id or channel_id not in rooms(request.sid)):
        return
    
    user_rooms[request.sid] = [user_id, channel_id]


@socketio.on("read")
@Decorators.manage_database
def mark_read(*args, db):
    if not args or not args[0]:
        return
    
    if not (user_room := user_rooms.get(request.sid)):
        return
    
    user_id = user_room[0]
    channel_id = args[0].get("channel")
    last_message = args[0].get("last")

    if not (updated_time := Functions.update_notifications(db, request.sid, user_id, channel_id, last_message)):
        return
    
    socketio.emit("channel_change", {"channel_id": channel_id, "setting": "notifications", "content": updated_time}, to=user_id)