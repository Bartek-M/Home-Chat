from dataclasses import dataclass


@dataclass
class User:
    """
    Representation of a user
    """
    id: str
    name: str
    tag: str
    avatar: str
    create_time: str
    visibility: int = 1 # 0 | 1

    def marks(self):
        return "?, ?, ?, ?, ?, ?"


@dataclass
class Message:
    """
    Representation of a message
    """
    id: str
    user_id: str
    channel_id: str
    content: str
    create_time: str

    def marks(self):
        return "?, ?, ?, ?, ?"


@dataclass
class Channel:
    """
    Representation of a channel
    """
    id: str
    name: str
    icon: str
    create_time: str
    direct: int = 1

    def marks(self):
        return "?, ?, ?, ?, ?"


@dataclass
class UserChannel:
    """
    Representation of user channels
    """
    user_id: str
    channel_id: str
    nick: str

    def marks(self):
        return "?, ?, ?"


@dataclass
class UserFriend:
    """
    Representation of user friends
    """
    user_id: str
    friend_id: str

    def marks(self):
        return "?, ?"
    

@dataclass
class UserSettings:
    """
    Representation of user settings
    """
    id: str
    email: str
    phone: str = "not set" # not set | user_phone_number
    theme: str = "auto" # auto | light | dark
    message_display: str = "standard" # standard | compact
    mfa_enabled: int = 0 # 0 | 1

    def marks(self):
        return "?, ?, ?, ?, ?, ?"


@dataclass
class UserSecrets:
    """
    Representation of user secrets
    """
    id: str
    password: str
    secret: str
    mfa_code: str = None

    def marks(self):
        return "?, ?, ?, ?"