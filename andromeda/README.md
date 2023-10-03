# Andromeda Backend Webserver
This server allows users to upload CSV files and perform dimensional reduction operations on the data.


## Requirements

- Python 3.8+

## Setup

Install depenencies within a python virtual environment:

```
pip install -r requirements.txt
```

## Custom Dataset
Andromeda has support for including a custom satellite CSV dataset that users can merge their iNaturalist observation data with. The dataset must have 4 columns representing the lat/lon bounding box to compare against the observation lat/lon. To use this feature a JSON config file must be provided with the following items:
- label - Label for checkbox in UI describing the CSV dataset
- note - Note about the dataset
- column_prefix - prefix to add column names during merging
- fields - dictionary of LAT_NW,LON_NW,LAT_SE,LON_SE referencing the bounding box columns in the CSV dataset

See [quest-2023-RGB-customData.json](../datasets/satelliteData/quest-2023-RGB-customData.json) for an example.

 
To activate the custom dataset functionality set the `ANDROMEDA_CUSTOM_DATA` environment variable.
For example to activate the `quest-2023-RGB-customData.json` run the following before running the app.
```
export ANDROMEDA_CUSTOM_DATA=../datasets/satelliteData/quest-2023-RGB-customData.json
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

### Fetch iNaturalist observations as JSON data
Read all observations for iNaturalist user and return as JSON.
- GET __/api/inaturalist/<inat_user>__
  - Output
    ```  
    {
      "data": [
        {
          "Date": "...",
          "Image_Label": "...",
          "Image_Link": "...",
          "Lat": 42.9349293461,
          "Long": -88.0380119262,
          "Place": "...",
          "Seconds": 57785,
          "Species": "White-tailed Deer",
          "Time": "...",
          "User": "..."
        },
        ...
      "user_id": "...",
      "warnings": [
        "missing_lat_long"
      ]
    }
    ```

### Fetch iNaturalist observations as CSV data
Read all observations for iNaturalist user and return as a CSV file.
- GET __/api/inaturalist/<inat_user>?format=csv__
  - Output
    ```  
    Image_Label,Image_Link,Species,User,Date,Time,Seconds,Place,Lat,Long
    p1,https://static.inaturalist.org/photos/12647253/medium.jpg,White-tailed Deer,lhouse,2017-12-31,16:03:05,57785,"Whitnall Park, Hales Corners, WI, US",42.9349293461,-88.0380119262
    ...
    ```
NOTE: Since the result is a CSV file no warnings will be returned.

### Get column configuration settings
Retrieve configuration about ancillary column names
- GET __/api/column-config/__
  - Output
    ```
     "ancillary_columns": [
        "sat_Lat-Center", ...
     ]
    ```

### Get custom dataset configuration
Retrieve config settings for the custom satellite dataset
- GET __/api/custom-data-config/__
  - Example Output
    ```
    {
        "label": "Add RGB Satellite Data",
        "note": "Note: The RGB satellite data is specific to the Princeton, NJ area, as it was developed for QUEST 2023.",
        "column_prefix": "sat",
        "fields": {
            "LAT_NW": "sat_Lat-NW",
            "LON_NW": "sat_Lon-NW",
            "LAT_SE": "sat_Lat-SE",
            "LON_SE": "sat_Lon-SE"
        },
        "url": "https://raw.githubusercontent.com/Imageomics/Andromeda/main/datasets/satelliteData/satRgbFinal4.csv"
    }
    ```
