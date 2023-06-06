import json
import pandas as pd
from pyinaturalist import get_observations

user_id = 'patsuttonwildlifegarden'

observations = get_observations(user_id=user_id, page='all')
for obs in observations['results']:
    # Get image urls
    if obs.get('photos'):
        image_url = obs.get('photos')[0].get('url')
    else:
        image_url = None
    if obs.get('location'):
        lat = obs.get('location')[0]
        lon = obs.get('location')[1]
    else:
        lat = None
        lon = None

    print("image_url", image_url)
    print("lat", lat)
    print("lon", lon)
    print(obs.get('place_guess'))
    print(obs.get('uri'))
    print(obs.get('user', {}).get('login'))
    break
