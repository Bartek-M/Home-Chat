from flask import Blueprint, request, send_file, jsonify, redirect, url_for
from config.database import *

api = Blueprint(__name__, "api") # Define api


# API PAGES
# CHANNELS
@api.route("/channels/<channel_id>", methods=["GET", "PATCH"])
@api.route("/channels/<channel_id>/<option>", methods=["GET", "PATCH"])
def get_channel(channel_id, option=None):
    db = Database()

    match option:
        case None:
            data = chnl.__dict__ if (chnl := db.get_entry(CHANNEL_TABLE, channel_id)) else {}
        case "messages":
            data = db.get_channel_messages(channel_id)
        case "users":
            data = db.get_user_channels(channel_id)
        case _:
            data = {}
    
    db.close()
    return jsonify(data)


# USERS
@api.route("/users/<user_id>/", methods=["GET", "PATCH"])
@api.route("/users/<user_id>/<option>", methods=["GET", "PATCH"])
def get_user(user_id, option=None):
    db = Database()
    user_id = user_id if user_id != "@me" else "4366136964471837146"

    # Use proper option
    match option:
        case None:
            data = usr.__dict__ if (usr := db.get_entry(USER_TABLE, user_id)) else {}
        case "channels":
            data = db.get_user_channels(user_id)
        case "friends":
            data = db.get_user_friends(user_id)
        case "settings":
            if request.method == "PATCH":
                db.update_entry(USER_SETTING_TABLE, user_id, request.json["settings"])
                data = {"message": "200 OK "}
            else:
                data = db.get_entry(USER_SETTING_TABLE, user_id).__dict__
        case _:
            data = {}

    db.close()
    return jsonify(data)


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