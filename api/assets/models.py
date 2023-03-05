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
    visibility: str = "public"

    def __repr__(self):
        """
        Representation
        :return: (id, name, tag, avatar, creation_time, visibility)
        """
        return f"('{self.id}', '{self.name}', '{self.tag}', '{self.avatar}', '{self.create_time}', '{self.visibility}')"


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

    def __repr__(self):
        """
        Representation
        :return: (id, user_id, channel_id, content, create_time)
        """
        return f"('{self.id}', '{self.user_id}', '{self.channel_id}', '{self.content}', '{self.create_time}')"


@dataclass
class Channel:
    """
    Representation of a channel
    """
    id: str
    name: str
    icon: str
    create_time: str
    direct: str = ""

    def __repr__(self):
        """
        Representation
        :return: (id, name, create_time, direct)
        """
        return f"('{self.id}', '{self.name}', '{self.icon}', '{self.create_time}', '{self.direct}')"


@dataclass
class UserChannel:
    """
    Representation of user channels
    """
    user_id: str
    channel_id: str
    nick: str

    def __repr__(self):
        """
        Representation
        :return: (user_id, name, nick)
        """
        return f"('{self.user_id}', '{self.channel_id}', '{self.nick}')"


@dataclass
class UserFriend:
    """
    Representation of user friends
    """
    user_id: str
    friend_id: str

    def __repr__(self):
        """
        Representation
        :return: (user_id, friend_id)
        """
        return f"('{self.user_id}', '{self.friend_id}')"


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
    auth: str = "password" # password | 2fa

    def __repr__(self):
        """
        Representation
        :return: (id, email, phone, theme, visibility, auth)
        """
        return f"('{self.id}', '{self.email}', '{self.phone}', '{self.theme}', '{self.message_display}', '{self.auth}')"


@dataclass
class UserSecrets:
    """
    Representation of user secrets
    """
    id: str
    password: str
    token: str
    auth_code: str = None

    def __repr__(self):
        """
        Representation
        :return: (id, password, token, auth_code)
        """
        return f"('{self.id}', '{self.password}', '{self.token}', '{self.auth_code}')"