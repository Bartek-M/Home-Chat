from flask import request, jsonify, render_template

from . import view


@view.app_errorhandler(401)
def unauthorized(_):
    return {"message": "401 Unauthorized"}, 401


@view.app_errorhandler(403)
def unauthorized(_):
    return {"message": "403 Forbidden"}, 403


@view.app_errorhandler(404)
def page_not_found(_):
    if request.path.startswith("/api"):
        return jsonify({"message": "404 Not Found"}), 404

    return render_template("index.html"), 404


@view.app_errorhandler(405)
def method_not_allowed(_):
    return jsonify({"message": "405 Method Not Allowed"}), 405


@view.app_errorhandler(429)
def too_many_requests(_):
    return jsonify({"message": "429 Too Many Requests"}), 429
