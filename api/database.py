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
                id TEXT UNIQUE, name TEXT UNIQUE, avatar TEXT, create_time TEXT, verified INTEGER, visibility INTEGER, notifications INTEGER, display_name TEXT
            )""",
            f"""{MESSAGE_TABLE} (
                id TEXT UNIQUE, author TEXT, channel_id TEXT, content TEXT, create_time TEXT, system INTEGER
            )""",
            f"""{CHANNEL_TABLE} (
                id TEXT UNIQUE, name TEXT, icon TEXT, owner TEXT, create_time TEXT, direct INTEGER
            )""",
            f"""{USER_CHANNEL_TABLE} (
                user_id TEXT, channel_id TEXT, join_time TEXT, nick TEXT, admin INTEGER, direct INTEGER, notifications TEXT
            )""",
            f"""{USER_FRIENDS_TABLE} (
                user_id TEXT, friend_id TEXT, accepted TEXT, notifications INTEGER
            )""",
            f"""{USER_SETTING_TABLE} (
                id TEXT UNIQUE, email TEXT UNIQUE, theme TEXT, message_display TEXT, mfa_enabled INTEGER, notifications_message INTEGER, notifications_friend INTEGER, notifications_changelog TEXT
            )""",
            f"""{USER_SECRET_TABLE} (
                id TEXT UNIQUE, password TEXT, secret TEXT, verify_code TEXT, sent_time TEXT, mfa_code TEXT
            )"""
        ]

        for query in queries:  
            self.cursor.execute(f"CREATE TABLE IF NOT EXISTS {query}")
        
        self.conn.commit()

    def get_entry(self, table, req_id, entry="id", order=None):
        """
        Get specific entry
        :param table: Table to look at
        :param req_id: ID of entry to get
        :param entry: Entry to get
        :param order: Sorting order
        :return: Desired config object or None
        """
        self.cursor.execute(f"SELECT * FROM {table} WHERE {entry}=? {f'ORDER BY {order}' if order else ''}", [req_id])

        if fetched := self.cursor.fetchone():
            return CONFIG_OBJECTS[table](*fetched)

        return None
    
    def get_channel_stuff(self, req_id, option):
        """
        Get specific information about the channel 
        :param req_id: ID to check for
        :param option: Option to use ("users", "messages")
        :return: List of User, Message objects or []
        """
        if option == "users":
            self.cursor.execute(f"SELECT * FROM {USER_CHANNEL_TABLE} WHERE channel_id=?", [req_id])

            if fetched := self.cursor.fetchall():
                return sorted(
                    [self.get_entry(USER_TABLE, data[0]).__dict__ for data in fetched],
                    key=lambda x: x.get("name")
                )

        if option == "mesages":
            self.cursor.execute(f"SELECT * FROM {MESSAGE_TABLE} WHERE channel_id=?", [req_id])

            if fetched := self.cursor.fetchall():
                messages = []
                users = {}

                for data in sorted(fetched, key=lambda x: x[4]):
                    message = Message(*data)

                    if (user := users.get(message.user_id)) is None:
                        user = self.cursor.execute(f"SELECT * FROM {USER_TABLE} WHERE id='{message.user_id}'").fetchone()
                        users[message.author] = user

                    message.author = user
                    messages.append(message)

                return messages
            
        if option == "user_channel":
            self.cursor.execute(f"SELECT * FROM {USER_CHANNEL_TABLE} WHERE user_id=? AND channel_id=?", [*req_id])

            if fetched := self.cursor.fetchone():
                return UserChannel(*fetched)

        return []
    
    def get_user_stuff(self, req_id, option):
        """
        Get specific information about the user
        :param req_id: ID to check for
        :param option: Option to use ("channels", "friends", "friend")
        :return: List of Channel objects or []
        """                
        if option == "channels":
            self.cursor.execute(f"SELECT * FROM {USER_CHANNEL_TABLE} WHERE user_id=?", [req_id])

            if fetched := self.cursor.fetchall():
                channels = []

                for data in fetched:
                    user_channel = UserChannel(*data)

                    if not (channel :=  self.get_entry(CHANNEL_TABLE, user_channel.channel_id)):
                        continue

                    channel = channel.__dict__
                    
                    if channel["direct"] and (friend := self.get_entry(USER_TABLE, channel["id"].replace(req_id, "").replace("-", ""))) and (friend_channel := self.get_channel_stuff([friend.id, channel["id"]], "user_channel")):
                        channel["display_name"] = friend_channel.nick if friend_channel.nick else friend.__dict__.get("display_name", None)
                        channel["name"] = friend.name 
                        channel["icon"] = friend.avatar
                    elif channel["direct"]:
                        channel["name"] = "Deleted Account"
                        channel["icon"] = "generic"

                    channels.append({
                        **channel,
                        "nick": user_channel.nick,
                        "notifications": user_channel.notifications,
                        "join_time": user_channel.join_time,
                        "admin": True if user_channel.admin else False,
                        "users": self.get_channel_stuff(channel["id"], "users")
                    })

                return sorted(channels, key=lambda channel: message.create_time if (message := self.get_entry(MESSAGE_TABLE, channel["id"], "channel_id", "id DESC")) else channel["join_time"], reverse=True)
                                                
        if option == "friends":
            friends = {}

            self.cursor.execute(f"SELECT * FROM {USER_FRIENDS_TABLE} WHERE (user_id=? OR friend_id=?) AND accepted='waiting'", [req_id, req_id])
            if fetched := self.cursor.fetchall():
                friends["pending"] = sorted(
                    [
                        {**(self.get_entry(USER_TABLE, friend[0] if friend[0] != req_id else friend[1]).__dict__), "accepted": friend[2], "inviting": friend[0]} 
                        for friend in fetched 
                    ], 
                    key=lambda x: x.get('name')
                )

            self.cursor.execute(f"SELECT * FROM {USER_FRIENDS_TABLE} WHERE (user_id=? OR friend_id=?) AND accepted!='waiting'", [req_id, req_id])
            if fetched := self.cursor.fetchall():
                friends["accepted"] = sorted(
                    [
                        {**(self.get_entry(USER_TABLE, friend[0] if friend[0] != req_id else friend[1]).__dict__), "accepted": friend[2], "inviting": friend[0]} 
                        for friend in fetched 
                    ], 
                    key=lambda x: x.get('name')
                )
            
            return friends
        
        if option == "friend":
            self.cursor.execute(f"SELECT * FROM {USER_FRIENDS_TABLE} WHERE (user_id=? AND friend_id=?) OR (friend_id=? AND user_id=?)", [*req_id, *req_id])

            if fetched := self.cursor.fetchone():
                return {**(self.get_entry(USER_TABLE, fetched[0] if fetched[0] != req_id[0] else fetched[1]).__dict__), "accepted": fetched[2], "inviting": fetched[0]}
                         
        return []    

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
            self.cursor.execute(f"UPDATE {table} SET {entry}=? WHERE (user_id=? AND friend_id=?) OR (friend_id=? AND user_id=?)", [data, *req_id, *req_id])

        if option == "user_channel":
            self.cursor.execute(f"UPDATE {table} SET {entry}=? WHERE user_id=? AND channel_id=?", [data, *req_id])
        
        self.conn.commit()

    def delete_entry(self, table, req_id, entry="id", option=None):
        """
        Delete specific entry
        :param table: Table to delete in
        :param req_id: ID of entry to delete
        :param entry: Entry to delete
        :param option: Option to use
        :return: None
        """
        if option is None:
            self.cursor.execute(f"DELETE FROM {table} WHERE {entry}=?", [req_id])

        if option == "account":
            self.cursor.execute(f"DELETE FROM {USER_TABLE} WHERE id=?", [req_id])
            self.cursor.execute(f"DELETE FROM {USER_SETTING_TABLE} WHERE id=?", [req_id])
            self.cursor.execute(f"DELETE FROM {USER_SECRET_TABLE} WHERE id=?", [req_id])
            self.cursor.execute(f"DELETE FROM {USER_FRIENDS_TABLE} WHERE user_id=? OR friend_id=?", [req_id, req_id])
            self.cursor.execute(f"DELETE FROM {USER_CHANNEL_TABLE} WHERE user_id=?", [req_id])

        if option == "channel":
            self.cursor.execute(f"DELETE FROM {CHANNEL_TABLE} WHERE id=?", [req_id])
            self.cursor.execute(f"DELETE FROM {MESSAGE_TABLE} WHERE channel_id=?", [req_id])
            self.cursor.execute(f"DELETE FROM {USER_CHANNEL_TABLE} WHERE channel_id=?", [req_id])

        if option == "user_channel":
            self.cursor.execute(f"DELETE FROM {USER_CHANNEL_TABLE} WHERE user_id=? AND channel_id=?", [*req_id])

        if option == "user_friend":
            self.cursor.execute(f"DELETE FROM {USER_FRIENDS_TABLE} WHERE (user_id=? AND friend_id=?) OR (friend_id=? AND user_id=?)", [*req_id, *req_id])

        self.conn.commit()

    def __exit__(self, *_):
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