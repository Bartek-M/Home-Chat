import os
import secrets

from PIL import Image
from flask import Blueprint, request, send_file

from ..database import *
from ..utils import *


class Images:
    """
    Images api class
    /api/images
    """
    images = Blueprint("images", __name__)

    @images.route("/<image_id>")
    def get_image(image_id):
        if image_id == "generic.webp":
            return send_file(f"{AVATARS_FOLDER}generic.webp", mimetype=image_id)

        try:
            return send_file(f"{AVATARS_FOLDER}{image_id}", mimetype=image_id)
        except:
            return send_file(f"{AVATARS_FOLDER}generic.webp", mimetype=image_id)

    @images.route("/channels/<image_id>")
    def get_channel_image(image_id):
        if image_id == "generic.webp":
            return send_file(f"{ICONS_FOLDER}generic.webp", mimetype=image_id)
         
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
        
        if not (img := Functions.crop_image(file, IMAGE_SIZE)):
            return ({"errors": {"image": "Invalid image format"}}, 400)

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
        
        if not (img := Functions.crop_image(file, IMAGE_SIZE)):
            return ({"errors": {"image": "Invalid image format"}}, 400)
        
        channel_icon = db.get_entry(CHANNEL_TABLE, channel_id).icon

        if channel_icon != "generic" and os.path.isfile(f"{ICONS_FOLDER}{channel_icon}.webp"): 
            os.remove(f"{ICONS_FOLDER}{channel_icon}.webp")
        
        file_name = f"{channel_id}{secrets.token_hex(2)}"
        img.save(f"{ICONS_FOLDER}{file_name}.webp")
        db.update_entry(CHANNEL_TABLE, channel_id, "icon", file_name)
    
        return ({"image": file_name}, 200)
