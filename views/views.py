from flask import render_template

from . import view


# CHAT
@view.route("/home")
def home():
    return render_template("index.html")


@view.route("/channels/<channel_id>")
def channel(**_):
    return render_template("index.html")


# AUTH
@view.route("/login")
def log_in():
    return render_template("index.html")


@view.route("/register")
def register():
    return render_template("index.html")


@view.route("/logout")
def log_out():
    return render_template("index.html")


@view.route("/email-confirm")
def email_confirm():
    return render_template("index.html")


# RECOVERY
@view.route("/recovery/<option>")
def recovery(**_):
    return render_template("index.html")
