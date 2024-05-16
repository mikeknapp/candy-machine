import os
import threading
import webbrowser
from typing import Any, Dict

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="dist")
CORS(app)

FLASK_ENV = os.environ.get("FLASK_ENV")
PORT = 5000
IS_PROD = FLASK_ENV == "production"
WORKING_DIR = os.path.join(os.path.dirname(__file__), "..", "working")


@app.route("/projects/create", methods=["POST"])
def create_project():
    if not request.json:
        return jsonify(errors={"dirName": "Invalid JSON data"}), 400
    data: Dict[str, Any] = request.json
    dirName = str(data.get("dirName", "")).strip()
    importDirPath = str(data.get("importDirPath", "")).strip()
    autoFileFormat = data.get("autoFileFormat")
    autoFileNaming = data.get("autoFileNaming")

    # Validate the directory name.
    if not dirName:
        return jsonify(errors={"dirName": "A directory name is required"}), 400

    if not all(c.isalnum() or c in ("_", "-") for c in dirName):
        return (
            jsonify(
                errors={
                    "dirName": "Only alphanumeric characters, underscores, and hyphens allowed"
                }
            ),
            400,
        )

    project_path = os.path.join(WORKING_DIR, dirName)
    if os.path.exists(project_path):
        return (
            jsonify(errors={"dirName": "A project with this name already exists"}),
            400,
        )

    os.makedirs(project_path)
    # Further logic for handling importDirPath, autoFileFormat, and autoFileNaming

    return jsonify(data), 200


@app.route("/projects/list", methods=["GET"])
def list_projects():
    if not os.path.exists(WORKING_DIR):
        return jsonify([]), 200

    project_dirs = os.listdir(WORKING_DIR)
    projects = [
        {
            "dirName": dirName,
            "importDirPath": "",  # TODO: Fix.
            "autoFileFormat": False,
            "autoFileNaming": False,
        }
        for dirName in project_dirs
    ]
    return jsonify(projects), 200


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    dist_dir = str(app.static_folder)
    if path != "" and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    else:
        return send_from_directory(dist_dir, "index.html")


def open_browser():
    if IS_PROD:
        webbrowser.open_new(f"http://127.0.0.1:{PORT}")


if __name__ == "__main__":
    if not os.path.exists(WORKING_DIR):
        os.makedirs(WORKING_DIR, exist_ok=True)

    threading.Timer(1.25, open_browser).start()

    app.run(debug=not IS_PROD, port=PORT)
