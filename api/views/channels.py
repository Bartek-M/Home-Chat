import time 

from flask import Blueprint, request

from ..database import *
from ..utils import *


class Channels:
    """
    Channels api class
    /api/channels/
    """
    channels = Blueprint("channels", __name__)
    
    # GET
    @channels.route("/<channel_id>")
    @Decorators.manage_database
    @Decorators.auth
    def get_channel(db, channel_id):
        if (chnl := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"channel": chnl}, 200)
        
        return None
        
    @channels.route("/<channel_id>/messages")
    @Decorators.manage_database
    @Decorators.auth
    def get_messages(db, channel_id):
        return ({"channel_messages": db.get_channel_stuff(channel_id, "messages")}, 200)
        
    @channels.route("/<channel_id>/users")
    @Decorators.manage_database
    @Decorators.auth 
    def get_users(db, channel_id):
        return ({"channel_users": db.get_channel_stuff(channel_id, "users")}, 200)
    
    # POST
    @channels.route("/open", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def open_direct(db, user_id):
        if not (friend_id := request.json.get("friend")):
            return ({"errors": {"friend": "Friend is invalid"}}, 400)
        
        if not (friend := db.get_user_stuff([user_id, friend_id], "friend")):
            return ({"errors": {"friend": "No friend connection"}}, 400)

        if friend.get("accepted") == "waiting":
            return ({"errors": {"friend": "Friend invite is still pending"}}, 406)
        
        id = f"{min(user_id, friend_id)}-{max(user_id, friend_id)}"

        if not (channel := db.get_entry(CHANNEL_TABLE, id)):
            creation_time = str(time.time())
            channel = Channel(id, "-", "-", "-", creation_time, 1)

            db.insert_entry(CHANNEL_TABLE, channel)
            db.insert_entry(USER_CHANNEL_TABLE, UserChannel(user_id, id, creation_time, None, 1, 1))
            db.insert_entry(USER_CHANNEL_TABLE, UserChannel(friend_id, id, creation_time, None, 1, 1))

        channel.name = friend.get("name")
        channel.icon = friend.get("avatar")

        return ({"channel": channel}, 200)

    @channels.route("/create", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def create_group(db, user_id):
        if not (name := request.json.get("name")):
            return ({"errors": {"name": "Name is invalid"}}, 400)
        
        if not (users := request.json.get("users")):
            return ({"errors": {"users": "Users are invalid"}}, 400)
        
        if len(users) > 100:
            return ({"errors": {"users": "Too many users"}}, 406)
        
        creation_time = str(time.time())
        channel = Channel(str(Functions.create_id(float(creation_time))), name, "generic", user_id, creation_time)
        
        db.insert_entry(CHANNEL_TABLE, channel)
        db.insert_entry(USER_CHANNEL_TABLE, UserChannel(user_id, channel.id, creation_time, None, 1))
        
        for member_id in users:
            if not (user := db.get_entry(USER_TABLE, member_id)):
                continue
            
            db.insert_entry(USER_CHANNEL_TABLE, UserChannel(user.id, channel.id, creation_time))

        return ({"channel": channel}, 200)

    # DELETE
    @channels.route("/delete/<channel_id>")
    @Decorators.manage_database
    def delete_channels(db, channel_id):
        db.delete_entry(None, channel_id, "channel")
        return 200