from flask import jsonify, abort, request
from base64 import b64encode, b64decode
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from .database import *
import secrets
import smtplib
import hashlib
import json
import time
import re

# CONSTANTS
AVATARS_FOLDER = "./api/assets/avatars/"
ICONS_FOLDER = "./api/assets/channel_icons/"

EMAIL_REGEX = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

with open("./api/mail.json", "r") as f:   
    EMAIL_CFG = json.load(f)


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
    def send_verification(email, name):
        """
        Send email with verification code to a specific user
        :param email: User email
        :param name: User name
        :return: Verification code
        """
        verify_code = secrets.token_hex(3).upper()

        # Generate message
        message = MIMEMultipart("alternative")
        message["Subject"] = f"Your Home Chat email verification code is {verify_code}"
        message["From"] = EMAIL_CFG.get("email")
        message["To"] = email

        # Message body
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
                <h1 style="margin: 1rem auto; max-width: 640px; text-align: center;">
                    <img style="width: 24px; height: 24px; vertical-align: auto;" src="https://lh3.googleusercontent.com/0Zt68QTrC7LU4BWIXWtuXTNOLbTxJD4CIriO7-9We0xM5XDCwTbFmvQuZfTID1dDc7_ym9Aokz80iNo9FVrXJEigy5D0WrnU4ijz2dUgXMw6NLpj4rpkMi03kpN6zgRF_plDJWsQqgMrGqKOqzbQM3bsBH0JeaBs2vhoRwTG74qDo3IGTbbMimRcOD4DNBWCuhZ8aE3uJhQzVZ2wbNPBLRSDMu9ahx4DTC_FnDHrGNPvupRo_awBhZizosqJ0JJ8xBJZkeSgUSkBZLD7kQmTLjfyQeqhvBHZbOJpPWAbZ-rhBl8WsvXBT6ERs4QwPyNDfA5ErNxegCf6q7y74K4DC1wbP-2luYx6VWy45uZXIB6ROqDEe3vO8VNhLKuX_V_o9is7bZRJ0ffqUmqh-Sl9jCv5jweBau8b0dCgWhxQV-zJ5YyIVFFW9v20LsGlcpQtS6RKp2om6LR5iZTGWPhFFB2G8cZ27ezSTeHwSu_84_LYDz6ZrMtUKXHNhUGKixQYE52O2UJu7y3Nzo8vdXnLEAxmPpw43rc2uVUJxhA074N0w63nSzBTa-uT5lUerK3vVUVMPHwmP7wJogwDWufWhrq_MnidfKnbuK3z9VZR3LJWQCpyr3ItobAESZD-S9rGVcubzFo6aWSBzw3mKcV2hrFbKcoz0Jx9yRTQMyVYXwg1iqp_ClBbSabDut7RETcnEeW7FZQaqCupAndwW2WBfnvutH27VK-OEqUM8inTzLrb8WLjUg5Y2vDTvDzwsrW_DMQgyPUCRtmKMKNXXhqeD76rtxaCi-h73wDXa4L3pcm4EflvpAZsLHVImdMFQb4mgIUSu8KX7GkTrhYyytaQNd3hO5CJ5-6kpUQpSMyK2wXDenfLjBqegAi_DAoReDDSjR879cIPgixVpvVWTCV3REDtcLxjQnKuBFlV6pVEH08=s845-no?authuser=0" />
                    Home Chat
                </h1>
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

        # Send an email
        with smtplib.SMTP("smtp.gmail.com", 587) as s:
            s.starttls()
            s.login(EMAIL_CFG.get("email"), EMAIL_CFG.get("password"))
            s.sendmail(EMAIL_CFG.get("email"), email, message.as_string())

        return verify_code


    @staticmethod
    def delete_account(db, id, option="timout"):
        """
        Delete user account
        :param db: Database connection
        :param id: User id you want to delete
        :param option: "timout" - user didn't verify email / "remove" - user removes his account
        :return: None
        """
    
    @staticmethod
    def manage_database(func):
        """
        Manage database decorator
        :param func: Function to run
        :return: Wrapper function
        """
        def wrapper(*args, **kwargs):
            db = Database()
            kwargs["db"] = db
            data, code = func(*args, **kwargs)
            db.close()

            if not data:
                abort(404)

            return jsonify(data), code   
        
        wrapper.__name__ = func.__name__
        return wrapper
    

class Security:
    @staticmethod
    def hash_passwd(passw: str, salt=secrets.token_hex(16)):
        """
        Hash user password
        :param passw: User password
        :param salt: Salt for additional encryption
        :return: Secured password (str)
        """
        return f"{salt}${hashlib.sha256((salt + passw).encode()).hexdigest()}"
    
    @staticmethod
    def gen_token(id: str, secret: str):
        """
        Generate token for specific user
        :param id: User ID
        :param secret: User secret
        :return: Secure access token
        """
        id = b64encode(id.encode("UTF-8")).decode("UTF-8")
        now = b64encode(str(int(time.time())).encode("UTF-8")).decode("UTF-8")
        hmac = hashlib.sha256(f"{id}|{now}|{secret}".encode("UTF-8")).hexdigest()

        return f"{id}.{now}.{hmac}"
    
    @staticmethod
    def verify_token(db, token: str):
        """
        Verify specific token
        :param token: Token you want to verify
        :return: "correct" / "expired" / "signature" / "invalid"
        """
        if not token:
            return ("invalid", None)

        if len(token := token.split(".")) != 3:
            return ("invalid", None)
        
        try:
            id = b64decode(token[0].encode("UTF-8")).decode("UTF-8")
            generated = b64decode(token[1].encode("UTF-8")).decode("UTF-8")
            hmac = token[2]
        except:
            return ("invalid", None)
        
        if not (user_secrets := db.get_entry(USER_SECRET_TABLE, id)):
            return ("invalid", None)
        
        if hashlib.sha256(f"{token[0]}|{token[1]}|{user_secrets.secret}".encode("UTF-8")).hexdigest() != hmac:
            return ("signature", id)
        
        if int(time.time()) - int(generated) > 31_536_000: # Tokens are expired after one year (365 days); time in seconds
            return ("expired", id)

        return ("correct", id)
    
    @staticmethod
    def auth(func):
        """
        Authenticate user tokens decorator
        :param func: Function to run
        :return: Wrapper function
        """
        def wrapper(*args, **kwargs):
            verify_code, verify_id = Security.verify_token(kwargs["db"], request.headers.get("Authentication", None))

            if verify_code == "correct":
                if kwargs.get("user_id") is None or kwargs.get("user_id") == "@me":
                    kwargs["user_id"] = verify_id
                
                return func(*args, **kwargs)
            elif verify_code == "expired":
                return ({"message": "403 Forbidden"}, 403)
            elif verify_code == "signature":
                return ({"message": "403 Forbidden"}, 403)
            elif verify_code == "invalid":
                return ({"message": "401 Unauthorized"}, 401)
            
            return (None, None)
        
        wrapper.__name__ = func.__name__
        return wrapper