import sqlite3
import hashlib
import random
import time
from .config_objects import User, Message, Channel, UserChannel

# GLOBAL VARIABLES
FILE = "./config/database.db"

USER_TABLE = "users"
MESSAGE_TABLE = "messages"
CHANNEL_TABLE = "channels"
USER_CHANNEL_TABLE = "user_channels"
USER_SETTING_TABLE = "user_settings"

CONFIG_OBJECTS = {USER_TABLE: User, MESSAGE_TABLE: Message, CHANNEL_TABLE: Channel, USER_CHANNEL_TABLE: UserChannel} 


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
            f"{USER_TABLE} (id INTEGER, name TEXT, email TEXT, password TEXT, create_time TEXT)",
            f"{MESSAGE_TABLE} (id INTEGER, user_id INTEGER, channel_id INTEGER, content TEXT, create_time TEXT)",
            f"{CHANNEL_TABLE} (id INTEGER, name TEXT, create_time TEXT, group_server INTEGER)",
            f"{USER_CHANNEL_TABLE} (id INTEGER, channel_id INTEGER, join_time TEXT, channel_index INTEGER)",
            f"{USER_SETTING_TABLE} (id INTEGER, dark_mode INEGER, auth TEXT)"
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
        self.cursor.execute(f"SELECT * FROM {table} WHERE id={req_id}")

        if fetched := self.cursor.fetchone():
            return CONFIG_OBJECTS[table](*fetched)

        return None

    def get_user(self, email):
        """
        Get specifc user via his email
        :param email: User email
        :return: User object
        """
        self.cursor.execute(f"SELECT * FROM {USER_TABLE} WHERE email='{email}'")

        if fetched := self.cursor.fetchone():
            return User(*fetched)

        return None


    def get_user_channels(self, req_id):
        """
        Get all channels which belongs to a certain user
        :param req_id: ID of user or channel you want to get
        :return: List of UserChannel objects or None
        """
        self.cursor.execute(f"SELECT * FROM {USER_CHANNEL_TABLE} WHERE id={req_id} OR channel_id={req_id}")
        
        if fetched := self.cursor.fetchall():
            return [UserChannel(*entry) for entry in sorted(fetched, key=lambda x: x[3])]

        return None

    def get_channel_messages(self, req_id):
        """
        Get all messages in current channel
        :param req_id: ID of channel you want to get messages from
        :return: List of Message objects or None
        """
        self.cursor.execute(f"SELECT * FROM {MESSAGE_TABLE} WHERE channel_id={req_id}")

        if fetched := self.cursor.fetchall():
            return [Message(*entry) for entry in sorted(fetched, key=lambda x: x[4])]

        return None

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
        self.cursor.execute(f"UPDATE {table} SET {entry} WHERE id={req_id}")
        self.conn.commit()

    def delete_entry(self, table, req_id):
        """
        Delete specific entry
        :param table: Table you want to delete in
        :param req_id: ID of entry you want to delete
        :return: None
        """
        self.cursor.execute(f"DELETE FROM {table} WHERE id={req_id}")
        self.conn.commit()

    def close(self):
        """
        Close connection
        :return: None
        """
        self.conn.close()


class Functions:
    @staticmethod
    def create_id(creation_time):
        """
        Create unique ID
        :param creation_time: Epoch creation time
        :return: Creation time(int)
        """
        return int(str(round(creation_time)) + ''.join([str(random.randint(0, 9)) for _ in range(6)]))

    @staticmethod
    def convert_time(creation_time):
        """
        Convert time from epoch to normal data
        :param creation_time: Epoch creation time
        :return: Converted time (str)
        """
        return str(time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(creation_time)))

    @staticmethod
    def hash_passwd(passw):
        """
        Hash user password
        :param passw: User password
        :return: Hashed password (str)
        """
        return str(hashlib.sha256(str(passw).strip().encode()).hexdigest())