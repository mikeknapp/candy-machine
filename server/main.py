import os
import threading
import webbrowser

from flask import Flask, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="dist")
CORS(app)

FLASK_ENV = os.environ.get("FLASK_ENV")
PORT = 5000
IS_PROD = FLASK_ENV == "production"
WORKING_DIR = os.path.join(os.path.dirname(__file__), "..", "working")


@app.route("/projects/create", methods=["POST"])
def create_project():
    request_data = request.get_json()
    print(request_data)

    return {
        "message": "Project created successfully",
        "success": True,
        "errors": None,
    }


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
