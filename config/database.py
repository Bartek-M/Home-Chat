import sqlite3
import hashlib
import secrets
import random
from .models import User, Message, Channel, UserChannel, UserFriend, UserSettings, UserSecrets

# GLOBAL VARIABLES
FILE = "./config/database.db" # ./config/database.db | :memory:

USER_TABLE = "users"
MESSAGE_TABLE = "messages"
CHANNEL_TABLE = "channels"
USER_CHANNEL_TABLE = "user_channels"
USER_FRIENDS_TABLE = "user_friends"
USER_SETTING_TABLE = "user_settings"
USER_SECRET_TABLE = "user_secrets"

CONFIG_OBJECTS = {
    USER_TABLE: User, 
    MESSAGE_TABLE: Message, 
    CHANNEL_TABLE: Channel, 
    USER_CHANNEL_TABLE: UserChannel,
    USER_FRIENDS_TABLE: UserFriend,
    USER_SETTING_TABLE: UserSettings, 
    USER_SECRET_TABLE: UserSecrets
} 


class Database:
    """
    Connect to database, write and read data
    """
    def __init__(self):
        self.conn = sqlite3.connect(FILE)
        self.cursor = self.conn.cursor()
        self._create_tables()

    def _create_tables(self):
        """
        Create tables if they don't exit
        :return: None
        """
        queries = [ 
            f"""{USER_TABLE} (
                id TEXT UNIQUE, name TEXT, avatar TEXT, create_time TEXT
            )""",
            f"""{MESSAGE_TABLE} (
                id TEXT UNIQUE, user_id TEXT, channel_id TEXT, content TEXT, create_time TEXT
            )""",
            f"""{CHANNEL_TABLE} (
                id TEXT UNIQUE, name TEXT, icon TEXT, create_time TEXT, direct TEXT
            )""",
            f"""{USER_CHANNEL_TABLE} (
                user_id TEXT, channel_id TEXT UNIQUE, nick TEXT
            )""",
            f"""{USER_FRIENDS_TABLE} (
                user_id TEXT, friend_id TEXT
            )""",
            f"""{USER_SETTING_TABLE} (
                id TEXT UNIQUE, email TEXT UNIQUE, phone TEXT, theme TEXT, visibility TEXT, auth TEXT
            )""",
            f"""{USER_SECRET_TABLE} (
                id TEXT UNIQUE, password TEXT, auth_code TEXT
            )"""
        ]

        for query in queries:  
            self.cursor.execute(f"CREATE TABLE IF NOT EXISTS {query}")
        
        self.conn.commit()

    def get_entry(self, table, req_id):
        """
        Get specific entry
        :param table: Table you want to look at
        :param req_id: ID of entry you want to get
        :return: Desired config object or None
        """
        self.cursor.execute(f"SELECT * FROM {table} WHERE id='{req_id}'")

        if fetched := self.cursor.fetchone():
            return CONFIG_OBJECTS[table](*fetched)

        return None

    def get_user(self, email):
        """
        Get specifc user via his email
        :param email: User email
        :return: User object
        """
        self.cursor.execute(f"SELECT * FROM {USER_SETTING_TABLE} WHERE email='{email}'")

        if fetched := self.cursor.fetchone():
            return UserSettings(*fetched)

        return None

    def get_user_channels(self, req_id):
        """
        Get all channels which belongs to a certain user
        :param req_id: ID of user or channel you want to get
        :return: List of UserChannel objects or []
        """
        self.cursor.execute(f"SELECT * FROM {USER_CHANNEL_TABLE} WHERE user_id='{req_id}' OR channel_id='{req_id}'")
        
        if fetched := self.cursor.fetchall():
            return [UserChannel(*entry).__dict__ for entry in sorted(fetched, key=lambda x: x[3])]

        return []

    def get_user_friends(self, req_id):
        """
        Get all user friends
        :param req_id: ID of user you want to get friends from
        :return: List of User objects or []
        """
        self.cursor.execute(f"SELECT * FROM {USER_FRIENDS_TABLE} WHERE user_id='{req_id}' OR friend_id='{req_id}'")

        if fetched := self.cursor.fetchall():
            return sorted([self.get_entry(USER_TABLE, friend[0] if friend[0] != req_id else friend[1]).__dict__ for friend in fetched], key=lambda x: x.get("name"))

        return []

    def get_channel_messages(self, req_id):
        """
        Get all messages in current channel
        :param req_id: ID of channel you want to get messages from
        :return: List of Message objects or []
        """
        self.cursor.execute(f"SELECT * FROM {MESSAGE_TABLE} WHERE channel_id='{req_id}'")

        if fetched := self.cursor.fetchall():
            return [Message(*entry).__dict__ for entry in sorted(fetched, key=lambda x: x[4])]

        return []

    def insert_entry(self, table, entry):
        """
        Insert entry into specific table
        :param table: Table you want to insert into 
        :param entry: Entry you want to insert
        :return: None
        """
        self.cursor.execute(f"INSERT INTO {table} VALUES {entry}")
        self.conn.commit()

    def update_entry(self, table, req_id, entry):
        """
        Update specific entry
        :param table: Table you want to update
        :param req_id: ID of entry you want to update
        :param entry: Updated entry (eg. name='new_name')
        :return: None
        """
        self.cursor.execute(f"UPDATE {table} SET {entry} WHERE id='{req_id}'")
        self.conn.commit()

    def delete_entry(self, table, req_id):
        """
        Delete specific entry
        :param table: Table you want to delete in
        :param req_id: ID of entry you want to delete
        :return: None
        """
        self.cursor.execute(f"DELETE FROM {table} WHERE id='{req_id}'")
        self.conn.commit()

    def close(self):
        """
        Close database connection
        :return: None
        """
        self.conn.close()


    # TEMP FUNCTION
    def get_all(self, table):
        """
        TEMP FUNC

        Get all entries in specific table
        :param table: Table you want to check
        :return: List data or None
        """
        self.cursor.execute(f"SELECT * FROM {table}")

        if fetched := self.cursor.fetchall():
            return fetched

        return None
    # TEMP FUNCTION


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
    def hash_passwd(passw, salt=secrets.token_hex(16)):
        """
        Hash user password
        :param passw: User password
        :param salt: Salt for additional encryption
        :return: Secured password (str)
        """
        return f"{salt}${hashlib.sha256((salt + passw).encode()).hexdigest()}"