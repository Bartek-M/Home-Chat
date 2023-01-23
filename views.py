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

    usr = session.get("user")
    settings = session.get("settings")

    return render_template("index.html", text=f"{usr.get('name')}!", user_id=usr.get("id"), theme=settings.get("theme"))


@view.route("/login", methods=["POST", "GET"])
def log_in():
    if "user" in session:
        flash("You are already logged in!", "info")
        return redirect(url_for("views.home"))

    if request.method != "POST":
        return render_template("login.html", theme=1)

    db = Database()

    if user := db.get_user(request.form.get("email")):
        settings = db.get_entry(USER_SETTING_TABLE, user.id)

        if Functions.hash_passwd(request.form.get("passwd"), settings.password.split("$")[0]) == settings.password:
            session["user"] = user.__dict__
            session["settings"] = settings.__dict__
            db.close()

            flash("You have been logged in!", "info")
            return redirect(url_for("views.home"))

    flash("Invalid email or password!", "error")
    return render_template("login.html", theme=1)
            
    
@view.route("/register", methods=["POST", "GET"])
def register():
    if request.method != "POST":
        return render_template("register.html", theme=1)
    
    if "user" in session:
        session.pop("user", None)  

    db = Database()

    if db.get_user(email := request.form.get("email")):
        flash("Email is already registered!", "error")
        return render_template("register.html", theme=1)

    current_time = time.time() 
    id = Functions.create_id(current_time)

    db.insert_entry(USER_TABLE, User(id, request.form.get("usrname"), email, current_time))
    db.insert_entry(USER_SETTING_TABLE, UserSettings(id, Functions.hash_passwd(request.form.get("passwd"))))
    db.close()

    flash("You have created an account!", "info")
    return redirect(url_for("views.log_in"))


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