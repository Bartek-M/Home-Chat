from flask import Blueprint, render_template, redirect, url_for, request, session, flash
from config.database import *
import time


view = Blueprint(__name__, "view") # Define views


# PAGES
@view.route("/")
@view.route("/home")
def home():
    if "user" not in session:
        flash("You are not logged in!", "error")
        return redirect(url_for("views.log_in"))

    db = Database()
    usr = session.get("user")
    settings = session.get("settings")

    # if request.method == "POST":
    #     if msg := request.form.get("message"):
    #         time_now = time.time()
    #         db.insert_entry(MESSAGE_TABLE, Message(Functions.create_id(time_now), usr.get("user_id"), 1234, msg, Functions.convert_time(time_now)))

    messages = db.get_channel_messages(1234) 

    return render_template("index.html", text=f"{usr.get('name')}!", user_id=usr.get("user_id"), theme=settings.get("theme"), messages=messages, Database=db)


@view.route("/login", methods=["POST", "GET"])
def log_in():
    if "user" in session:
        flash("You are already logged in!", "info")
        return redirect(url_for("views.home"))

    if request.method == "POST":
        db = Database()

        user = db.get_user(request.form.get("email"))
        hashed_passw = Functions.hash_passwd(request.form.get("passwd"))

        if not user or hashed_passw != user.password:
            flash("Invalid email or password!", "error")
            return render_template("login.html", theme=1)

        session["user"] = user.__dict__
        session["settings"] = db.get_entry(USER_SETTING_TABLE, user.user_id).__dict__
        db.close()

        flash("You have been logged in!", "info")
        return redirect(url_for("views.home"))
            
    return render_template("login.html", theme=1)


@view.route("/register", methods=["POST", "GET"])
def register():
    if request.method == "POST":
        if "user" in session:
            session.pop("user", None)
        
        current_time = time.time() 
        id = Functions.create_id(current_time)
        name = request.form.get("usrname")
        email = request.form.get("email")
        passwd = request.form.get("passwd")

        db = Database()
        db.insert_entry(USER_TABLE, User(id, name, email, Functions.hash_passwd(passwd), Functions.convert_time(current_time)))
        db.insert_entry(USER_SETTING_TABLE, UserSettings(id))
        db.close()

        flash("You have created an account!", "info")
        return redirect(url_for("views.log_in"))

    return render_template("register.html", theme=1)


@view.route("/logout")
def log_out():
    if "user" in session:
        session.pop("user", None)
        session.pop("settings", None)
        flash("You have been logged out!", "info")

    return redirect(url_for("views.log_in"))


# GENERAL FUNCTIONS
@view.route("/database")
def database():
    tables = [USER_TABLE, MESSAGE_TABLE, CHANNEL_TABLE, USER_CHANNEL_TABLE, USER_SETTING_TABLE]
    db = Database()

    for table in tables:
        print(f"{table}:\n{db.get_all(table)}\n")

    db.close()

    return redirect(url_for("views.home"))