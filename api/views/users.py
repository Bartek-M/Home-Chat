import os
import time 
import secrets

import pyotp
from flask import Blueprint, request
from flask_socketio import disconnect
from __main__ import socketio

from ..database import *
from ..utils import *


class Users:
    """
    Users api class
    /api/users/
    """
    users = Blueprint("users", __name__)

    # GET
    @users.route("/@me")
    @Decorators.manage_database
    @Decorators.auth
    def get_me(db, user):
        settings = db.get_entry(USER_SETTING_TABLE, user.id)

        if not settings:
            return 404

        return ({"user": {
            **user.__dict__,
            **settings.__dict__
        }}, 200)
    
    @users.route("/@me/channels")
    @Decorators.manage_database
    @Decorators.auth
    def get_channels(db, user):
        return ({"user_channels": db.get_user_stuff(user.id, "channels")}, 200)

    @users.route("/@me/friends")
    @Decorators.manage_database
    @Decorators.auth
    def get_friends(db, user):
        return ({"user_friends": db.get_user_stuff(user.id, "friends")}, 200)
    

    # POST
    @users.route("/search", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def search_users(db, user):
        if not (username := request.json.get("username")):
            return ({"errors": {"username": "Username is invalid."}}, 400)
        
        if not (search_user := db.get_entry(USER_TABLE, username.lower(), "name")) or search_user.visibility == 0:
            return ({"errors": {"username": "User does not exist."}}, 400)
        
        if search_user.id == user.id:
            return ({"errors": {"username": "User is a client user."}}, 406)
    
        friend = db.get_user_stuff([user.id, search_user.id], "friend")
        friend_accepted = friend.get("accepted") if friend else None
        friend_invited = friend.get("inviting") if friend else None

        return ({"user": {**search_user.__dict__, "accepted": friend_accepted, "inviting": friend_invited}}, 200)
    
    @users.route("/@me/friends/add", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def add_friend(db, user):
        if not (friend_id := request.json.get("friend")):
            return ({"errors": {"friend": "No friend"}}, 400)

        if friend_id == user.id: 
            return ({"errors": {"friend": "Invalid friend"}}, 406)
        
        if not (friend := db.get_entry(USER_TABLE, friend_id)):
            return ({"errors": {"friend": "User does not exist"}}, 400)
        
        if db.get_user_stuff([user.id, friend_id], "friend"):
            return ({"errors": {"friend": "Already added"}}, 400)
        
        db.insert_entry(USER_FRIENDS_TABLE, UserFriend(user.id, friend_id))

        invited_friend = {**friend.__dict__, "accepted": "waiting", "inviting": user.id}
        inviting_friend = {**user.id.__dict__, "accepted": "waiting", "inviting": user.id}

        socketio.emit("friends_change", {"action": "add", "friend": invited_friend}, to=user.id)
        socketio.emit("friends_change", {"action": "add", "friend": inviting_friend}, to=friend_id)

        return ({"friend": invited_friend}, 200)


    # PATCH
    @users.route("/@me", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def change_user(db, user):
        user_secrets = db.get_entry(USER_SECRET_TABLE, user.id)

        if (data := request.json.get("data")) is None or (category := request.json.get("category")) is None:
            return ({"errors": {"data": "No data or category", "category": "No data or category"}}, 400)
        if not (password := request.json.get("password")) or Security.hash_passwd(password, user_secrets.password.split("$")[0]) != user_secrets.password:
            return ({"errors": {"password": "Password doesn't match"}}, 403)
        
        if category == "name":
            name = data.lower()

            if db.get_entry(USER_TABLE, name, "name"):
                return ({"errors": {"name": "Username is already taken"}}, 409)

            db.update_entry(USER_TABLE, user.id, "name", name)
            socketio.emit("user_change", {"setting": "name", "content": name}, to=user.id)
            return 200

        if category == "email":
            email = data.lower()

            if not Functions.verify_email(email):
                return ({"errors": {"email": "Invalid email form"}}, 400)
            if db.get_entry(USER_SETTING_TABLE, email, "email"):
                return ({"errors": {"email": "Email is already registered!"}}, 406)
            
            Mailing.send_email_verification(email, user.name, Security.gen_token(user.id, user_secrets.secret, f"email-new|{email}"))
            return 200

        if category == "password":
            if len(data) < 6:
                return ({"errors": {"new_password": "Password must have at least 6 characters"}}, 400)
            if data == password:
                return ({"errors": {"new_password": "Password must not be the same"}}, 400)
            
            if db.get_entry(USER_SETTING_TABLE, user.id).mfa_enabled == 1 and not pyotp.TOTP(user_secrets.mfa_code).verify(request.json.get("code")):
                return ({"errors": {"code": "Invalid two-factor code"}}, 400)
            
            secret = secrets.token_hex(32)

            db.update_entry(USER_SECRET_TABLE, user.id, "password", Security.hash_passwd(data))
            db.update_entry(USER_SECRET_TABLE, user.id, "secret", secret)

            socketio.emit("logout", {"reason": "password changed"}, to=user.id)

            for sid in socketio.server.manager.rooms["/"].get(user.id, {}).copy():
                disconnect(sid=sid, namespace="/")

            return ({"token": Security.gen_token(user_secrets.id, secret)}, 200)
 
        return ({"errors": {"category": "Invalid category"}}, 400)
    
    @users.route("/@me/settings", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def change_settings(db, user):
        if (data := request.json.get("data")) is None or (category := request.json.get("category")) is None:
            return ({"errors": {"data": "No data or category", "category": "No data or category"}}, 400)
        
        if category == "display_name":
            db.update_entry(USER_TABLE, user.id, "display_name", data if data != "" else None)
        elif category == "theme":
            if data not in ["auto", "light", "dark"]:
                return ({"errors": {"theme": "Invalid theme"}}, 400)
            
            db.update_entry(USER_SETTING_TABLE, user.id, category, data)
        elif category == "message_display":
            if data not in ["standard", "compact"]:
                return ({"errors": {"message_display": "Invalid message_display"}}, 400)
            
            db.update_entry(USER_SETTING_TABLE, user.id, category, data)
        elif category == "visibility":
            if data not in [0, 1]:
                return ({"errors": {"visibility": "Invalid visibility"}}, 400)
            
            db.update_entry(USER_TABLE, user.id, category, data)
        else:
            return ({"errors": {"category": "Invalid category"}}, 400)
        
        socketio.emit("user_change", {"setting": category, "content": data}, to=user.id)
        return 200
    
    @users.route("/@me/settings/mfa", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def setup_mfa(db, user):
        user_secrets = db.get_entry(USER_SECRET_TABLE, user.id)

        if request.json.get("option") == "enable":
            if not (password := request.json.get("password")) or Security.hash_passwd(password, user_secrets.password.split("$")[0]) != user_secrets.password:
                return ({"errors": {"password": "Password doesn't match"}}, 403)
            
            # Check if there's a valid secret
            try:
                secret = request.json.get("secret")
                pyotp.TOTP(secret).now()
            except:
                return ({"errors": {"secret": "Invalid two-factor secret"}}, 400)
            
            if not pyotp.TOTP(secret).verify((request.json.get("code"))):
                return ({"errors": {"code": "Invalid two-factor code"}}, 400)
            
            db.update_entry(USER_SECRET_TABLE, user.id, "mfa_code", secret)
            db.update_entry(USER_SETTING_TABLE, user.id, "mfa_enabled", 1)

            socketio.emit("user_change", {"setting": "mfa_enabled", "content": 1}, to=user.id)
            return 200
        
        if request.json.get("option") == "disable":
            if not pyotp.TOTP(user_secrets.mfa_code).verify(request.json.get("code")):
                return ({"errors": {"code": "Invalid two-factor code"}}, 400)
            
            db.update_entry(USER_SETTING_TABLE, user.id, "mfa_enabled", 0)
            db.update_entry(USER_SECRET_TABLE, user.id, "mfa_code", None)
            socketio.emit("user_change", {"setting": "mfa_enabled", "content": 0}, to=user.id)

            return 200

        return ({"errors": {"option": "Invalid option"}}, 400)
    
    @users.route("/@me/friends/confirm", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def confirm_friend(db, user):
        if not (friend_id := request.json.get("friend")):
            return ({"errors": {"friend": "No friend"}}, 400)

        if friend_id == user.id: 
            return ({"errors": {"friend": "Invalid friend"}}, 406)

        if not (friend := db.get_user_stuff([user.id, friend_id], "friend")):
            return ({"errors": {"friend": "No friend connection"}}, 400)
        
        if friend.get("inviting") == user.id:
            return ({"errors": {"friend": "Inviting user can't confirm an invite"}}, 406)
        
        if friend.get("accepted") != "waiting":
            return ({"errors": {"friend": "Already confirmed"}}, 406)
        
        current_time = time.time()
        db.update_entry(USER_FRIENDS_TABLE, [user.id, friend_id], "accepted", current_time, "friend")

        user = {**user.__dict__, "accepted": current_time, "inviting": friend.get("inviting") }
        friend = {**friend, "accepted": current_time}

        socketio.emit("friends_change", {"action": "confirm", "friend": friend}, to=user.id)
        socketio.emit("friends_change", {"action": "confirm", "friend": user}, to=friend_id)

        return ({"friend": friend}, 200)

    @users.route("/@me/notifications/", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def notifications(db, user):
        option = request.json.get("option")
        position = request.json.get("position")

        if position != 0 and position != 1:
            return ({"errors": {"position": "Invalid position"}}, 400)
            
        if option == "notifications":
            db.update_entry(USER_TABLE, user.id, "notifications", position)
        elif option == "notifications_message":
            db.update_entry(USER_SETTING_TABLE, user.id, "notifications_message", position)
        elif option == "notifications_friend":
            db.update_entry(USER_SETTING_TABLE, user.id, "notifications_friend", position)
        elif option == "notifications_changelog":
            position = "1" if position else None
            db.update_entry(USER_SETTING_TABLE, user.id, "notifications_changelog", position)
        else:
            return ({"errors": {"option": "Invalid option"}}, 400)

        socketio.emit("user_change", {"setting": option, "content": position}, to=user.id)
        return ({"position": position}, 200)
        
    
    # DELETE
    @users.route("/@me/delete", methods=["DELETE"])
    @Decorators.manage_database
    @Decorators.auth
    def delete_account(db, user):
        if db.get_entry(CHANNEL_TABLE, user.id, "owner"):
            return ({"errors": {"channels": "You own some channels!"}}, 400)
        
        user_secrets = db.get_entry(USER_SECRET_TABLE, user.id)

        if not (password := request.json.get("password")) or Security.hash_passwd(password, user_secrets.password.split("$")[0]) != user_secrets.password:
            return ({"errors": {"password": "Password doesn't match"}}, 403)

        if db.get_entry(USER_SETTING_TABLE, user.id).mfa_enabled == 1 and not pyotp.TOTP(user_secrets.mfa_code).verify(request.json.get("code")):
            return ({"errors": {"code": "Invalid two-factor code"}}, 400)
        
        if user.avatar != "generic" and os.path.isfile(f"{AVATARS_FOLDER}{user.avatar}.webp"): 
            os.remove(f"{AVATARS_FOLDER}{user.avatar}.webp")
        
        db.delete_entry(None, user.id, option="account")

        socketio.emit("logout", {"reason": "account deleted"}, to=user.id)

        for sid in socketio.server.manager.rooms["/"].get(user.id, {}).copy():
            disconnect(sid=sid, namespace="/")

        return 200
    
    @users.route("/@me/friends/remove", methods=["DELETE"])
    @users.route("/@me/friends/decline", methods=["DELETE"])
    @Decorators.manage_database
    @Decorators.auth
    def remove_friend(db, user):
        if not (friend_id := request.json.get("friend")):
            return ({"errors": {"friend": "No friend"}}, 400)

        if friend_id == user.id: 
            return ({"errors": {"friend": "Invalid friend"}}, 406)
        
        if not db.get_entry(USER_TABLE, friend_id):
            return ({"errors": {"friend": "User does not exist"}}, 400)

        if not db.get_user_stuff([user.id, friend_id], "friend"):
            return ({"errors": {"friend": "No friend connection"}}, 400)
        
        db.delete_entry(None, [user.id, friend_id], option="user_friend")

        socketio.emit("friends_change", {"action": "remove", "friend": friend_id}, to=user.id)
        socketio.emit("friends_change", {"action": "remove", "friend": user.id}, to=friend_id)

        return ({"friend": friend_id}, 200)