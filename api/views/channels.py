import os
import time 

import pyotp
from flask import Blueprint, request
from flask_socketio import rooms, leave_room
from __main__ import socketio

from ..database import *
from ..utils import *


class Channels:
    """
    Channels api class
    /api/channels/
    """
    channels = Blueprint("channels", __name__)
    
    # GET  
    @channels.route("/<channel_id>/users")
    @Decorators.manage_database
    @Decorators.auth
    def get_users(db, user_id, channel_id):
        if not db.get_entry(CHANNEL_TABLE, channel_id):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not db.get_channel_stuff([user_id, channel_id], "user_channel"):
            return ({"errors": {"channel": "You are not a member"}}, 401)

        return ({"channel_users": db.get_channel_stuff(channel_id, "users")}, 200)
        
    @channels.route("/<channel_id>/messages")
    @Decorators.manage_database
    @Decorators.auth
    def get_messages(db, user_id, channel_id):
        if not db.get_entry(CHANNEL_TABLE, channel_id):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not (user_channel := db.get_channel_stuff([user_id, channel_id], "user_channel")):
            return ({"errors": {"channel": "You are not a member"}}, 401)

        if user_channel.notifications != "0":
            db.update_entry(USER_CHANNEL_TABLE, [user_id, channel_id], "notifications", str(time.time()), "user_channel")

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
        channel = Channel(Functions.create_id(creation_time), name, "generic", user_id, creation_time)
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
    
    @channels.route("/<channel_id>/message", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def send_message(db, user_id, channel_id):
        if not db.get_entry(CHANNEL_TABLE, channel_id):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not (user_channel := db.get_channel_stuff([user_id, channel_id], "user_channel")):
            return ({"errors": {"channel": "You are not a member"}}, 401)
        
        if not (content := request.json.get("content")):
            return ({"errors": {"message": "Invalid message content"}}, 400)
        
        if len(content) > 2000:
            return ({"errors": {"message": "Message too long"}}, 413)

        create_time = str(time.time())
        message = Message(Functions.create_id(create_time), user_id, channel_id, content, create_time)
        db.insert_entry(MESSAGE_TABLE, message)

        if user_channel.notifications != "0":
            db.update_entry(USER_CHANNEL_TABLE, [user_id, channel_id], "notifications", create_time, "user_channel")

        socketio.send(message.__dict__, to=channel_id)
        return ({"content": message.__dict__}, 200)


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
            socketio.emit("channel_change", {"channel_id": channel_id, "setting": "name", "content": name}, to=channel_id)

        if (nick := request.json.get("nick")) != user_channel.nick:
            db.update_entry(USER_CHANNEL_TABLE, [user_id, channel_id], "nick", nick, "user_channel")
            socketio.emit("member_change", {"channel_id": channel_id, "member_id": user_id, "setting": "nick", "content": nick}, to=channel_id)

        notifications = 1 if request.json.get("notifications") else "0"
        if notifications != user_channel.notifications:
            db.update_entry(USER_CHANNEL_TABLE, [user_id, channel_id], "notifications", notifications, "user_channel")
            socketio.emit("channel_change", {"channel_id": channel_id, "setting": "notifications", "content": notifications}, to=user_id)

        return 200
    
    @channels.route("/<channel_id>/users/<member_id>/nick", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def member_nick(db, user_id, channel_id, member_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not (user_channel := db.get_channel_stuff([user_id, channel_id], "user_channel")) or not (member_channel := db.get_channel_stuff([member_id, channel_id], "user_channel")):
            return ({"errors": {"channel": "You or selected user is not a member"}}, 401)

        if user_id != channel.owner and not user_channel.admin:
            return ({"errors": {"channel": "You are not a stuff member"}}, 403)
        
        if member_id == channel.owner:
            return ({"errors": {"user": "Selected member is the owner"}}, 403)
        
        if (nick := request.json.get("nick")) == member_channel.nick:
            return ({"errors": {"nick": "Invalid nickname"}}, 400)

        db.update_entry(USER_CHANNEL_TABLE, [member_id, channel_id], "nick", nick, "user_channel")
        socketio.emit("member_change", {"channel_id": channel_id, "member_id": member_id, "setting": "nick", "content": nick}, to=channel_id)
        return 200

    @channels.route("/<channel_id>/users/<member_id>/admin", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def member_admin(db, user_id, channel_id, member_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not (user_channel := db.get_channel_stuff([user_id, channel_id], "user_channel")) or not (member_channel := db.get_channel_stuff([member_id, channel_id], "user_channel")):
            return ({"errors": {"channel": "You or selected user is not a member"}}, 401)
        
        if channel.direct:
            return ({"errors": {"channel": "Direct channel"}}, 406)
        
        if user_id != channel.owner and not user_channel.admin:
                return ({"errors": {"channel": "You are not a stuff member"}}, 403)

        if user_id == member_id:
            return ({"errors": {"user": "Client user"}}, 406)

        if member_id == channel.owner:
            return ({"errors": {"user": "Selected member is the owner"}}, 403)

        admin_status = 0 if member_channel.admin else 1
        db.update_entry(USER_CHANNEL_TABLE, [member_id, channel_id], "admin", admin_status, "user_channel")

        socketio.emit("member_change", {"channel_id": channel_id, "member_id": member_id, "setting": "admin", "content": admin_status}, to=channel_id)
        return ({"admin_status": admin_status}, 200)

    @channels.route("/<channel_id>/users/<member_id>/owner", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def member_owner(db, user_id, channel_id, member_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)
        
        if not db.get_channel_stuff([user_id, channel_id], "user_channel") or not db.get_channel_stuff([member_id, channel_id], "user_channel"):
            return ({"errors": {"channel": "You or selected user is not a member"}}, 401)
        
        if channel.direct:
            return ({"errors": {"channel": "Direct channel"}}, 406)
        
        if channel.owner != user_id:
            return ({"errors": {"channel": "You are not the owner"}}, 403)
        
        user_settings = db.get_entry(USER_SETTING_TABLE, user_id)
        user_secrets = db.get_entry(USER_SECRET_TABLE, user_id)

        if user_settings.mfa_enabled == 0 and Security.hash_passwd(request.json.get("password"), user_secrets.password.split("$")[0]) != user_secrets.password:
            return ({"errors": {"password": "Password doesn't match"}}, 403)
        elif user_settings.mfa_enabled == 1 and not pyotp.TOTP(user_secrets.mfa_code).verify(request.json.get("code")):
            return ({"errors": {"code": "Invalid two-factor code"}}, 400)

        db.update_entry(CHANNEL_TABLE, channel_id, "owner", member_id)
        socketio.emit("channel_change", {"channel_id": channel_id, "setting": "owner", "content": member_id}, to=channel_id)
        return 200
    

    # DELETE
    @channels.route("/<channel_id>/delete", methods=["DELETE"])
    @Decorators.manage_database
    @Decorators.auth
    def delete_channel(db, user_id, channel_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)
        
        if channel.direct:
            return ({"errors": {"channel": "Direct channel"}}, 406)
        
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
    
    @channels.route("/<channel_id>/users/<member_id>/kick", methods=["DELETE"])
    @Decorators.manage_database
    @Decorators.auth
    def member_kick(db, user_id, channel_id, member_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not (user_channel := db.get_channel_stuff([user_id, channel_id], "user_channel")) or not db.get_channel_stuff([member_id, channel_id], "user_channel"):
            return ({"errors": {"channel": "You or selected user is not a member"}}, 401)
        
        if channel.direct:
            return ({"errors": {"channel": "Direct channel"}}, 406)
        
        if user_id != channel.owner and not user_channel.admin:
                return ({"errors": {"channel": "You are not a stuff member"}}, 403)

        if user_id == member_id:
            return ({"errors": {"user": "Client user"}}, 406)

        if member_id == channel.owner:
            return ({"errors": {"user": "Selected member is the owner"}}, 403)

        # Disconnect user clients from room        
        # for sid in socketio.server.manager.rooms["/"].get(user_id, []):
        #     leave_room(channel_id, sid=sid, namespace="/")

        db.delete_entry(None, [member_id, channel_id], option="user_channel")
        return 200