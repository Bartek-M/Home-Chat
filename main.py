from flask import Flask

from api import *
from views import view

# GLOBAL VARIABLES
ADDR = "192.168.0.194" # 192.168.0.194 | 127.0.0.1
PORT = 5000

# INITIALIZE FLASK
app = Flask(__name__)
app.url_map.strict_slashes = False

app.json.sort_keys = False
app.json.compact = False

app.register_blueprint(view, url_prefix="/")
app.register_blueprint(api, url_prefix="/api")

app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(channels, url_prefix="/api/channels")
app.register_blueprint(users, url_prefix="/api/users")
app.register_blueprint(images, url_prefix="/api/images")


if __name__ == "__main__":
    app.run(debug=True, host=ADDR, port=PORT)