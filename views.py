# Imports
from flask import Blueprint, render_template, redirect, url_for

view = Blueprint(__name__, "view") # Define views

# Nothing
@view.route("")
def blank_page():
    return redirect(url_for("views.login"))

# Login Page
@view.route("login")
def login():
    return "<h1>Login Page</h1>"

# Home Page
@view.route("home")
def home():
    return "<h1>Home Page</h1>"