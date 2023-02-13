from flask import Blueprint, request, send_file, jsonify
from flask import redirect, url_for
from config.database import *

api = Blueprint(__name__, "api") # Define api


# API PAGES
# CHANNELS
@api.route("/channels/<channel_id>")
def get_channel(channel_id):
    db = Database()
    channel = chnl.__dict__ if (chnl := db.get_entry(CHANNEL_TABLE, channel_id)) else {}
    db.close()

    return jsonify(channel)

@api.route("/channels/<channel_id>/messages")
def get_messages(channel_id):
    db = Database()
    messages = db.get_channel_messages(channel_id)
    db.close()

    return jsonify(messages)


# USERS
@api.route("/users/<user_id>")
def get_user(user_id,):
    db = Database()
    user_id = user_id if user_id != "@me" else "4365166056053833144"
    user = usr.__dict__ if (usr := db.get_entry(USER_TABLE, user_id)) else {}
    db.close()

    return jsonify(user)

@api.route("/users/<user_id>/channels")
def get_channels(user_id):
    db = Database()
    messages = db.get_user_channels(user_id)
    db.close()

    return jsonify(messages)

@api.route("/users/<user_id>/friends")
def get_friends(user_id):
    db = Database()
    friends = db.get_user_friends(user_id)
    db.close()

    return jsonify(friends)


# SETTINGS
@api.route("/settings/@me")
def settings():
    db = Database()
    user_settings = db.get_
    db.close()

    return jsonify(user_settings)

# PHOTOS
@api.route("/photos/<photo_id>")
def get_photo(photo_id):
    return send_file(f"./config/photos/avatars/{photo_id}", mimetype=photo_id)

@api.route("/photos/upload")
def upload_photo():
    return "File Uploaded"


# TEMP DATABASE
@api.route("/database")
def database():
    tables = [USER_TABLE, MESSAGE_TABLE, CHANNEL_TABLE, USER_CHANNEL_TABLE, USER_FRIENDS_TABLE, USER_SETTING_TABLE, USER_SECRET_TABLE]
    db = Database()

    for table in tables:
        print(f"{table}:\n{db.get_all(table)}\n")

    db.close()

    return redirect(url_for("views.home"))