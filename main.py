import threading

from flask import Flask
from flask_socketio import SocketIO
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# GLOBAL VARIABLES
ADDR = "127.0.0.1" # 192.168.0.194 | 127.0.0.1
PORT = 5000

app = Flask(__name__)
socketio = SocketIO(app, ping_interval=45, ping_timeout=10)

from api import *
from views import view


# CONFIGURE FLASK
app.url_map.strict_slashes = False

app.json.sort_keys = False
app.json.compact = False

app.register_blueprint(view, url_prefix="/")
app.register_blueprint(api, url_prefix="/api")

app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(channels, url_prefix="/api/channels")
app.register_blueprint(users, url_prefix="/api/users")
app.register_blueprint(images, url_prefix="/api/images")
app.register_blueprint(recovery, url_prefix="/api/recovery")

# SETUP RATE LIMITER
limiter = Limiter(get_remote_address, app=app, default_limits=["1000/minute"])

# SETUP NON-VERIFIED USERS CHECK
verified_check_thread = threading.Thread(target=Functions.delete_non_verified)
verified_check_thread.daemon = True
verified_check_thread.start()


if __name__ == "__main__":
    socketio.run(app, debug=True, host=ADDR, port=PORT)