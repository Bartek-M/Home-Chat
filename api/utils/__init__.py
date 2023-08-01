from .decorators import Decorators
from .functions import Functions
from .mailing import Mailing
from .security import Security


# CONSTANTS
AVATARS_FOLDER = "./api/assets/avatars/"
ICONS_FOLDER = "./api/assets/channel_icons/"
IMAGE_SIZE = (256, 256)

VERIFY_ACCESS = "verify"
MFA_ACCESS = "mfa"

MAX_CHANNELS = 50
MAX_FRIENDS = 100
MAX_CHANNEL_USERS = 100