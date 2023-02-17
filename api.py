from flask import Blueprint, request, send_file, jsonify, redirect, url_for
from config.database import *

api = Blueprint(__name__, "api") # Define api

# DATABASE DATA FROM TABLES
TABLES = {
    "name": USER_TABLE, 
    "visibility": USER_TABLE,
    "email": USER_SETTING_TABLE,
    "phone": USER_SETTING_TABLE,
    "password": USER_SECRET_TABLE,
    "auth_code": USER_SECRET_TABLE
}

# Manage database
def manage_database(func):
    def wrapper(*args, **kwargs):
        db = Database()
        response = func(db, *args, **kwargs)
        db.close()

        return jsonify(response if response else {"message": "404 Not Found"})
    
    wrapper.__name__ = func.__name__
    return wrapper
    

# API PAGES
# CHANNELS
@api.route("/channels/<channel_id>", methods=["GET", "PATCH"])
@api.route("/channels/<channel_id>/<option>", methods=["GET", "PATCH"])
@manage_database
def get_channel(db, channel_id, option=None):
    data = None

    match option:
        case None:
            data = chnl.__dict__ if (chnl := db.get_entry(CHANNEL_TABLE, channel_id)) else {}
        case "messages":
            data = db.get_channel_messages(channel_id)
        case "users":
            data = db.get_user_channels(channel_id)

    return data


# USERS
@api.route("/users/<user_id>/", methods=["GET", "PATCH"])
@api.route("/users/<user_id>/<option>", methods=["GET", "PATCH"])
@manage_database
def get_user(db, user_id, option=None):
    data = None 

    match (option, request.method):
        # PATCH
        case (None, "PATCH"):
            secrets = db.get_entry(USER_SECRET_TABLE, user_id)
            settings = request.json.get("settings")

            if not settings:
                return {"message": "403	Forbidden"}
            
            if Functions.hash_passwd(request.json.get("password"), secrets.password.split("$")[0]) != secrets.password:
                return {"message": "401 Unauthorized"}   

            if settings.startswith("name"):
                if (tag := db.get_available_tag(settings[6:-1])) is None:
                    return {"message": "406 Not Acceptable", "flash_message": "Too many users have this username, try another one!"}
            
                db.update_entry(TABLES[settings.split("=")[0]], user_id, f"tag='{tag}'")

            if settings.startswith("email") and (db.get_user(settings[7:-1])):
                return {"message": "406 Not Acceptable", "flash_message": "Email is already registered!"}

            db.update_entry(TABLES[settings.split("=")[0]], user_id, settings)
            data = {"message": "200 OK ", "data": db.get_entry(TABLES[settings.split("=")[0]], user_id)}
   
        case ("settings", "PATCH"):
            db.update_entry(USER_SETTING_TABLE, user_id, request.json.get("settings"))
            data = {"message": "200 OK "}

        # GET
        case (None, "GET"): 
            data = usr.__dict__ if (usr := db.get_entry(USER_TABLE, user_id)) else None
        case ("channels", "GET"): 
            data = db.get_user_channels(user_id)
        case ("friends", "GET"): 
            data = db.get_user_friends(user_id)
        case ("settings", "GET"): 
            data = db.get_entry(USER_SETTING_TABLE, user_id).__dict__

    return data


# PHOTOS
@api.route("/photos/<photo_id>")
def get_photo(photo_id):
    return send_file(f"./config/photos/avatars/{photo_id}", mimetype=photo_id)

@api.route("/photos/upload")
def upload_photo():
    return "File Uploaded"


# TEMP DATABASE VIEW
@api.route("/database")
def database():
    tables = [USER_TABLE, MESSAGE_TABLE, CHANNEL_TABLE, USER_CHANNEL_TABLE, USER_FRIENDS_TABLE, USER_SETTING_TABLE, USER_SECRET_TABLE]
    db = Database()

    for table in tables:
        print(f"{table}:\n{db.get_all(table)}\n")

    db.close()

    return redirect(url_for("views.home"))