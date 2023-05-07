import os
import re
import smtplib
import random

from dotenv import load_dotenv
load_dotenv(dotenv_path="./api/.env")

EMAIL_REGEX = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")


class Functions:
    @staticmethod
    def create_id(creation_time):
        """
        Create unique ID
        :param creation_time: Epoch creation time
        :return: Creation time(int)
        """
        return (int((creation_time - 1155909600) * 1000) << 23) + random.SystemRandom().getrandbits(22)
    
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
    def send_email(dest, message):
        """
        Send email to a specific address
        :param dest: Destination email
        :param message: Message to send
        :return: None
        """
        with smtplib.SMTP("smtp.gmail.com", 587) as s:
            s.starttls()
            s.login(EMAIL, PASSWORD)
            s.sendmail(EMAIL, dest, message.as_string())

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