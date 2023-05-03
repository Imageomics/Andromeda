# Andromeda Backend Webserver
This server allows users to upload CSV files and perform dimensional reduction operations on the data.


## Requirements

- Python 3.8+

## Setup

Install depenencies within a python virtual environment:

```
pip install -r requirements.txt
```

## Running

By default flask performs CORS checking which is useful in production.
When developing locally this can cause problems when using the API from a web browser.
To disable CORS checking functionality run the following:

```
export ANDROMEDA_DEV_MODE=Y
```

Within your python virtual environment run:

```
flask --app main run --debug
```

## Run Tests

Within your python virtual environment run:

```
python -m unittest
```

## Run Integration Test

You will need [jq](https://stedolan.github.io/jq/) installed to run this test.
The flask app needs to be running in another terminal.

Run the following command:

```
./itest.sh
```

## API
### Definitions
- `dataset_id` - Unique identifier for a CSV file uploaded to the API
- `column_name` - name of a column in the CSV file
- `label` unique name of a particular image
- `x` is a number between -1.0 and 1.0 representing the x location of the image
- `y` is a number between -1.0 and 1.0 representing the y location of the image
- `url` URL of an image

### Create a dataset
Upload a CSV file and return an id for use with `dimensional-reduction` and `inverse-dimensional-reduction` endpoints.
- POST __/api/dataset/__
  - Input
    - file: CSV file to create a new datset for
  - Output
    ```
    { "id": "<dataset_id>" }
    ```

### Perform dimensional reduction
Calculate image coordinates for the given weights.
- POST __/api/dataset/<dataset_id>/dimensional-reduction__
  - Input
    ```
    { "weights": {"<column_name>": <weight_value>, ...} }
    ```
  - Output
    ```
    { 
        "id": "<dataset_id>",
        "weights": {"<column_name>": <weight_value>, ...},
        "images": [{"label": "<label>", "url": "<url>", "x": "<x>", "y": "<y>"}, ...]
    }
    ```

### Perform inverse dimensional reduction
Calculate weights for the given image coordinates.
- POST __/api/dataset/<dataset_id>/inverse-dimensional-reduction__
  - Input
    ```  
    { "images": [{ "label": "<label>", "x": <x> "y": <y> }, ...] }
    ```

  - Output
    ```  
    {
        "id": "<dataset_id>",
        "weights": {"<column_name>": <weight_value>, ...},
        "images": [{"label": "<label>", "url": "<url>", "x": "<x>", "y": "<y>"}, ...]
    }
    ```
