class User:
    """
    Representation of a user
    """
    def __init__(self, user_id, name, password, create_time):
        self.user_id = user_id
        self.name = name
        self.password = password
        self.create_time = create_time 

    def __repr__(self):
        """
        Representation
        :return: User(user_id, name, password, channels, creation_time)
        """
        return f"User('{self.user_id}', '{self.name}', '{self.password}', '{self.create_time}')"


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
        :return: Message(messageid, user_id, channel_id, content, create_time)
        """
        return f"Message('{self.message_id}', '{self.user_id}', '{self.channel_id}', '{self.content}', '{self.create_time}')"


class Channel:
    """
    Representation of a channel
    """
    def __init__(self, channel_id, name, create_time, group_server=0):
        self.channel_id = channel_id
        self.name = name
        self.create_time = create_time
        self.group = group_server

    def __repr__(self):
        """
        Representation
        :return: Channel(channel_id, name, create_time, group_server)
        """
        return f"Channel('{self.channel_id}', '{self.name}', '{self.create_time}', '{self.group_server}')"


class UserChannel:
    """
    Representation of a user channels
    """
    def __init__(self, user_id, channel_id, join_time, access_time):
        self.user_id = user_id
        self.channel_id = channel_id
        self.join_time = join_time
        self.access_time = access_time

    def __repr__(self):
        """
        Representation
        :return: UserChannel(user_id, name)
        """
        return f"UserChannel('{self.user_id}', '{self.channel_id}', '{self.join_time}', '{self.access_time}')"