from flask import jsonify, request
from base64 import b64encode, b64decode
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
from .database import *
import secrets
import smtplib
import hashlib
import time
import re
import os

# CONSTANTS
load_dotenv(dotenv_path="./api/.env")

AVATARS_FOLDER = "./api/assets/avatars/"
ICONS_FOLDER = "./api/assets/channel_icons/"

EMAIL_REGEX = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")

VERIFY_ACCESS = "verify"
MFA_ACCESS = "mfa"

PEPPER = os.getenv("PEPPER")


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
    

class Security:
    @staticmethod
    def hash_passwd(passw: str, salt=secrets.token_hex(16)):
        """
        Hash user password
        :param passw: User password
        :param salt: Salt for additional encryption
        :return: Secured password (str)
        """
        return f"{salt}${hashlib.sha256((salt + passw + PEPPER).encode()).hexdigest()}"
    
    @staticmethod
    def gen_token(id: str, secret: str, ending: str = None):
        """
        Generate token for specific user
        :param id: User ID
        :param secret: User secret
        :return: Secure access token
        """
        now = b64encode(str(int(time.time())).encode("UTF-8")).decode("UTF-8")

        if ending:
            id = b64encode(f"{id},{ending}".encode("UTF-8")).decode("UTF-8")
            hmac = hashlib.sha256(f"{id}|{now}|{secret[:int(len(secret)/2)]}|temp-{ending}-access".encode("UTF-8")).hexdigest()
        else:
            id = b64encode(id.encode("UTF-8")).decode("UTF-8")
            hmac = hashlib.sha256(f"{id}|{now}|{secret}".encode("UTF-8")).hexdigest()

        return f"{id}.{now}.{hmac}"
    
    @staticmethod
    def verify_token(db, token: str):
        """
        Verify specific token
        :param token: Token to verify
        :return: ("correct" / "expired" / "signature" / "invalid", id, option if any)
        """
        option = None

        if not token:
            return ("invalid", None, option)
        if len(token := token.split(".")) != 3:
            return ("invalid", None, option)
        
        # Try base encoding
        try:
            id = b64decode(token[0].encode("UTF-8")).decode("UTF-8")
            generated = b64decode(token[1].encode("UTF-8")).decode("UTF-8")
            hmac = token[2]
        except:
            return ("invalid", None, option)
        
        if "," in id:
            sliced = id.split(",")
            id = sliced[0]
            option = sliced[1]

        if not (user_secrets := db.get_entry(USER_SECRET_TABLE, id)):
            return ("invalid", None, option)

        if option and hashlib.sha256(f"{token[0]}|{token[1]}|{user_secrets.secret[:int(len(user_secrets.secret)/2)]}|temp-{option}-access".encode("UTF-8")).hexdigest() != hmac:
            return ("signature", id, option)
        if not option and hashlib.sha256(f"{token[0]}|{token[1]}|{user_secrets.secret}".encode("UTF-8")).hexdigest() != hmac:
            return ("signature", id, option)
    
        if option and int(time.time()) - int(generated) > 600: # Tickets are expired after 5 minutes; time in seconds
            return ("expired", id, option)
        if int(time.time()) - int(generated) > 31_536_000: # Tokens are expired after one year (365 days); time in seconds
            return ("expired", id, option)

        return ("correct", id, option)
    
    @staticmethod
    def send_verification(email, name, verify_code):
        """
        Generate and send email with verification code
        :param email: User email
        :param name: User name
        :param verify_code: User verification code
        :return: None
        """
        message = MIMEMultipart("alternative")
        message["Subject"] = f"Your Home Chat email verification code is {verify_code}"
        message["From"] = EMAIL
        message["To"] = email

        text = f"""
        Home Chat

        Welcome, {name}!
        Thank you for registering an account in Home Chat!<br />
        Grab this code and log in to activate your account. You have one hour to do that - if you don't activate it, your account will be deleted.

        Code: {verify_code}

        Don't share this code with anyone.
        If you didn't ask for this code please ignore this email.

        Sent by Home Chat
        """

        html = f"""
        <!DOCTYPE html>
        <html style="font-family: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <head>
                <meta name="color-scheme" content="light only">
                <meta name="supported-color-schemes" content="light only">
            </head>
            <body style="background-color: #f9f9f9;">
                <h1 style="margin: 1rem auto; max-width: 640px; text-align: center;">Home Chat</h1>
                <div style="margin: 0 auto; max-width: 640px; padding: 1rem 0; background-color: #FFFFFF;">
                    <h2 style="width: calc(100% - 2rem); margin: 0 1rem;">Welcome, {name}!</h2>
                    <p style="width: calc(100% - 2rem); margin: 1rem; line-height: 1.5rem;">
                        Thank you for registering an account in Home Chat!<br />
                        Grab this code and log in to activate your account. You have one hour to do that - if you don't activate it, your account will be deleted.
                    </p>
                    
                    <div style="width: calc(100% - 4rem); margin: 2rem 1rem; padding: 1rem; text-align: center; font-weight: 700; background-color: #f2f3f4;">
                        <h2 style="margin: 0">{verify_code}</h2>
                    </div>

                    <p style="width: calc(100% - 2rem); margin: 1rem; line-height: 1.5rem;">
                        Don't share this code with anyone.<br />
                        If you didn't ask for this code please ignore this email.
                    </p>

                    <hr style="width: calc(100% - 2rem); border-color: #f9f9f9" />

                    <p style="width: calc(100% - 2rem); margin: 1rem; font-size: .75rem; ">
                        Sent by Home Chat
                    </p>
                </div>
        </body>
        </html>
        """

        message.attach(MIMEText(text, "plain"))
        message.attach(MIMEText(html, "html"))

        Functions.send_email(email, message)


class Decorators:
    @staticmethod
    def manage_database(func):
        """
        Manage database decorator
        :param func: Function to run
        :return: Wrapper function
        """
        def wrapper(*args, **kwargs):
            with Database() as db:
                kwargs["db"] = db
                resp = func(*args, **kwargs)
            
            data, code = resp if isinstance(resp, tuple) else ({}, resp)

            if message := Functions.match_code(code):
                data["message"] = message

            return jsonify(data), code
        
        wrapper.__name__ = func.__name__
        return wrapper
    
    @staticmethod
    def auth(func):
        """
        Authenticate user tokens decorator
        :param func: Function to run
        :return: Wrapper function
        """
        def wrapper(*args, **kwargs):
            verify_code, verify_id, verify_option = Security.verify_token(kwargs["db"], request.headers.get("Authentication", None))

            if verify_option and verify_code == "correct":
                return 403
            
            if verify_code == "correct":
                kwargs["user_id"] = verify_id
                return func(*args, **kwargs)
            
            if verify_code == "expired" or verify_code == "signature":
                return 403
            
            if verify_code == "invalid":
                return 401
            
            return None
        
        wrapper.__name__ = func.__name__
        return wrapper
    
    @staticmethod
    def ticket_auth(func):
        """
        Authenticate user ticets decorator
        :param func: Funtion tu run
        :return: Wrapper function
        """
        def wrapper(*args, **kwargs):
            verify_code, verify_id, verify_option = Security.verify_token(kwargs["db"], request.json.get("ticket", None))

            if not verify_option and verify_code == "correct":
                return 403
            
            if verify_code == "correct":
                kwargs["user_id"] = verify_id
                kwargs["option"] = verify_option

                return func(*args, **kwargs)
            
            if verify_code == "expired" or verify_code == "signature":
                return 403
            
            if verify_code == "invalid":
                return 401
 
            return None
        
        
        wrapper.__name__ = func.__name__
        return wrapper