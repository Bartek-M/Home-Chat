class User:
    """
    Representation of a user
    """
    def __init__(self, user_id, name, email, password, create_time):
        self.user_id = user_id
        self.name = name
        self.email = email
        self.password = password
        self.create_time = create_time 

    def __repr__(self):
        """
        Representation
        :return: (user_id, name, email, password, channels, creation_time)
        """
        return f"({self.user_id}, '{self.name}', '{self.email}', '{self.password}', '{self.create_time}')"


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
    def __init__(self, channel_id, name, create_time, group_server=0):
        self.channel_id = channel_id
        self.name = name
        self.create_time = create_time
        self.group_server = group_server

    def __repr__(self):
        """
        Representation
        :return: (channel_id, name, create_time, group_server)
        """
        return f"({self.channel_id}, '{self.name}', '{self.create_time}', {self.group_server})"


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
        return f"({self.user_id}, {self.channel_id}, '{self.join_time}', {self.channel_index})"


class UserSettings:
    """
    Representation of user settings
    """
    def __init__(self, user_id, theme=None, auth=None):
        self.user_id = user_id
        self.theme = theme if theme else 1
        self.auth = auth if auth else False

    def __repr__(self):
        """
        Representation
        :return: (user_id, theme, 'auth')
        """
        return f"({self.user_id}, {self.theme}, '{self.auth}')"