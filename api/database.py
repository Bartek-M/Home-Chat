import random
import sqlite3

from .assets.models import *

# GLOBAL VARIABLES
FILE = "./api/db.sqlite" # ./api/db.sqlite | :memory:

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

    def __enter__(self):
        return self

    def _create_tables(self):
        """
        Create tables if they don't exit
        :return: None
        """
        queries = [ 
            f"""{USER_TABLE} (
                id TEXT UNIQUE, name TEXT, tag TEXT, avatar TEXT, create_time TEXT, verified INTEGER, visibility INTEGER
            )""",
            f"""{MESSAGE_TABLE} (
                id TEXT UNIQUE, author TEXT, channel_id TEXT, content TEXT, create_time TEXT
            )""",
            f"""{CHANNEL_TABLE} (
                id TEXT UNIQUE, name TEXT, icon TEXT, owner TEXT, create_time TEXT, direct TEXT
            )""",
            f"""{USER_CHANNEL_TABLE} (
                user_id TEXT, channel_id TEXT UNIQUE, nick TEXT, position TEXT
            )""",
            f"""{USER_FRIENDS_TABLE} (
                user_id TEXT, friend_id TEXT, accepted TEXT 
            )""",
            f"""{USER_SETTING_TABLE} (
                id TEXT UNIQUE, email TEXT UNIQUE, theme TEXT, message_display TEXT, mfa_enabled INTEGER
            )""",
            f"""{USER_SECRET_TABLE} (
                id TEXT UNIQUE, password TEXT, secret TEXT, verify_code TEXT, sent_time TEXT, mfa_code TEXT
            )"""
        ]

        for query in queries:  
            self.cursor.execute(f"CREATE TABLE IF NOT EXISTS {query}")
        
        self.conn.commit()

    def get_entry(self, table, req_id):
        """
        Get specific entry
        :param table: Table to look at
        :param req_id: ID of entry to get
        :return: Desired config object or None
        """
        self.cursor.execute(f"SELECT * FROM {table} WHERE id=?", [req_id])

        if fetched := self.cursor.fetchone():
            return CONFIG_OBJECTS[table](*fetched)

        return None

    def get_user(self, search, option="email"):
        """
        Get specifc user using his information
        :param search: User information
        :param option: Option to use ("email", "name")
        :return: UserSettings or User object
        """
        if option == "email":
            self.cursor.execute(f"SELECT * FROM {USER_SETTING_TABLE} WHERE email=?", [search])

            if fetched := self.cursor.fetchone():
                return UserSettings(*fetched)
        
        if option == "name":
            if len(username := search.split("#")) != 2: 
                return None
            
            self.cursor.execute(f"SELECT * FROM {USER_TABLE} WHERE name=? AND tag=? AND visibility=1", [username[0], username[1]])

            if fetched := self.cursor.fetchone():
                return User(*fetched)
            
        return None

    def get_user_stuff(self, req_id, option):
        """
        Get all channels which belongs to a certain user
        :param req_id: ID of user or channel to get
        :param option: Option to use ("channels", "friends")
        :return: List of Channel objects or []
        """

        if option == "owner_channels":
            self.cursor.execute(f"SELECT * FROM {CHANNEL_TABLE} WHERE owner=?", [req_id])

            if fetched := self.cursor.fetchall():
                return [Channel(*channel) for channel in fetched]
                
        if option == "channels":
            self.cursor.execute(f"SELECT * FROM {USER_CHANNEL_TABLE} WHERE user_id=? OR channel_id=?", [req_id, req_id])

            if fetched := self.cursor.fetchall():
                return sorted(
                    [self.get_entry((CHANNEL_TABLE, data[1]) if data[0] == req_id else (USER_TABLE, data[0])).__dict__ for data in fetched], 
                    key=lambda x: x.get("position")
                )
                        
        if option == "friends":
            friends = {}

            self.cursor.execute(f"SELECT * FROM {USER_FRIENDS_TABLE} WHERE user_id=? OR friend_id=? AND accepted='waiting'", [req_id, req_id])
            if fetched := self.cursor.fetchall():
                friends["pending"] = sorted(
                    [
                        {**(self.get_entry(USER_TABLE, friend[0] if friend[0] != req_id else friend[1]).__dict__), "accepted": friend[2]} 
                        for friend in fetched 
                    ], 
                    key=lambda x: x.get("name")
                )

            self.cursor.execute(f"SELECT * FROM {USER_FRIENDS_TABLE} WHERE user_id=? OR friend_id=? AND accepted!='waiting'", [req_id, req_id])
            if fetched := self.cursor.fetchall():
                friends["accepted"] = sorted(
                    [
                        {**(self.get_entry(USER_TABLE, friend[0] if friend[0] != req_id else friend[1]).__dict__), "accepted": friend[2]} 
                        for friend in fetched 
                    ], 
                    key=lambda x: x.get("name")
                )
            
            return friends
        
        if option == "friend":
            self.cursor.execute(f"SELECT * FROM {USER_FRIENDS_TABLE} WHERE (user_id=? OR friend_id=?) AND (user_id=? OR friend_id=?)", [*req_id, *req_id])

            if fetched := self.cursor.fetchone():
                return {**(self.get_entry(USER_TABLE, fetched[0] if fetched[0] != req_id else fetched[1]).__dict__), "accepted": fetched[2]} 
 
        return []

    def get_channel_messages(self, req_id):
        """
        Get all messages in current channel
        :param req_id: ID of channel to get messages from
        :return: List of Message objects or []
        """
        self.cursor.execute(f"SELECT * FROM {MESSAGE_TABLE} WHERE channel_id=?", [req_id])

        if fetched := self.cursor.fetchall():
            users = {}

            for message in (messages := [Message(*entry).__dict__ for entry in sorted(fetched, key=lambda x: x[4])]):
                if (user := users.get(message.user_id, None) is None):
                    user = self.cursor.execute(f"SELECT * FROM {USER_TABLE} WHERE id='{message.user_id}'").fetchone()
                    users[message.author] = user

                message.author = user

            return messages

        return []

    def get_available_tag(self, name):
        """
        Get available tags for specific name
        :param name: Name to check tags for
        :return: Random available tag or None
        """
        self.cursor.execute(f"SELECT tag FROM {USER_TABLE} WHERE name=?", [name])
        tag_range = set(range(1000, 10000))

        if fetched := self.cursor.fetchall():
            tag_range -= {int(tag[0]) for tag in fetched}

        return random.choice(list(tag_range)) if tag_range else None

    def insert_entry(self, table, entry):
        """
        Insert entry into specific table
        :param table: Table to insert into 
        :param entry: Entry to insert
        :return: None
        """
        self.cursor.execute(f"INSERT INTO {table} VALUES ({entry.marks()})", list(entry.__dict__.values()))
        self.conn.commit()

    def update_entry(self, table, req_id, entry, data, option=None):
        """
        Update specific entry
        :param table: Table to update
        :param req_id: ID of entry to update
        :param entry: Entry to update 
        :param data: Updated data to insert
        :return: None
        """
        if option is None:
            self.cursor.execute(f"UPDATE {table} SET {entry}=? WHERE id=?", [data, req_id])
        
        if option == "friend":
            self.cursor.execute(f"UPDATE {table} SET {entry}=? WHERE (user_id=? OR friend_id=?) AND (user_id=? OR friend_id=?)", [data, *req_id, *req_id])
        
        self.conn.commit()

    def delete_entry(self, table, req_id, option=None):
        """
        Delete specific entry
        :param table: Table to delete in
        :param req_id: ID of entry to delete
        :param option: Option to use
        :return: None
        """
        if option is None:
            self.cursor.execute(f"DELETE FROM {table} WHERE id=?", [req_id])

        if option == "channel":
            self.cursor.execute(f"DELETE FROM {CHANNEL_TABLE} WHERE id=?", [req_id])
            self.cursor.execute(f"DELETE FROM {MESSAGE_TABLE} WHERE channel_id=?", [req_id])
            self.cursor.execute(f"DELETE FROM {USER_CHANNEL_TABLE} WHERE channel_id=?", [req_id])
        
        if option == "user_channels":
            self.cursor.execute(f"DELETE FROM {USER_CHANNEL_TABLE} WHERE user_id=?", [req_id])

        if option == "user_friends":
            self.cursor.execute(f"DELETE FROM {USER_FRIENDS_TABLE} WHERE user_id=? OR friend_id=?", [req_id, req_id])

        if option == "user_friend":
            self.cursor.execute(f"DELETE FROM {USER_FRIENDS_TABLE} WHERE (user_id=? OR friend_id=?) AND (user_id=? OR friend_id=?)", [*req_id, *req_id])

        self.conn.commit()

    def __exit__(self, exc_type, exc_value, exc_traceback):
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
        :param table: Table to check
        :return: List data or None
        """
        self.cursor.execute(f"SELECT * FROM {table}")

        if fetched := self.cursor.fetchall():
            return fetched

        return None
    # TEMP FUNCTION