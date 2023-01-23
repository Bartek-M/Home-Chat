class User:
    """
    Representation of a user
    """
    def __init__(self, id, name, email, create_time):
        self.id = id
        self.name = name
        self.email = email
        self.create_time = create_time 

    def __repr__(self):
        """
        Representation
        :return: (id, name, email, creation_time)
        """
        return f"({self.id}, '{self.name}', '{self.email}', {self.create_time})"


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
        return f"({self.id}, {self.user_id}, {self.channel_id}, '{self.content}', {self.create_time})"


class Channel:
    """
    Representation of a channel
    """
    def __init__(self, id, name, create_time):
        self.id = id
        self.name = name
        self.create_time = create_time

    def __repr__(self):
        """
        Representation
        :return: (id, name, create_time)
        """
        return f"({self.id}, '{self.name}', {self.create_time})"


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
        :return: (user_id, name)
        """
        return f"({self.user_id}, {self.channel_id}, '{self.nick}')"


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
        :return: (user_id, password, theme, auth)
        """
        return f"({self.user_id}, '{self.password}', {self.theme}, '{self.auth}')"