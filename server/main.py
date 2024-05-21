import io
import os
import threading
import webbrowser

from consts import IMGS_DIR, WORKING_DIR
from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
from PIL import Image
from project import Project

app = Flask(__name__, static_folder="dist")
CORS(app)

FLASK_ENV = os.environ.get("FLASK_ENV")
PORT = 5000
IS_PROD = FLASK_ENV == "production"


@app.route("/projects/create", methods=["POST"])
def create_project():
    data = request.json or {}
    name = str(data.get("name", "")).strip()
    is_valid, msg = Project.is_valid_name(name)
    if not is_valid:
        return {"errors": {"name": msg}}
    Project.create_new_project(name)
    return "OK"


@app.route("/projects/list", methods=["GET", "POST"])
def list_projects():
    return Project.list_all_projects()


@app.route("/project/<string:project_name>/get", methods=["GET", "POST"])
def get_project(project_name):
    project = Project(project_name)
    return {
        "name": project_name,
        "images": project.list_all_imgs(),
    }


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
