from flask import Flask
from flask_socketio import SocketIO
from views import view
from api import *
import time

# GLOBAL VARIABLES
ADDR = "127.0.0.1" # 192.168.0.194 | 127.0.0.1
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

socketio = SocketIO(app)


# SOCKETS
@socketio.on("message send")
def handle(data):
    user_id, channel_id, content = data.values()
    current_time = time.time()

    db = Database()
    user = db.get_entry(USER_TABLE, user_id).__dict__

    if not (channel := db.get_entry(CHANNEL_TABLE, channel_id)):
        channel = Channel(channel_id, "Test", "123456789", current_time)

        db.insert_entry(CHANNEL_TABLE, channel)

    message = Message(Functions.create_id(current_time), user["id"], channel.id, content, current_time)
    db.insert_entry(MESSAGE_TABLE, message)
    db.close()

    socketio.emit("message recive", {"id": message.id, "channel_id": channel.id, "author": user, "content": message.content, "time": str(current_time)})

@socketio.on("connect")
def handle():
    print("connect")

@socketio.on("disconnect")
def handle():
    print("diconnect")


if __name__ == "__main__":
    socketio.run(app, debug=True, host=ADDR, port=PORT)