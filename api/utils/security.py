import os
import time
import hashlib
import secrets
from base64 import b64encode, b64decode

from ..database import USER_SECRET_TABLE

from dotenv import load_dotenv
load_dotenv(dotenv_path="./api/.env")

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