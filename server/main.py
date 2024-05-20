import io
import os
import threading
import webbrowser
from typing import Any, Dict

from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
from PIL import Image

app = Flask(__name__, static_folder="dist")
CORS(app)

FLASK_ENV = os.environ.get("FLASK_ENV")
PORT = 5000
IS_PROD = FLASK_ENV == "production"
WORKING_DIR = os.path.join(os.path.dirname(__file__), "..", "working")
IMGS_DIR = "imgs"
IMG_EXT = ".jpg"


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


@app.route("/projects/list", methods=["GET", "POST"])
def list_projects():
    if not os.path.exists(WORKING_DIR):
        return jsonify([]), 200
    return jsonify(os.listdir(WORKING_DIR)), 200


@app.route("/project/<string:dir_name>/get", methods=["GET", "POST"])
def get_project(dir_name):
    img_path = os.path.join(WORKING_DIR, dir_name, IMGS_DIR)
    if not os.path.exists(img_path):
        return jsonify(errors={"dirName": "Project image directory not found"}), 404
    img_files = os.listdir(img_path)
    img_files = [f for f in img_files if f.endswith(IMG_EXT)]
    return jsonify({"dirName": dir_name, "images": img_files}), 200


@app.route("/project/<string:dir_name>/imgs/<string:fname>", methods=["GET"])
def serve_image(dir_name, fname):
    img_dir = os.path.join(WORKING_DIR, dir_name, IMGS_DIR)
    img_path = os.path.join(img_dir, fname)
    if not os.path.exists(img_path):
        return jsonify(errors={"fname": "Image file not found"}), 404

    # Preview rotation
    left_rotate = int(request.args.get("rotate", 0))
    if left_rotate > 0:
        rotated_image = Image.open(img_path)
        if left_rotate:
            rotated_image = rotated_image.rotate(-left_rotate, expand=True)
        img_io = io.BytesIO()
        rotated_image.save(img_io, "PNG")
        img_io.seek(0)
        return send_file(img_io, mimetype="image/png")
    return send_from_directory(img_dir, fname)


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
