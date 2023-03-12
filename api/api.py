from flask import Blueprint, request, send_file, redirect, url_for, abort
from .funcs import Functions, Security, TABLES 
from .database import *
import secrets
import time

api = Blueprint("api", __name__) # Define api


# API PAGES
# AUTH
@api.route("/auth/<option>", methods=["POST"])
@Functions.manage_database
def auth(db, option):
    match (option, request.method):
        # POST
        case ("login", "POST"):
            if settings := db.get_user(request.json.get("email")):
                user_secrets = db.get_entry(USER_SECRET_TABLE, settings.id)
                
                if Security.hash_passwd(request.json.get("password"), user_secrets.password.split("$")[0]) == user_secrets.password:
                    return {
                        "message": "200 OK", 
                        "token": Security.gen_token(user_secrets.id, user_secrets.secret), 
                        "theme": settings.theme
                    }, 200

            return {
                "message": "400 Invalid Form Body",
                "errors": {
                    "email": "Login or password is invalid.",
                    "password": "Login or password is invalid."
                }
            }, 400
        
        case ("register", "POST"):
            email = request.json.get("email")
            username = request.json.get("username")
            password = request.json.get("password")

            if not Functions.verify_email(email):
                return {"message": "400 Invalid Form Body", "errors": {"email": "Invalid email form"}}, 400
            
            if db.get_user(email):
                return {"message": "409 Conflict", "errors": {"email": "Email is already registered"}}, 409
            
            if (tag := db.get_available_tag(username)) is None:
                return {"message": "409 Conflict", "errors": {"username": "Too many users have this username"}}, 409
            
            if len(password) < 8:
                return {"message": "400 Invalid Form Body", "errors": {"password": "Password must have at least 8 characters"}}, 400
            
            current_time = time.time() 
            id = Functions.create_id(current_time)

            db.insert_entry(USER_TABLE, User(id, username, tag, "generic", current_time))
            db.insert_entry(USER_SETTING_TABLE, UserSettings(id, email))
            db.insert_entry(USER_SECRET_TABLE, UserSecrets(id, Security.hash_passwd(password), secrets.token_hex(32)))
            
            return {"message": "200 OK"}, 200
            
    return None, 404


# CHANNELS
@api.route("/channels/<channel_id>", methods=["GET", "PATCH"])
@api.route("/channels/<channel_id>/<option>", methods=["GET", "PATCH"])
@Functions.manage_database
def get_channel(db, channel_id, option=None):
    data, code = None, 404

    match option:
        case None:
            data, code = chnl.__dict__ if (chnl := db.get_entry(CHANNEL_TABLE, channel_id)) else {}, 200
        case "messages":
            data, code = db.get_channel_messages(channel_id), 200
        case "users":
            data, code = db.get_user_channels(channel_id), 200

    return (data, code)


# USERS
@api.route("/users/<user_id>/", methods=["GET", "PATCH"])
@api.route("/users/<user_id>/<option>", methods=["GET", "PATCH"])
@Functions.manage_database
def get_user(db, user_id, option=None):
    data, code = None, 404

    match (option, request.method):
        # PATCH
        case (None, "PATCH"):
            user_secrets = db.get_entry(USER_SECRET_TABLE, user_id)
            settings = request.json.get("settings")

            if not settings:
                abort(403)
            
            if Security.hash_passwd(request.json.get("password"), user_secrets.password.split("$")[0]) != user_secrets.password:
                abort(401) 

            if settings.startswith("name"):
                if (tag := db.get_available_tag(settings[6:-1])) is None:
                    return {"message": "406 Not Acceptable", "flash_message": "Too many users have this username, try another one!"}, 200
            
                db.update_entry(TABLES[settings.split("=")[0]], user_id, f"tag='{tag}'")

            if settings.startswith("email") and (db.get_user(settings[7:-1])):
                return {"message": "406 Not Acceptable", "flash_message": "Email is already registered!"}, 200

            db.update_entry(TABLES[settings.split("=")[0]], user_id, settings)
            data, code = {"message": "200 OK ", "data": db.get_entry(TABLES[settings.split("=")[0]], user_id)}, 200
   
        case ("settings", "PATCH"):
            db.update_entry(USER_SETTING_TABLE, user_id, request.json.get("settings"))
            data, code = {"message": "200 OK "}, 200

        # GET
        case (None, "GET"): 
            data, code = usr.__dict__ if (usr := db.get_entry(USER_TABLE, user_id)) else None, 200
        case ("channels", "GET"): 
            data, code = db.get_user_stuff(user_id, "channels"), 200
        case ("friends", "GET"): 
            data, code = db.get_user_stuff(user_id, "friends"), 200
        case ("settings", "GET"): 
            data, code = {**db.get_entry(USER_TABLE, user_id).__dict__, **db.get_entry(USER_SETTING_TABLE, user_id).__dict__}, 200

    return (data, code)


# PHOTOS
@api.route("/photos/<photo_id>")
def get_photo(photo_id):
    return send_file(f"./api/assets/avatars/{photo_id}", mimetype=photo_id)

@api.route("/photos/upload")
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