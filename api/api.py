from flask import Blueprint, request, send_file, redirect, url_for
from .funcs import AVATARS_FOLDER, VERIFY_ACCESS, MFA_ACCESS
from .funcs import Functions, Security, Decorators 
from multiprocessing import Process
from .database import *
import secrets
import time
import os

api = Blueprint("api", __name__) # Define api


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
        if settings := db.get_user(request.json.get("email")):
            user_secrets = db.get_entry(USER_SECRET_TABLE, settings.id)
            
            # Check password
            if Security.hash_passwd(request.json.get("password"), user_secrets.password.split("$")[0]) == user_secrets.password:
                # User not verified, has to pass a verification code
                if db.get_entry(USER_TABLE, settings.id).verified == 0:
                    return {
                        "message": "200 OK",
                        "token": None,
                        "mfa": False,
                        "verified": False,
                        "ticket": Security.gen_token(user_secrets.id, user_secrets.secret, VERIFY_ACCESS)
                    }

                # User has mfa enabled, has to pass mfa code
                if settings.mfa_enabled == 1:
                    return {
                        "message": "200 OK",
                        "token": None,
                        "mfa": True,
                        "verified": True,
                        "ticket": Security.gen_token(user_secrets.id, user_secrets.secret, MFA_ACCESS),
                    }
                
                # User is verified and doesn't have mfa enabled
                return {
                    "message": "200 OK", 
                    "token": Security.gen_token(user_secrets.id, user_secrets.secret), 
                    "mfa": False,
                    "verified": True
                }

        return {
            "message": "400 Invalid Form Body",
            "errors": {
                "email": "Login or password is invalid.",
                "password": "Login or password is invalid."
            }
        }
    
    @auth.route('/register', methods=["POST"])
    @Decorators.manage_database
    def register(db):
        email = request.json.get("email")
        username = request.json.get("username")
        password = request.json.get("password")

        if not Functions.verify_email(email):
            return {"message": "400 Invalid Form Body", "errors": {"email": "Invalid email form"}}
        
        if db.get_user(email):
            return {"message": "409 Conflict", "errors": {"email": "Email is already registered"}}
        
        if (tag := db.get_available_tag(username)) is None:
            return {"message": "409 Conflict", "errors": {"username": "Too many users have this username"}}
        
        if len(password) < 8:
            return {"message": "400 Invalid Form Body", "errors": {"password": "Password must have at least 8 characters"}}
        
        current_time = time.time() 
        id = Functions.create_id(current_time)
        verify_code = secrets.token_hex(3).upper()

        Process(target=Security.send_verification, args=(email, username, verify_code)).start()

        db.insert_entry(USER_TABLE, User(id, username, tag, "generic", current_time))
        db.insert_entry(USER_SETTING_TABLE, UserSettings(id, email))
        db.insert_entry(USER_SECRET_TABLE, UserSecrets(id, Security.hash_passwd(password), secrets.token_hex(32), verify_code))
        
        return {"message": "200 OK"}
    
    @auth.route("/verify", methods=["POST"])
    @Decorators.manage_database
    @Decorators.ticket_auth
    def verify(db, user_id, option):
        if not (code := request.json.get("code")):
            return {"message": "400 Invalid Form Body", "errors": {"code": "No code provided."}}
        
        if not (user_secrets := db.get_entry(USER_SECRET_TABLE, user_id)):
            return {"message": "401 Unauthorized"}
        
        if option == "verify":
            print(user_secrets.verify_code, code)
            if user_secrets.verify_code != code:
                return {"message": "400 Invalid Form Body", "errors": {"code": "Invalid code."}}
            
            db.update_entry(USER_TABLE, user_id, "verified", 1)
            db.update_entry(USER_SECRET_TABLE, user_id, "verify_code", "")

            return {
                "message": "200 OK", 
                "token": Security.gen_token(user_secrets.id, user_secrets.secret), 
                "mfa": True if user_secrets.mfa_code else False,
                "verified": True
            }
        
        if option == "mfa":
            return {"message": "200 OK"}            

        return {"message": "403 Forbidden"}


class Channels:
    """
    Channels api class
    /api/channels/
    """
    channels = Blueprint("channels", __name__)
    
    @channels.route("/<channel_id>")
    @Decorators.manage_database
    @Decorators.auth
    def get_channel(db, channel_id):
        if (chnl := db.get_entry(CHANNEL_TABLE, channel_id)):
            return chnl
        
        return None
        
    @channels.route("/<channel_id>/messages")
    @Decorators.manage_database
    @Decorators.auth
    def get_messages(db, channel_id):
        if (msgs := db.get_channel_messages(channel_id)):
            return msgs
        
        return None
    
    @channels.route("/<channel_id>/users")
    @Decorators.manage_database
    @Decorators.auth
    def get_users(db, channel_id):
        if (users :=  db.get_user_channels(channel_id)):
            return users
        
        return None


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
            return usr
        
        return None
    
    @users.route("/<user_id>/channels")
    @Decorators.manage_database
    @Decorators.auth
    def get_channels(db, user_id):
        if (chnls := db.get_user_stuff(user_id, "channels")):
            return chnls
        
        return None

    @users.route("/<user_id>/friends")
    @Decorators.manage_database
    @Decorators.auth
    def get_friends(db, user_id):
        if (frnds := db.get_user_stuff(user_id, "friends")):
            return frnds
        
        return None

    @users.route("/<user_id>/settings")
    @Decorators.manage_database
    @Decorators.auth
    def get_settings(db, user_id):
        if (stng := {**db.get_entry(USER_TABLE, user_id).__dict__, **db.get_entry(USER_SETTING_TABLE, user_id).__dict__}):
            return stng
        
        return None
    

    # PATCH
    @users.route("/<user_id>", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def change_user(db, user_id):
        user_secrets = db.get_entry(USER_SECRET_TABLE, user_id)

        # Check if there's any data and category
        if (data := request.json.get("data")) is None or (category := request.json.get("category")) is None:
            return {"message": "400 Invalid Form Body", "errors": {"data": "No data or category provided", "category": "No data or category provided"}}
        
        # Check if password is correct
        if Security.hash_passwd(request.json.get("password"), user_secrets.password.split("$")[0]) != user_secrets.password:
            return {"message": "403 Forbidden", "errors": {"password": "Invalid password"}}
        
        # Change name
        if category == "name":
            # Get available tags
            if (tag := db.get_available_tag(data)) is None:
                return {"message": "406 Not Acceptable", "errors": {"name": "Too many users have this username"}}

            db.update_entry(USER_TABLE, user_id, category, data)
            db.update_entry(USER_TABLE, user_id, "tag", tag)

            return {"message": "200 OK", "tag": tag}

        # Change email
        elif category == "email":
            # Check email syntax
            if not Functions.verify_email(data):
                return {"message": "400 Invalid Form Body", "errors": {"email": "Invalid email form"}}
            
            # Check if email is not already registered
            if db.get_user(data):
                return {"message": "406 Not Acceptable", "errors": {"email": "Email is already registered!"}}

            db.update_entry(USER_SETTING_TABLE, user_id, category, data)

        # Change phone
        elif category == "phone":
            # Check if phone number is correct
            pass

        # Change password
        elif category == "password":
            # Check if password is secure
            pass
        
        return {"message": "200 OK"}
    
    @users.route("/<user_id>/settings", methods=["PATCH"])
    @Decorators.manage_database
    @Decorators.auth
    def change_settings(db, user_id):
        # Check if there's any data and category
        if (data := request.json.get("data")) is None or (category := request.json.get("category")) is None:
            return {"message": "400 Invalid Form Body", "errors": {"data": "No data or category provided", "category": "No data or category provided"}}
        
        # Change theme
        if category == "theme":
            if data not in ["auto", "light", "dark"]:
                return {"message": "400 Invalid Form Body", "errors": {"theme": "Invalid theme provided"}}
            
            db.update_entry(USER_SETTING_TABLE, user_id, category, data)

        # Change message display
        elif category == "message_display":
            if data not in ["standard", "compact"]:
                return {"message": "400 Invalid Form Body", "errors": {"message_display": "Invalid message_display provided"}}
            
            db.update_entry(USER_SETTING_TABLE, user_id, category, data)

        # Change visibility
        elif category == "visibility":
            if data not in [0, 1]:
                return {"message": "400 Invalid Form Body", "errors": {"visibility": "Invalid visibility provided"}}
            
            db.update_entry(USER_TABLE, user_id, category, data)
        
        return {"message": "200 OK "}


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

    @images.route("/avatar", methods=["POST"])
    @Decorators.manage_database
    @Decorators.auth
    def avatar(db, user_id):
        if not (file := request.files.get("image")):
            return {"message": "400 Invalid Form Body", "errors": {"image": "No image provided"}}
        
        user_avatar = db.get_entry(USER_TABLE, user_id).avatar

        if user_avatar != "generic" and os.path.isfile(f"{AVATARS_FOLDER}{user_avatar}.webp"): 
            os.remove(f"{AVATARS_FOLDER}{user_avatar}.webp")
        
        file_name = f"{user_id}{secrets.token_hex(2)}"
        file.save(f"{AVATARS_FOLDER}{file_name}.webp")
        db.update_entry(USER_TABLE, user_id, "avatar", file_name)

        return {"message": "200 OK ", "image": file_name}


# TEMP DATABASE VIEW
@api.route("/database")
@Decorators.manage_database
def database(db):
    tables = [USER_TABLE, MESSAGE_TABLE, CHANNEL_TABLE, USER_CHANNEL_TABLE, USER_FRIENDS_TABLE, USER_SETTING_TABLE, USER_SECRET_TABLE]

    for table in tables:
        print(f"{table}:\n{db.get_all(table)}\n")    

    return redirect(url_for("views.home"))
# TEMP DATABASE VIEW