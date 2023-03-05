from flask import Blueprint, request, send_file, jsonify, redirect, url_for, abort
import re
from .database import *

api = Blueprint("api", __name__) # Define api

# CONSTANTS
TABLES = {
    "name": USER_TABLE, 
    "visibility": USER_TABLE,
    "email": USER_SETTING_TABLE,
    "phone": USER_SETTING_TABLE,
    "password": USER_SECRET_TABLE,
    "auth_code": USER_SECRET_TABLE
}

EMAIL_REGEX = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

# Manage database
def manage_database(func):
    def wrapper(*args, **kwargs):
        db = Database()
        data, code = func(db, *args, **kwargs)
        db.close()

        if not data:
            abort(404)

        return jsonify(data), code   
    
    wrapper.__name__ = func.__name__
    return wrapper

# Verify email
def verify_email(email):
    if re.fullmatch(EMAIL_REGEX, email):
        return True

    return False
    

# API PAGES
# AUTH
@api.route("/auth/<option>", methods=["POST"])
@manage_database
def auth(db, option):
    data, code = None, 404

    match (option, request.method):
        # POST
        case ("login", "POST"):
            if settings := db.get_user(request.json.get("email")):
                secrets = db.get_entry(USER_SECRET_TABLE, settings.id)

                if Functions.hash_passwd(request.json.get("password"), secrets.password.split("$")[0]) == secrets.password:
                    return {"token": "test1234"}, 200

            return {
                "message": "400 Invalid Form Body",
                "errors": {
                    "email": "Login or password is invalid.",
                    "password": "Login or password is invalid."
                }
            }, 400
        
        case ("register", "POST"):
            print("[EMAIL]", request.json.get("email"))
            print("[USERNAME]", request.json.get("username"))
            print("[PASSWORD]", request.json.get("password"))

            data, code = {"massage": "200 OK"}, 200
        
    return (data, code)


# CHANNELS
@api.route("/channels/<channel_id>", methods=["GET", "PATCH"])
@api.route("/channels/<channel_id>/<option>", methods=["GET", "PATCH"])
@manage_database
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
@manage_database
def get_user(db, user_id, option=None):
    data, code = None, 404

    match (option, request.method):
        # PATCH
        case (None, "PATCH"):
            secrets = db.get_entry(USER_SECRET_TABLE, user_id)
            settings = request.json.get("settings")

            if not settings:
                abort(403)
            
            if Functions.hash_passwd(request.json.get("password"), secrets.password.split("$")[0]) != secrets.password:
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
def database():
    tables = [USER_TABLE, MESSAGE_TABLE, CHANNEL_TABLE, USER_CHANNEL_TABLE, USER_FRIENDS_TABLE, USER_SETTING_TABLE, USER_SECRET_TABLE]
    db = Database()

    for table in tables:
        print(f"{table}:\n{db.get_all(table)}\n")

    db.close()

    return redirect(url_for("views.home"))