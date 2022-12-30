from random import randint
import time
import hashlib


class User:
    """
    Representation of a user
    """
    def __init__(self, name, password, create_time):
        self.name = name
        self.password = password
        self.create_time = create_time

        self.id = self._create_id()
        self.password = self._hash_passwd()
        self.create_time = self._convert_time()

    def _create_id(self):
        """
        Create unique ID
        :return: creation time(int)
        """
        return int(str(self.create_time).replace(".", "") + ''.join([str(randint(0, 9)) for _ in range(7)]))

    def _convert_time(self):
        """
        Convert time from epoch to normal data
        :return: Converted time (str)
        """
        return str(time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(self.create_time)))

    def _hash_passwd(self):
        """
        Hash user password
        :return: Hashed password (str)
        """
        return str(hashlib.sha256(str(self.password).strip().encode()).hexdigest())        

    def __repr__(self):
        return f"User('{self.id}', '{self.name}', '{self.password}', '{self.create_time}')"