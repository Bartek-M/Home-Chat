import secrets
import time
import os

import pyotp
from flask import Blueprint, request, send_file
from multiprocessing import Process
from PIL import Image

from .funcs import AVATARS_FOLDER, ICONS_FOLDER, VERIFY_ACCESS, MFA_ACCESS, IMAGE_SIZE
from .funcs import Functions, Security, Decorators 
from .database import *


api = Blueprint("api", __name__)


# API PAGES
class Auth:
    """
    Auth api class
    /api/auth/
    """
    auth = Blueprint("auth", __name__)

    @auth.route("/login", methods=["POST"])
    @Decorators.manage_database
    def login(db):
        if settings := db.get_user(request.json.get("email").lower()):
            user_secrets = db.get_entry(USER_SECRET_TABLE, settings.id)
            
            if not (password := request.json.get("password")) or Security.hash_passwd(password, user_secrets.password.split("$")[0]) == user_secrets.password:
                # User not verified, has to pass a verification code
                if db.get_entry(USER_TABLE, settings.id).verified == 0:
                    return ({
                        "token": None,
                        "mfa": False,
                        "verified": False,
                        "ticket": Security.gen_token(user_secrets.id, user_secrets.secret, VERIFY_ACCESS)
                    }, 200)

                # User has mfa enabled, has to pass mfa code
                if settings.mfa_enabled == 1:
                    return ({
                        "token": None,
                        "mfa": True,
                        "verified": True,
                        "ticket": Security.gen_token(user_secrets.id, user_secrets.secret, MFA_ACCESS),
                    }, 200)
                
                # User is verified and doesn't have mfa enabled
                return ({
                    "token": Security.gen_token(user_secrets.id, user_secrets.secret), 
                    "mfa": False,
                    "verified": True
                }, 200)

        return ({
            "errors": {
                "email": "Login or password is invalid.",
                "password": "Login or password is invalid."
            }
        }, 400)
    
    @auth.route('/register', methods=["POST"])
    @Decorators.manage_database
    def register(db):
        email = request.json.get("email")
        username = request.json.get("username")
        password = request.json.get("password")

        if not Functions.verify_email(email):
            return ({"errors": {"email": "Invalid email syntax"}}, 400)
        
        if db.get_user(email.lower()):
            return ({"errors": {"email": "Email is already registered"}}, 409)
        
        if (tag := db.get_available_tag(username)) is None:
            return ({"errors": {"username": "Too many users have this username"}}, 409)
        
        if len(password) < 6:
            return ({"errors": {"password": "Password must have at least 6 characters"}}, 400)
        
        current_time = time.time() 
        id = Functions.create_id(current_time)
        verify_code = "123456"
        # verify_code = secrets.token_hex(3).upper()

        # Process(target=Security.send_verification, args=(email, username, verify_code)).start()

        db.insert_entry(USER_TABLE, User(id, username, tag, "generic", current_time))
        db.insert_entry(USER_SETTING_TABLE, UserSettings(id, email))
        db.insert_entry(USER_SECRET_TABLE, UserSecrets(id, Security.hash_passwd(password), secrets.token_hex(32), verify_code))
        
        return 200
    
    @auth.route("/verify", methods=["POST"])
    @Decorators.manage_database
    @Decorators.ticket_auth
    def verify(db, user_id, option):
        if not (code := request.json.get("code")):
            return ({"errors": {"code": "No code."}}, 400)
        
        if not (user_secrets := db.get_entry(USER_SECRET_TABLE, user_id)):
            return 401
        
        if option == "verify":
            if user_secrets.verify_code.upper() != code.upper():
                return ({"errors": {"code": "Invalid code."}}, 400)
            
            db.update_entry(USER_TABLE, user_id, "verified", 1)
            db.update_entry(USER_SECRET_TABLE, user_id, "verify_code", "")

            return ({
                "token": Security.gen_token(user_secrets.id, user_secrets.secret), 
                "mfa": True if user_secrets.mfa_code else False,
                "verified": True
            }, 200)
        
        if option == "mfa":
            if not pyotp.TOTP(user_secrets.mfa_code).verify((request.json.get("code"))):
                return ({"errors": {"code": "Invalid two-factor code"}}, 400)

            return ({
                "token": Security.gen_token(user_secrets.id, user_secrets.secret), 
                "mfa": True if user_secrets.mfa_code else False,
                "verified": True
            }, 200)          

        return ({"errors": {"option": "Invalid option"}}, 400)


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
        
        creation_time = time.time()
        channel = Channel(str(Functions.create_id(creation_time)), name, "generic", user_id, creation_time)
        
        db.insert_entry(CHANNEL_TABLE, channel)
        db.insert_entry(USER_CHANNEL_TABLE, UserChannel(user_id, channel.id, creation_time))
        
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
        if (stng := {**db.get_entry(USER_TABLE, user_id).__dict__, **db.get_entry(USER_SETTING_TABLE, user_id).__dict__}):
            return ({"user": {**stng}}, 200)
        
        return None
    

    # POST
    @users.route("/search", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def search_users(db, user_id):
        if not (username := request.json.get("username")) or len((tag := request.json.get("tag"))) != 4:
            return ({"errors": {"username": "Username or tag is invalid."}}, 400)
        
        if not (user := db.get_user(f"{username}#{tag}", "name")):
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
            if (tag := db.get_available_tag(data)) is None:
                return ({"errors": {"name": "Too many users have this username"}}, 406)

            db.update_entry(USER_TABLE, user_id, "name", data)
            db.update_entry(USER_TABLE, user_id, "tag", tag)

            return ({"tag": tag}, 200)

        if category == "email":
            if not Functions.verify_email(data):
                return ({"errors": {"email": "Invalid email form"}}, 400)
            if db.get_user(data):
                return ({"errors": {"email": "Email is already registered!"}}, 406)

            db.update_entry(USER_SETTING_TABLE, user_id, "email", data)

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


class Images:
    """
    Images api class
    /api/images
    """
    images = Blueprint("images", __name__)

    @images.route("/<image_id>")
    def get_image(image_id):
        try:
            return send_file(f"{AVATARS_FOLDER}{image_id}", mimetype=image_id)
        except:
            return send_file(f"{AVATARS_FOLDER}generic.webp", mimetype=image_id)

    @images.route("/channels/<image_id>")
    def get_channel_image(image_id):
        try:
            return send_file(f"{ICONS_FOLDER}{image_id}", mimetype=image_id)
        except:
            return send_file(f"{ICONS_FOLDER}generic.webp", mimetype=image_id)


    @images.route("/avatar", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def avatar(db, user_id):
        if not (file := request.files.get("image")):
            return ({"errors": {"image": "No image"}}, 400)
        
        try:
            img = Image.open(file)
        except:
            return ({"errors": {"image": "Invalid image format"}}, 400)

        width, height = img.size

        if width > height:
            left_right = int(((height - width) * -1) / 2)
            img = img.crop((left_right, 0, width-left_right, height))
        else:
            top_bottom = int(((width - height) * -1) / 2)
            img = img.crop((0, top_bottom, width, height - top_bottom))
        
        img = img.resize(IMAGE_SIZE)
        user_avatar = db.get_entry(USER_TABLE, user_id).avatar

        if user_avatar != "generic" and os.path.isfile(f"{AVATARS_FOLDER}{user_avatar}.webp"): 
            os.remove(f"{AVATARS_FOLDER}{user_avatar}.webp")
        
        file_name = f"{user_id}{secrets.token_hex(2)}"
        img.save(f"{AVATARS_FOLDER}{file_name}.webp")
        db.update_entry(USER_TABLE, user_id, "avatar", file_name)

        return ({"image": file_name}, 200)

    @images.route("/icon/<channel_id>", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def icon(db, user_id, channel_id):    
        if not (file := request.files.get("image")):
            return ({"errors": {"image": "No image"}}, 400)
        
        if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
            return ({"errors": {"channel": "Channel does not exist"}}, 400)
        
        if not (user_channel := db.get_channel_stuff([user_id, channel_id], "user_channel")):
            return ({"errors": {"channel": "You are not a member of this channel"}}, 403)
        
        if user_channel.admin != 1 and channel.owner != user_id:
            return ({"errors": {"channel": "You are not admin or owner of this channel"}}, 403)
        
        try:
            img = Image.open(file)
        except:
            return ({"errors": {"image": "Invalid image format"}}, 400)

        width, height = img.size

        if width > height:
            left_right = int(((height - width) * -1) / 2)
            img = img.crop((left_right, 0, width-left_right, height))
        else:
            top_bottom = int(((width - height) * -1) / 2)
            img = img.crop((0, top_bottom, width, height - top_bottom))
        
        img = img.resize(IMAGE_SIZE)
        channel_icon = db.get_entry(CHANNEL_TABLE, channel_id).icon

        if channel_icon != "generic" and os.path.isfile(f"{ICONS_FOLDER}{channel_icon}.webp"): 
            os.remove(f"{ICONS_FOLDER}{channel_icon}.webp")
        
        file_name = f"{channel_id}{secrets.token_hex(2)}"
        img.save(f"{ICONS_FOLDER}{file_name}.webp")
        db.update_entry(CHANNEL_TABLE, channel_id, "icon", file_name)
    
        return ({"image": file_name}, 200)


# TEMP DATABASE VIEW
@api.route("/database")
@Decorators.manage_database
def database(db):
    tables = [USER_TABLE, MESSAGE_TABLE, CHANNEL_TABLE, USER_CHANNEL_TABLE, USER_FRIENDS_TABLE, USER_SETTING_TABLE, USER_SECRET_TABLE]

    for table in tables:
        print(f"{table}:\n{db.get_all(table)}\n")    

    return 200
# TEMP DATABASE VIEW