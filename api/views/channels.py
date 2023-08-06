import os
import time 

import pyotp
from flask import Blueprint, request
from flask_socketio import join_room, leave_room, close_room
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
    def get_users(db, user, channel_id):
        if not db.get_entry(CHANNEL_TABLE, channel_id):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not db.get_channel_stuff([user.id, channel_id], "user_channel"):
            return ({"errors": {"channel": "You are not a member"}}, 401)

        return ({"channel_users": db.get_channel_stuff(channel_id, "users")}, 200)
        
    @channels.route("/<channel_id>/messages")
    @Decorators.manage_database
    @Decorators.auth
    def get_messages(db, user, channel_id):
        if not db.get_entry(CHANNEL_TABLE, channel_id):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not db.get_channel_stuff([user.id, channel_id], "user_channel"):
            return ({"errors": {"channel": "You are not a member"}}, 401)

        messages = db.get_channel_stuff(channel_id, "messages", request.args.get("before"))

        if 0 < len(messages) <= 50:
            messages[0]["first"] = True

        if len(messages) == 51:
            messages.pop(0)

        return ({"channel_messages": messages}, 200)
    
    
    # POST
    @channels.route("/open", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def open_direct(db, user):
        if not (friend_id := request.json.get("friend")):
            return ({"errors": {"friend": "Friend is invalid"}}, 400)
        
        if not (friend := db.get_user_stuff([user.id, friend_id], "friend")):
            return ({"errors": {"friend": "No friend connection"}}, 400)

        if friend.get("accepted") == "waiting":
            return ({"errors": {"friend": "Friend invite is still pending"}}, 406)
        
        id = f"{min(user.id, friend_id)}-{max(user.id, friend_id)}"
        creation_time = str(time.time())

        if not (channel := db.get_entry(CHANNEL_TABLE, id)):
            channel = Channel(id, None, None, None, creation_time, 1)
            db.insert_entry(CHANNEL_TABLE, channel)

        if not (user_channel := db.get_channel_stuff([user.id, channel.id], "user_channel")):
            user_channel = UserChannel(user.id, id, creation_time, admin=1, direct=1)
            db.insert_entry(USER_CHANNEL_TABLE, user_channel)

        if not (friend_channel := db.get_channel_stuff([friend_id, channel.id], "user_channel")):
            friend_channel = UserChannel(friend_id, id, creation_time, admin=1, direct=1)
            db.insert_entry(USER_CHANNEL_TABLE, friend_channel)

        channel = {
            **channel.__dict__,
            "name": friend.get("name"),
            "display_name": friend_channel.nick if friend_channel.nick else friend.get("display_name"),
            "icon": friend.get("avatar"),
            "notifications": user_channel.notifications,
            "join_time": user_channel.join_time,
            "admin": True,
            "users": db.get_channel_stuff(channel.id, "users"),
            "messages": None
        }

        if user_channel.join_time == creation_time and socketio.server.manager.rooms["/"].get(user.id):
            socketio.emit("channel_invite", channel, to=user.id)

            for sid in socketio.server.manager.rooms["/"].get(user.id, []):
                join_room(channel.get("id"), sid=sid, namespace="/")

        if friend_channel.join_time == creation_time and socketio.server.manager.rooms["/"].get(friend.get("id")):
            channel_2 = {
                **channel,
                "name": user.name,
                "display_name": user_channel.nick if user_channel.nick else user.display_name,
                "icon": user.avatar,
                "notifications": friend_channel.notifications,
                "join_time": friend_channel.join_time,
            }

            socketio.emit("channel_invite", channel_2, to=friend.get("id"))

            for sid in socketio.server.manager.rooms["/"].get(friend.get("id"), []):
                join_room(channel.get("id"), sid=sid, namespace="/")

        socketio.emit("member_list", {"channel_id": channel.get("id"), "member": user.__dict__, "action": "add"}, to=channel.get("id"))
        return ({"channel": channel}, 200)

    @channels.route("/create", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def create_group(db, user):
        if not (name := request.json.get("name")):
            return ({"errors": {"name": "Name is invalid"}}, 400)
        
        if not (users := request.json.get("users")):
            return ({"errors": {"users": "Users are invalid"}}, 400)
        
        if len(users) >= MAX_CHANNEL_USERS:
            return ({"errors": {"users": "Too many users"}}, 406)
        
        if db.count_entry(USER_CHANNEL_TABLE, user.id, "user_id", "user_channel") >= MAX_CHANNELS:
            return ({"errors": {"member": f"You already belongs to {MAX_CHANNELS} group channels"}}, 406)
        
        if verify_error := Functions.verify_name(name, "channel_name"):
            return ({"errors": {"name": verify_error}}, 400)
        
        creation_time = str(time.time())
        channel = Channel(Functions.create_id(creation_time), name, "generic", user.id, creation_time)

        user_channel = UserChannel(user.id, channel.id, creation_time, None, 1)
        channel_members = {user.id: {**user.__dict__, "admin": True}}
        
        db.insert_entry(CHANNEL_TABLE, channel)
        db.insert_entry(USER_CHANNEL_TABLE, user_channel)

        if request.json.get("icon"):
            channel.icon = "loading"

        for member_id in users:
            if not (member := db.get_entry(USER_TABLE, member_id)):
                continue

            if db.count_entry(USER_CHANNEL_TABLE, member.id, "user_id", "user_channel") >= MAX_CHANNELS:
                continue
            
            db.insert_entry(USER_CHANNEL_TABLE, UserChannel(member.id, channel.id, creation_time))
            channel_members[member.id] = member.__dict__

        for member in channel_members.values():
            if not socketio.server.manager.rooms["/"].get(member.get(id)):
                continue

            socketio.emit("channel_invite", {
                **channel.__dict__,
                "notifications": "1",
                "last_message": creation_time,
                "join_time": creation_time,
                "admin": True if member.get(id) else False,
                "users": channel_members,
                "messages": []
            }, to=member.get(id))

            for sid in socketio.server.manager.rooms["/"].get(member.get(id), []):
                join_room(channel.id, sid=sid, namespace="/")

        return ({"channel": {
            **channel.__dict__,
            "notifications": "1",
            "last_message": creation_time,
            "join_time": creation_time,
            "admin": True,
            "users": channel_members,
            "messages": []
        }}, 200)
    
    @channels.route("/<channel_id>/invite", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def invite_member(db, user, channel_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not (user_channel := db.get_channel_stuff([user.id, channel_id], "user_channel")):
            return ({"errors": {"channel": "You are not a member"}}, 401)

        if channel.direct:
            return ({"errors": {"channel": "Direct channel"}}, 406)

        if user.id != channel.owner and not user_channel.admin:
            return ({"errors": {"channel": "You are not a stuff member"}}, 403)

        if not (member := db.get_entry(USER_TABLE, request.json.get("member"))):
            return ({"errors": {"member": "User does not exist"}}, 400)

        current_time = str(time.time())
        member_channel = db.get_channel_stuff([member.id, channel_id], "user_channel")

        if not member_channel:
            if db.count_entry(USER_CHANNEL_TABLE, channel.id, "channel_id") >= MAX_CHANNEL_USERS:
                return ({"errors": {"channel": f"Reached {MAX_CHANNEL_USERS} channel members"}}, 409)

            if db.count_entry(USER_CHANNEL_TABLE, member.id, "user_id", "user_channel") >= MAX_CHANNELS:
                return ({"errors": {"member": f"User already belongs to {MAX_CHANNELS} group channels"}}, 406)

            member_channel = UserChannel(member.id, channel.id, current_time)
            db.insert_entry(USER_CHANNEL_TABLE, member_channel)

            Functions.send_system_message(db, socketio, channel_id, f"{user.name} added {member.name}")

        if socketio.server.manager.rooms["/"].get(member.id):
            socketio.emit("channel_invite", {
                **channel.__dict__,
                "nick": member_channel.nick,
                "notifications": member_channel.notifications,
                "last_message": current_time,
                "join_time": member_channel.join_time,
                "admin": True if member_channel.admin else False,
                "users": db.get_channel_stuff(channel.id, "users"),
                "messages": None
            }, to=member.id)

            for sid in socketio.server.manager.rooms["/"].get(member.id, []):
                join_room(channel_id, sid=sid, namespace="/")

        member = {
            **member.__dict__,
            "nick": member_channel.nick,
            "admin": member_channel.admin,
        }

        socketio.emit("member_list", {"channel_id": channel_id, "member": member, "action": "add"}, to=channel_id)
        return ({"user": member}, 200)
    
    @channels.route("/<channel_id>/message", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def send_message(db, user, channel_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not (user_channel := db.get_channel_stuff([user.id, channel_id], "user_channel")):
            return ({"errors": {"channel": "You are not a member"}}, 401)
        
        if user_channel.direct and (not (friend := db.get_user_stuff([user.id, channel_id.replace(user.id, "").replace("-", "")], "friend")) or friend.get("accepted", "waiting") == "waiting"):
            return ({"errors": {"channel": "No friend connection"}}, 403)

        if not (content := request.json.get("content")):
            return ({"errors": {"message": "Invalid message content"}}, 400)
        
        if len(content) > 2000:
            return ({"errors": {"message": "Message too long"}}, 413)

        create_time = str(time.time())
        message = Message(Functions.create_id(create_time), user.id, channel_id, content.strip(), create_time)
        db.insert_entry(MESSAGE_TABLE, message)

        if user_channel.direct:
            if not (friend_channel := db.get_channel_stuff([friend.get("id"), channel.id], "user_channel")):
                friend_channel = UserChannel(friend.get("id"), channel.id, create_time, admin=1, direct=1)
                db.insert_entry(USER_CHANNEL_TABLE, friend_channel)

            if friend_channel.join_time == create_time and socketio.server.manager.rooms["/"].get(friend.get("id")):
                channel = {
                    **channel.__dict__,
                    "name": user.name,
                    "display_name": user_channel.nick if user_channel.nick else user.display_name,
                    "icon": user.avatar,
                    "notifications": friend_channel.notifications,
                    "join_time": friend_channel.join_time,
                    "admin": True,
                    "users": db.get_channel_stuff(channel.id, "users"),
                    "messages": None
                }

                socketio.emit("channel_invite", channel, to=friend.get("id"))

                for sid in socketio.server.manager.rooms["/"].get(friend.get("id"), []):
                    join_room(channel.get("id"), sid=sid, namespace="/")

        socketio.send(message.__dict__, to=channel_id)
        return ({"content": message.__dict__}, 200)


    # PATCH
    @channels.route("/<channel_id>/settings", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def settings_channel(db, user, channel_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not (user_channel := db.get_channel_stuff([user.id, channel_id], "user_channel")):
            return ({"errors": {"channel": "You are not a member"}}, 401)

        if (name := request.json.get("name")) and name != channel.name:
            if channel.direct:
                return ({"errors": {"channel": "Direct channel"}}, 406)

            if user.id != channel.owner and not user_channel.admin:
                return ({"errors": {"channel": "You are not a stuff member"}}, 403)
            
            if verify_error := Functions.verify_name(name, "channel_name"):
                return ({"errors": {"name": verify_error}}, 400)

            db.update_entry(CHANNEL_TABLE, channel_id, "name", name)
            Functions.send_system_message(db, socketio, channel_id, f"{user.name} changed channel name to '{name}'")
            socketio.emit("channel_change", {"channel_id": channel_id, "setting": "name", "content": name}, to=channel_id)

        if (nick := request.json.get("nick", None)) != user_channel.nick:
            if verify_error := Functions.verify_name(nick, "display_name"):
                return ({"errors": {"nick": verify_error}}, 400)
            
            db.update_entry(USER_CHANNEL_TABLE, [user.id, channel_id], "nick", nick, "user_channel")
            Functions.send_system_message(db, socketio, channel_id, f"{user.name} changed their nickname to '{nick}'")
            socketio.emit("member_change", {"channel_id": channel_id, "member_id": user.id, "setting": "nick", "content": nick}, to=channel_id)

        notifications = str(time.time()) if request.json.get("notifications") else "0"
        if notifications != user_channel.notifications:
            db.update_entry(USER_CHANNEL_TABLE, [user.id, channel_id], "notifications", notifications, "user_channel")
            socketio.emit("channel_change", {"channel_id": channel_id, "setting": "notifications", "content": notifications}, to=user.id)

        return 200
    
    @channels.route("/<channel_id>/users/<member_id>/nick", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def member_nick(db, user, channel_id, member_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)
        
        if not (member := db.get_entry(USER_TABLE, member_id)):
            return ({"errors": {"user": "Selected user does not exist"}}, 400)

        if not (user_channel := db.get_channel_stuff([user.id, channel_id], "user_channel")) or not (member_channel := db.get_channel_stuff([member_id, channel_id], "user_channel")):
            return ({"errors": {"channel": "You or selected user is not a member"}}, 401)

        if user.id != channel.owner and not user_channel.admin:
            return ({"errors": {"channel": "You are not a stuff member"}}, 403)
        
        if member_id == channel.owner:
            return ({"errors": {"user": "Selected member is the owner"}}, 403)
        
        if (nick := request.json.get("nick")) == member_channel.nick:
            return ({"errors": {"nick": "Invalid nickname"}}, 400)
        
        if verify_error := Functions.verify_name(nick, "display_name"):
            return ({"errors": {"nick": verify_error}}, 400)
        
        db.update_entry(USER_CHANNEL_TABLE, [member_id, channel_id], "nick", nick, "user_channel")
        Functions.send_system_message(db, socketio, channel_id, f"{user.name} changed {member.name}'s nickname to '{nick}'")
        socketio.emit("member_change", {"channel_id": channel_id, "member_id": member_id, "setting": "nick", "content": nick}, to=channel_id)
        return 200

    @channels.route("/<channel_id>/users/<member_id>/admin", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def member_admin(db, user, channel_id, member_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)
        
        if not (member := db.get_entry(USER_TABLE, member_id)):
            return ({"errors": {"user": "Selected user does not exist"}}, 400)

        if not (user_channel := db.get_channel_stuff([user.id, channel_id], "user_channel")) or not (member_channel := db.get_channel_stuff([member_id, channel_id], "user_channel")):
            return ({"errors": {"channel": "You or selected user is not a member"}}, 401)
        
        if channel.direct:
            return ({"errors": {"channel": "Direct channel"}}, 406)
        
        if user.id != channel.owner and not user_channel.admin:
                return ({"errors": {"channel": "You are not a stuff member"}}, 403)

        if user.id == member_id:
            return ({"errors": {"user": "Client user"}}, 406)

        if member_id == channel.owner:
            return ({"errors": {"user": "Selected member is the owner"}}, 403)

        admin_status = 0 if member_channel.admin else 1
        db.update_entry(USER_CHANNEL_TABLE, [member_id, channel_id], "admin", admin_status, "user_channel")

        Functions.send_system_message(db, socketio, channel_id, f"{user.name} {'added' if admin_status else 'removed'} {member.name} as admin")
        socketio.emit("member_change", {"channel_id": channel_id, "member_id": member_id, "setting": "admin", "content": admin_status}, to=channel_id)
        return ({"admin_status": admin_status}, 200)

    @channels.route("/<channel_id>/users/<member_id>/owner", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def member_owner(db, user, channel_id, member_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)
        
        if not (member := db.get_entry(USER_TABLE, member_id)):
            return ({"errors": {"user": "Selected user does not exist"}}, 400)
        
        if not db.get_channel_stuff([user.id, channel_id], "user_channel") or not db.get_channel_stuff([member_id, channel_id], "user_channel"):
            return ({"errors": {"channel": "You or selected user is not a member"}}, 401)
        
        if channel.direct:
            return ({"errors": {"channel": "Direct channel"}}, 406)
        
        if channel.owner != user.id:
            return ({"errors": {"channel": "You are not the owner"}}, 403)
        
        user_settings = db.get_entry(USER_SETTING_TABLE, user.id)
        user_secrets = db.get_entry(USER_SECRET_TABLE, user.id)

        if user_settings.mfa_enabled == 0 and Security.hash_passwd(request.json.get("password"), user_secrets.password.split("$")[0]) != user_secrets.password:
            return ({"errors": {"password": "Password doesn't match"}}, 403)
        elif user_settings.mfa_enabled == 1 and not pyotp.TOTP(user_secrets.mfa_code).verify(request.json.get("code")):
            return ({"errors": {"code": "Invalid two-factor code"}}, 400)

        db.update_entry(CHANNEL_TABLE, channel_id, "owner", member_id)
        Functions.send_system_message(db, socketio, channel_id, f"{user.name} transferred ownership to {member.name}")
        socketio.emit("channel_change", {"channel_id": channel_id, "setting": "owner", "content": member_id}, to=channel_id)
        return 200
        
    @channels.route("<channel_id>/message/<message_id>/edit", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def edit_message(db, user, channel_id, message_id):
        if not db.get_entry(CHANNEL_TABLE, channel_id):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not (user_channel := db.get_channel_stuff([user.id, channel_id], "user_channel")):
            return ({"errors": {"channel": "You are not a member"}}, 401)
        
        if user_channel.direct and (not (friend := db.get_user_stuff([user.id, channel_id.replace(user.id, "").replace("-", "")], "friend")) or friend.get("accepted", "waiting") == "waiting"):
            return ({"errors": {"channel": "No friend connection"}}, 403)

        if not (message := db.get_entry(MESSAGE_TABLE, message_id)):
            return ({"errors": {"message": "Message does not exist"}}, 400)

        if user.id != message.author:
            return ({"errors": {"message": "You can't edit this message"}}, 403)
        
        if not (content := request.json.get("content")):
            return ({"errors": {"message": "Invalid message content"}}, 400)
        
        content = content.strip()

        if len(content) > 2000:
            return ({"errors": {"message": "Message too long"}}, 413)

        if message.content == content:
            return ({"errors": {"message": "Edited message is the same"}}, 406)
        
        db.update_entry(MESSAGE_TABLE, message_id, "content", content)
        db.update_entry(MESSAGE_TABLE, message_id, "edited", 1)

        message.content = content
        message.edited = 1

        socketio.emit("message_edit", message.__dict__, to=channel_id)
        return 200
    

    # DELETE
    @channels.route("/<channel_id>/delete", methods=["DELETE"])
    @Decorators.manage_database
    @Decorators.auth
    def delete_channel(db, user, channel_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)
        
        if channel.direct:
            return ({"errors": {"channel": "Direct channel"}}, 406)
        
        if channel.owner != user.id:
            return ({"errors": {"channel": "You are not the owner"}}, 403)
        
        user_settings = db.get_entry(USER_SETTING_TABLE, user.id)
        user_secrets = db.get_entry(USER_SECRET_TABLE, user.id)

        if user_settings.mfa_enabled == 0 and Security.hash_passwd(request.json.get("password"), user_secrets.password.split("$")[0]) != user_secrets.password:
            return ({"errors": {"password": "Password doesn't match"}}, 403)
        elif user_settings.mfa_enabled == 1 and not pyotp.TOTP(user_secrets.mfa_code).verify(request.json.get("code")):
            return ({"errors": {"code": "Invalid two-factor code"}}, 400)
        
        if channel.icon != "generic" and os.path.isfile(f"{ICONS_FOLDER}{channel.icon}.webp"): 
            os.remove(f"{ICONS_FOLDER}{channel.icon}.webp")

        db.delete_entry(None, channel_id, option="channel")
        socketio.emit("channel_delete", {"channel_id": channel_id}, to=channel_id)
        close_room(channel_id, "/")
        return 200
    
    @channels.route("/<channel_id>/leave", methods=["DELETE"])
    @Decorators.manage_database
    @Decorators.auth
    def leave_channel(db, user, channel_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not db.get_channel_stuff([user.id, channel_id], "user_channel"):
            return ({"errors": {"channel": "You are not a member"}}, 401)

        if channel.owner == user.id:
            return ({"errors": {"channel": "You are the owner"}}, 400)
        
        db.delete_entry(None, [user.id, channel_id], option="user_channel")

        if len(db.get_channel_stuff(channel_id, "users")) == 0:
            db.delete_entry(None, channel_id, option="channel")
            socketio.emit("channel_delete", {"channel_id": channel_id}, to=channel_id)
            close_room(channel_id, "/")
            return 200

        if socketio.server.manager.rooms["/"].get(user.id):
            socketio.emit("member_list", {"channel_id": channel_id, "member": user.id, "action": "remove"}, to=user.id)

            for sid in socketio.server.manager.rooms["/"].get(user.id, []):
                leave_room(channel_id, sid=sid, namespace="/")

        if not channel.direct:
            Functions.send_system_message(db, socketio, channel_id, f"{user.name} left")

        socketio.emit("member_list", {"channel_id": channel_id, "member": user.id, "action": "remove"}, to=channel_id)
        return 200
    
    @channels.route("/<channel_id>/users/<member_id>/kick", methods=["DELETE"])
    @Decorators.manage_database
    @Decorators.auth
    def member_kick(db, user, channel_id, member_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)
        
        if not (member := db.get_entry(USER_TABLE, member_id)):
            return ({"errors": {"user": "Selected user does not exist"}}, 400)

        if not (user_channel := db.get_channel_stuff([user.id, channel_id], "user_channel")) or not db.get_channel_stuff([member_id, channel_id], "user_channel"):
            return ({"errors": {"channel": "You or selected user is not a member"}}, 401)
        
        if channel.direct:
            return ({"errors": {"channel": "Direct channel"}}, 406)
        
        if user.id != channel.owner and not user_channel.admin:
                return ({"errors": {"channel": "You are not a stuff member"}}, 403)

        if user.id == member_id:
            return ({"errors": {"user": "Client user"}}, 406)

        if member_id == channel.owner:
            return ({"errors": {"user": "Selected member is the owner"}}, 403)

        db.delete_entry(None, [member_id, channel_id], option="user_channel")

        if socketio.server.manager.rooms["/"].get(member_id):
            socketio.emit("member_list", {"channel_id": channel_id, "member": member_id, "action": "remove"}, to=member_id)

            for sid in socketio.server.manager.rooms["/"].get(member_id, []):
                leave_room(channel_id, sid=sid, namespace="/")

        Functions.send_system_message(db, socketio, channel_id, f"{user.name} kicked {member.name}")
        socketio.emit("member_list", {"channel_id": channel_id, "member": member_id, "action": "remove"}, to=channel_id)
        return 200
    
    @channels.route("<channel_id>/message/<message_id>/delete", methods=["DELETE"])
    @Decorators.manage_database
    @Decorators.auth
    def delete_message(db, user, channel_id, message_id):
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)

        if not (user_channel := db.get_channel_stuff([user.id, channel_id], "user_channel")):
            return ({"errors": {"channel": "You are not a member"}}, 401)

        if not (message := db.get_entry(MESSAGE_TABLE, message_id)):
            return ({"errors": {"message": "Message does not exist"}}, 400)

        if user.id != message.author and (not channel.direct and user.id != channel.owner and not user_channel.admin):
            return ({"errors": {"message": "You can't delete this message"}}, 403)

        db.delete_entry(MESSAGE_TABLE, message_id)
        socketio.emit("message_delete", {"channel_id": channel_id, "message_id": message_id}, to=channel_id)
        return 200