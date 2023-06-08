import time 
import secrets

import pyotp
from flask import Blueprint, request

from ..database import *
from ..utils import *


class Users:
    """
    Users api class
    /api/users/
    """
    users = Blueprint("users", __name__)

    # GET
    @users.route("/<user_id>")
    @Decorators.manage_database
    @Decorators.auth
    def get_user(db, user_id):
        if (usr := db.get_entry(USER_TABLE, user_id)):
            return (usr, 200)
        
        return None
    
    @users.route("/<user_id>/channels")
    @Decorators.manage_database
    @Decorators.auth
    def get_channels(db, user_id):
        return ({"user_channels": db.get_user_stuff(user_id, "channels")}, 200)

    @users.route("/<user_id>/friends")
    @Decorators.manage_database
    @Decorators.auth
    def get_friends(db, user_id):
        return ({"user_friends": db.get_user_stuff(user_id, "friends")}, 200)

    @users.route("/<user_id>/settings")
    @Decorators.manage_database
    @Decorators.auth
    def get_settings(db, user_id):
        if (user := db.get_entry(USER_TABLE, user_id).__dict__) and (stng := db.get_entry(USER_SETTING_TABLE, user_id).__dict__):
            return ({"user": {**user, **stng}}, 200)
        
        return None
    

    # POST
    @users.route("/search", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def search_users(db, user_id):
        if not (username := request.json.get("username")):
            return ({"errors": {"username": "Username is invalid."}}, 400)
        
        if not (user := db.get_user(username, "name")) or user.visibility == 0:
            return ({"errors": {"username": "User does not exist."}}, 400)
        
        if user.id == user_id:
            return ({"errors": {"username": "User is a client user."}}, 406)
    
        friend = db.get_user_stuff([user_id, user.id], "friend")
        friend_accepted = friend.get("accepted") if friend else None
        friend_invited = friend.get("inviting") if friend else None

        return ({"user": {**user.__dict__, "accepted": friend_accepted, "inviting": friend_invited}}, 200)
    
    @users.route("/<user_id>/friends/add", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def add_friend(db, user_id):
        if not (friend_id := request.json.get("friend")):
            return ({"errors": {"friend": "No friend"}}, 400)

        if friend_id == user_id: 
            return ({"errors": {"friend": "Invalid friend"}}, 406)
        
        if not db.get_entry(USER_TABLE, friend_id):
            return ({"errors": {"friend": "User does not exist"}}, 400)
        
        if db.get_user_stuff([user_id, friend_id], "friend"):
            return ({"errors": {"friend": "Already added"}}, 400)
        
        db.insert_entry(USER_FRIENDS_TABLE, UserFriend(user_id, friend_id))
        return 200


    # PATCH
    @users.route("/<user_id>", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def change_user(db, user_id):
        user_secrets = db.get_entry(USER_SECRET_TABLE, user_id)

        if (data := request.json.get("data")) is None or (category := request.json.get("category")) is None:
            return ({"errors": {"data": "No data or category", "category": "No data or category"}}, 400)
        if not (password := request.json.get("password")) or Security.hash_passwd(password, user_secrets.password.split("$")[0]) != user_secrets.password:
            return ({"errors": {"password": "Password doesn't match"}}, 403)
        
        if category == "name":
            if db.get_user(data, "name"):
                return ({"errors": {"username": "Username is already taken"}}, 409)

            db.update_entry(USER_TABLE, user_id, "name", data.lower())
            return 200

        if category == "email":
            if not Functions.verify_email(data):
                return ({"errors": {"email": "Invalid email form"}}, 400)
            if db.get_user(data):
                return ({"errors": {"email": "Email is already registered!"}}, 406)

            db.update_entry(USER_SETTING_TABLE, user_id, "email", data.lower())

        if category == "password":
            if len(data) < 6:
                return ({"errors": {"new_password": "Password must have at least 6 characters"}}, 400)
            if data == password:
                return ({"errors": {"new_password": "Password must not be the same"}}, 400)
            
            if db.get_entry(USER_SETTING_TABLE, user_id).mfa_enabled == 1 and not pyotp.TOTP(user_secrets.mfa_code).verify(request.json.get("code")):
                return ({"errors": {"code": "Invalid two-factor code"}}, 400)
            
            db.update_entry(USER_SECRET_TABLE, user_id, "password", Security.hash_passwd(data))
            db.update_entry(USER_SECRET_TABLE, user_id, "secret", secrets.token_hex(32))

            return ({"token": Security.gen_token(user_secrets.id, user_secrets.secret)}, 200)
 
        return ({"errors": {"category": "Invalid category"}}, 400)
    
    @users.route("/<user_id>/settings", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def change_settings(db, user_id):
        if (data := request.json.get("data")) is None or (category := request.json.get("category")) is None:
            return ({"errors": {"data": "No data or category", "category": "No data or category"}}, 400)
        
        if category == "display_name":
            db.update_entry(USER_TABLE, user_id, "display_name", data if data != "" else None)
            return 200

        if category == "theme":
            if data not in ["auto", "light", "dark"]:
                return ({"errors": {"theme": "Invalid theme"}}, 400)
            
            db.update_entry(USER_SETTING_TABLE, user_id, category, data)
            return 200

        if category == "message_display":
            if data not in ["standard", "compact"]:
                return ({"errors": {"message_display": "Invalid message_display"}}, 400)
            
            db.update_entry(USER_SETTING_TABLE, user_id, category, data)
            return 200

        if category == "visibility":
            if data not in [0, 1]:
                return ({"errors": {"visibility": "Invalid visibility"}}, 400)
            
            db.update_entry(USER_TABLE, user_id, category, data)
            return 200

        # Wrong option 
        return ({"errors": {"category": "Invalid category"}}, 400)
    
    @users.route("/<user_id>/settings/mfa", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def setup_mfa(db, user_id):
        user_secrets = db.get_entry(USER_SECRET_TABLE, user_id)

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
            
            db.update_entry(USER_SECRET_TABLE, user_id, "mfa_code", secret)
            db.update_entry(USER_SETTING_TABLE, user_id, "mfa_enabled", 1)

            return 200
        
        if request.json.get("option") == "disable":
            if not pyotp.TOTP(user_secrets.mfa_code).verify(request.json.get("code")):
                return ({"errors": {"code": "Invalid two-factor code"}}, 400)
            
            db.update_entry(USER_SETTING_TABLE, user_id, "mfa_enabled", 0)
            db.update_entry(USER_SECRET_TABLE, user_id, "mfa_code", None)

            return 200
        
        # Wrong option  
        return ({"errors": {"option": "Invalid option"}}, 400)
    
    @users.route("/<user_id>/friends/confirm", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def confirm_friend(db, user_id):
        if not (friend_id := request.json.get("friend")):
            return ({"errors": {"friend": "No friend"}}, 400)

        if friend_id == user_id: 
            return ({"errors": {"friend": "Invalid friend"}}, 406)
        
        if not db.get_entry(USER_TABLE, friend_id):
            return ({"errors": {"friend": "User does not exist"}}, 400)

        if not (friend := db.get_user_stuff([user_id, friend_id], "friend")):
            return ({"errors": {"friend": "No friend connection"}}, 400)
        
        if friend.get("inviting") == user_id:
            return ({"errors": {"friend": "Inviting user can't confirm an invite"}}, 406)
        
        if friend.get("accepted") != "waiting":
            return ({"errors": {"friend": "Already confirmed"}}, 406)
        
        db.update_entry(USER_FRIENDS_TABLE, [user_id, friend_id], "accepted", current_time := time.time(), "friend")
        return ({"time": current_time}, 200)
    
    @users.route("/<user_id>/notifications/", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def notifications(db, user_id):
        option = request.json.get("option")
        position = request.json.get("position")

        if position != 0 and position != 1:
            return ({"errors": {"position": "Invalid position"}}, 400)
            
        if option == "notifications":
            db.update_entry(USER_TABLE, user_id, "notifications", position)
            return ({"position": position}, 200)
        
        elif option == "message":
            db.update_entry(USER_SETTING_TABLE, user_id, "notifications_message", position)
            return ({"position": position}, 200)
        
        elif option == "friend":
            db.update_entry(USER_SETTING_TABLE, user_id, "notifications_friend", position)
            return ({"position": position}, 200)

        elif option == "changelog":
            db.update_entry(USER_SETTING_TABLE, user_id, "notifications_changelog", "1" if position else None)
            return ({"position": "1" if position else None}, 200)

        return ({"errors": {"option": "Invalid option"}}, 400)
        
    
    # DELETE
    @users.route("/<user_id>/delete", methods=["DELETE"])
    @Decorators.manage_database
    @Decorators.auth
    def delete_account(db, user_id):
        user_secrets = db.get_entry(USER_SECRET_TABLE, user_id)

        if db.get_user_stuff(user_id, "owner_channels"):
            return ({"errors": {"channels": "You own some channels!"}}, 400)

        if not (password := request.json.get("password")) or Security.hash_passwd(password, user_secrets.password.split("$")[0]) != user_secrets.password:
            return ({"errors": {"password": "Password doesn't match"}}, 403)

        if db.get_entry(USER_SETTING_TABLE, user_id).mfa_enabled == 1 and not pyotp.TOTP(user_secrets.mfa_code).verify(request.json.get("code")):
            return ({"errors": {"code": "Invalid two-factor code"}}, 400)
        
        db.delete_entry(USER_TABLE, user_id)
        db.delete_entry(USER_SETTING_TABLE, user_id)
        db.delete_entry(USER_SECRET_TABLE, user_id)
        db.delete_entry(USER_FRIENDS_TABLE, user_id, "user_friends")
        db.delete_entry(USER_CHANNEL_TABLE, user_id, "user_channels")

        return 200
    
    @users.route("/<user_id>/friends/remove", methods=["DELETE"])
    @users.route("/<user_id>/friends/decline", methods=["DELETE"])
    @Decorators.manage_database
    @Decorators.auth
    def remove_friend(db, user_id):
        if not (friend_id := request.json.get("friend")):
            return ({"errors": {"friend": "No friend"}}, 400)

        if friend_id == user_id: 
            return ({"errors": {"friend": "Invalid friend"}}, 406)
        
        if not db.get_entry(USER_TABLE, friend_id):
            return ({"errors": {"friend": "User does not exist"}}, 400)

        if not db.get_user_stuff([user_id, friend_id], "friend"):
            return ({"errors": {"friend": "No friend connection"}}, 400)
        
        db.delete_entry(USER_FRIENDS_TABLE, [user_id, friend_id], "user_friend")
        return 200