import os
from flask import Flask
from flask import Flask, request, jsonify, abort, json
from werkzeug.exceptions import HTTPException
from flask_cors import CORS
from dataset import DatasetStore
import numpy as np

UPLOAD_FOLDER = os.environ.get('ANDROMEDA_UPLOAD_DIR', '/tmp/andromeda_uploads')
app = Flask(__name__)
if os.environ.get('ANDROMEDA_DEV_MODE'):
    print("Warning: Disabling CORS checking for local development.")
    CORS(app) # Disable CORS so local react app can use the API
os.makedirs(UPLOAD_FOLDER, exist_ok=True) # ensure the upload destination exists
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200 MB


@app.errorhandler(HTTPException)
def handle_exception(e):
    """Return JSON instead of HTML for HTTP errors."""
    # start with the correct headers and status code from the error
    response = e.get_response()
    # replace the body with JSON
    response.data = json.dumps({
        "code": e.code,
        "name": e.name,
        "description": e.description,
    })
    response.content_type = "application/json"
    return response


def has_csv_extension(filename):
    if '.' in filename:
        return filename.rsplit('.', 1)[1].lower() == 'csv'
    return False


def validate_upload_filename(filename):
    # If the user does not select a file, the browser submits an
    # empty file without a filename.
    if filename == '':
        abort(400, "Empty filename included in request.")

    if not has_csv_extension(filename):
        abort(400, "Only CSV files with the .csv extension are allowed to be uploaded.")


@app.route('/api/dataset/', methods=['POST'])
def upload_dataset():
    # check if the post request has the file part
    if 'file' not in request.files:
        abort(400, "No file included in request.")
    user_file = request.files['file']
    validate_upload_filename(user_file.filename)

    dataset_store = DatasetStore(base_directory=UPLOAD_FOLDER)
    dataset = dataset_store.create_dataset(user_file)
    # we could send the data the the front end here
    # data = dataset.read_dataframe().replace({np.nan: None}).to_dict("records")
    return jsonify(
        {
            "id": dataset.id
        }
    )


@app.route('/api/dataset/<uuid:dataset_id>/dimensional-reduction', methods=['POST'])
def dimensional_reduction(dataset_id):
    json_payload = request.get_json()
    if "weights" not in json_payload:
        abort(400, "Missing weights in json payload")

    dataset_store = DatasetStore(base_directory=UPLOAD_FOLDER)
    dataset = dataset_store.get_dataset(dataset_id)
    weights, image_coordinates = dataset.dimensional_reduction(json_payload["weights"])

    return jsonify({
        "id": dataset_id,
        "weights": weights,
        "images": image_coordinates
    })


@app.route('/api/dataset/<uuid:dataset_id>/inverse-dimensional-reduction', methods=['POST'])
def inverse_dimensional_reduction(dataset_id):
    json_payload = request.get_json()
    if "images" not in json_payload:
        abort(400, "Missing images in json payload")

    dataset_store = DatasetStore(base_directory=UPLOAD_FOLDER)
    dataset = dataset_store.get_dataset(dataset_id)
    weights, image_coordinates = dataset.inverse_dimensional_reduction(json_payload["images"])

    return jsonify({
        "id": dataset_id,
        "weights": weights,
        "images": image_coordinates
    })
