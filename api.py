from flask import Blueprint, request, send_file
from config.database import Database

api = Blueprint(__name__, "api") # Define api


# API PAGES
@api.route("/channels/<channel>/messages")
def channel_messages(channel):
    print(channel, limit := request.args.get("limit", 50))
    return f"Messages for channel: {channel};\nLimit: {limit}"


@api.route("/users/<user>")
def get_user(user):
    return user


# PHOTOS
@api.route("/photos/<photo_id>")
def get_photo(photo_id):
    return send_file(f"./config/icons/{photo_id}", mimetype=photo_id)

@api.route("/photos/upload")
def upload_photo():
    return "File Uploaded"