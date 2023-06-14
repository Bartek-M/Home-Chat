import os
import time 

import pyotp
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
        creation_time = str(time.time())

        if not (channel := db.get_entry(CHANNEL_TABLE, id)):
            channel = Channel(id, None, None, None, creation_time, 1)
            db.insert_entry(CHANNEL_TABLE, channel)

        if not (user_channel := db.get_channel_stuff([user_id, channel.id], "user_channel")):
            user_channel = UserChannel(user_id, id, creation_time, None, 1, 1)
            db.insert_entry(USER_CHANNEL_TABLE, user_channel)

        if not (friend_channel := db.get_channel_stuff([friend_id, channel.id], "user_channel")):
            friend_channel = UserChannel(friend_id, id, creation_time, None, 1, 1)
            db.insert_entry(USER_CHANNEL_TABLE, friend_channel)

        return ({"channel": {
            **channel.__dict__,
            "name": friend.get("name", "Deleted Account"),
            "display_name": friend_channel.nick if friend_channel.nick else friend.get("display_name", None),
            "icon": friend.get("avatar", "generic"),
            "notifications": user_channel.notifications,
            "join_time": user_channel.join_time,
            "admin": True if user_channel.admin else False,
            "users": db.get_channel_stuff(channel.id, "users")
        }}, 200)

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
        user_channel = UserChannel(user_id, channel.id, creation_time, None, 1)
        
        db.insert_entry(CHANNEL_TABLE, channel)
        db.insert_entry(USER_CHANNEL_TABLE, user_channel)
        
        for member_id in users:
            if not (user := db.get_entry(USER_TABLE, member_id)):
                continue
            
            db.insert_entry(USER_CHANNEL_TABLE, UserChannel(user.id, channel.id, creation_time))

        return ({"channel": {
            **channel.__dict__,
            "nick": user_channel.nick,
            "notifications": user_channel.notifications,
            "join_time": user_channel.join_time,
            "admin": True if user_channel.admin else False,
            "users": db.get_channel_stuff(channel.id, "users")
        }}, 200)
    
    @channels.route("/<channel_id>/invite", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def invite_member(db, user_id, channel_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not (user_channel := db.get_channel_stuff([user_id, channel_id], "user_channel")):
            return ({"errors": {"channel": "You are not a member"}}, 401)

        if channel.direct:
            return ({"errors": {"channel": "Direct channel"}}, 406)

        if user_id != channel.owner and not user_channel.admin:
            return ({"errors": {"channel": "You are not a stuff member"}}, 403)

        if not (member := db.get_entry(USER_TABLE, request.json.get("member"))):
            return ({"errors": {"member": "User does not exist"}}, 400)

        if not db.get_channel_stuff([member.id, channel_id], "user_channel"):
            db.insert_entry(USER_CHANNEL_TABLE, UserChannel(member.id, channel.id, time.time()))

        return ({"user": member}, 200)


    # PATCH
    @channels.route("/<channel_id>/settings", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def settings_channel(db, user_id, channel_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not (user_channel := db.get_channel_stuff([user_id, channel_id], "user_channel")):
            return ({"errors": {"channel": "You are not a member"}}, 401)

        if (name := request.json.get("name")) and name != channel.name:
            if channel.direct:
                return ({"errors": {"channel": "Direct channel"}}, 406)

            if user_id != channel.owner and not user_channel.admin:
                return ({"errors": {"channel": "You are not a stuff member"}}, 403)

            db.update_entry(CHANNEL_TABLE, channel_id, "name", name)

        if (nick := request.json.get("nick")) != user_channel.nick:
            db.update_entry(USER_CHANNEL_TABLE, [user_id, channel_id], "nick", nick, "user_channel")

        notifications = (user_channel.notifications if user_channel.notifications else "1") if request.json.get("notifications") else None
        if notifications != user_channel.notifications:
            db.update_entry(USER_CHANNEL_TABLE, [user_id, channel_id], "notifications", notifications, "user_channel")

        return 200


    # DELETE
    @channels.route("/<channel_id>/delete", methods=["DELETE"])
    @Decorators.manage_database
    @Decorators.auth
    def delete_channel(db, user_id, channel_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)
        
        if channel.owner != user_id:
            return ({"errors": {"channel": "You are not the owner"}}, 403)
        
        user_settings = db.get_entry(USER_SETTING_TABLE, user_id)
        user_secrets = db.get_entry(USER_SECRET_TABLE, user_id)

        if user_settings.mfa_enabled == 0 and Security.hash_passwd(request.json.get("password"), user_secrets.password.split("$")[0]) != user_secrets.password:
            return ({"errors": {"password": "Password doesn't match"}}, 403)
        elif user_settings.mfa_enabled == 1 and not pyotp.TOTP(user_secrets.mfa_code).verify(request.json.get("code")):
            return ({"errors": {"code": "Invalid two-factor code"}}, 400)
        
        if channel.icon != "generic" and os.path.isfile(f"{ICONS_FOLDER}{channel.icon}.webp"): 
            os.remove(f"{ICONS_FOLDER}{channel.icon}.webp")

        db.delete_entry(None, channel_id, option="channel")
        return 200
    
    @channels.route("/<channel_id>/leave", methods=["DELETE"])
    @Decorators.manage_database
    @Decorators.auth
    def leave_channel(db, user_id, channel_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not db.get_channel_stuff([user_id, channel_id], "user_channel"):
            return ({"errors": {"channel": "You are not a member"}}, 401)

        if channel.owner == user_id:
            return ({"errors": {"channel": "You are the owner"}}, 400)
        
        if len(db.get_channel_stuff(channel_id, "users")) <= 1:
            db.delete_entry(None, channel_id, option="channel")
            return 200

        db.delete_entry(None, [user_id, channel_id], option="user_channel")
        return 200