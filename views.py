from flask import Blueprint, render_template, redirect, url_for, flash, request, session
from api.database import *
import time

view = Blueprint(__name__, "view") # Define views


# PAGES
@view.route("/")
@view.route("/home")
def home():
    # if "user" not in session:
    #     flash("Not logged in!", "error")
    #     return redirect(url_for("views.log_in"))

    # usr = session.get("user")

    return render_template("base.html")#, user_id=usr.get("id"))


@view.route("/login", methods=["POST", "GET"])
def log_in():
    if "user" in session:
        flash("Already logged in!", "info")
        return redirect(url_for("views.home"))

    if request.method != "POST":
        return render_template("login.html")

    db = Database()

    if settings := db.get_user(request.form.get("email")):
        user = db.get_entry(USER_TABLE, settings.id)
        secrets = db.get_entry(USER_SECRET_TABLE, settings.id)

        if Functions.hash_passwd(request.form.get("passwd"), secrets.password.split("$")[0]) == secrets.password:
            session["user"] = user.__dict__
            db.close()

            flash("Logged in!", "info")
            return redirect(url_for("views.home"))

    flash("Invalid email or password!", "error")
    return render_template("login.html")
            
    
@view.route("/register", methods=["POST", "GET"])
def register():
    if request.method != "POST":
        return render_template("register.html")
    
    if "user" in session:
        session.pop("user", None)  

    db = Database()

    if db.get_user(email := request.form.get("email")):
        flash("Email is already registered!", "error")
        return render_template("register.html")

    if (tag := db.get_available_tag(username := request.form.get("usrname"))) is None:
        flash("Too many users have this username, try another one!", "error")
        return render_template("register.html")

    current_time = time.time() 
    id = Functions.create_id(current_time)

    db.insert_entry(USER_TABLE, User(id, username, tag, "generic", current_time))
    db.insert_entry(USER_SETTING_TABLE, UserSettings(id, email))
    db.insert_entry(USER_SECRET_TABLE, UserSecrets(id, Functions.hash_passwd(request.form.get("passwd"))))

    db.close()

    flash("Created an account!", "info")
    return redirect(url_for("views.log_in"))


@view.route("/logout")
def log_out():
    if "user" in session:
        session.pop("user", None)
        flash("Logged out!", "info")

    return redirect(url_for("views.log_in"))


# GENERAL FUNCTIONS