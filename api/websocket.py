from flask import request
from __main__ import socketio
from flask_socketio import join_room, disconnect, rooms

from .database import *
from .utils import *

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

    print(f"[WEBSOCKET CONNECTION] {verify_user.name} - {verify_user.id }")


@socketio.on("read")
@Decorators.manage_database
def mark_read(*args, db):
    if not args or not args[0]:
        return
    
    user_id = args[0].get("user")
    channel_id = args[0].get("channel")
    last_message = args[0].get("last")

    if (
        not user_id or not channel_id 
        or user_id not in rooms(request.sid) or channel_id not in rooms(request.sid) 
        or not (user := db.get_entry(USER_TABLE, user_id)) or not db.get_entry(CHANNEL_TABLE, channel_id)
        or not (user_channel := db.get_channel_stuff([user_id, channel_id], "user_channel"))
    ):
        return

    if not user.notifications or not db.get_entry(USER_SETTING_TABLE, user_id).notifications_message or not user_channel.notifications:
        return

    if not last_message or last_message < user_channel.notifications:
        return

    db.update_entry(USER_CHANNEL_TABLE, [user_id, channel_id], "notifications", str(time.time()), "user_channel")