import re
import time
import random

from PIL import Image

from ..database import *

EMAIL_REGEX = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'


class Functions:
    @staticmethod
    def create_id(creation_time):
        """
        Create unique ID
        :param creation_time: Epoch creation time
        :return: str ID
        """
        return str((int((float(creation_time) - 1155909600) * 1000) << 23) + random.SystemRandom().getrandbits(22))
    
    @staticmethod
    def verify_email(email):
        """
        Verify user email
        :param email: Email to verify
        :return: True if correct, False if incorrect
        """
        if re.fullmatch(EMAIL_REGEX, email):
            return True

        return False

    @staticmethod
    def match_code(code):
        """
        Match code to a specific message
        :param code: Code for a specific message
        :return: Matched message or None
        """
        match code:
            # Successful responses 
            case 200: return "200 OK"
            case 201: return "201 Created"
            case 204: return "204 No Content"

            # Client error responses
            case 400: return "400 Invalid Body Form"
            case 401: return "401 Unauthorized"
            case 403: return "403 Forbidden"
            case 404: return "404 Not Found"
            case 405: return "405 Method Not Allowed"
            case 406: return "406 Not Acceptable"
            case 409: return "409 Conflict"
            case 413: return "413 Payload Too Large"
            case 429: return "429 Too Many Requests"            
            
        return None
    
    @staticmethod
    def crop_image(file, IMAGE_SIZE):
        try:
            img = Image.open(file)
        except:
            return None

        width, height = img.size

        if width > height:
            left_right = int(((height - width) * -1) / 2)
            img = img.crop((left_right, 0, width-left_right, height))
        else:
            top_bottom = int(((width - height) * -1) / 2)
            img = img.crop((0, top_bottom, width, height - top_bottom))
        
        return img.resize(IMAGE_SIZE)
    
    @staticmethod
    def delete_non_verified():
        while True:
            with Database() as db:
                db.delete_entry(None, None, option="non-verified")

            time.sleep(21_600) # Wait 6 hours; time in seconds