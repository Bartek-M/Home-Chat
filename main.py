from flask import Flask, render_template
from views import view

# GLOBAL VARIABLES
ADDR = "127.0.0.1" # 192.168.0.194 | 127.0.0.1
PORT = 5000

# INITIALIZE FLASK
app = Flask(__name__)
app.secret_key = 'jkuQ/jM"?L5Vh]071iE{P9ziv?7xQUeeA8rFZ9*{' # Secret key for session
app.register_blueprint(view, url_prefix="/")


# not found
@app.errorhandler(404)
def page_not_found(e):
    return render_template("not_found.html", kwargs={"theme": True}), 404


if __name__ == "__main__":
    app.run(host=ADDR, port=PORT, debug=True)