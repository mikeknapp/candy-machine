import os
import threading
import webbrowser

from flask import Flask, jsonify, send_from_directory

app = Flask(__name__, static_folder="dist")

CANDY_MACHINE_ENV = os.environ.get("CANDY_MACHINE_ENV")
PORT = 5000
IS_PROD = CANDY_MACHINE_ENV == "prod"
WORKING_DIR = os.path.join("..", "working")


@app.route("/api/hello", methods=["GET"])
def hello():
    return jsonify(message="HELLO")


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
        print(f"Creating working directory: {WORKING_DIR}")
        os.makedirs(WORKING_DIR, exist_ok=True)

    threading.Timer(1.25, open_browser).start()

    app.run(debug=IS_PROD, port=PORT)
