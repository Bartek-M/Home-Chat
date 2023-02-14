class User:
    """
    Representation of a user
    """
    def __init__(self, id, name, avatar, create_time):
        self.id = id
        self.name = name
        self.avatar = avatar
        self.create_time = create_time 

    def __repr__(self):
        """
        Representation
        :return: (id, name, avatar, creation_time)
        """
        return f"('{self.id}', '{self.name}', '{self.avatar}', '{self.create_time}')"


class Message:
    """
    Representation of a message
    """
    def __init__(self, id, user_id, channel_id, content, create_time):
        self.id = id
        self.user_id = user_id
        self.channel_id = channel_id

        self.content = content
        self.create_time = create_time

    def __repr__(self):
        """
        Representation
        :return: (id, user_id, channel_id, content, create_time)
        """
        return f"('{self.id}', '{self.user_id}', '{self.channel_id}', '{self.content}', '{self.create_time}')"


class Channel:
    """
    Representation of a channel
    """
    def __init__(self, id, name, icon, create_time, direct=""):
        self.id = id
        self.name = name
        self.icon = icon
        self.create_time = create_time
        self.direct = direct

    def __repr__(self):
        """
        Representation
        :return: (id, name, create_time, direct)
        """
        return f"('{self.id}', '{self.name}', '{self.icon}', '{self.create_time}', '{self.direct}')"


class UserChannel:
    """
    Representation of a user channels
    """
    def __init__(self, user_id, channel_id, nick):
        self.user_id = user_id
        self.channel_id = channel_id
        self.nick = nick

    def __repr__(self):
        """
        Representation
        :return: (user_id, name, nick)
        """
        return f"('{self.user_id}', '{self.channel_id}', '{self.nick}')"

class UserFriend:
    """
    Representation of a user friend
    """
    def __init__(self, user_id, friend_id):
        self.user_id = user_id
        self.friend_id = friend_id

    def __repr__(self):
        """
        Representation
        :return: (user_id, friend_id)
        """
        return f"('{self.user_id}', '{self.friend_id}')"


class UserSettings:
    """
    Representation of user settings
    """
    def __init__(self, id, email, phone="not set", theme="auto", message_display="standard", visibility="public", auth="password"):
        self.id = id
        self.email = email
        self.phone = phone # not set | user_phone_number
        self.theme = theme # auto | light | dark
        self.message_display = message_display # standard | compact
        self.visibility = visibility # public | private
        self.auth = auth # password | 2fa

    def __repr__(self):
        """
        Representation
        :return: (id, email, phone, theme, visibility, auth)
        """
        return f"('{self.id}', '{self.email}', '{self.phone}', '{self.theme}', '{self.message_display}', '{self.visibility}', '{self.auth}')"


class UserSecrets:
    """
    Representation of user secrets
    """
    def __init__(self, id, password, auth_code=None):
        self.id = id
        self.password = password
        self.auth_code = auth_code

    def __repr__(self):
        """
        Representation
        :return: (id, password, auth_code)
        """
        return f"('{self.id}', '{self.password}', '{self.auth_code}')"