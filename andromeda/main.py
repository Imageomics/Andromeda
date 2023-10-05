import os
import json
import datetime
from flask import Flask, Response, request, jsonify, abort, json, send_file
from werkzeug.exceptions import HTTPException
from flask_cors import CORS
from dataset import DatasetStore
from inaturalist import get_inaturalist_observations, create_csv_str, BadObservationException

UPLOAD_FOLDER = os.environ.get('ANDROMEDA_UPLOAD_DIR', '/tmp/andromeda_uploads')
COLUMN_CONFIG = os.environ.get('ANDROMEDA_COLUMN_CONFIG', 'columnConfig.json')

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


def get_boolean_param(request, param_name):
    # Return boolean value in query parameters, defaults to false
    str_value = request.args.get(param_name, "false")
    return str_value.lower() == "true"


def get_int_param(request, param_name):
    # Return integer value in query parameters, defaults to None
    str_value = request.args.get(param_name)
    if str_value:
        return int(str_value)
    return None


@app.route('/api/dataset/', methods=['POST'])
def upload_dataset():
    # check if the post request has the file part
    if 'file' not in request.files:
        abort(400, "No file included in request.")
    user_file = request.files['file']
    validate_upload_filename(user_file.filename)

    dataset_store = DatasetStore(base_directory=UPLOAD_FOLDER)
    dataset = dataset_store.create_dataset(user_file)
    return jsonify(
        {
            "id": dataset.id
        }
    )


@app.route('/api/dataset/<uuid:dataset_id>', methods=['GET'])
def download_dataset(dataset_id):
    filename = request.args.get("filename", "json")
    dataset_store = DatasetStore(base_directory=UPLOAD_FOLDER)
    path = dataset_store.get_dataset_path(dataset_id)
    return send_file(path, as_attachment=True, download_name=filename)


@app.route('/api/dataset/<uuid:dataset_id>/dimensional-reduction', methods=['POST'])
def dimensional_reduction(dataset_id):
    json_payload = request.get_json()
    if "weights" not in json_payload:
        abort(400, "Missing weights in json payload")

    dataset_store = DatasetStore(base_directory=UPLOAD_FOLDER)
    dataset = dataset_store.get_dataset(dataset_id, json_payload["columnSettings"])
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
    dataset = dataset_store.get_dataset(dataset_id, json_payload["columnSettings"])
    weights, image_coordinates = dataset.inverse_dimensional_reduction(json_payload["images"])

    return jsonify({
        "id": dataset_id,
        "weights": weights,
        "images": image_coordinates
    })


@app.route('/api/inaturalist/<user_id>', methods=['GET'])
def get_inaturalist(user_id):
    format = request.args.get("format", "json").lower()
    add_sat_rgb_data = get_boolean_param(request, "add_sat_rgb_data")
    add_landcover_data = get_boolean_param(request, "add_landcover_data")
    limit = get_int_param(request, "limit")
    try:
        observations = get_inaturalist_observations(user_id=user_id,
                                                    add_sat_rgb_data=add_sat_rgb_data,
                                                    add_landcover_data=add_landcover_data,
                                                    limit=limit)
        if format == "json":
            return jsonify({
                "user_id": user_id,
                "total": observations.total,
                "data": observations.data,
                "warnings": list(observations.warnings)
            })
        elif format == "csv":
            return csv_reponse_for_observations(
                fieldnames=observations.fieldnames,
                observations=observations.data,
                user_id=user_id
            )
        else:
            abort(400, "Unsupported format parameter value " + format)
    except BadObservationException as ex:
        abort(400, str(ex))


def get_csv_filename(user_id):
    now_str = datetime.datetime.now().strftime("%Y-%m-%d-%H%M%S")
    return f"andromeda_inaturalist_{user_id}_{now_str}.csv"


def csv_reponse_for_observations(fieldnames, observations, user_id):
    filename = get_csv_filename(user_id)
    return Response(
        create_csv_str(fieldnames=fieldnames, observations=observations),
        mimetype="text/csv",
        headers={"Content-disposition": f"attachment; filename={filename}"})


@app.route('/api/inaturalist/<user_id>/dataset', methods=['POST'])
def create_inaturalist_dataset(user_id):
    add_sat_rgb_data = get_boolean_param(request, "add_sat_rgb_data")
    add_landcover_data = get_boolean_param(request, "add_landcover_data")
    try:
        observations = get_inaturalist_observations(user_id=user_id,
                                                    add_sat_rgb_data=add_sat_rgb_data,
                                                    add_landcover_data=add_landcover_data,
                                                    limit=None)
        csv_content = create_csv_str(fieldnames=observations.fieldnames,
                                     observations=observations.data)
        dataset_store = DatasetStore(base_directory=UPLOAD_FOLDER)
        dataset = dataset_store.create_dataset_with_content(csv_content)
        filename = get_csv_filename(user_id=user_id)
        download_url = f"{request.host_url}/api/dataset/{dataset.id}?filename={filename}"
        return jsonify({
            "id": dataset.id,
            "url": download_url,
            "warnings": list(observations.warnings)
        })
    except BadObservationException as ex:
        abort(400, str(ex))


@app.route('/api/column-config', methods=['GET'])
def get_column_config():
    with open(COLUMN_CONFIG, 'r') as infile:
        payload = json.load(infile)
    return jsonify(payload)
