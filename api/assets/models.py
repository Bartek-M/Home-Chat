from dataclasses import dataclass


@dataclass
class User:
    """
    Representation of a user
    """
    id: str
    name: str
    avatar: str
    create_time: str
    verified: int = 0 # 0 | 1
    visibility: int = 1 # 0 | 1
    display_name: str = None

    def marks(self):
        return "?, ?, ?, ?, ?, ?, ?"


@dataclass
class Message:
    """
    Representation of a message
    """
    id: str
    author: str
    channel_id: str
    content: str
    create_time: str
    system: int = 0 # 0 | 1

    def marks(self):
        return "?, ?, ?, ?, ?, ?"


@dataclass
class Channel:
    """
    Representation of a channel
    """
    id: str
    name: str
    icon: str
    owner: str
    create_time: str
    direct: int = 0 # 0 | 1

    def marks(self):
        return "?, ?, ?, ?, ?, ?"


@dataclass
class UserChannel:
    """
    Representation of user channels
    """
    user_id: str
    channel_id: str
    join_time: str
    nick: str = None
    admin: int = 0 # 0 | 1
    direct: int = 0 # 0 | 1

    def marks(self):
        return "?, ?, ?, ?, ?, ?"


@dataclass
class UserFriend:
    """
    Representation of user friends
    """
    user_id: str
    friend_id: str
    accepted: str = "waiting" # waiting | accepted_time

    def marks(self):
        return "?, ?, ?"
    

@dataclass
class UserSettings:
    """
    Representation of user settings
    """
    id: str
    email: str
    theme: str = "auto" # auto | light | dark
    message_display: str = "standard" # standard | compact
    mfa_enabled: int = 0 # 0 | 1

    def marks(self):
        return "?, ?, ?, ?, ?"


@dataclass
class UserSecrets:
    """
    Representation of user secrets
    """
    id: str
    password: str
    secret: str
    verify_code: str
    sent_time: str = None
    mfa_code: str = None

    def marks(self):
        return "?, ?, ?, ?, ?, ?"