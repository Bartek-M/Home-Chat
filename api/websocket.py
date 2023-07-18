from __main__ import socketio
from flask_socketio import join_room, disconnect

from .database import USER_TABLE
from .utils import *

@socketio.on("connect")
@Decorators.manage_database
def connection(auth, db):
    if not auth:
        return disconnect()

    verify_code, verify_id, verify_option = Security.verify_token(db, auth.get("token"))

    if verify_code != "correct" or verify_option:
        return disconnect()

    join_room(verify_id)

    for channel_id in db.get_user_stuff(verify_id, "channels").keys():
        join_room(channel_id)

    print(f"[WEBSOCKET CONNECTION] {db.get_entry(USER_TABLE, verify_id).name} - {verify_id}")