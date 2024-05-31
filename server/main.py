import io
import os
import threading
import webbrowser
from urllib.parse import unquote

from consts import LOWERCASE_IS_TRUE, PROJECTS_DIR
from flask import (
    Flask,
    json,
    jsonify,
    make_response,
    request,
    send_file,
    send_from_directory,
)
from flask_cors import CORS
from image import Crop, valid_import_directory
from PIL import Image
from project import Project

app = Flask(__name__, static_folder="dist")
CORS(app)

FLASK_ENV = os.environ.get("FLASK_ENV")
PORT = 5000
IS_PROD = FLASK_ENV == "production"


@app.route("/project/create", methods=["POST"])
def create_project():
    data = request.json if request.json else {}

    # Check the name is valid.
    name = str(data.get("name", "")).strip()
    is_valid, msg = Project.is_valid_name(name)
    if not is_valid:
        return {"errors": {"name": msg}}, 400

    trigger_word = str(data.get("triggerWord", "")).strip()

    # Check the import directory looks fine. We don't actually import the photos yet.
    # That will happen later, and the frontend will pass us the path to import from.
    import_dir = str(data.get("importDirPath", "")).strip()
    if import_dir and not valid_import_directory(import_dir):
        return {
            "errors": {"importDirPath": "No valid images found in the directory"}
        }, 400

    Project.create_new_project(name, trigger_word)
    return jsonify({"name": name, "triggerWord": trigger_word})


@app.route("/project/<string:project_name>/import", methods=["GET"])
def import_to_project(project_name):
    import_path = unquote(request.args.get("path", "")).strip()
    remove_duplicates = (
        request.args.get("remove_duplicates", "").strip().lower() in LOWERCASE_IS_TRUE
    )
    project = Project(project_name)

    def generate():
        for data in project.import_images(import_path, remove_duplicates):
            yield f"data:{json.dumps(data)}\n\n"

    return app.response_class(generate(), mimetype="text/event-stream")


@app.route("/projects/list", methods=["GET", "POST"])
def list_projects():
    return jsonify(Project.list_all_projects())


@app.route("/project/<string:project_name>/get", methods=["GET", "POST"])
def get_project(project_name):
    project = Project(project_name)
    return jsonify(project.to_dict())


@app.route("/project/<string:project_name>/save", methods=["GET", "POST"])
def save_project(project_name):
    project = Project(project_name)
    data = request.json if request.json else {}
    project.save(data)
    return jsonify({"result": "OK"})


@app.route("/project/<string:project_name>/tags/save", methods=["POST"])
def save_image_tags(project_name):
    project = Project(project_name)
    data = request.json if request.json else {}
    project.set_selected_image(data.get("image", ""))
    project.save_selected_image_tags(data.get("tags", []))
    return jsonify({"result": "OK"})


@app.route("/project/<string:project_name>/tags/load", methods=["GET", "POST"])
def load_image_tags(project_name):
    project = Project(project_name)
    filename = request.args.get("image", "")
    project.set_selected_image(filename)
    return jsonify(
        {
            "projectName": project_name,
            "image": filename,
            "selected": project.get_selected_image_tags(),
            "autoTags": project.get_selected_auto_image_tags(),
        }
    )


@app.route("/project/<string:project_name>/imgs/<string:fname>", methods=["GET"])
def serve_image(project_name, fname):
    project = Project(project_name)
    img_path = project.img_path(fname)

    # Check the file exists.
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

    # Thumbnail?
    thumbnail = request.args.get("thumbnail", "").strip().lower() in LOWERCASE_IS_TRUE
    if thumbnail:
        img = Image.open(img_path)
        img.thumbnail((250, int(250 * img.height / img.width)))
        img_io = io.BytesIO()
        img.save(img_io, "PNG")
        img_io.seek(0)
        response = make_response(send_file(img_io, mimetype="image/png"))
        response.headers["Cache-Control"] = "public, max-age=31536000"  # 1 year
        return response

    return send_from_directory(project.img_dir(), fname)


@app.route("/project/<string:project_name>/img/delete", methods=["POST"])
def delete_image(project_name):
    data = request.json if request.json else {}
    filename = str(data.get("filename", "")).strip()
    project = Project(project_name)
    project.delete_image(filename)
    return jsonify({"result": "OK"})


@app.route("/project/<string:project_name>/img/edit", methods=["POST"])
def edit_image(project_name):
    data = request.json if request.json else {}
    filename = str(data.get("filename", "")).strip()
    left_rotate = int(data.get("rotate", 0))
    flip = data.get("flip", "")
    crop_data: dict = data.get("crop", {})
    assert crop_data["unit"] == "px", "Only pixel units are supported"
    crop = Crop(
        crop_data.get("x", 0),
        crop_data.get("y", 0),
        crop_data.get("width", 0),
        crop_data.get("height", 0),
    )
    project = Project(project_name)
    new_filename = project.edit_image(filename, left_rotate, flip, crop)
    if not new_filename:
        return {"errors": {"edit": "Error editing image"}}, 404
    return jsonify({"newFilename": new_filename})


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    dist_dir = str(app.static_folder)
    if path != "" and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    elif path == "":
        return send_from_directory(dist_dir, "index.html")
    return "Not found", 404


def open_browser():
    if IS_PROD:
        webbrowser.open_new(f"http://127.0.0.1:{PORT}")


if __name__ == "__main__":
    if not os.path.exists(PROJECTS_DIR):
        os.makedirs(PROJECTS_DIR, exist_ok=True)

    threading.Timer(1.25, open_browser).start()

    app.run(debug=not IS_PROD, port=PORT)
