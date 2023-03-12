from flask import Blueprint, render_template, redirect, url_for

view = Blueprint(__name__, "view") # Define views


# PAGES
@view.route("/")
@view.route("/home")
def home():
    return render_template("index.html")

@view.route("/login")
def log_in():
    return render_template("index.html")
    
@view.route("/register")
def register():
    return render_template("index.html")

@view.route("/logout")
def log_out():
    return redirect(url_for("views.log_in"))