from flask import Blueprint, request, send_file, redirect, url_for, abort
from .funcs import Functions, Security, TABLES 
from .database import *
import secrets
import time

api = Blueprint("api", __name__) # Define api


# API PAGES
class Auth:
    """
    Auth api class
    /api/auth/
    """
    auth = Blueprint("auth", __name__)

    @auth.route("/login", methods=["POST"])
    @Functions.manage_database
    def login(db):
        if settings := db.get_user(request.json.get("email")):
            user_secrets = db.get_entry(USER_SECRET_TABLE, settings.id)
            
            if Security.hash_passwd(request.json.get("password"), user_secrets.password.split("$")[0]) == user_secrets.password:
                return ({
                    "message": "200 OK", 
                    "token": Security.gen_token(user_secrets.id, user_secrets.secret), 
                    "theme": settings.theme
                }, 200)

        return ({
            "message": "400 Invalid Form Body",
            "errors": {
                "email": "Login or password is invalid.",
                "password": "Login or password is invalid."
            }
        }, 400)
    
    @auth.route('/register', methods=["POST"])
    @Functions.manage_database
    def register(db):
        email = request.json.get("email")
        username = request.json.get("username")
        password = request.json.get("password")

        if not Functions.verify_email(email):
            return ({"message": "400 Invalid Form Body", "errors": {"email": "Invalid email form"}}, 400)
        
        if db.get_user(email):
            return ({"message": "409 Conflict", "errors": {"email": "Email is already registered"}}, 409)
        
        if (tag := db.get_available_tag(username)) is None:
            return ({"message": "409 Conflict", "errors": {"username": "Too many users have this username"}}, 409)
        
        if len(password) < 8:
            return ({"message": "400 Invalid Form Body", "errors": {"password": "Password must have at least 8 characters"}}, 400)
        
        current_time = time.time() 
        id = Functions.create_id(current_time)

        db.insert_entry(USER_TABLE, User(id, username, tag, "generic", current_time))
        db.insert_entry(USER_SETTING_TABLE, UserSettings(id, email))
        db.insert_entry(USER_SECRET_TABLE, UserSecrets(id, Security.hash_passwd(password), secrets.token_hex(32)))
        
        return ({"message": "200 OK"}, 200)


class Channels:
    """
    Channels api class
    /api/channels/
    """
    channels = Blueprint("channels", __name__)
    
    @channels.route("/<channel_id>")
    @Functions.manage_database
    @Security.auth
    def get_channel(db, channel_id):
        if (chnl := db.get_entry(CHANNEL_TABLE, channel_id)):
            return (chnl, 200)
        
        return (None, 404)
        
    @channels.route("/<channel_id>/messages")
    @Functions.manage_database
    @Security.auth
    def get_messages(db, channel_id):
        if (msgs := db.get_channel_messages(channel_id)):
            return (msgs, 200)
        
        return (None, 404)
    
    @channels.route("/<channel_id>/users")
    @Functions.manage_database
    @Security.auth
    def get_users(db, channel_id):
        if (users :=  db.get_user_channels(channel_id)):
            return (users, 200)
        
        return (None, 404)


class Users:
    """
    Users api class
    /api/users/
    """
    users = Blueprint("users", __name__)

    # GET
    @users.route("/<user_id>")
    @Functions.manage_database
    @Security.auth
    def get_user(db, user_id):
        if (usr := db.get_entry(USER_TABLE, user_id)):
            return (usr, 200)
        
        return (None, 404)
    
    @users.route("/<user_id>/channels")
    @Functions.manage_database
    @Security.auth
    def get_channels(db, user_id):
        if (chnls := db.get_user_stuff(user_id, "channels")):
            return (chnls, 200)
        
        return (None, 404)

    @users.route("/<user_id>/friends")
    @Functions.manage_database
    @Security.auth
    def get_friends(db, user_id):
        if (frnds := db.get_user_stuff(user_id, "friends")):
            return (frnds, 200)
        
        return (None, 404)

    @users.route("/<user_id>/settings")
    @Functions.manage_database
    @Security.auth
    def get_settings(db, user_id):
        if (stng := {**db.get_entry(USER_TABLE, user_id).__dict__, **db.get_entry(USER_SETTING_TABLE, user_id).__dict__}):
            return (stng, 200)
        
        return (None, 404)
    

    # PATCH
    @users.route("/<user_id>", methods=["PATCH"])
    @Functions.manage_database
    @Security.auth
    def change_user(db, user_id):
        user_secrets = db.get_entry(USER_SECRET_TABLE, user_id)
        settings = request.json.get("settings")

        if not settings:
            abort(403)

        if settings.startswith("visibility") or settings.startswith("avatar"):
            db.update_entry(TABLES[settings.split("=")[0]], user_id, settings)
            return ({"message": "200 OK "}, 200)
        
        if Security.hash_passwd(request.json.get("password"), user_secrets.password.split("$")[0]) != user_secrets.password:
            abort(401) 

        if settings.startswith("name"):
            if (tag := db.get_available_tag(settings[6:-1])) is None:
                return ({"message": "406 Not Acceptable", "flash_message": "Too many users have this username, try another one!"}, 200)
        
            db.update_entry(TABLES[settings.split("=")[0]], user_id, f"tag='{tag}'")

        if settings.startswith("email") and (db.get_user(settings[7:-1])):
            return ({"message": "406 Not Acceptable", "flash_message": "Email is already registered!"}, 200)

        db.update_entry(TABLES[settings.split("=")[0]], user_id, settings)
        return ({"message": "200 OK "}, 200)
    
    @users.route("/<user_id>/settings", methods=["PATCH"])
    @Functions.manage_database
    @Security.auth
    def change_settings(db, user_id):
        db.update_entry(USER_SETTING_TABLE, user_id, request.json.get("settings"))
        return ({"message": "200 OK "}, 200)


class Photos:
    """
    Photos api class
    /api/photos
    """
    photos = Blueprint("photos", __name__)

    @photos.route("/<photo_id>")
    def get_photo(photo_id):
        return send_file(f"./api/assets/avatars/{photo_id}", mimetype=photo_id)

    @photos.route("/upload")
    def upload_photo():
        return "File Uploaded"


# TEMP DATABASE VIEW
@api.route("/database")
@Functions.manage_database
def database(db):
    tables = [USER_TABLE, MESSAGE_TABLE, CHANNEL_TABLE, USER_CHANNEL_TABLE, USER_FRIENDS_TABLE, USER_SETTING_TABLE, USER_SECRET_TABLE]

    for table in tables:
        print(f"{table}:\n{db.get_all(table)}\n")    

    return redirect(url_for("views.home"))
# TEMP DATABASE VIEW