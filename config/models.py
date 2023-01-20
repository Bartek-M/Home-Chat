class User:
    """
    Representation of a user
    """
    def __init__(self, user_id, name, email, create_time):
        self.user_id = user_id
        self.name = name
        self.email = email
        self.create_time = create_time 

    def __repr__(self):
        """
        Representation
        :return: (user_id, name, email, creation_time)
        """
        return f"({self.user_id}, '{self.name}', '{self.email}', '{self.create_time}')"


class Message:
    """
    Representation of a message
    """
    def __init__(self, message_id, user_id, channel_id, content, create_time):
        self.message_id = message_id
        self.user_id = user_id
        self.channel_id = channel_id

        self.content = content
        self.create_time = create_time

    def __repr__(self):
        """
        Representation
        :return: (message_id, user_id, channel_id, content, create_time)
        """
        return f"({self.message_id}, {self.user_id}, {self.channel_id}, '{self.content}', '{self.create_time}')"


class Channel:
    """
    Representation of a channel
    """
    def __init__(self, channel_id, name, create_time, group_name=""):
        self.channel_id = channel_id
        self.name = name
        self.create_time = create_time
        self.group_name = group_name

    def __repr__(self):
        """
        Representation
        :return: (channel_id, name, create_time, group_name)
        """
        return f"({self.channel_id}, '{self.name}', '{self.create_time}', {self.group_name})"


class UserChannel:
    """
    Representation of a user channels
    """
    def __init__(self, user_id, channel_id, join_time, channel_index):
        self.user_id = user_id
        self.channel_id = channel_id
        self.join_time = join_time
        self.channel_index = channel_index

    def __repr__(self):
        """
        Representation
        :return: (user_id, name)
        """
        return f"({self.user_id}, {self.channel_id})"


class UserSettings:
    """
    Representation of user settings
    """
    def __init__(self, user_id, password, theme=None, auth=None):
        self.user_id = user_id
        self.password = password
        self.theme = theme if theme else 1
        self.auth = auth if auth else False

    def __repr__(self):
        """
        Representation
        :return: (user_id, 'password', theme, 'auth')
        """
        return f"({self.user_id}, '{self.password}', {self.theme}, '{self.auth}')"