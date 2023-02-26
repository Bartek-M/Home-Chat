from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO
from api import *
from views import view
import time

# GLOBAL VARIABLES
ADDR = "127.0.0.1" # 192.168.0.194 | 127.0.0.1
PORT = 5000

# INITIALIZE FLASK
app = Flask(__name__)
app.url_map.strict_slashes = False
app.secret_key = 'jkuQ/jM"?L5Vh]071iE{P9ziv?7xQUeeA8rFZ9*{' # Secret key for session

app.register_blueprint(view, url_prefix="/")
app.register_blueprint(api, url_prefix="/api")

socketio = SocketIO(app)


# Handle socketio server
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


# not found
@app.errorhandler(404)
def page_not_found(_):
    return render_template("index.html"), 404

@app.errorhandler(405)
def method_not_allowed(_):
    return jsonify({"message": "405 Method Not Allowed"}), 405


if __name__ == "__main__":
    socketio.run(app, debug=True, host=ADDR, port=PORT)