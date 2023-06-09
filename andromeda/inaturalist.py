import io
import csv
import random
import pandas as pd
from pyinaturalist import get_observations

LABEL_FIELD = "Image_Label"
URL_FIELD = "Image_Link"
SPECIES_FIELD = "Species"
USER_FIELD = "User"
DATE_FIELD = "Date"
TIME_FIELD = "Time"
SECONDS_FIELD = "Seconds"
PLACE_FIELD = "Place"
LAT_FIELD = "Lat"
LON_FIELD = "Long"
CSV_FIELDS = [
    LABEL_FIELD, URL_FIELD, SPECIES_FIELD, USER_FIELD, 
    DATE_FIELD, TIME_FIELD, SECONDS_FIELD, PLACE_FIELD, 
    LAT_FIELD, LON_FIELD]
SAT_MEAN_RED = "sat_meanRed"
SAT_MEAN_GREEN = "sat_meanGreen"
SAT_MEAN_BLUE = "sat_meanBlue"
SAT_CSV_FIELDS = [
    SAT_MEAN_RED,
    SAT_MEAN_GREEN,
    SAT_MEAN_BLUE
]


def augment_observations(obs_ary, sat_dataset):
    for obs in obs_ary:
        obs[SAT_MEAN_RED] = random.random()
        obs[SAT_MEAN_GREEN] = random.random()
        obs[SAT_MEAN_BLUE] = random.random()


def get_inaturalist_observations(user_id, sat_dataset):
    result = []
    idx = 0
    observations = get_observations(user_id=user_id, page='all')
    for obs in observations['results']:
        idx += 1
        label = f"p{idx}"
        df = pd.DataFrame.from_dict(obs, orient='index')
        # Get image urls
        if obs.get('photos'):
            # Replace image size from 'square' to 'medium' and 'large'
            image_url = obs.get('photos')[0].get('url').replace('square', 'medium')
        else:
            image_url = None
        observed_on = pd.to_datetime(obs.get('observed_on'))      
        observed_seconds = observed_on.hour * 3600 + observed_on.minute * 60 + observed_on.second
        if obs.get('location'):
            lat = obs.get('location')[0]
            lon = obs.get('location')[1]
        else:
            lat = None
            lon = None
        place_guess = obs.get('place_guess')
        user_login = obs.get('user', {}).get('login')
        result.append({
            LABEL_FIELD: label,
            URL_FIELD: image_url,
            SPECIES_FIELD: obs.get('species_guess'),
            USER_FIELD: user_login,
            DATE_FIELD: observed_on.strftime("%Y-%m-%d"),
            TIME_FIELD: observed_on.strftime("%H:%M:%S"),
            SECONDS_FIELD: observed_seconds,
            PLACE_FIELD: place_guess,
            LAT_FIELD: lat,
            LON_FIELD: lon,
        })
    if sat_dataset:
        augment_observations(obs_ary=result, sat_dataset=sat_dataset)
    return result

def get_inaturalist_csv_content(user_id, sat_dataset):
    output = io.StringIO()
    fieldnames = CSV_FIELDS[:]
    if sat_dataset:
        fieldnames += SAT_CSV_FIELDS
    print(fieldnames)
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for obs in get_inaturalist_observations(user_id=user_id,
                                            sat_dataset=sat_dataset):
        writer.writerow(obs)
    return output.getvalue()