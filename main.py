from flask import Flask, render_template
from flask_socketio import SocketIO
from config.database import *
from views import view
import time

# GLOBAL VARIABLES
ADDR = "127.0.0.1" # 192.168.0.194 | 127.0.0.1
PORT = 5000

# INITIALIZE FLASK
app = Flask(__name__, static_folder="src", template_folder="src/html")
app.secret_key = 'jkuQ/jM"?L5Vh]071iE{P9ziv?7xQUeeA8rFZ9*{' # Secret key for session
app.register_blueprint(view, url_prefix="/")
socketio = SocketIO(app)


# Handle socketio server
@socketio.on("message send")
def handle(data):
    user_id, content = data.values()

    db = Database()
    user_name = db.get_entry(USER_TABLE, user_id).name
    current_time = time.time()

    socketio.emit("message response", {"author_name": user_name, "content": content, "time": Functions.convert_time(current_time)})

@socketio.on("connecting")
def handle(user_id):
    print(f"[CONNECTION] {user_id}")


# not found
@app.errorhandler(404)
def page_not_found(e):
    return render_template("not_found.html", theme=1), 404


if __name__ == "__main__":
    socketio.run(app, debug=False, host=ADDR, port=PORT)