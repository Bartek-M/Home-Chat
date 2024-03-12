from flask import Blueprint

view = Blueprint(__name__, "view")

from . import views
from . import errors
