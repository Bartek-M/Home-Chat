from flask import Blueprint, request, send_file, jsonify
from config.database import *

api = Blueprint(__name__, "api") # Define api


# API PAGES
@api.route("/channels/<channel_id>")
def get_channel(channel_id):
    db = Database()
    channel = chnl.__dict__ if (chnl := db.get_entry(CHANNEL_TABLE, channel_id)) else {}
    db.close()

    return jsonify(channel)

@api.route("/channels/<channel_id>/messages")
def channel_messages(channel_id):
    db = Database()
    messages = db.get_channel_messages(channel_id)
    db.close()

    return jsonify(messages)


@api.route("/users/<user_id>")
def get_user(user_id):
    db = Database()
    user = usr.__dict__ if (usr := db.get_entry(USER_TABLE, user_id)) else {}
    db.close()

    return jsonify(user)

@api.route("/users/<user_id>/channels")
def channel_messages(channels):
    db = Database()
    messages = db.get_channel_messages(channels)
    db.close()

    return jsonify(messages)


# SETTINGS
@api.route("/users/<user_id>/settings")


# PHOTOS
@api.route("/photos/<photo_id>")
def get_photo(photo_id):
    return send_file(f"./config/photos/avatars/{photo_id}", mimetype=photo_id)

@api.route("/photos/upload")
def upload_photo():
    return "File Uploaded"