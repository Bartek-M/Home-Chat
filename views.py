from flask import Blueprint, render_template, redirect, url_for, request, session, flash

view = Blueprint(__name__, "view") # Define views
kwargs = {"theme": False}


# PAGES
@view.route("/")
@view.route("/home", methods=["POST", "GET"])
def home():
    if "user" not in session:
        flash("You are not logged in!", "info")
        return redirect(url_for("views.log_in"))

    usr = session["user"]    
    return render_template("index.html", text=f"Hello {usr}!", kwargs=kwargs) # Render home page


@view.route("/login", methods=["POST", "GET"])
def log_in():
    if "user" in session:
        flash("You are already logged in!", "info")
        return redirect(url_for("views.home"))

    if request.method == "POST":
        user = request.form["usrname"]
        session["user"] = user

        flash("You have been logged in!", "info")
        return redirect(url_for("views.home"))
            
    return render_template("login.html", kwargs=kwargs)


@view.route("/signup", methods=["POST", "GET"])
def sign_up():
    if request.method == "POST":
        if "user" in session:
            session.pop("user", None)

        flash("You have created an account!", "info")
        return redirect(url_for("views.log_in"))

    return render_template("signup.html", kwargs=kwargs)


@view.route("/logout")
def log_out():
    if "user" in session:
        session.pop("user", None)
        flash("You have been logged out!", "info")

    return redirect(url_for("views.log_in"))


# GENERAL FUNCTIONS