import os
import time
import hashlib
import secrets
import threading
from base64 import b64encode, b64decode
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from ..database import *
from .functions import Functions

from dotenv import load_dotenv
load_dotenv(dotenv_path="./api/.env")

EMAIL = os.getenv("EMAIL")
PEPPER = os.getenv("PEPPER")


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
    def gen_token(id: str, secret: str, option: str = None):
        """
        Generate token for specific user
        :param id: User ID
        :param secret: User secret
        :param option: Temporary token option
        :return: Secure access token
        """
        now = b64encode(str(int(time.time())).encode("UTF-8")).decode("UTF-8")

        if option:
            id = b64encode(f"{id},{option}".encode("UTF-8")).decode("UTF-8")
            hmac = hashlib.sha256(f"{id}|{now}|{secret[:int(len(secret)/2)]}|temp-{option}-access".encode("UTF-8")).hexdigest()
        else:
            id = b64encode(id.encode("UTF-8")).decode("UTF-8")
            hmac = hashlib.sha256(f"{id}|{now}|{secret}".encode("UTF-8")).hexdigest()

        return f"{id}.{now}.{hmac}"
    
    @staticmethod
    def verify_token(db, token: str):
        """
        Verify specific token
        :param token: Token to verify
        :return: ("correct" / "expired" / "signature" / "invalid" - id or option if any)
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

        if option:
            if option == "email" and int(time.time() - int(generated)) > 604_800: # Email tickets expire after 1 week; time in seconds
                return ("expired", id, option)
            elif option != "email" and int(time.time() - int(generated)) > 600: # Other tickets expire after 5 minutes; time in seconds
                return ("expired", id, option)

        if int(time.time()) - int(generated) > 31_536_000: # Everything expire after one year (365 days); time in seconds
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
        <html style="font-family: arial, sans-serif">
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
                        Grab this code and log in to activate your account. You have 24 hours to do that - if you don't activate it, your account will be deleted. Of course, you can register your account again.
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

        email_thread = threading.Thread(target=Functions.send_email, args=(email, message))
        email_thread.start()
        
    @staticmethod
    def send_email_recovery():
        pass