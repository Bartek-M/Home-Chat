from flask import Blueprint, render_template, jsonify, request

error = Blueprint(__name__, "error")

# ERRORS
@error.app_errorhandler(401)
def unauthorized(_):
    return {"message": "401 Unauthorized"}, 401

@error.app_errorhandler(401)
def unauthorized(_):
    return {"message": "403 Forbidden"}, 403

@error.app_errorhandler(404)
def page_not_found(_):
    if request.path.startswith("/api"):
        return jsonify({"message": "404 Not Found"}), 404

    return render_template("index.html"), 404

@error.app_errorhandler(405)
def method_not_allowed(_):
    return jsonify({"message": "405 Method Not Allowed"}), 405